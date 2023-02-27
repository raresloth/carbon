use anchor_lang::prelude::*;
use anchor_spl::associated_token::get_associated_token_address;
use anchor_spl::token::{Mint};
use anchor_spl::metadata::{MetadataAccount};
use solana_program::{pubkey::Pubkey, account_info::AccountInfo};
use solana_program::program_pack::{IsInitialized, Pack};
use spl_token::state::Account as SplAccount;
use crate::util::error::Error;

pub fn is_native_mint(key: Pubkey) -> bool {
	return key == spl_token::native_mint::ID;
}

pub fn assert_keys_equal(key1: Pubkey, key2: Pubkey, error_message: &str) -> Result<()> {
	if key1 != key2 {
		msg!("{}: actual: {} expected: {}", error_message, key1, key2);
	}

	require!(key1 == key2, Error::PublicKeyMismatch);

	Ok(())
}

pub fn assert_is_ata(ata: &AccountInfo, wallet: &Pubkey, mint: &Pubkey) -> Result<SplAccount> {
	assert_owned_by(ata, &spl_token::id())?;
	let ata_account: SplAccount = assert_initialized(ata)?;
	assert_keys_equal(ata_account.owner, *wallet, "Invalid ATA owner")?;
	assert_keys_equal(ata_account.mint, *mint, "Invalid ATA mint")?;
	assert_keys_equal(get_associated_token_address(wallet, mint), *ata.key, "Invalid ATA address")?;
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
	assert_keys_equal(nft_metadata.mint, nft_mint.key(), "Invalid metadata mint")?;

	let collection_data = nft_metadata.collection.as_ref()
		.ok_or(Error::CollectionNotSet)?;
	assert!(collection_data.verified);
	assert_keys_equal(collection_data.key, collection, "Invalid collection key")?;

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

pub fn assert_is_metadata_account(
	metadata_account: Pubkey,
	mint: Pubkey,
) -> Result<()> {
	let metadata_program_id = &mpl_token_metadata::id();
	let metadata_seeds = &[
		mpl_token_metadata::state::PREFIX.as_bytes(),
		metadata_program_id.as_ref(),
		mint.as_ref()
	];
	let (expected_metadata_account, _) = Pubkey::find_program_address(
		metadata_seeds,
		metadata_program_id
	);

	assert_keys_equal(metadata_account, expected_metadata_account, "Invalid metadata account")?;

	Ok(())
}