use anchor_lang::prelude::*;
use crate::{error::Error, state::{CollectionConfig, MintRecord}, util::assert_is_edition_account};

#[derive(Accounts)]
pub struct CloseMintRecord<'info> {
    /// Marketplace authority wallet.
    #[account(mut)]
    pub marketplace_authority: Signer<'info>,

    /// CHECK: Safe due to mint_record constraint
    pub mint: UncheckedAccount<'info>,

    /// Edition account of the NFT.
	/// CHECK: Verified in handler
	#[account(mut)]
	pub edition: UncheckedAccount<'info>,

    #[account(
        seeds = [
            CollectionConfig::PREFIX.as_bytes(),
            collection_config.collection_mint.key().as_ref()
        ],
        bump = collection_config.bump[0],
        has_one = marketplace_authority,
    )]
    pub collection_config: Box<Account<'info, CollectionConfig>>,

    #[account(
        mut,
        close = marketplace_authority,
        seeds = [
			MintRecord::PREFIX.as_bytes(),
			collection_config.key().as_ref(),
			mint_record.item_id.as_ref(),
		],
        bump,
        has_one = collection_config @ Error::InvalidCollectionConfig,
        has_one = mint @ Error::InvalidMint,
    )]
    pub mint_record: Box<Account<'info, MintRecord>>,

    pub system_program: Program<'info, System>,
}

pub fn close_mint_record_handler<'info>(
    ctx: Context<CloseMintRecord>,
) -> Result<()> {
    assert_is_edition_account(ctx.accounts.edition.key(), ctx.accounts.mint.key())?;

    if !ctx.accounts.edition.data_is_empty() {
		msg!("Edition account must be empty");
	}
	require!(ctx.accounts.edition.data_is_empty(), Error::InvalidEdition);

    Ok(())
}