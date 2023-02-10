use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct FeeSchedule {
	pub beneficiary: Pubkey,
	pub bps: u16,
}

impl FeeSchedule {
	// Additional padding for future proofing
	pub const SPACE: usize = 32 + 2 + 128;

	pub fn default() -> Self {
		Self {
			beneficiary: crate::constants::FEE_ACCOUNT,
			bps: crate::constants::FEE_BPS
		}
	}
}