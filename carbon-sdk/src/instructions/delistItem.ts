import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export type DelistItemArgs = {
	seller?: PublicKey;
	itemId: number[];
};

export async function delistItem(
	args: DelistItemArgs
): Promise<TransactionInstruction | undefined> {
	const { seller, itemId } = args;
	try {
		const listing = await this.carbon.program.account.listing.fetch(
			this.carbon.pdas.listing(itemId)
		);
		if (listing.isVirtual) {
			return await this.delistVirtual({
				seller,
				itemId,
			});
		} else {
			return await this.delistNft({
				seller: seller ?? this.carbon.marketplaceAuthority,
				mint: new PublicKey(itemId),
			});
		}
	} catch (e) {
		if (e?.message.includes("Account does not exist")) {
			return;
		} else {
			throw e;
		}
	}
}
