use anchor_lang::prelude::*;
use crate::{error::Error, CollectionConfig};

#[derive(Accounts)]
#[instruction(args: CollectionConfigArgs)]
pub struct InitCollectionConfig<'info> {
    /// Marketplace authority wallet.
    #[account(mut)]
    pub marketplace_authority: Signer<'info>,

    #[account(
        init,
        seeds = [
            CollectionConfig::PREFIX.as_bytes(),
            args.collection_mint.as_ref()
        ],
        bump,
        space = CollectionConfig::SPACE,
        payer = marketplace_authority,
    )]
    pub collection_config: Box<Account<'info, CollectionConfig>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CollectionConfigArgs {
    pub collection_mint: Pubkey,
    pub seller_fee_basis_points: u16,
    pub symbol: String
}

pub fn init_collection_config_handler<'info>(
    ctx: Context<InitCollectionConfig>,
    args: CollectionConfigArgs
) -> Result<()> {
    let collection_config = &mut ctx.accounts.collection_config;
    collection_config.init(
        [*ctx.bumps.get(CollectionConfig::PREFIX).ok_or(Error::BumpSeedNotInHashMap)?],
        ctx.accounts.marketplace_authority.key(),
        args.collection_mint,
        args.seller_fee_basis_points,
        args.symbol,
    )?;

    Ok(())
}