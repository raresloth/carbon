use anchor_lang::prelude::*;

#[account]
pub struct MintRecord {
	/// Collection config for the item
	pub collection_config: Pubkey,
	/// A unique ID for the virtual item within the collection
	pub item_id: [u8;32],
	/// Track NFT mint for the item
	pub mint: Pubkey,
}

impl MintRecord {

	pub const SPACE: usize =
		8 + 32 + 32 + 32;

	pub const PREFIX: &'static str = "mint_record";

	pub fn init(
		&mut self,
		collection_config: Pubkey,
		item_id: [u8;32],
		mint: Pubkey
	) -> Result<()> {
		self.collection_config = collection_config;
		self.item_id = item_id;
		self.mint = mint;

		return Ok(());
	}
}
