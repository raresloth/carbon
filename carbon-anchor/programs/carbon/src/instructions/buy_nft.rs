use anchor_lang::prelude::*;
use anchor_spl::{
	token::{Token},
	associated_token::AssociatedToken,
};
use anchor_spl::metadata::Metadata;
use crate::{state::{Listing}};
use crate::error::Error;
use crate::util::{thaw, transfer_payment, transfer_spl};

#[derive(Accounts)]
pub struct BuyNft<'info> {
	/// Buyer wallet.
	#[account(mut)]
	pub buyer: Signer<'info>,

	/// Seller wallet.
	/// CHECK: Safe because of listing constraint
	#[account(mut)]
	pub seller: UncheckedAccount<'info>,

	/// The new mint to be used for the NFT.
	/// CHECK: Safe because of listing constraint
	pub mint: UncheckedAccount<'info>,

	/// Seller NFT token account.
	/// CHECK: Verified in thaw
	#[account(mut)]
	pub seller_token_account: UncheckedAccount<'info>,

	/// Buyer NFT token account.
	/// CHECK: Verified in transfer
	#[account(mut)]
	pub buyer_token_account: UncheckedAccount<'info>,

	/// Metadata account for the NFT.
	/// CHECK: Verified in transfer_payment
	#[account(mut)]
	pub metadata_account: UncheckedAccount<'info>,

	/// Edition account for the NFT.
	/// CHECK: Verified in thaw
	#[account(mut)]
	pub edition: UncheckedAccount<'info>,

	#[account(
		mut,
		close = seller,
		seeds = [
			Listing::PREFIX.as_bytes(),
			mint.key().as_ref()
		],
		bump = listing.bump[0],
		constraint = !listing.is_virtual @ Error::IsVirtual,
		constraint = listing.id == mint.key() @ Error::InvalidMint,
		constraint = listing.seller == seller.key() @ Error::InvalidListingAuthority,
		constraint = listing.fee_config.fee_account == fee_account.key() @ Error::InvalidFeeAccount,
	)]
	pub listing: Box<Account<'info, Listing>>,

	/// Account to send fees to.
	/// CHECK: Safe because of listing constraint
	#[account(mut)]
	pub fee_account: UncheckedAccount<'info>,

	pub token_metadata_program: Program<'info, Metadata>,
	pub token_program: Program<'info, Token>,
	pub associated_token_program: Program<'info, AssociatedToken>,
	pub system_program: Program<'info, System>,
	pub rent: Sysvar<'info, Rent>,
}

/// When buying with SOL, the remaining accounts should only contain the marketplace auth.
/// When buying with an SPL token, the remaining accounts should be in the following order:
/// 1. currency mint account
/// 2. buyer currency ata
/// 3. marketplace auth wallet
/// 4. marketplace auth currency ata
/// 5. marketplace fee currency ata
/// 6. seller currency ata
pub fn buy_nft_handler<'info>(
	ctx: Context<'_, '_, '_, 'info, BuyNft<'info>>,
	price: u64,
) -> Result<()> {
	ctx.accounts.listing.assert_can_buy(price)?;

	let listing = &ctx.accounts.listing;
	let auth_seeds = listing.auth_seeds();

	thaw(
		&ctx.accounts.seller_token_account.to_account_info(),
		&ctx.accounts.mint.to_account_info(),
		&ctx.accounts.edition.to_account_info(),
		&ctx.accounts.listing.to_account_info(),
		&ctx.accounts.token_program.to_account_info(),
		&ctx.accounts.token_metadata_program.to_account_info(),
		Some(&auth_seeds[..])
	)?;

	transfer_spl(
		&ctx.accounts.seller.to_account_info(),
		&ctx.accounts.buyer.to_account_info(),
		&ctx.accounts.seller_token_account.to_account_info(),
		&ctx.accounts.buyer_token_account.to_account_info(),
		&ctx.accounts.mint.to_account_info(),
		&ctx.accounts.buyer.to_account_info(),
		&ctx.accounts.associated_token_program.to_account_info(),
		&ctx.accounts.token_program.to_account_info(),
		&ctx.accounts.system_program.to_account_info(),
		&ctx.accounts.rent.to_account_info(),
		Some(&ctx.accounts.listing.to_account_info()),
		Some(&auth_seeds[..]),
		None,
		1
	)?;

	transfer_payment(
		&ctx.accounts.buyer.to_account_info(),
		&ctx.accounts.seller.to_account_info(),
		&ctx.accounts.fee_account.to_account_info(),
		&ctx.accounts.mint.to_account_info(),
		&ctx.accounts.metadata_account.to_account_info(),
		ctx.accounts.listing.currency_mint,
		&ctx.accounts.associated_token_program.to_account_info(),
		&ctx.accounts.token_program.to_account_info(),
		&ctx.accounts.system_program.to_account_info(),
		&ctx.accounts.rent.to_account_info(),
		&ctx.remaining_accounts,
		ctx.accounts.listing.price,
		ctx.accounts.listing.get_fee_amount()?
	)?;

	Ok(())
}