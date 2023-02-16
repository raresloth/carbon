use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::Metadata;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::{CustodyAccount};
use crate::util::{thaw, transfer_spl};

#[derive(Accounts)]
pub struct TakeOwnership<'info> {
    /// Marketplace authority wallet.
    /// CHECK: Can be any marketplace authority
    #[account(mut)]
    pub marketplace_authority: Signer<'info>,

    /// User wallet with authority over the custodied mint.
    /// CHECK: Safe because of custody account constraint
    pub authority: UncheckedAccount<'info>,

    /// User's token account of the custodied mint.
    #[account(
        mut,
        constraint = token_account.owner == authority.key(),
        token::mint = mint,
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// Marketplace authority's token account of the custodied mint.
    /// CHECK: Verified in transfer
    #[account(mut)]
    pub marketplace_authority_token_account: UncheckedAccount<'info>,

    /// Mint custodied
    pub mint: Box<Account<'info, Mint>>,

    /// Edition of the custodied mint.
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
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn take_ownership_handler<'info>(
    ctx: Context<TakeOwnership>,
) -> Result<()> {
    let custody_account = &ctx.accounts.custody_account;
    let auth_seeds = custody_account.auth_seeds();

    thaw(
        &ctx.accounts.token_account.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.edition.to_account_info(),
        &custody_account.to_account_info(),
        &ctx.accounts.token_program.to_account_info(),
        &ctx.accounts.token_metadata_program.to_account_info(),
        Some(&auth_seeds),
    )?;

    transfer_spl(
        &ctx.accounts.authority.to_account_info(),
        &ctx.accounts.marketplace_authority.to_account_info(),
        &ctx.accounts.token_account.to_account_info(),
        &ctx.accounts.marketplace_authority_token_account.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.marketplace_authority.to_account_info(),
        &ctx.accounts.associated_token_program.to_account_info(),
        &ctx.accounts.token_program.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        &ctx.accounts.rent.to_account_info(),
        Some(&custody_account.to_account_info()),
        Some(&auth_seeds),
        None,
        1
    )?;

    Ok(())
}