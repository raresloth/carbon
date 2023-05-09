use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;

#[event]
pub struct Mint {
	pub item_id: [u8;32],
	pub mint: Pubkey,
	pub buyer: Pubkey,
	pub marketplace_authority: Pubkey,
	pub collection_mint: Pubkey,
}