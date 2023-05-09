use anchor_lang::prelude::*;
use crate::{
    state::{Listing},
    event::ListingUpdate,
    error::Error,
};

#[derive(Accounts)]
pub struct UpdateListing<'info> {
    /// Seller wallet.
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        seeds = [
            Listing::PREFIX.as_bytes(),
            listing.item_id.as_ref()
        ],
        bump = listing.bump[0],
        has_one = seller @ Error::InvalidSeller,
    )]
    pub listing: Box<Account<'info, Listing>>,
}

pub fn update_listing_handler<'info>(
    ctx: Context<UpdateListing>,
    price: u64,
    expiry: i64,
) -> Result<()> {
    require!(price > 0, Error::InvalidPrice);
    require!(expiry >= 0, Error::InvalidExpiry);

    let listing = &mut ctx.accounts.listing;
    listing.update(
        price,
        expiry,
    )?;

    emit!(ListingUpdate {
        item_id: listing.item_id,
        price,
        expiry,
        seller: listing.seller,
        is_virtual: true,
        currency_mint: listing.currency_mint,
        collection_mint: listing.collection_mint,
        marketplace_authority: listing.marketplace_authority,
        fee_config: listing.fee_config,
    });

    Ok(())
}