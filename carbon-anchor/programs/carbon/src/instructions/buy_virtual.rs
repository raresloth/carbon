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
use crate::{
	state::{Listing, CollectionConfig, Metadata},
	event::Buy,
	util::{mint_nft, transfer_payment, is_native_mint},
	error::Error
};

#[derive(Accounts)]
#[instruction(item_id: [u8;32])]
pub struct BuyVirtual<'info> {
	/// Buyer wallet.
	#[account(mut)]
	pub buyer: Signer<'info>,

	/// Seller wallet.
	/// CHECK: Safe because of listing constraint
	#[account(mut)]
	pub seller: UncheckedAccount<'info>,

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
		close = seller,
		seeds = [
			Listing::PREFIX.as_bytes(),
			item_id.as_ref()
		],
		bump = listing.bump[0],
		has_one = collection_config @ Error::InvalidCollectionConfig,
		has_one = seller @ Error::InvalidSeller,
		constraint = listing.item_id == item_id,
		constraint = listing.is_virtual @ Error::NotVirtual,
		constraint = listing.fee_config.fee_account == fee_account.key() @ Error::InvalidFeeAccount,
	)]
	pub listing: Box<Account<'info, Listing>>,

	/// CHECK: Marketplace authority is validated in handler
	#[account(
		seeds = [
			CollectionConfig::PREFIX.as_bytes(),
			collection_mint.key().as_ref()
		],
		bump = collection_config.bump[0],
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
/// 1. marketplace auth wallet
///
/// When buying with an SPL token, the remaining accounts should be in the following order:
/// 1. currency mint account
/// 2. buyer currency ata
/// 3. marketplace auth wallet
/// 4. marketplace auth currency ata
/// 5. marketplace fee currency ata
/// 6. seller currency ata if seller is not the marketplace auth
pub fn buy_virtual_handler<'info>(
	ctx: Context<'_, '_, '_, 'info, BuyVirtual<'info>>,
	item_id: [u8;32],
	max_price: u64,
	metadata: Metadata
) -> Result<()> {
	ctx.accounts.listing.assert_can_buy(max_price)?;

	// Ensure valid collection config
	let marketplace_authority = if is_native_mint(ctx.accounts.listing.currency_mint) {
		&ctx.remaining_accounts[0]
	} else {
		&ctx.remaining_accounts[2]
	};
	require!(ctx.accounts.collection_config.marketplace_authority == marketplace_authority.key(),
		Error::InvalidCollectionConfig);

	let data = &ctx.accounts.collection_config.get_mpl_metadata(metadata)?;
	// Mint the NFT to the buyer.
	mint_nft(
		marketplace_authority,
		&ctx.accounts.buyer.to_account_info(),
		&ctx.accounts.buyer_token_account.to_account_info(),
		&ctx.accounts.mint.to_account_info(),
		marketplace_authority,
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
				collection_authority: marketplace_authority.clone(),
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

	emit!(Buy {
		item_id,
        mint: ctx.accounts.mint.key(),
        price: ctx.accounts.listing.price,
        seller: ctx.accounts.listing.seller,
		buyer: ctx.accounts.buyer.key(),
        is_virtual: true,
        currency_mint: ctx.accounts.listing.currency_mint,
        marketplace_authority: ctx.accounts.listing.marketplace_authority,
        fee_config: ctx.accounts.listing.fee_config,
    });

	Ok(())
}