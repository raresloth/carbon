use anchor_lang::prelude::*;
use anchor_spl::{
	token::{Token},
	associated_token::AssociatedToken,
	metadata::Metadata
};
use crate::{
	state::{Listing, CustodyAccount},
	event::Buy,
	util::{assert_keys_equal, thaw, transfer_payment, transfer_spl},
	error::Error
};

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
		has_one = seller @ Error::InvalidSeller,
		constraint = !listing.is_virtual @ Error::IsVirtual,
		constraint = listing.item_id == mint.key().to_bytes() @ Error::InvalidMint,
		constraint = listing.fee_config.fee_account == fee_account.key() @ Error::InvalidFeeAccount,
	)]
	pub listing: Box<Account<'info, Listing>>,

	#[account(mut)]
	/// CHECK: Validated in handler
	pub custody_account: UncheckedAccount<'info>,

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
/// 1. marketplace auth wallet
///
/// When buying with an SPL token, the remaining accounts should be in the following order:
/// 1. currency mint account
/// 2. buyer currency ata
/// 3. marketplace auth wallet
/// 4. marketplace auth currency ata
/// 5. marketplace fee currency ata
/// 6. seller currency ata
pub fn buy_nft_handler<'info>(
	ctx: Context<'_, '_, '_, 'info, BuyNft<'info>>,
	max_price: u64,
) -> Result<()> {
	ctx.accounts.listing.assert_can_buy(max_price)?;

	CustodyAccount::assert_is_key_for_mint(
		ctx.accounts.custody_account.key(),
		ctx.accounts.mint.key(),
	)?;

	if ctx.accounts.custody_account.data_is_empty() {
		let listing = &ctx.accounts.listing;
		let auth_seeds = listing.auth_seeds();
		ctx.accounts.transfer_with_seeds(
			&ctx.accounts.listing.to_account_info(),
			&auth_seeds,
			ctx.remaining_accounts
		)?;
	} else {
		let account_loader = AccountLoader::<'info, CustodyAccount>::try_from(
			&ctx.accounts.custody_account.to_account_info()
		)?;

		assert_keys_equal(
			account_loader.load()?.marketplace_authority,
			ctx.accounts.listing.marketplace_authority,
			"Invalid marketplace authority"
		)?;

		let bump = account_loader.load()?.bump;
		let auth_seeds = CustodyAccount::auth_seeds_from_args(
			ctx.accounts.mint.key,
			&bump
		);

		ctx.accounts.transfer_with_seeds(
			&ctx.accounts.custody_account.to_account_info(),
			&auth_seeds,
			ctx.remaining_accounts
		)?;

		account_loader.close(ctx.accounts.seller.to_account_info())?;
	}

	emit!(Buy {
		item_id: ctx.accounts.listing.item_id,
        mint: ctx.accounts.mint.key(),
        price: ctx.accounts.listing.price,
        seller: ctx.accounts.listing.seller,
		buyer: ctx.accounts.buyer.key(),
        is_virtual: false,
        currency_mint: ctx.accounts.listing.currency_mint,
        marketplace_authority: ctx.accounts.listing.marketplace_authority,
        fee_config: ctx.accounts.listing.fee_config,
    });

	Ok(())
}

impl<'info> BuyNft<'info> {

	fn transfer_with_seeds<'b>(
		&self,
		delegate: &AccountInfo<'info>,
		auth_seeds: &[&[u8]],
		remaining_accounts: &'b [AccountInfo<'info>]
	) -> Result<()> {
		thaw(
			&self.seller_token_account.to_account_info(),
			&self.mint.to_account_info(),
			&self.edition.to_account_info(),
			delegate,
			&self.token_program.to_account_info(),
			&self.token_metadata_program.to_account_info(),
			Some(auth_seeds)
		)?;

		transfer_spl(
			&self.seller.to_account_info(),
			&self.buyer.to_account_info(),
			&self.seller_token_account.to_account_info(),
			&self.buyer_token_account.to_account_info(),
			&self.mint.to_account_info(),
			&self.buyer.to_account_info(),
			&self.associated_token_program.to_account_info(),
			&self.token_program.to_account_info(),
			&self.system_program.to_account_info(),
			&self.rent.to_account_info(),
			Some(delegate),
			Some(auth_seeds),
			None,
			1
		)?;

		transfer_payment(
			&self.buyer.to_account_info(),
			&self.seller.to_account_info(),
			&self.fee_account.to_account_info(),
			&self.mint.to_account_info(),
			&self.metadata_account.to_account_info(),
			self.listing.currency_mint,
			&self.associated_token_program.to_account_info(),
			&self.token_program.to_account_info(),
			&self.system_program.to_account_info(),
			&self.rent.to_account_info(),
			&remaining_accounts,
			self.listing.price,
			self.listing.get_fee_amount()?
		)?;

		Ok(())
	}

}