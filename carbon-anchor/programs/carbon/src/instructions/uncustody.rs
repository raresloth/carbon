use anchor_lang::prelude::*;
use anchor_spl::metadata::Metadata;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::{
    CustodyAccount, Listing,
    util::{thaw_and_revoke},
    error::Error
};

#[derive(Accounts)]
pub struct Uncustody<'info> {
    /// User wallet.
    #[account(mut)]
    pub owner: Signer<'info>,

    /// Marketplace authority wallet.
    /// CHECK: Can be any marketplace authority
    pub marketplace_authority: UncheckedAccount<'info>,

    /// User's token account of the mint to uncustody.
    #[account(
        mut,
        constraint = token_account.owner == owner.key(),
        token::mint = mint,
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// Mint to be uncustodied
    pub mint: Box<Account<'info, Mint>>,

    /// Edition of the NFT to uncustody.
    /// CHECK: Verified in thaw
    pub edition: UncheckedAccount<'info>,

    #[account(
        mut,
        close = owner,
        seeds = [
            CustodyAccount::PREFIX.as_bytes(),
            mint.key().as_ref()
        ],
        bump = custody_account.load()?.bump[0],
        has_one = marketplace_authority,
        has_one = owner,
        has_one = mint,
    )]
    pub custody_account: AccountLoader<'info, CustodyAccount>,

    /// CHECK: Verified in handler
    pub listing: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn uncustody_handler<'info>(
    ctx: Context<Uncustody>,
) -> Result<()> {
    let listing = Listing::from_account_info_with_checks(
        &ctx.accounts.listing.to_account_info(),
        ctx.accounts.mint.key().to_bytes()
    )?;

    require!(listing.is_none(), Error::NftIsListed);

    let bump = ctx.accounts.custody_account.load()?.bump;
    let item_id = ctx.accounts.custody_account.load()?.item_id;
    let auth_seeds = CustodyAccount::auth_seeds_from_args(
        ctx.accounts.mint.to_account_info().key,
        &bump
    );

    thaw_and_revoke(
        &ctx.accounts.token_account.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.edition.to_account_info(),
        &ctx.accounts.owner.to_account_info(),
        &ctx.accounts.custody_account.to_account_info(),
        &ctx.accounts.token_program.to_account_info(),
        &ctx.accounts.token_metadata_program.to_account_info(),
        Some(&auth_seeds),
    )?;

    emit!(crate::event::Uncustody {
        marketplace_authority: ctx.accounts.marketplace_authority.key(),
        owner: ctx.accounts.owner.key(),
        mint: ctx.accounts.mint.key(),
        item_id
    });

    Ok(())
}