use anchor_lang::prelude::*;

#[account]
pub struct CustodyAccount {
	pub bump: [u8; 1],
	pub version: u8,
	/// Pubkey of the marketplace authority's wallet
	pub marketplace_authority: Pubkey,
	/// Pubkey of the user's wallet
	pub authority: Pubkey,
	/// Pubkey of the mint being custodied
	pub mint: Pubkey,
}

impl CustodyAccount {
	// Current version of data structure
	pub const VERSION: u8 = 1;

	// Additional padding for future proofing
	pub const SPACE: usize =
		8 + 1 + 1 + 32 + 32 + 32 + 128;

	pub const PREFIX: &'static str = "custody_account";

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

		return Ok(());
	}
}
