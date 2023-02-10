use anchor_lang::prelude::*;
use crate::{
	state::fee_schedule::{FeeSchedule},
	error::Error
};

#[account]
pub struct Listing {
	pub bump: [u8; 1],
	pub version: u8,
	pub authority: Pubkey,
	// Set to mint of NFT if listing is for NFT, otherwise a unique ID for the virtual item
	pub id: Pubkey,
	// True if the listing is for a virtual item, false if it is for an NFT
	pub is_virtual: bool,
	pub currency_mint: Pubkey,
	pub price: u64,
	pub expiry: i64,
	pub fee_schedule: FeeSchedule
}

impl Listing {
	// Current version of data structure
	pub const VERSION: u8 = 1;

	// Additional padding for future proofing
	pub const SPACE: usize =
		8 + 1 + 1 + 32 + 32 + 1 + 32 + 8 + 8 + FeeSchedule::SPACE + 256;

	pub const PREFIX: &'static str = "listing";

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
		authority: Pubkey,
		id: Pubkey,
		is_virtual: bool,
		currency_mint: Pubkey,
		price: u64,
		expiry: i64
	) -> Result<()> {
		if expiry <= Clock::get()?.unix_timestamp {
			return err!(Error::InvalidExpiry);
		}

		self.bump = bump;
		self.version = Listing::VERSION;
		self.authority = authority;
		self.id = id;
		self.is_virtual = is_virtual;
		self.currency_mint = currency_mint;
		self.price = price;
		self.expiry = expiry;
		self.fee_schedule = FeeSchedule::default();

		return Ok(());
	}
}
