use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Metadata {
	pub name: String,
	pub uri: String,
}