use anchor_lang::prelude::*;
use anchor_spl::metadata::Metadata;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::{error::Error, CustodyAccount, Listing};
use crate::util::approve_and_freeze;

#[derive(Accounts)]
pub struct Custody<'info> {
    /// User wallet.
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Marketplace authority wallet.
    /// CHECK: Can be any marketplace authority
    pub marketplace_authority: UncheckedAccount<'info>,

    /// User's token account of the mint to custody.
    #[account(
        mut,
        constraint = token_account.owner == authority.key(),
        token::mint = mint,
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// Mint to be custodied
    pub mint: Box<Account<'info, Mint>>,

    /// Edition of the NFT to custody.
    /// CHECK: Verified in freeze
    pub edition: UncheckedAccount<'info>,

    #[account(
        init,
        seeds = [
            CustodyAccount::PREFIX.as_bytes(),
            mint.key().as_ref()
        ],
        bump,
        space = CustodyAccount::SPACE,
        payer = authority,
    )]
    pub custody_account: AccountLoader<'info, CustodyAccount>,

    /// CHECK: Verified in handler
    pub listing: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn custody_handler<'info>(
    ctx: Context<Custody>,
) -> Result<()> {
    let listing = Listing::from_account_info_with_checks(
        &ctx.accounts.listing.to_account_info(),
        ctx.accounts.mint.key()
    )?;

    require!(listing.is_none(), Error::NftIsListed);

    {
        let custody_account = &mut ctx.accounts.custody_account.load_init()?;
        custody_account.init(
            [*ctx.bumps.get(CustodyAccount::PREFIX).ok_or(Error::BumpSeedNotInHashMap)?],
            ctx.accounts.marketplace_authority.key(),
            ctx.accounts.authority.key(),
            ctx.accounts.mint.key(),
        )?;
    }

    let bump = [*ctx.bumps.get(CustodyAccount::PREFIX).unwrap()];
    let auth_seeds = CustodyAccount::auth_seeds_from_args(
        ctx.accounts.mint.to_account_info().key,
        &bump
    );

    approve_and_freeze(
        &ctx.accounts.token_account.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.edition.to_account_info(),
        &ctx.accounts.authority.to_account_info(),
        &ctx.accounts.custody_account.to_account_info(),
        &ctx.accounts.token_program.to_account_info(),
        &ctx.accounts.token_metadata_program.to_account_info(),
        Some(&auth_seeds),
        1
    )?;

    Ok(())
}