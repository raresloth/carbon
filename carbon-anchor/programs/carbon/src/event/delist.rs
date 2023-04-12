use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;

#[event]
pub struct Delist {
	pub item_id: [u8;32],
	pub seller: Pubkey,
	pub marketplace_authority: Pubkey,
	pub collection_config: Pubkey,
}