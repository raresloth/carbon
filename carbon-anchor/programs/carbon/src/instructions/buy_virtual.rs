use anchor_lang::prelude::*;
use anchor_spl::{
	token::{Token},
	associated_token::AssociatedToken,
	metadata::{
		verify_sized_collection_item,
		update_primary_sale_happened_via_token,
		VerifySizedCollectionItem,
		UpdatePrimarySaleHappenedViaToken
	},
	metadata
};
use crate::{CollectionConfig, Metadata, state::{Listing}};
use crate::error::Error;
use crate::util::{is_native_mint, mint_nft, pay_creator_fees, transfer_sol, transfer_spl};

#[derive(Accounts)]
#[instruction(id: Pubkey)]
pub struct BuyVirtual<'info> {
	/// Buyer wallet.
	#[account(mut)]
	pub buyer: Signer<'info>,

	/// Marketplace authority wallet.
	/// CHECK: Safe because of collection_config constraint
	#[account(mut)]
	pub marketplace_authority: Signer<'info>,

	/// The new mint to be used for the NFT.
	/// CHECK: Verified in mint CPI
	#[account(mut)]
	pub mint: Signer<'info>,

	/// Buyer NFT token account.
	/// CHECK: Created for mint CPI
	#[account(mut)]
	pub buyer_token_account: UncheckedAccount<'info>,

	/// Metadata account for the NFT.
	/// CHECK: Verified in mint CPI
	#[account(mut)]
	pub metadata_account: UncheckedAccount<'info>,

	/// Edition of the NFT to mint.
	/// CHECK: Verified in mint CPI
	#[account(mut)]
	pub edition: UncheckedAccount<'info>,

	/// Mint of the collection NFT.
	/// CHECK: Safe due to collection_config constraint
	#[account(mut)]
	pub collection_mint: UncheckedAccount<'info>,

	/// Metadata for the collection NFT.
	/// CHECK: Verified in verify collection CPI
	#[account(mut)]
	pub collection_metadata_account: UncheckedAccount<'info>,

	/// Edition of the collection NFT.
	/// CHECK: Verified in verify collection CPI
	#[account(mut)]
	pub collection_edition: UncheckedAccount<'info>,

	#[account(
		mut,
		close = marketplace_authority,
		seeds = [
			Listing::PREFIX.as_bytes(),
			id.key().as_ref()
		],
		bump = listing.bump[0],
		has_one = id,
		has_one = collection_config,
		constraint = listing.is_virtual @ Error::NotVirtual,
		constraint = listing.seller == marketplace_authority.key() @ Error::InvalidListingAuthority,
		constraint = listing.fee_config.fee_account == fee_account.key() @ Error::InvalidFeeAccount,
	)]
	pub listing: Box<Account<'info, Listing>>,

	#[account(
		seeds = [
			CollectionConfig::PREFIX.as_bytes(),
			collection_mint.key().as_ref()
		],
		bump = collection_config.bump[0],
		has_one = marketplace_authority,
		has_one = collection_mint,
	)]
	pub collection_config: Box<Account<'info, CollectionConfig>>,

	/// Account to send fees to.
	/// CHECK: Safe because of listing constraint
	#[account(mut)]
	pub fee_account: UncheckedAccount<'info>,

	pub token_metadata_program: Program<'info, metadata::Metadata>,
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
pub fn buy_virtual_handler<'info>(
	ctx: Context<'_, '_, '_, 'info, BuyVirtual<'info>>,
	_id: Pubkey,
	price: u64,
	metadata: Metadata
) -> Result<()> {
	ctx.accounts.listing.assert_can_buy(price)?;

	let data = &ctx.accounts.collection_config.get_mpl_metadata(metadata)?;
	// Mint the NFT to the buyer.
	mint_nft(
		&ctx.accounts.marketplace_authority.to_account_info(),
		&ctx.accounts.buyer.to_account_info(),
		&ctx.accounts.buyer_token_account.to_account_info(),
		&ctx.accounts.mint.to_account_info(),
		&ctx.accounts.marketplace_authority.to_account_info(),
		&ctx.accounts.metadata_account.to_account_info(),
		data.clone(),
		&ctx.accounts.edition.to_account_info(),
		&ctx.accounts.token_metadata_program.to_account_info(),
		&ctx.accounts.associated_token_program.to_account_info(),
		&ctx.accounts.token_program.to_account_info(),
		&ctx.accounts.system_program.to_account_info(),
		&ctx.accounts.rent.to_account_info()
	)?;

	// Mark the item as a verified item in the collection.
	verify_sized_collection_item(
		CpiContext::new(
			ctx.accounts.token_metadata_program.to_account_info(),
			VerifySizedCollectionItem {
				payer: ctx.accounts.buyer.to_account_info(),
				metadata: ctx.accounts.metadata_account.to_account_info(),
				collection_authority: ctx.accounts.marketplace_authority.to_account_info(),
				collection_mint: ctx.accounts.collection_mint.to_account_info(),
				collection_metadata: ctx.accounts.collection_metadata_account.to_account_info(),
				collection_master_edition: ctx.accounts.collection_edition.to_account_info()
			},
		),
		None
	)?;

	// Mark that the primary sale happened.
	update_primary_sale_happened_via_token(
		CpiContext::new(
			ctx.accounts.token_metadata_program.to_account_info(),
			UpdatePrimarySaleHappenedViaToken {
				metadata: ctx.accounts.metadata_account.to_account_info(),
				owner: ctx.accounts.buyer.to_account_info(),
				token: ctx.accounts.buyer_token_account.to_account_info(),
			}
		)
	)?;

	// Transfer fees to the fee account.
	let marketplace_fees = ctx.accounts.listing.get_fee_amount()?;
	// First 2 remaining accounts are for the currency mint and from_currency_account
	let remaining_accounts = &mut ctx.remaining_accounts.iter().clone();

	let creator_fees = pay_creator_fees(
		&ctx.accounts.buyer.to_account_info(),
		ctx.accounts.listing.currency_mint,
		Some(&ctx.accounts.buyer.to_account_info()),
		&ctx.accounts.metadata_account.to_account_info(),
		remaining_accounts,
		&ctx.accounts.associated_token_program.to_account_info(),
		&ctx.accounts.token_program.to_account_info(),
		&ctx.accounts.system_program.to_account_info(),
		&ctx.accounts.rent.to_account_info(),
		None,
		None,
		ctx.accounts.listing.price
	)?;

	let seller_amount = ctx.accounts.listing.price
		.checked_sub(marketplace_fees)
		.ok_or(Error::OverflowError)?
		.checked_sub(creator_fees)
		.ok_or(Error::OverflowError)?;

	if is_native_mint(ctx.accounts.listing.currency_mint) {
		transfer_sol(
			&ctx.accounts.buyer.to_account_info(),
			&ctx.accounts.fee_account.to_account_info(),
			&ctx.accounts.system_program.to_account_info(),
			None,
			marketplace_fees
		)?;

		transfer_sol(
			&ctx.accounts.buyer.to_account_info(),
			&ctx.accounts.marketplace_authority.to_account_info(),
			&ctx.accounts.system_program.to_account_info(),
			None,
			seller_amount
		)?;
	} else {
		let remaining_accounts = &mut ctx.remaining_accounts.iter().clone();
		let currency_mint = next_account_info(remaining_accounts)?;
		msg!("currency_mint {}", currency_mint.key());
		let buyer_currency_account = next_account_info(remaining_accounts)?;
		msg!("buyer_currency_account {}", buyer_currency_account.key());
		let next = next_account_info(remaining_accounts)?;
		msg!("_ {}", next.key());
		let marketplace_currency_account = next_account_info(remaining_accounts)?;
		msg!("marketplace_currency_account {}", marketplace_currency_account.key());
		let fee_currency_account = next_account_info(remaining_accounts)?;
		msg!("fee_currency_account {}", fee_currency_account.key());

		transfer_spl(
			&ctx.accounts.buyer.to_account_info(),
			&ctx.accounts.fee_account.to_account_info(),
			buyer_currency_account,
			fee_currency_account,
			currency_mint,
			&ctx.accounts.buyer.to_account_info(),
			&ctx.accounts.associated_token_program.to_account_info(),
			&ctx.accounts.token_program.to_account_info(),
			&ctx.accounts.system_program.to_account_info(),
			&ctx.accounts.rent.to_account_info(),
			None,
			None,
			marketplace_fees
		)?;

		transfer_spl(
			&ctx.accounts.buyer.to_account_info(),
			&ctx.accounts.marketplace_authority.to_account_info(),
			buyer_currency_account,
			marketplace_currency_account,
			currency_mint,
			&ctx.accounts.buyer.to_account_info(),
			&ctx.accounts.associated_token_program.to_account_info(),
			&ctx.accounts.token_program.to_account_info(),
			&ctx.accounts.system_program.to_account_info(),
			&ctx.accounts.rent.to_account_info(),
			None,
			None,
			seller_amount
		)?;
	}

	Ok(())
}