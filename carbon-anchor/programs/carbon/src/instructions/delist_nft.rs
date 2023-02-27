use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount},
    metadata::Metadata
};
use crate::{
    CustodyAccount,
    state::{Listing},
    util::{assert_keys_equal, thaw_and_revoke},
    error::Error
};

#[derive(Accounts)]
pub struct DelistNft<'info> {
    /// Seller wallet.
    #[account(mut)]
    pub seller: Signer<'info>,

    /// Seller's token account of the mint to delist.
    #[account(
        mut,
        constraint = token_account.owner == seller.key(),
        token::mint = mint,
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// Mint of the NFT to sell.
    pub mint: Box<Account<'info, Mint>>,

    /// Edition of the NFT to sell.
    /// CHECK: Freeze would fail if incorrect
    pub edition: UncheckedAccount<'info>,

    #[account(
        mut,
        close = seller,
        seeds = [
            Listing::PREFIX.as_bytes(),
            mint.key().as_ref()
        ],
        bump = listing.bump[0],
        has_one = seller @ Error::InvalidListingAuthority,
        constraint = !listing.is_virtual @ Error::IsVirtual,
        constraint = listing.id == mint.key() @ Error::InvalidMint,
    )]
    pub listing: Box<Account<'info, Listing>>,

    #[account(mut)]
    /// CHECK: Validated in handler
    pub custody_account: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn delist_nft_handler<'info>(
    ctx: Context<'_, '_, '_, 'info, DelistNft<'info>>
) -> Result<()> {
    CustodyAccount::assert_is_key_for_mint(
        ctx.accounts.custody_account.key(),
        ctx.accounts.mint.key(),
    )?;

    let listing = &ctx.accounts.listing;
    let auth_seeds = listing.auth_seeds();

    if ctx.accounts.custody_account.data_is_empty() {
        thaw_and_revoke(
            &ctx.accounts.token_account.to_account_info(),
            &ctx.accounts.mint.to_account_info(),
            &ctx.accounts.edition.to_account_info(),
            &ctx.accounts.seller.to_account_info(),
            &ctx.accounts.listing.to_account_info(),
            &ctx.accounts.token_program.to_account_info(),
            &ctx.accounts.token_metadata_program.to_account_info(),
            Some(&auth_seeds)
        )?;
    } else {
        let account_loader = AccountLoader::<'info, CustodyAccount>::try_from(
            &ctx.accounts.custody_account.to_account_info()
        )?;

        assert_keys_equal(
            account_loader.load()?.marketplace_authority,
            ctx.accounts.listing.marketplace_authority,
            "Invalid marketplace authority"
        )?;

        let custody_account = &mut account_loader.load_mut()?;
        custody_account.is_listed = false;
    }

    Ok(())
}