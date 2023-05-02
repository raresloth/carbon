import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import { Listing } from "../types";

export type DelistOrBuyItemArgs = {
	listing: Listing;
	maxPrice?: number;
};

export async function delistOrBuyItem(args: DelistOrBuyItemArgs): Promise<TransactionInstruction> {
	const { listing, maxPrice } = args;

	if (listing.isVirtual) {
		return await this.delistVirtual({
			seller: this.carbon.marketplaceAuthority,
			itemId: listing.itemId,
		});
	} else {
		if (listing.seller.equals(this.carbon.marketplaceAuthority)) {
			return await this.delistNft({
				seller: this.carbon.marketplaceAuthority,
				mint: new PublicKey(listing.itemId),
			});
		} else {
			return await this.buyNft({
				buyer: this.carbon.marketplaceAuthority,
				listing,
				maxPrice,
			});
		}
	}
}
