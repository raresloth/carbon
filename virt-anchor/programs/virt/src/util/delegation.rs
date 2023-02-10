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

pub fn approve_and_freeze<'a>(
	token_account: &AccountInfo<'a>,
	edition: &AccountInfo<'a>,
	mint: &AccountInfo<'a>,
	token_owner: &AccountInfo<'a>,
	delegate: &AccountInfo<'a>,
	token_program: &AccountInfo<'a>,
	token_metadata_program: &AccountInfo<'a>,
	signer_seeds: Option<&[&[u8]]>,
	amount: u64,
) -> Result<()> {
	token::approve(
		CpiContext::new(token_program.clone(), Approve {
			to: token_account.clone(),
			delegate: delegate.clone(),
			authority: token_owner.clone(),
		}),
		amount
	)?;

	let freeze_ix = mpl_token_metadata::instruction::freeze_delegated_account(
		token_metadata_program.key(),
		delegate.key(),
		token_account.key(),
		edition.key(),
		mint.key(),
	);

	let auth_seeds = signer_seeds.unwrap_or(&[]);
	return Ok(invoke_signed(&freeze_ix, &[
		token_program.clone(),
		token_metadata_program.clone(),
		delegate.clone(),
		token_account.clone(),
		edition.clone(),
		mint.clone(),
	], &[&auth_seeds])?)
}

pub fn thaw_and_revoke<'a>(
	token_account: &AccountInfo<'a>,
	edition: &AccountInfo<'a>,
	mint: &AccountInfo<'a>,
	token_owner: &AccountInfo<'a>,
	delegate: &AccountInfo<'a>,
	token_program: &AccountInfo<'a>,
	token_metadata_program: &AccountInfo<'a>,
	signer_seeds: Option<&[&[u8]]>,
) -> Result<()> {
	let auth_seeds = signer_seeds.unwrap_or(&[]);

	let thaw_ix = mpl_token_metadata::instruction::thaw_delegated_account(
		token_metadata_program.key(),
		delegate.key(),
		token_account.key(),
		edition.key(),
		mint.key(),
	);

	invoke_signed(&thaw_ix, &[
		token_program.clone(),
		token_metadata_program.clone(),
		delegate.clone(),
		token_account.clone(),
		edition.clone(),
		mint.clone(),
	], &[&auth_seeds])?;

	return Ok(token::revoke(
		CpiContext::new(token_program.clone(), Revoke {
			source: token_account.clone(),
			authority: token_owner.clone(),
		}),
	)?)
}