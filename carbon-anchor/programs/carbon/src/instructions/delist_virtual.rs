use anchor_lang::prelude::*;
use crate::{state::{Listing}};

#[derive(Accounts)]
#[instruction(id: Pubkey)]
pub struct DelistVirtual<'info> {
    /// Marketplace authority wallet.
    #[account(mut)]
    pub marketplace_authority: Signer<'info>,

    #[account(
        mut,
        close = marketplace_authority,
        seeds = [
            Listing::PREFIX.as_bytes(),
            id.as_ref()
        ],
        bump = listing.bump[0],
    )]
    pub listing: Box<Account<'info, Listing>>,

    pub system_program: Program<'info, System>,
}

pub fn delist_virtual_handler<'info>(
    _ctx: Context<DelistVirtual>,
    _id: Pubkey,
) -> Result<()> {
    Ok(())
}