use anchor_lang::prelude::*;

#[error_code]
pub enum Error {
	/// 0
	#[msg("Invalid public key")]
	PublicKeyMismatch,
	#[msg("Incorrect owner")]
	IncorrectOwner,
	#[msg("Account not initialized")]
	UninitializedAccount,
	#[msg("Overflow error")]
	OverflowError,
	#[msg("Collection not set")]
	CollectionNotSet
}