use anchor_lang::prelude::*;
use mpl_token_metadata::state::{Collection, DataV2};
use crate::{Metadata};

#[account]
pub struct CollectionConfig {
	pub bump: [u8; 1],
	pub version: u8,
	/// Pubkey of the marketplace authority's wallet
	pub authority: Pubkey,
	/// The verified collection key
	pub collection_mint: Pubkey,
	/// Pubkey of the mint authority to be used for newly minted items for this collection
	pub mint_authority: Pubkey,
	pub seller_fee_basis_points: u16,
	/// Max 16 chars for symbol
	pub symbol: String,
}

impl CollectionConfig {
	// Current version of data structure
	pub const VERSION: u8 = 1;

	pub const MAX_SYMBOL_LENGTH: usize = 16;

	// Additional padding for future proofing
	pub const SPACE: usize =
		8 + 1 + 1 + 32 + 32 + 32 + 2 + (4 + CollectionConfig::MAX_SYMBOL_LENGTH) + 256;

	pub const PREFIX: &'static str = "collection_config";

	pub fn auth_seeds<'a>(&'a self) -> [&'a [u8]; 3] {
		[
			CollectionConfig::PREFIX.as_bytes(),
			self.authority.as_ref(),
			self.collection_mint.as_ref()
		]
	}

	pub fn init(
		&mut self,
		bump: [u8; 1],
		authority: Pubkey,
		collection_mint: Pubkey,
		mint_authority: Pubkey,
		seller_fee_basis_points: u16,
		symbol: String
	) -> Result<()> {
		self.bump = bump;
		self.version = CollectionConfig::VERSION;
		self.authority = authority;
		self.collection_mint = collection_mint;
		self.mint_authority = mint_authority;
		self.seller_fee_basis_points = seller_fee_basis_points;
		self.symbol = symbol;

		return Ok(());
	}

	pub fn get_mpl_metadata(&self, metadata: Metadata) -> Result<DataV2> {
		return Ok(DataV2 {
			name: metadata.name.to_string(),
			uri: metadata.uri.to_string(),
			symbol: self.symbol.to_string(),
			seller_fee_basis_points: self.seller_fee_basis_points,
			creators: None,
			collection: Some(Collection {
				verified: false,
				key: self.collection_mint
			}),
			uses: None
		});
	}

}
