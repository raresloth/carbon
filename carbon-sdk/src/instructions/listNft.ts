import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync, NATIVE_MINT } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getMetadataPDA, getEditionPDA, TOKEN_METADATA_PROGRAM_ID } from "../solana";

export type ListNftArgs = {
	seller: PublicKey;
	mint: PublicKey;
	collectionMint: PublicKey;
	price: number;
	expiry: number;
	currencyMint?: PublicKey;
	accounts?: any;
};

export async function listNft(args: ListNftArgs): Promise<TransactionInstruction> {
	const { seller, mint, collectionMint, price, expiry, currencyMint, accounts } = args;

	return await this.carbon.program.methods
		.listNft(new BN(price), new BN(expiry))
		.accounts({
			seller,
			tokenAccount: getAssociatedTokenAddressSync(mint, seller),
			mint,
			collectionMint,
			metadataAccount: getMetadataPDA(mint),
			edition: getEditionPDA(mint),
			currencyMint: currencyMint ?? NATIVE_MINT,
			listing: this.carbon.pdas.listing(Array.from(mint.toBytes())),
			collectionConfig: this.carbon.pdas.collectionConfig(collectionMint),
			marketplaceConfig: this.carbon.pdas.marketplaceConfig(this.carbon.marketplaceAuthority),
			custodyAccount: this.carbon.pdas.custodyAccount(mint),
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			...(accounts || {}),
		})
		.instruction();
}
