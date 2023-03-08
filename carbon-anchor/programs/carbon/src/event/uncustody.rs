use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;

#[event]
pub struct Uncustody {
	pub marketplace_authority: Pubkey,
	pub owner: Pubkey,
	pub mint: Pubkey,
}