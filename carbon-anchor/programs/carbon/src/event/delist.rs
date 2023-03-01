use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;

#[event]
pub struct Delist {
	pub id: Pubkey,
	pub seller: Pubkey,
}