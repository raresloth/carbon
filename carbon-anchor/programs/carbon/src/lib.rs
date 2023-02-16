use anchor_lang::prelude::*;
use instructions::*;
use state::*;

pub mod instructions;
pub mod state;
pub mod error;
mod util;
mod constants;

declare_id!("CRBNZ9mWZXkgX7Um6FsdFMGFHfeNgfwbyPYtuzHxbPWB");

#[program]
pub mod carbon {
    use super::*;

    pub fn init_marketplace_config(ctx: Context<InitMarketplaceConfig>, args: MarketplaceConfigArgs) -> Result<()> {
        instructions::init_marketplace_config_handler(ctx, args)
    }

    pub fn init_collection_config(ctx: Context<InitCollectionConfig>, args: CollectionConfigArgs) -> Result<()> {
        instructions::init_collection_config_handler(ctx, args)
    }

    pub fn list_nft(ctx: Context<ListNft>, price: u64, expiry: i64) -> Result<()> {
        instructions::list_nft_handler(ctx, price, expiry)
    }

    pub fn list_virtual(ctx: Context<ListVirtual>, id: Pubkey, price: u64, expiry: i64) -> Result<()> {
        instructions::list_virtual_handler(ctx, id, price, expiry)
    }

    pub fn delist_nft(ctx: Context<DelistNft>) -> Result<()> {
        instructions::delist_nft_handler(ctx)
    }

    pub fn delist_virtual(ctx: Context<DelistVirtual>, id: Pubkey) -> Result<()> {
        instructions::delist_virtual_handler(ctx, id)
    }

    pub fn buy_nft<'info>(
        ctx: Context<'_, '_, '_, 'info, BuyNft<'info>>,
        price: u64,
    ) -> Result<()> {
        instructions::buy_nft_handler(ctx, price)
    }

    pub fn buy_virtual<'info>(
        ctx: Context<'_, '_, '_, 'info, BuyVirtual<'info>>,
        id: Pubkey,
        price: u64,
        metadata: Metadata
    ) -> Result<()> {
        instructions::buy_virtual_handler(ctx, id, price, metadata)
    }

    pub fn custody<'info>(ctx: Context<Custody>, ) -> Result<()> {
        instructions::custody_handler(ctx)
    }

    pub fn uncustody<'info>(ctx: Context<Uncustody>, ) -> Result<()> {
        instructions::uncustody_handler(ctx)
    }
}
