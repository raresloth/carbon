use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;

#[event]
pub struct Custody {
	pub marketplace_authority: Pubkey,
	pub owner: Pubkey,
	pub mint: Pubkey,
	pub item_id: [u8; 32],
}