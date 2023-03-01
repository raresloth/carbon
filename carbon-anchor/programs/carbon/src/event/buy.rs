use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;
use crate::FeeConfig;

#[event]
pub struct Buy {
	pub id: [u8;32],
	pub mint: Pubkey,
	pub price: u64,
	pub seller: Pubkey,
	pub buyer: Pubkey,
	pub is_virtual: bool,
	pub currency_mint: Pubkey,
	pub marketplace_authority: Pubkey,
	pub fee_config: FeeConfig,
}