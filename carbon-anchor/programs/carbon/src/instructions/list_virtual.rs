use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint},
};
use crate::{
	state::{Listing},
	error::Error
};

#[derive(Accounts)]
#[instruction(id: Pubkey)]
pub struct ListVirtual<'info> {
    /// Seller wallet.
    #[account(mut)]
    pub authority: Signer<'info>,

    /// The currency to use or native mint if using SOL
    pub currency_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        seeds = [
            Listing::PREFIX.as_bytes(),
            id.as_ref()
        ],
        bump,
        space = Listing::SPACE,
        payer = authority,
    )]
    pub listing: Box<Account<'info, Listing>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn list_virtual_handler<'info>(
    ctx: Context<ListVirtual>,
    id: Pubkey,
    price: u64,
    expiry: i64,
) -> Result<()> {
    let listing = &mut ctx.accounts.listing;
    listing.init(
        [*ctx.bumps.get(Listing::PREFIX).ok_or(Error::BumpSeedNotInHashMap)?],
        ctx.accounts.authority.key(),
        id,
        true,
        ctx.accounts.currency_mint.key(),
        price,
        expiry,
    )?;

    Ok(())
}