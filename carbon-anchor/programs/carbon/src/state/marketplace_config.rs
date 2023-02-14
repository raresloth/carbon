use anchor_lang::prelude::*;
use mpl_token_metadata::state::{Collection, DataV2};
use crate::{FeeConfig, Metadata};

#[account]
pub struct MarketplaceConfig {
	pub bump: [u8; 1],
	pub version: u8,
	/// Pubkey of the marketplace authority's wallet.
	pub marketplace_authority: Pubkey,
	/// Royalty bps. Inserted into newly minted metadata.
	pub fee_config: FeeConfig,
}

impl MarketplaceConfig {
	// Current version of data structure
	pub const VERSION: u8 = 1;

	// Additional padding for future proofing
	pub const SPACE: usize =
		8 + 1 + 1 + 32 + (FeeConfig::SPACE) + 256;

	pub const PREFIX: &'static str = "marketplace_config";

	pub fn auth_seeds<'a>(&'a self) -> [&'a [u8]; 2] {
		[
			MarketplaceConfig::PREFIX.as_bytes(),
			self.marketplace_authority.as_ref()
		]
	}

	pub fn init(
		&mut self,
		bump: [u8; 1],
		marketplace_authority: Pubkey,
		fee_config: FeeConfig
	) -> Result<()> {
		self.bump = bump;
		self.version = MarketplaceConfig::VERSION;
		self.marketplace_authority = marketplace_authority;
		self.fee_config = fee_config;

		return Ok(());
	}

}
