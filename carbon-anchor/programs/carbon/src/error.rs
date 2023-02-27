use anchor_lang::prelude::*;

#[error_code]
pub enum Error {
	/// 0
	#[msg("Bump seed not in hash map")]
	BumpSeedNotInHashMap,
	#[msg("Invalid expiry")]
	InvalidExpiry,
	#[msg("Not virtual")]
	NotVirtual,
	#[msg("Listing expired")]
	ListingExpired,
	#[msg("Price mismatch")]
	PriceMismatch,

	/// 5
	#[msg("Invalid listing authority")]
	InvalidListingAuthority,
	#[msg("Overflow error")]
	OverflowError,
	#[msg("Invalid fee account")]
	InvalidFeeAccount,
	#[msg("Item is virtual")]
	IsVirtual,
	#[msg("Invalid mint")]
	InvalidMint,

	/// 10
	#[msg("Nft is listed")]
	NftIsListed,
	#[msg("Invalid custody account")]
	InvalidCustodyAccount,
	#[msg("Invalid listing account")]
	InvalidListingAccount,
	#[msg("Invalid seller")]
	InvalidSeller
}