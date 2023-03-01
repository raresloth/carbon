use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount},
    metadata::Metadata
};
use anchor_spl::metadata::MetadataAccount;
use crate::{
    state::{Listing, MarketplaceConfig, CollectionConfig, CustodyAccount},
    event::List,
    util::{approve_and_freeze, assert_is_nft_in_collection, assert_keys_equal},
    error::Error
};

#[derive(Accounts)]
pub struct ListNft<'info> {
    /// Seller wallet.
    #[account(mut)]
    pub seller: Signer<'info>,

    /// Seller's token account of the mint to sell.
    #[account(
        mut,
        constraint = token_account.owner == seller.key(),
        token::mint = mint,
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// Mint of the NFT to sell.
    pub mint: Box<Account<'info, Mint>>,

    /// The verified collection mint of the NFT to sell.
    pub collection_mint: Box<Account<'info, Mint>>,

    /// Metadata of the NFT to sell.
    #[account(
        constraint = metadata_account.mint == mint.key(),
    )]
    pub metadata_account: Box<Account<'info, MetadataAccount>>,

    /// Edition of the NFT to sell.
    /// CHECK: Freeze would fail if incorrect
    pub edition: UncheckedAccount<'info>,

    /// The currency to use or native mint if using SOL
    pub currency_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        seeds = [
            Listing::PREFIX.as_bytes(),
            mint.key().as_ref()
        ],
        bump,
        space = Listing::SPACE,
        payer = seller,
    )]
    pub listing: Box<Account<'info, Listing>>,

    #[account(
        seeds = [
            CollectionConfig::PREFIX.as_bytes(),
            collection_mint.key().as_ref()
        ],
        bump = collection_config.bump[0],
        has_one = collection_mint,
        constraint = collection_config.marketplace_authority == marketplace_config.marketplace_authority,
    )]
    pub collection_config: Box<Account<'info, CollectionConfig>>,

    #[account(
        seeds = [
            MarketplaceConfig::PREFIX.as_bytes(),
            marketplace_config.marketplace_authority.key().as_ref()
        ],
        bump = marketplace_config.bump[0],
    )]
    pub marketplace_config: Box<Account<'info, MarketplaceConfig>>,

    #[account(mut)]
    /// CHECK: Validated in handler
    pub custody_account: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn list_nft_handler<'info>(
    ctx: Context<'_, '_, '_, 'info, ListNft<'info>>,
    price: u64,
    expiry: i64,
) -> Result<()> {
    assert_is_nft_in_collection(
        &ctx.accounts.mint,
        &ctx.accounts.metadata_account,
        ctx.accounts.collection_mint.key()
    )?;

    CustodyAccount::assert_is_key_for_mint(
        ctx.accounts.custody_account.key(),
        ctx.accounts.mint.key(),
    )?;

    let listing_account = &ctx.accounts.listing.to_account_info().clone();

    let listing = &mut ctx.accounts.listing;
    listing.init(
        [*ctx.bumps.get(Listing::PREFIX).ok_or(Error::BumpSeedNotInHashMap)?],
        ctx.accounts.marketplace_config.marketplace_authority,
        ctx.accounts.seller.key(),
        ctx.accounts.mint.key(),
        false,
        ctx.accounts.currency_mint.key(),
        ctx.accounts.collection_config.key(),
        ctx.accounts.marketplace_config.fee_config.clone(),
        price,
        expiry,
    )?;

    if ctx.accounts.custody_account.data_is_empty() {
        let auth_seeds = listing.auth_seeds();
        approve_and_freeze(
            &ctx.accounts.token_account.to_account_info(),
            &ctx.accounts.mint.to_account_info(),
            &ctx.accounts.edition.to_account_info(),
            &ctx.accounts.seller.to_account_info(),
            &listing_account,
            &ctx.accounts.token_program.to_account_info(),
            &ctx.accounts.token_metadata_program.to_account_info(),
            Some(&auth_seeds),
            1
        )?;
    } else {
        let account_loader = AccountLoader::<'info, CustodyAccount>::try_from(
            &ctx.accounts.custody_account.to_account_info()
        )?;

        assert_keys_equal(
            account_loader.load()?.marketplace_authority,
            ctx.accounts.collection_config.marketplace_authority,
            "Invalid marketplace authority"
        )?;

        // Only the owner or the marketplace authority can list a custodial NFT
        require!(
            ctx.accounts.seller.key() == account_loader.load()?.authority  ||
            ctx.accounts.seller.key() == ctx.accounts.collection_config.marketplace_authority,
            Error::InvalidSeller
        );

        let custody_account = &mut account_loader.load_mut()?;
        custody_account.is_listed = true;
    }

    emit!(List {
        id: listing.id,
        price,
        expiry,
        seller: listing.seller,
        is_virtual: true,
        currency_mint: listing.currency_mint,
        collection_mint: ctx.accounts.collection_config.collection_mint,
        marketplace_authority: listing.marketplace_authority,
        fee_config: listing.fee_config,
    });

    Ok(())
}