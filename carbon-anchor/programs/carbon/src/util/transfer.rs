use std::slice::Iter;
use anchor_lang::prelude::*;
use anchor_spl::metadata::{MetadataAccount};
use anchor_spl::token;
use anchor_spl::token::{Transfer};
use solana_program::{account_info::AccountInfo, system_instruction};
use solana_program::program::{invoke, invoke_signed};
use spl_associated_token_account::instruction::create_associated_token_account;
use crate::util::{assert_is_ata, assert_is_mint, is_native_mint, error::Error, assert_keys_equal, assert_is_metadata_account};

pub fn transfer_sol<'a>(
	from: &AccountInfo<'a>,
	to: &AccountInfo<'a>,
	system_program: &AccountInfo<'a>,
	signer_seeds: Option<&[&[u8]]>,
	amount: u64,
) -> Result<()> {
	if amount == 0 {
		return Ok(());
	}

	let transfer_ix = &system_instruction::transfer(
		from.key,
		to.key,
		amount,
	);

	let transfer_accounts = &[
		from.clone(),
		to.clone(),
		system_program.clone(),
	];

	if signer_seeds.is_some() {
		invoke_signed(
			transfer_ix,
			transfer_accounts,
			&[signer_seeds.unwrap()],
		)?;
	} else {
		invoke(
			transfer_ix,
			transfer_accounts,
		)?;
	}

	Ok(())
}

pub fn transfer_spl<'a>(
	from: &AccountInfo<'a>,
	to: &AccountInfo<'a>,
	from_token_account: &AccountInfo<'a>,
	to_token_account: &AccountInfo<'a>,
	mint: &AccountInfo<'a>,
	fee_payer: &AccountInfo<'a>,
	ata_program: &AccountInfo<'a>,
	token_program: &AccountInfo<'a>,
	system_program: &AccountInfo<'a>,
	rent: &AccountInfo<'a>,
	from_authority: Option<&AccountInfo<'a>>,
	signer_seeds: Option<&[&[u8]]>,
	fee_payer_seeds: Option<&[&[u8]]>,
	amount: u64,
) -> Result<()> {
	if amount == 0 {
		return Ok(());
	}

	assert_is_mint(mint)?;

	if to_token_account.data_is_empty() {
		make_ata(
			to_token_account.to_account_info(),
			to.to_account_info(),
			mint.to_account_info(),
			fee_payer.to_account_info(),
			ata_program.to_account_info(),
			token_program.to_account_info(),
			system_program.to_account_info(),
			rent.to_account_info(),
			fee_payer_seeds,
		)?;
	} else {
		assert_is_ata(
			to_token_account,
			to.key,
			&mint.key(),
		)?;
	}

	let transfer_cpi = CpiContext::new(
		token_program.to_account_info(),
		Transfer {
			from: from_token_account.to_account_info(),
			to: to_token_account.to_account_info(),
			authority: if from_authority.is_some() { from_authority.unwrap().to_account_info() } else { from.to_account_info() },
		},
	);

	if signer_seeds.is_none() {
		token::transfer(
			transfer_cpi,
			amount,
		)?;
	} else {
		token::transfer(
			transfer_cpi.with_signer(&[signer_seeds.unwrap()]),
			amount,
		)?;
	}

	Ok(())
}

pub fn make_ata<'a>(
	ata: AccountInfo<'a>,
	wallet: AccountInfo<'a>,
	mint: AccountInfo<'a>,
	fee_payer: AccountInfo<'a>,
	ata_program: AccountInfo<'a>,
	token_program: AccountInfo<'a>,
	system_program: AccountInfo<'a>,
	rent: AccountInfo<'a>,
	fee_payer_seeds: Option<&[&[u8]]>,
) -> Result<()> {
	let ix = &create_associated_token_account(
		fee_payer.key,
		wallet.key,
		mint.key,
		token_program.key,
	);

	let accounts = &[
		ata,
		wallet,
		mint,
		fee_payer,
		ata_program,
		system_program,
		rent,
		token_program,
	];

	if fee_payer_seeds.is_some() {
		let seeds = &[fee_payer_seeds.unwrap()];
		invoke_signed(ix, accounts, seeds, )?;
	} else {
		invoke(ix, accounts)?;
	}

	Ok(())
}

