use anchor_lang::prelude::*;
use instructions::*;

pub mod instructions;
pub mod state;
pub mod error;
mod util;
mod constants;

declare_id!("VRTEittKzMw7RxcmwAvk9WEQwjrceHawEM3fpzg9LUc");

#[program]
pub mod virt {
    use super::*;

    pub fn list_nft(ctx: Context<ListNft>, price: u64, expiry: i64) -> Result<()> {
        instructions::list_nft_handler(ctx, price, expiry)
    }
}
