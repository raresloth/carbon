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
	#[msg("Max price exceeded")]
	MaxPriceExceeded,

	/// 5
	#[msg("Invalid listing authority")]
	InvalidSeller,
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
	#[msg("Invalid price")]
	InvalidPrice,
	#[msg("Invalid collection config")]
	InvalidCollectionConfig,

	/// 11
	#[msg("Invalid edition")]
	InvalidEdition,
}