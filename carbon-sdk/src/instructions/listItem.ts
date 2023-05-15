import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export type ListItemArgs = {
	seller?: PublicKey;
	tokenOwner?: PublicKey;
	itemId: number[];
	collectionMint: PublicKey;
	price: number;
	expiry: number;
	currencyMint?: PublicKey;
};

export async function listItem(args: ListItemArgs): Promise<TransactionInstruction> {
	const { seller, tokenOwner, itemId, collectionMint, price, expiry, currencyMint } = args;

	const mintAccountInfo = await this.carbon.accounts.getAccountInfo(new PublicKey(itemId));

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
			tokenOwner,
			mint: new PublicKey(itemId),
			collectionMint,
			price,
			expiry,
			currencyMint,
		});
	}
}
