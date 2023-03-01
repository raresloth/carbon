use anchor_lang::prelude::*;
use crate::{
    state::{Listing},
    event::Delist,
};

#[derive(Accounts)]
#[instruction(item_id: [u8;32])]
pub struct DelistVirtual<'info> {
    /// Marketplace authority wallet.
    #[account(mut)]
    pub marketplace_authority: Signer<'info>,

    #[account(
        mut,
        close = marketplace_authority,
        seeds = [
            Listing::PREFIX.as_bytes(),
            item_id.as_ref()
        ],
        bump = listing.bump[0],
        has_one = marketplace_authority,
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
        seller: ctx.accounts.listing.seller
    });

    Ok(())
}