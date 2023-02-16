use anchor_lang::prelude::*;
use anchor_spl::metadata::Metadata;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::{CustodyAccount};
use crate::util::{thaw_and_revoke};

#[derive(Accounts)]
pub struct Uncustody<'info> {
    /// User wallet.
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Marketplace authority wallet.
    /// CHECK: Can be any marketplace authority
    pub marketplace_authority: UncheckedAccount<'info>,

    /// User's token account of the mint to uncustody.
    #[account(
        mut,
        constraint = token_account.owner == authority.key(),
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
        close = authority,
        seeds = [
            CustodyAccount::PREFIX.as_bytes(),
            mint.key().as_ref()
        ],
        bump = custody_account.bump[0],
        has_one = marketplace_authority,
        has_one = authority,
        has_one = mint,
    )]
    pub custody_account: Box<Account<'info, CustodyAccount>>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn uncustody_handler<'info>(
    ctx: Context<Uncustody>,
) -> Result<()> {
    let custody_account = &ctx.accounts.custody_account;
    let auth_seeds = custody_account.auth_seeds();

    thaw_and_revoke(
        &ctx.accounts.token_account.to_account_info(),
        &ctx.accounts.edition.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.authority.to_account_info(),
        &custody_account.to_account_info(),
        &ctx.accounts.token_program.to_account_info(),
        &ctx.accounts.token_metadata_program.to_account_info(),
        Some(&auth_seeds),
    )?;

    Ok(())
}