use anchor_lang::prelude::*;
use crate::{
	util::assert_keys_equal,
};

#[account(zero_copy)]
pub struct CustodyAccount {
	pub bump: [u8; 1],
	pub version: u8,
	/// Pubkey of the marketplace authority's wallet
	pub marketplace_authority: Pubkey,
	/// Pubkey of the user's wallet
	pub authority: Pubkey,
	/// Pubkey of the mint being custodied
	pub mint: Pubkey,
	/// True if the mint is listed for sale
	pub is_listed: bool,
}

impl CustodyAccount {
	// Current version of data structure
	pub const VERSION: u8 = 1;

	// Additional padding for future proofing
	pub const SPACE: usize =
		8 + 1 + 1 + 32 + 32 + 32 + 1 + 128;

	pub const PREFIX: &'static str = "custody_account";

	pub fn assert_is_key_for_mint<'a>(
		custody_account: Pubkey,
		mint: Pubkey
	) -> Result<()> {
		let (expected_pubkey, _) = Pubkey::find_program_address(
			&[
				CustodyAccount::PREFIX.as_bytes(),
				mint.as_ref()
			],
			&crate::id::ID
		);

		assert_keys_equal(
			custody_account,
			expected_pubkey,
			"Invalid custody account key"
		)?;

		Ok(())
	}

	pub fn auth_seeds_from_args<'a>(mint: &'a Pubkey, bump: &'a[u8]) -> [&'a [u8]; 3] {
		[
			CustodyAccount::PREFIX.as_bytes(),
			mint.as_ref(),
			bump
		]
	}

	pub fn auth_seeds<'a>(&'a self) -> [&'a [u8]; 3] {
		[
			CustodyAccount::PREFIX.as_bytes(),
			self.mint.as_ref(),
			self.bump.as_ref()
		]
	}

	pub fn init(
		&mut self,
		bump: [u8; 1],
		marketplace_authority: Pubkey,
		authority: Pubkey,
		mint: Pubkey,
	) -> Result<()> {
		self.bump = bump;
		self.version = CustodyAccount::VERSION;
		self.marketplace_authority = marketplace_authority;
		self.authority = authority;
		self.mint = mint;
		self.is_listed = false;

		return Ok(());
	}
}
