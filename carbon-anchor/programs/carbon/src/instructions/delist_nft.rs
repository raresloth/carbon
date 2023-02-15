use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token, TokenAccount},
    metadata::Metadata
};
use anchor_spl::metadata::MetadataAccount;
use crate::{state::{Listing}, util::{approve_and_freeze}, error::Error, MarketplaceConfig, CollectionConfig};
use crate::util::{assert_is_nft_in_collection, thaw_and_revoke};

#[derive(Accounts)]
pub struct DelistNft<'info> {
    /// Seller wallet.
    #[account(mut)]
    pub seller: Signer<'info>,

    /// Seller's token account of the mint to delist.
    #[account(
        mut,
        constraint = token_account.owner == seller.key(),
        token::mint = mint,
    )]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// Mint of the NFT to sell.
    pub mint: Box<Account<'info, Mint>>,

    /// Edition of the NFT to sell.
    /// CHECK: Freeze would fail if incorrect
    pub edition: UncheckedAccount<'info>,

    #[account(
        mut,
        close = seller,
        seeds = [
            Listing::PREFIX.as_bytes(),
            mint.key().as_ref()
        ],
        bump = listing.bump[0],
    )]
    pub listing: Box<Account<'info, Listing>>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn delist_nft_handler<'info>(
    ctx: Context<DelistNft>
) -> Result<()> {
    let listing = &ctx.accounts.listing;
    let auth_seeds = listing.auth_seeds();

    thaw_and_revoke(
        &ctx.accounts.token_account.to_account_info(),
        &ctx.accounts.edition.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.seller.to_account_info(),
        &ctx.accounts.listing.to_account_info(),
        &ctx.accounts.token_program.to_account_info(),
        &ctx.accounts.token_metadata_program.to_account_info(),
        Some(&auth_seeds)
    )?;

    Ok(())
}