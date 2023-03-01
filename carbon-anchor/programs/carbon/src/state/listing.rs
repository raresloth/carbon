use anchor_lang::prelude::*;
use crate::{
	state::fee_config::{FeeConfig},
	util::assert_keys_equal,
	error::Error
};
use crate::util::assert_owned_by;

#[account]
pub struct Listing {
	pub bump: [u8; 1],
	pub version: u8,
	/// Pubkey of the marketplace authority's wallet
	pub marketplace_authority: Pubkey,
	/// Pubkey of the seller's wallet
	pub seller: Pubkey,
	/// Set to bytes of NFT mint if listing is for NFT, otherwise a unique ID for the virtual item
	pub id: [u8;32],
	/// True if the listing is for a virtual item, false if it is for an NFT
	pub is_virtual: bool,
	/// Currency to accept for payment
	pub currency_mint: Pubkey,
	/// Collection config for the item
	pub collection_config: Pubkey,
	/// Price of the item
	pub price: u64,
	/// Unix timestamp of when the listing expires
	pub expiry: i64,
	/// Fee config for the listing
	pub fee_config: FeeConfig
}

impl Listing {
	// Current version of data structure
	pub const VERSION: u8 = 1;

	// Additional padding for future proofing
	pub const SPACE: usize =
		8 + 1 + 1 + 32 + 32 + 1 + 32 + 8 + 8 + FeeConfig::SPACE + 256;

	pub const PREFIX: &'static str = "listing";

	pub fn from_account_info_with_checks<'a>(
		account_info: &AccountInfo<'a>,
		id: [u8;32]
	) -> Result<Option<Account<'a, Listing>>> {
		let (expected_pubkey, _) = Pubkey::find_program_address(
			&[
				Listing::PREFIX.as_bytes(),
				id.as_ref()
			],
			&crate::id::ID
		);

		assert_keys_equal(
			account_info.key(),
			expected_pubkey,
			"Invalid listing account key"
		)?;


		if account_info.data_is_empty() {
			return Ok(None);
		}

		assert_owned_by(account_info, &crate::id::ID)?;

		let listing_account = Account::<'a, Listing>::try_from(account_info)?;

		Ok(Some(listing_account))
	}

	pub fn auth_seeds<'a>(&'a self) -> [&'a [u8]; 3] {
		[
			Listing::PREFIX.as_bytes(),
			self.id.as_ref(),
			self.bump.as_ref()
		]
	}

	pub fn init(
		&mut self,
		bump: [u8; 1],
		marketplace_authority: Pubkey,
		seller: Pubkey,
		id: [u8;32],
		is_virtual: bool,
		currency_mint: Pubkey,
		collection_config: Pubkey,
		fee_config: FeeConfig,
		price: u64,
		expiry: i64
	) -> Result<()> {
		if expiry <= Clock::get()?.unix_timestamp {
			return err!(Error::InvalidExpiry);
		}

		self.bump = bump;
		self.version = Listing::VERSION;
		self.marketplace_authority = marketplace_authority;
		self.seller = seller;
		self.id = id;
		self.is_virtual = is_virtual;
		self.currency_mint = currency_mint;
		self.collection_config = collection_config;
		self.price = price;
		self.expiry = expiry;
		self.fee_config = fee_config;

		return Ok(());
	}

	pub fn get_fee_amount(&self) -> Result<u64> {
		return Ok((self.price as u128)
			.checked_mul(self.fee_config.bps as u128)
			.ok_or(Error::OverflowError)?
			.checked_div(10_000)
			.ok_or(Error::OverflowError)? as u64);
	}

	pub fn assert_can_buy(&self, max_price: u64) -> Result<()> {
		if self.expiry <= Clock::get()?.unix_timestamp {
			return err!(Error::ListingExpired);
		}

		if self.price > max_price {
			return err!(Error::MaxPriceExceeded);
		}

		return Ok(());
	}
}
