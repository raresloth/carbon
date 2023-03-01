use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct FeeConfig {
	pub fee_account: Pubkey,
	pub bps: u16,
}

impl FeeConfig {
	// Additional padding for future proofing
	pub const SPACE: usize = 32 + 2 + 128;

	pub fn default() -> Self {
		Self {
			fee_account: crate::constants::FEE_ACCOUNT,
			bps: crate::constants::FEE_BPS
		}
	}
}