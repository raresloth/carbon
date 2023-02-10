use anchor_lang::prelude::*;
use anchor_spl::associated_token::get_associated_token_address;
use anchor_spl::token;
use anchor_spl::token::{Approve, Mint, Revoke, Transfer};
use anchor_spl::metadata::{MetadataAccount};
use solana_program::{pubkey::Pubkey, account_info::AccountInfo, system_instruction};
use solana_program::program::{invoke, invoke_signed};
use solana_program::program_pack::{IsInitialized, Pack};
use spl_associated_token_account::instruction::create_associated_token_account;
use spl_token::state::Account as SplAccount;
use crate::util::{assert_is_ata, assert_is_mint, is_native_mint};

/// Transfers SOL or SPL tokens between two accounts. The native mint can be used for the
/// currency mint to specifically transfer SOL.
pub fn transfer<'a>(
	from: &AccountInfo<'a>,
	to: &AccountInfo<'a>,
	from_currency_account: Option<&AccountInfo<'a>>,
	to_currency_account: Option<&AccountInfo<'a>>,
	currency_mint: Option<&AccountInfo<'a>>,
	fee_payer: Option<&AccountInfo<'a>>,
	ata_program: Option<&AccountInfo<'a>>,
	token_program: Option<&AccountInfo<'a>>,
	system_program: &AccountInfo<'a>,
	rent: Option<&AccountInfo<'a>>,
	signer_seeds: Option<&[&[u8]]>,
	fee_payer_seeds: Option<&[&[u8]]>,
	amount: u64,
) -> Result<()> {
	let is_native = if currency_mint.is_some() {
		is_native_mint(currency_mint.unwrap().key())
	} else {
		true
	};

	if is_native {
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
	} else {
		let from_currency_account = from_currency_account.unwrap();
		let to_currency_account = to_currency_account.unwrap();
		let currency_mint = currency_mint.unwrap();
		let token_program = token_program.unwrap();

		assert_is_mint(currency_mint)?;

		if to_currency_account.data_is_empty() {
			let fee_payer = fee_payer.unwrap();
			let ata_program = ata_program.unwrap();
			let rent = rent.unwrap();
			let fee_payer_seeds = if fee_payer_seeds.is_some() {
				fee_payer_seeds.unwrap()
			}  else {
				&[]
			};

			make_ata(
				to_currency_account.to_account_info(),
				to.to_account_info(),
				currency_mint.to_account_info(),
				fee_payer.to_account_info(),
				ata_program.to_account_info(),
				token_program.to_account_info(),
				system_program.to_account_info(),
				rent.to_account_info(),
				fee_payer_seeds,
			)?;
		} else {
			assert_is_ata(
				to_currency_account,
				to.key,
				&currency_mint.key(),
			)?;
		}

		let transfer_cpi = CpiContext::new(
			token_program.to_account_info(),
			Transfer {
				from: from_currency_account.to_account_info(),
				to: to_currency_account.to_account_info(),
				authority: from.to_account_info(),
			},
		);

		msg!("Invoking transfer");
		if signer_seeds.is_some() {
			token::transfer(
				transfer_cpi.with_signer(&[signer_seeds.unwrap()]),
				amount,
			)?;
		} else {
			token::transfer(
				transfer_cpi,
				amount,
			)?;
		}
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
	fee_payer_seeds: &[&[u8]],
) -> Result<()> {
	let as_arr = [fee_payer_seeds];

	let seeds: &[&[&[u8]]] = if !fee_payer_seeds.is_empty() {
		&as_arr
	} else {
		&[]
	};

	invoke_signed(
		&create_associated_token_account(
			fee_payer.key,
			wallet.key,
			mint.key,
			token_program.key,
		),
		&[
			ata,
			wallet,
			mint,
			fee_payer,
			ata_program,
			system_program,
			rent,
			token_program,
		],
		seeds,
	)?;

	Ok(())
}