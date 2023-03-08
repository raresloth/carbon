use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::Metadata;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::{
    CustodyAccount, Listing,
    util::{thaw, transfer_spl},
    error::Error
};

#[derive(Accounts)]
pub struct TakeOwnership<'info> {
    /// Marketplace authority wallet.
    /// CHECK: Can be any marketplace authority
    #[account(mut)]
    pub marketplace_authority: Signer<'info>,

    /// User wallet with authority over the custodial mint.
    /// CHECK: Safe because of custody account constraint
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,

    /// User's token account of the custodial mint.
    #[account(
        mut,
        constraint = token_account.owner == owner.key(),
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
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn take_ownership_handler<'info>(
    ctx: Context<TakeOwnership>,
) -> Result<()> {
    let listing = Listing::from_account_info_with_checks(
        &ctx.accounts.listing.to_account_info(),
        ctx.accounts.mint.key().to_bytes()
    )?;

    require!(listing.is_none(), Error::NftIsListed);

    let bump = ctx.accounts.custody_account.load()?.bump;
    let auth_seeds = CustodyAccount::auth_seeds_from_args(
        ctx.accounts.mint.to_account_info().key,
        &bump
    );

    thaw(
        &ctx.accounts.token_account.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.edition.to_account_info(),
        ctx.accounts.custody_account.as_ref(),
        &ctx.accounts.token_program.to_account_info(),
        &ctx.accounts.token_metadata_program.to_account_info(),
        Some(&auth_seeds),
    )?;

    transfer_spl(
        &ctx.accounts.owner.to_account_info(),
        &ctx.accounts.marketplace_authority.to_account_info(),
        &ctx.accounts.token_account.to_account_info(),
        &ctx.accounts.marketplace_authority_token_account.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.marketplace_authority.to_account_info(),
        &ctx.accounts.associated_token_program.to_account_info(),
        &ctx.accounts.token_program.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        &ctx.accounts.rent.to_account_info(),
        Some(ctx.accounts.custody_account.as_ref()),
        Some(&auth_seeds),
        None,
        1
    )?;

    Ok(())
}