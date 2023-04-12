use anchor_lang::prelude::*;
use crate::{
    state::{Listing},
    event::Delist,
};

#[derive(Accounts)]
#[instruction(item_id: [u8;32])]
pub struct DelistVirtual<'info> {
    /// Seller wallet.
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        close = seller,
        seeds = [
            Listing::PREFIX.as_bytes(),
            item_id.as_ref()
        ],
        bump = listing.bump[0],
        has_one = seller,
    )]
    pub listing: Box<Account<'info, Listing>>,

    pub system_program: Program<'info, System>,
}

pub fn delist_virtual_handler<'info>(
    ctx: Context<DelistVirtual>,
    item_id: [u8;32],
) -> Result<()> {

    emit!(Delist {
        item_id,
        seller: ctx.accounts.listing.seller,
        marketplace_authority: ctx.accounts.listing.marketplace_authority,
        collection_config: ctx.accounts.listing.collection_config,
    });

    Ok(())
}