use anchor_lang::prelude::*;

#[error_code]
pub enum Error {
	/// 0
	#[msg("Bump seed not in hash map")]
	BumpSeedNotInHashMap,
	#[msg("Invalid expiry")]
	InvalidExpiry,
}