import { BN } from "@coral-xyz/anchor";
import {
	getAssociatedTokenAddressSync,
	ASSOCIATED_TOKEN_PROGRAM_ID,
	NATIVE_MINT,
} from "@solana/spl-token";
import { PublicKey, Keypair, TransactionInstruction } from "@solana/web3.js";
import { getMetadataPDA, getEditionPDA, TOKEN_METADATA_PROGRAM_ID } from "../solana";
import { CollectionConfig, Listing, Metadata } from "../types";

export type BuyVirtualArgs = {
	marketplaceAuthority?: PublicKey;
	buyer: PublicKey;
	collectionConfig: CollectionConfig;
	listing: Listing;
	metadata: Metadata;
	maxPrice?: number;
};

export async function buyVirtual(
	args: BuyVirtualArgs
): Promise<{ mint: Keypair; instruction: TransactionInstruction }> {
	const { buyer, listing, metadata, collectionConfig, maxPrice } = args;
	const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.marketplaceAuthority;

	const mint = Keypair.generate();

	const builder = this.carbon.program.methods
		.buyVirtual(listing.itemId, maxPrice ? new BN(maxPrice) : listing.price, metadata)
		.accounts({
			buyer,
			seller: listing.seller,
			mint: mint.publicKey,
			collectionConfig: this.carbon.pdas.collectionConfig(collectionConfig.collectionMint),
			mintRecord: this.carbon.pdas.mintRecord(
				this.carbon.pdas.collectionConfig(collectionConfig.collectionMint),
				listing.itemId
			),
			buyerTokenAccount: getAssociatedTokenAddressSync(mint.publicKey, buyer),
			metadataAccount: getMetadataPDA(mint.publicKey),
			edition: getEditionPDA(mint.publicKey),
			collectionMint: collectionConfig.collectionMint,
			collectionMetadataAccount: getMetadataPDA(collectionConfig.collectionMint),
			collectionEdition: getEditionPDA(collectionConfig.collectionMint),
			listing: this.carbon.pdas.listing(listing.itemId),
			feeAccount: listing.feeConfig.feeAccount,
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
		});

	if (listing.currencyMint.equals(NATIVE_MINT)) {
		builder.remainingAccounts([
			{
				pubkey: marketplaceAuthority!,
				isWritable: true,
				isSigner: true,
			},
		]);
	} else {
		builder.remainingAccounts([
			{
				pubkey: listing.currencyMint,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, buyer),
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: marketplaceAuthority,
				isWritable: false,
				isSigner: true,
			},
			{
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, marketplaceAuthority),
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, listing.feeConfig.feeAccount),
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, listing.seller),
				isWritable: true,
				isSigner: false,
			},
		]);
	}

	return {
		mint,
		instruction: await builder.instruction(),
	};
}