/// Pays creator fees to the creators in the metadata and returns total paid
pub fn pay_creator_fees<'a>(
	from: &AccountInfo<'a>,
	currency_mint: Pubkey,
	fee_payer: Option<&AccountInfo<'a>>,
	mint: &AccountInfo<'a>,
	metadata_account: &AccountInfo<'a>,
	remaining_accounts: &mut Iter<AccountInfo<'a>>,
	ata_program: &AccountInfo<'a>,
	token_program: &AccountInfo<'a>,
	system_program: &AccountInfo<'a>,
	rent: &AccountInfo<'a>,
	signer_seeds: Option<&[&[u8]]>,
	fee_payer_seeds: Option<&[&[u8]]>,
	buy_price: u64,
) -> Result<u64> {
	let metadata = Account::<'a, MetadataAccount>::try_from(metadata_account)?;
	if metadata.data.seller_fee_basis_points == 0 {
		return Ok(0);
	}

	if metadata.data.creators.is_none() {
		return Ok(0);
	}

	assert_is_metadata_account(metadata_account.key(), mint.key())?;

	let creators = metadata.data.creators.as_ref().unwrap();
	if creators.is_empty() {
		return Ok(0);
	}

	let total_royalty = (metadata.data.seller_fee_basis_points as u128)
		.checked_mul(buy_price as u128)
		.ok_or(Error::OverflowError)?
		.checked_div(10_000)
		.ok_or(Error::OverflowError)? as u64;

	let mut total_paid = 0;
	let is_native = is_native_mint(currency_mint);

	let (currency_mint_account, from_currency_account) = if is_native {
		(None, None)
	} else {
		(
			Some(next_account_info(remaining_accounts)?),
			Some(next_account_info(remaining_accounts)?)
		)
	};

	for creator in creators {
		let creator_fee = (creator.share as u128)
			.checked_mul(total_royalty as u128)
			.ok_or(Error::OverflowError)?
			.checked_div(100)
			.ok_or(Error::OverflowError)? as u64;

		if creator_fee == 0 {
			continue;
		}

		let current_creator_info = next_account_info(remaining_accounts)?;
		assert_keys_equal(creator.address, current_creator_info.key(), "Invalid creator key")?;

		msg!("Disbursing royalty of {} to {}", creator_fee, creator.address);

		if is_native {
			transfer_sol(
				from,
				current_creator_info,
				system_program,
				signer_seeds,
				creator_fee,
			)?;
		} else {
			let current_creator_token_account_info = next_account_info(remaining_accounts)?;
			transfer_spl(
				from,
				current_creator_info,
				from_currency_account.unwrap(),
				current_creator_token_account_info,
				currency_mint_account.unwrap(),
				fee_payer.unwrap(),
				ata_program,
				token_program,
				system_program,
				rent,
				None,
				signer_seeds,
				fee_payer_seeds,
				creator_fee,
			)?;
		};

		total_paid += creator_fee;
	}

	Ok(total_paid)
}

pub fn transfer_payment<'a, 'b>(
	buyer: &AccountInfo<'a>,
	seller: &AccountInfo<'a>,
	fee_account: &AccountInfo<'a>,
	mint: &AccountInfo<'a>,
	metadata_account: &AccountInfo<'a>,
	currency_mint_key: Pubkey,
	associated_token_program: &AccountInfo<'a>,
	token_program: &AccountInfo<'a>,
	system_program: &AccountInfo<'a>,
	rent: &AccountInfo<'a>,
	remaining_accounts: &'b [AccountInfo<'a>],
	price: u64,
	marketplace_fees: u64
) -> Result<()> {
	let remaining_accounts_clone = &mut remaining_accounts.iter().clone();

	let creator_fees = pay_creator_fees(
		&buyer.to_account_info(),
		currency_mint_key,
		Some(&buyer.to_account_info()),
		&mint.to_account_info(),
		&metadata_account.to_account_info(),
		remaining_accounts_clone,
		&associated_token_program.to_account_info(),
		&token_program.to_account_info(),
		&system_program.to_account_info(),
		&rent.to_account_info(),
		None,
		None,
		price
	)?;

	let seller_amount = price
		.checked_sub(marketplace_fees)
		.ok_or(Error::OverflowError)?
		.checked_sub(creator_fees)
		.ok_or(Error::OverflowError)?;

	if is_native_mint(currency_mint_key) {
		transfer_sol(
			&buyer.to_account_info(),
			&fee_account.to_account_info(),
			&system_program.to_account_info(),
			None,
			marketplace_fees
		)?;

		transfer_sol(
			&buyer.to_account_info(),
			&seller.to_account_info(),
			&system_program.to_account_info(),
			None,
			seller_amount
		)?;
	} else {
		let remaining_accounts_clone = &mut remaining_accounts.iter().clone();
		let currency_mint = next_account_info(remaining_accounts_clone)?;
		assert_keys_equal(currency_mint_key, currency_mint.key(), "Invalid currency mint")?;
		let buyer_currency_account = next_account_info(remaining_accounts_clone)?;
		let marketplace_authority = next_account_info(remaining_accounts_clone)?;
		let marketplace_currency_account = next_account_info(remaining_accounts_clone)?;
		let fee_currency_account = next_account_info(remaining_accounts_clone)?;

		let seller_currency_account = if seller.key() == marketplace_authority.key()  {
			marketplace_currency_account
		} else {
			next_account_info(remaining_accounts_clone)?
		};

		transfer_spl(
			&buyer.to_account_info(),
			&fee_account.to_account_info(),
			buyer_currency_account,
			fee_currency_account,
			currency_mint,
			&buyer.to_account_info(),
			&associated_token_program.to_account_info(),
			&token_program.to_account_info(),
			&system_program.to_account_info(),
			&rent.to_account_info(),
			None,
			None,
			None,
			marketplace_fees
		)?;

		transfer_spl(
			&buyer.to_account_info(),
			&seller.to_account_info(),
			buyer_currency_account,
			seller_currency_account,
			currency_mint,
			&buyer.to_account_info(),
			&associated_token_program.to_account_info(),
			&token_program.to_account_info(),
			&system_program.to_account_info(),
			&rent.to_account_info(),
			None,
			None,
			None,
			seller_amount
		)?;
	}
	
	Ok(())
}