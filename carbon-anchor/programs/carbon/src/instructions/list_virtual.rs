use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint},
};
use crate::{
    state::{Listing, MarketplaceConfig, CollectionConfig},
    event::List,
    error::Error,
};

#[derive(Accounts)]
#[instruction(item_id: [u8;32])]
pub struct ListVirtual<'info> {
    /// Seller wallet.
    #[account(mut)]
    pub seller: Signer<'info>,

    /// Marketplace authority wallet.
    pub marketplace_authority: Signer<'info>,

    /// The currency to use or native mint if using SOL
    pub currency_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        seeds = [
            Listing::PREFIX.as_bytes(),
            item_id.as_ref()
        ],
        bump,
        space = Listing::SPACE,
        payer = seller,
    )]
    pub listing: Box<Account<'info, Listing>>,

    #[account(
        seeds = [
            CollectionConfig::PREFIX.as_bytes(),
            collection_config.collection_mint.key().as_ref()
        ],
        bump = collection_config.bump[0],
        has_one = marketplace_authority,
    )]
    pub collection_config: Box<Account<'info, CollectionConfig>>,

    #[account(
        seeds = [
            MarketplaceConfig::PREFIX.as_bytes(),
            marketplace_config.marketplace_authority.key().as_ref()
        ],
        bump = marketplace_config.bump[0],
        has_one = marketplace_authority
    )]
    pub marketplace_config: Box<Account<'info, MarketplaceConfig>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn list_virtual_handler<'info>(
    ctx: Context<ListVirtual>,
    item_id: [u8;32],
    price: u64,
    expiry: i64,
) -> Result<()> {
    require!(price > 0, Error::InvalidPrice);
    require!(expiry >= 0, Error::InvalidExpiry);

    let listing = &mut ctx.accounts.listing;
    listing.init(
        [*ctx.bumps.get(Listing::PREFIX).ok_or(Error::BumpSeedNotInHashMap)?],
        ctx.accounts.marketplace_authority.key(),
        ctx.accounts.seller.key(),
        item_id,
        true,
        ctx.accounts.currency_mint.key(),
        ctx.accounts.collection_config.collection_mint,
        ctx.accounts.marketplace_config.fee_config.clone(),
        price,
        expiry,
    )?;

    emit!(List {
        item_id,
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