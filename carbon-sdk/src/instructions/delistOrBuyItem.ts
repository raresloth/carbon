import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import { Listing } from "../types";
import { BurnArgs } from "./burnAndCloseMintRecord";

export type DelistOrBuyItemArgs = {
	listing: Listing;
	maxPrice?: number;
	burnArgs?: BurnArgs;
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

			const ixs = [
				await this.delistNft({
					seller: this.carbon.marketplaceAuthority,
					mint: new PublicKey(listing.itemId),
					tokenOwner: custodyAccount?.owner ?? listing.seller,
				}),
			];

			if (custodyAccount != null) {
				ixs.push(
					await this.takeOwnership({
						custodyAccount,
					})
				);
			}

			if (args.burnArgs != null) {
				ixs.push(...(await this.burnAndCloseMintRecord(args.burnArgs, listing)));
			}

			return ixs;
		} else {
			const ixs = [
				await this.buyNft({
					buyer: this.carbon.marketplaceAuthority,
					listing,
					maxPrice,
				}),
			];

			if (args.burnArgs != null) {
				ixs.push(...(await this.burnAndCloseMintRecord(args.burnArgs, listing)));
			}

			return ixs;
		}
	}
}
