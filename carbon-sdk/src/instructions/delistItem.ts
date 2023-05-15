import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export type DelistItemArgs = {
	seller?: PublicKey;
	itemId: number[];
};

export async function delistItem(
	args: DelistItemArgs
): Promise<TransactionInstruction | undefined> {
	const { seller, itemId } = args;
	const listing = await this.carbon.accounts.listing(itemId);
	if (listing?.isVirtual) {
		return await this.delistVirtual({
			seller,
			itemId,
		});
	} else {
		const custodyAccount = await this.carbon.accounts.custodyAccount(new PublicKey(itemId));
		return await this.delistNft({
			seller: seller ?? this.carbon.marketplaceAuthority,
			mint: new PublicKey(itemId),
			tokenOwner: custodyAccount?.owner,
		});
	}
}
