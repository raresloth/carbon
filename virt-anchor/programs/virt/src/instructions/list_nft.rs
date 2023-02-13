use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount},
    metadata::Metadata
};
use crate::{
	state::{Listing},
	util::{approve_and_freeze},
	error::Error
};

#[derive(Accounts)]
pub struct ListNft<'info> {
    /// Seller wallet.
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Seller's token account of the mint to sell.
    #[account(
        mut,
        constraint = token_account.owner == authority.key(),
        token::mint = mint,
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// Mint of the NFT to sell.
    pub mint: Box<Account<'info, Mint>>,

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
        payer = authority,
    )]
    pub listing: Box<Account<'info, Listing>>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn list_nft_handler<'info>(
    ctx: Context<ListNft>,
    price: u64,
    expiry: i64,
) -> Result<()> {

    let listing_account = &ctx.accounts.listing.to_account_info().clone();

    let listing = &mut ctx.accounts.listing;
    listing.init(
        [*ctx.bumps.get(Listing::PREFIX).ok_or(Error::BumpSeedNotInHashMap)?],
        ctx.accounts.authority.key(),
        ctx.accounts.mint.key(),
        false,
        ctx.accounts.currency_mint.key(),
        price,
        expiry,
    )?;

    let auth_seeds = listing.auth_seeds();
    approve_and_freeze(
        &ctx.accounts.token_account.to_account_info(),
        &ctx.accounts.edition.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.authority.to_account_info(),
        &listing_account,
        &ctx.accounts.token_program.to_account_info(),
        &ctx.accounts.token_metadata_program.to_account_info(),
        Some(&auth_seeds),
        1
    )?;

    Ok(())
}