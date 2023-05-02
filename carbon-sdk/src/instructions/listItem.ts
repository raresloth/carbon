import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export type ListItemArgs = {
	seller?: PublicKey;
	itemId: number[];
	collectionMint: PublicKey;
	price: number;
	expiry: number;
	currencyMint?: PublicKey;
};

export async function listItem(args: ListItemArgs): Promise<TransactionInstruction> {
	const { seller, itemId, collectionMint, price, expiry, currencyMint } = args;

	let mintAccountInfo;
	try {
		const mint = new PublicKey(itemId);
		mintAccountInfo = await this.carbon.program.provider.connection.getAccountInfo(mint);
	} catch (e) {}

	// Account info does not exist, therefore has not been minted
	if (mintAccountInfo == null) {
		return await this.listVirtual({
			seller: seller ?? this.carbon.marketplaceAuthority,
			itemId,
			collectionMint,
			price,
			expiry,
			currencyMint,
		});
	} else {
		return await this.listNft({
			seller: seller ?? this.carbon.marketplaceAuthority,
			mint: new PublicKey(itemId),
			collectionMint,
			price,
			expiry,
			currencyMint,
		});
	}
}
