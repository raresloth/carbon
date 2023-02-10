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
use crate::util::error::Error;

pub fn is_native_mint(key: Pubkey) -> bool {
	return key == spl_token::native_mint::ID;
}

pub fn is_default(key: Pubkey) -> bool {
	return key == Pubkey::default();
}

pub fn assert_keys_equal(key1: Pubkey, key2: Pubkey) -> Result<()> {
	if key1 != key2 {
		err!(Error::PublicKeyMismatch)
	} else {
		Ok(())
	}
}

pub fn assert_is_ata(ata: &AccountInfo, wallet: &Pubkey, mint: &Pubkey) -> Result<SplAccount> {
	assert_owned_by(ata, &spl_token::id())?;
	let ata_account: SplAccount = assert_initialized(ata)?;
	assert_keys_equal(ata_account.owner, *wallet)?;
	assert_keys_equal(ata_account.mint, *mint)?;
	assert_keys_equal(get_associated_token_address(wallet, mint), *ata.key)?;
	Ok(ata_account)
}

pub fn assert_is_mint<'info>(mint: &AccountInfo<'info>) -> Result<Account<'info, Mint>> {
	assert_owned_by(mint, &spl_token::id())?;
	let _spl_mint: spl_token::state::Mint = assert_initialized(mint)?;
	let mint_account = Account::<'info, Mint>::try_from(mint)?;
	Ok(mint_account)
}

pub fn assert_is_nft_in_collection<'info>(
	nft_mint: &Account<'info, Mint>,
	nft_metadata: &Account<'info, MetadataAccount>,
	collection: Pubkey
) -> Result<()> {
	assert_owned_by(&nft_metadata.to_account_info(), &mpl_token_metadata::id())?;
	assert_keys_equal(nft_metadata.mint, nft_mint.key())?;

	let collection_data = nft_metadata.collection.as_ref().unwrap();
	assert!(collection_data.verified);
	assert_keys_equal(collection_data.key, collection)?;

	Ok(())
}

pub fn assert_owned_by(account: &AccountInfo, owner: &Pubkey) -> Result<()> {
	if account.owner != owner {
		err!(Error::IncorrectOwner)
	} else {
		Ok(())
	}
}

pub fn assert_initialized<T: Pack + IsInitialized>(account_info: &AccountInfo) -> Result<T> {
	let account: T = T::unpack_unchecked(&account_info.data.borrow())?;
	if !account.is_initialized() {
		err!(Error::UninitializedAccount)
	} else {
		Ok(account)
	}
}
