use anchor_lang::prelude::*;
use instructions::*;
use state::*;
use id::*;

pub mod instructions;
pub mod state;
pub mod error;
mod id;
mod constants;
mod event;
mod util;

#[program]
pub mod carbon {
    use super::*;

    pub fn init_marketplace_config(ctx: Context<InitMarketplaceConfig>, args: MarketplaceConfigArgs) -> Result<()> {
        instructions::init_marketplace_config_handler(ctx, args)
    }

    pub fn init_collection_config(ctx: Context<InitCollectionConfig>, args: CollectionConfigArgs) -> Result<()> {
        instructions::init_collection_config_handler(ctx, args)
    }

    pub fn list_nft<'info>(
        ctx: Context<'_, '_, '_, 'info, ListNft<'info>>,
        price: u64,
        expiry: i64
    ) -> Result<()> {
        instructions::list_nft_handler(ctx, price, expiry)
    }

    pub fn list_virtual(ctx: Context<ListVirtual>, item_id: [u8;32], price: u64, expiry: i64) -> Result<()> {
        instructions::list_virtual_handler(ctx, item_id, price, expiry)
    }

    pub fn update_listing(ctx: Context<UpdateListing>, price: u64, expiry: i64) -> Result<()> {
        instructions::update_listing_handler(ctx, price, expiry)
    }

    pub fn delist_nft<'info>(ctx: Context<'_, '_, '_, 'info, DelistNft<'info>>) -> Result<()> {
        instructions::delist_nft_handler(ctx)
    }

    pub fn delist_virtual(ctx: Context<DelistVirtual>, item_id: [u8;32]) -> Result<()> {
        instructions::delist_virtual_handler(ctx, item_id)
    }

    pub fn buy_nft<'info>(
        ctx: Context<'_, '_, '_, 'info, BuyNft<'info>>,
        max_price: u64,
    ) -> Result<()> {
        instructions::buy_nft_handler(ctx, max_price)
    }

    pub fn buy_virtual<'info>(
        ctx: Context<'_, '_, '_, 'info, BuyVirtual<'info>>,
        item_id: [u8;32],
        max_price: u64,
        metadata: Metadata
    ) -> Result<()> {
        instructions::buy_virtual_handler(ctx, item_id, max_price, metadata)
    }

    pub fn mint_virtual<'info>(
        ctx: Context<'_, '_, '_, 'info, MintVirtual<'info>>,
        item_id: [u8;32],
        metadata: Metadata
    ) -> Result<()> {
        instructions::mint_virtual_handler(ctx, item_id, metadata)
    }

    pub fn custody<'info>(ctx: Context<Custody>, item_id: [u8; 32]) -> Result<()> {
        instructions::custody_handler(ctx, item_id)
    }

    pub fn uncustody<'info>(ctx: Context<Uncustody>) -> Result<()> {
        instructions::uncustody_handler(ctx)
    }

    pub fn take_ownership<'info>(ctx: Context<TakeOwnership>) -> Result<()> {
        instructions::take_ownership_handler(ctx)
    }

    pub fn close_mint_record<'info>(ctx: Context<CloseMintRecord>) -> Result<()> {
        instructions::close_mint_record_handler(ctx)
    }
}
