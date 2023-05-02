use anchor_lang::prelude::*;
use anchor_spl::{
	token::Token,
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
	state::{CollectionConfig, Metadata, MintRecord},
	event::Mint,
	util::mint_nft
};

#[derive(Accounts)]
#[instruction(item_id: [u8;32])]
pub struct MintVirtual<'info> {
	/// Buyer wallet.
	#[account(mut)]
	pub buyer: Signer<'info>,

	/// Marketplace authority wallet.
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

	/// Collection config for the new NFT.
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

	#[account(
		init,
		seeds = [
			MintRecord::PREFIX.as_bytes(),
			collection_config.key().as_ref(),
			item_id.as_ref(),
		],
		bump,
		space = MintRecord::SPACE,
        payer = buyer,
	)]
	pub mint_record: Box<Account<'info, MintRecord>>,

	pub token_metadata_program: Program<'info, metadata::Metadata>,
	pub token_program: Program<'info, Token>,
	pub associated_token_program: Program<'info, AssociatedToken>,
	pub system_program: Program<'info, System>,
	pub rent: Sysvar<'info, Rent>,
}

pub fn mint_virtual_handler<'info>(
	ctx: Context<'_, '_, '_, 'info, MintVirtual<'info>>,
	item_id: [u8;32],
	metadata: Metadata
) -> Result<()> {
	let mint_record = &mut ctx.accounts.mint_record;
	mint_record.init(ctx.accounts.collection_config.key(), item_id, ctx.accounts.mint.key())?;
	
	let marketplace_authority = &ctx.accounts.marketplace_authority.to_account_info();
	let data = &ctx.accounts.collection_config.get_mpl_metadata(metadata)?;
	// Mint the NFT to the buyer.
	mint_nft(
		&ctx.accounts.buyer.to_account_info(),
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

	emit!(Mint {
		item_id,
        mint: ctx.accounts.mint.key(),
		buyer: ctx.accounts.buyer.key(),
        marketplace_authority: ctx.accounts.collection_config.marketplace_authority,
		collection_config: ctx.accounts.collection_config.key(),
    });

	Ok(())
}