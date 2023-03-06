use anchor_lang::prelude::*;
use anchor_lang::system_program::{create_account, CreateAccount};
use anchor_spl::{
	metadata::{
		create_metadata_accounts_v3,
		create_master_edition_v3,
		CreateMasterEditionV3,
		CreateMetadataAccountsV3
	},
	token::{
		initialize_mint2,
		mint_to,
		InitializeMint2,
		MintTo,
	}
};
use mpl_token_metadata::state::{DataV2};
use crate::util::make_ata;

pub fn mint_nft<'a>(
	payer: &AccountInfo<'a>,
	receiver: &AccountInfo<'a>,
	receiver_token_account: &AccountInfo<'a>,
	mint: &AccountInfo<'a>,
	mint_authority: &AccountInfo<'a>,
	metadata_account: &AccountInfo<'a>,
	metadata_data: DataV2,
	edition: &AccountInfo<'a>,
	token_metadata_program: &AccountInfo<'a>,
	associated_token_program: &AccountInfo<'a>,
	token_program: &AccountInfo<'a>,
	system_program: &AccountInfo<'a>,
	rent: &AccountInfo<'a>,
) -> Result<()> {
	let token_program = token_program.to_account_info();

	create_account(
		CpiContext::new(system_program.clone(), CreateAccount {
			from: payer.to_account_info(),
			to: mint.to_account_info()
		}),
		Rent::get()?.minimum_balance(82),
		82,
		&token_program.key(),
	)?;

	// Create a new mint
	initialize_mint2(
		CpiContext::new(token_program.clone(), InitializeMint2 {
			mint: mint.to_account_info(),
		}),
		0,
		&mint_authority.key(),
		Some(&mint_authority.key()),
	)?;

	// Initialize the receiver's token account
	make_ata(
		receiver_token_account.to_account_info(),
		receiver.to_account_info(),
		mint.to_account_info(),
		payer.to_account_info(),
		associated_token_program.to_account_info(),
		token_program.to_account_info(),
		system_program.to_account_info(),
		rent.to_account_info(),
		None
	)?;

	// Mint to the receiver
	mint_to(
		CpiContext::new(token_program.clone(), MintTo {
			mint: mint.to_account_info(),
			to: receiver_token_account.to_account_info(),
			authority: mint_authority.to_account_info(),
		}),
		1
	)?;

	// Create metadata accounts
	create_metadata_accounts_v3(
		CpiContext::new(token_metadata_program.clone(), CreateMetadataAccountsV3 {
			metadata: metadata_account.to_account_info(),
			mint: mint.to_account_info(),
			mint_authority: mint_authority.to_account_info(),
			update_authority: mint_authority.to_account_info(),
			payer: payer.to_account_info(),
			system_program: system_program.to_account_info(),
			rent: rent.to_account_info(),
		}),
		metadata_data,
		true,
		true,
		None
	)?;

	// Create master edition
	Ok(create_master_edition_v3(
		CpiContext::new(token_metadata_program.clone(), CreateMasterEditionV3 {
			payer: payer.to_account_info(),
			mint: mint.to_account_info(),
			edition: edition.to_account_info(),
			mint_authority: mint_authority.to_account_info(),
			update_authority: mint_authority.to_account_info(),
			metadata: metadata_account.to_account_info(),
			token_program: token_program.to_account_info(),
			system_program: system_program.to_account_info(),
			rent: rent.to_account_info(),
		}),
		Some(1),
	)?)
}