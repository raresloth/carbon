import { BN } from "@coral-xyz/anchor";
import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export type ListVirtualArgs = {
	seller?: PublicKey;
	marketplaceAuthority?: PublicKey;
	itemId: number[];
	collectionMint: PublicKey;
	price: number;
	expiry: number;
	currencyMint?: PublicKey;
};

export async function listVirtual(args: ListVirtualArgs): Promise<TransactionInstruction> {
	const { itemId, price, expiry, collectionMint, currencyMint } = args;
	const seller = args.seller ?? this.carbon.marketplaceAuthority;
	const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.marketplaceAuthority;

	return await this.carbon.program.methods
		.listVirtual(itemId, new BN(price), new BN(expiry))
		.accounts({
			seller,
			marketplaceAuthority,
			currencyMint: currencyMint ?? NATIVE_MINT,
			listing: this.carbon.pdas.listing(itemId),
			collectionConfig: this.carbon.pdas.collectionConfig(collectionMint),
			marketplaceConfig: this.carbon.pdas.marketplaceConfig(marketplaceAuthority),
		})
		.instruction();
}
