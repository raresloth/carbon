use anchor_lang::prelude::*;
use crate::{error::Error, MarketplaceConfig, FeeConfig};

#[derive(Accounts)]
pub struct InitMarketplaceConfig<'info> {
    /// Marketplace authority wallet.
    #[account(mut)]
    pub marketplace_authority: Signer<'info>,

    #[account(
        init,
        seeds = [
            MarketplaceConfig::PREFIX.as_bytes(),
            marketplace_authority.key().as_ref()
        ],
        bump,
        space = MarketplaceConfig::SPACE,
        payer = marketplace_authority,
    )]
    pub marketplace_config: Box<Account<'info, MarketplaceConfig>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MarketplaceConfigArgs {
    pub fee_config: FeeConfig
}

pub fn init_marketplace_config_handler<'info>(
    ctx: Context<InitMarketplaceConfig>,
    args: MarketplaceConfigArgs
) -> Result<()> {
    let marketplace_config = &mut ctx.accounts.marketplace_config;
    marketplace_config.init(
        [*ctx.bumps.get(MarketplaceConfig::PREFIX).ok_or(Error::BumpSeedNotInHashMap)?],
        ctx.accounts.marketplace_authority.key(),
        args.fee_config
    )?;

    Ok(())
}