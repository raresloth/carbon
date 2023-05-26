import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import { Listing, MintRecord } from "../types";
import { createBurnNftInstruction } from "@metaplex-foundation/mpl-token-metadata";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { TOKEN_METADATA_PROGRAM_ID, getEditionPDA, getMetadataPDA } from "../solana";

export type DelistOrBuyItemArgs = {
	listing: Listing;
	maxPrice?: number;
	burnOnBuy?: BurnOnBuyArgs;
};

export type BurnOnBuyArgs = {
	mintRecord: MintRecord;
};

export async function delistOrBuyItem(
	args: DelistOrBuyItemArgs
): Promise<TransactionInstruction[]> {
	const { listing, maxPrice } = args;

	if (listing.isVirtual) {
		return [
			await this.delistVirtual({
				seller: this.carbon.marketplaceAuthority,
				itemId: listing.itemId,
			}),
		];
	} else {
		if (listing.seller.equals(this.carbon.marketplaceAuthority)) {
			const custodyAccount = await this.carbon.accounts.custodyAccount(
				new PublicKey(listing.itemId)
			);

			return [
				await this.delistNft({
					seller: this.carbon.marketplaceAuthority,
					mint: new PublicKey(listing.itemId),
					tokenOwner: custodyAccount?.owner ?? listing.seller,
				}),
			];
		} else {
			const ixs = [
				await this.buyNft({
					buyer: this.carbon.marketplaceAuthority,
					listing,
					maxPrice,
				}),
			];

			if (args.burnOnBuy != null) {
				const { mintRecord } = args.burnOnBuy;
				const mint = mintRecord.mint;
				ixs.push(
					createBurnNftInstruction(
						{
							metadata: getMetadataPDA(mint),
							owner: this.carbon.marketplaceAuthority,
							mint,
							tokenAccount: getAssociatedTokenAddressSync(mint, this.carbon.marketplaceAuthority),
							masterEditionAccount: getEditionPDA(mint),
							splTokenProgram: TOKEN_PROGRAM_ID,
							collectionMetadata: getMetadataPDA(listing.collectionMint),
						},
						TOKEN_METADATA_PROGRAM_ID
					)
				);

				ixs.push(
					await this.closeMintRecord({
						mintRecord,
					})
				);
			}

			return ixs;
		}
	}
}
