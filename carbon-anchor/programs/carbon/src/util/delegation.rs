use anchor_lang::prelude::*;
use anchor_spl::token;
use anchor_spl::token::{Approve, Revoke};
use solana_program::{account_info::AccountInfo};
use solana_program::program::{invoke_signed};

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
	thaw(
		token_account,
		mint,
		edition,
		delegate,
		token_program,
		token_metadata_program,
		signer_seeds,
	)?;

	token::revoke(
		CpiContext::new(token_program.clone(), Revoke {
			source: token_account.clone(),
			authority: token_owner.clone(),
		}),
	)?;

	return Ok(())
}

pub fn thaw<'a>(
	token_account: &AccountInfo<'a>,
	mint: &AccountInfo<'a>,
	edition: &AccountInfo<'a>,
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

	return Ok(())
}