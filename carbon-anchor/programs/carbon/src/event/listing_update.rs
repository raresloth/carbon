use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;
use crate::FeeConfig;

#[event]
pub struct ListingUpdate {
	pub item_id: [u8;32],
	pub price: u64,
	pub expiry: i64,
	pub seller: Pubkey,
	pub is_virtual: bool,
	pub currency_mint: Pubkey,
	pub collection_mint: Pubkey,
	pub marketplace_authority: Pubkey,
	pub fee_config: FeeConfig,
}