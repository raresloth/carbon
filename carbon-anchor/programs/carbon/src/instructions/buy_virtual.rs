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
use crate::util::{is_native_mint, mint_nft, transfer_sol};

#[derive(Accounts)]
#[instruction(id: Pubkey)]
pub struct BuyVirtual<'info> {
	/// Buyer wallet.
	#[account(mut)]
	pub buyer: Signer<'info>,

	/// Marketplace authority wallet.
	/// CHECK: Safe because of collection_config constraint
	#[account(mut)]
	pub authority: Signer<'info>,

	/// Collection authority for the NFT.
	/// CHECK: Safe because of collection_config constraint
	#[account(mut)]
	pub collection_authority: Signer<'info>,

	/// The new mint to be used for the NFT.
	/// CHECK: Verified in mint CPI
	#[account(mut)]
	pub mint: Signer<'info>,

	/// Mint authority for the NFT.
	/// CHECK: Safe because of collection_config constraint
	#[account(mut)]
	pub mint_authority: Signer<'info>,

	#[account(
		mut,
		seeds = [
			CollectionConfig::PREFIX.as_bytes(),
			authority.key().as_ref(),
			collection_mint.key().as_ref()
		],
		bump = collection_config.bump[0],
		has_one = authority,
		has_one = collection_mint,
		has_one = mint_authority,
	)]
	pub collection_config: Box<Account<'info, CollectionConfig>>,

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
		close = authority,
		seeds = [
			Listing::PREFIX.as_bytes(),
			id.key().as_ref()
		],
		bump = listing.bump[0],
		has_one = authority @ Error::InvalidListingAuthority,
		has_one = id,
		constraint = listing.is_virtual @ Error::NotVirtual,
		constraint = listing.fee_config.fee_account == fee_account.key() @ Error::InvalidFeeAccount,
	)]
	pub listing: Box<Account<'info, Listing>>,

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

pub fn buy_virtual_handler<'info>(
	ctx: Context<BuyVirtual>,
	_id: Pubkey,
	price: u64,
	metadata: Metadata
) -> Result<()> {
	ctx.accounts.listing.assert_can_buy(price)?;

	let data = &ctx.accounts.collection_config.get_mpl_metadata(metadata)?;
	// Mint the NFT to the buyer.
	mint_nft(
		&ctx.accounts.buyer.to_account_info(),
		&ctx.accounts.buyer.to_account_info(),
		&ctx.accounts.buyer_token_account.to_account_info(),
		&ctx.accounts.mint.to_account_info(),
		&ctx.accounts.mint_authority.to_account_info(),
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
				collection_authority: ctx.accounts.collection_authority.to_account_info(),
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
	let fee_amount = ctx.accounts.listing.get_fee_amount()?;
	// TODO: Creator royalties
	let seller_amount = ctx.accounts.listing.price.checked_sub(fee_amount)
		.ok_or(Error::OverflowError)?;

	if is_native_mint(ctx.accounts.listing.currency_mint) {
		if fee_amount > 0 {
			transfer_sol(
				&ctx.accounts.buyer.to_account_info(),
				&ctx.accounts.fee_account.to_account_info(),
				&ctx.accounts.system_program.to_account_info(),
				None,
				fee_amount
			)?;
		}
		if seller_amount > 0 {
			transfer_sol(
				&ctx.accounts.buyer.to_account_info(),
				&ctx.accounts.authority.to_account_info(),
				&ctx.accounts.system_program.to_account_info(),
				None,
				seller_amount
			)?;
		}
	} else {
		// TODO: Transfer tokens
	}

	Ok(())
}