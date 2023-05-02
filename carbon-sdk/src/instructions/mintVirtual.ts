import { IdlTypes } from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, Keypair, TransactionInstruction } from "@solana/web3.js";
import { CarbonIDL } from "..";
import { getMetadataPDA, getEditionPDA, TOKEN_METADATA_PROGRAM_ID } from "../solana";
import { CollectionConfig } from "../types";

export type MintVirtualArgs = {
	marketplaceAuthority?: PublicKey;
	buyer: PublicKey;
	itemId: number[];
	collectionConfig: CollectionConfig;
	metadata: IdlTypes<CarbonIDL.Carbon>["Metadata"];
};

export async function mintVirtual(
	args: MintVirtualArgs
): Promise<{ mint: Keypair; instruction: TransactionInstruction }> {
	const { buyer, metadata, itemId, collectionConfig } = args;
	const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.marketplaceAuthority;

	const mint = Keypair.generate();

	const builder = this.carbon.program.methods.mintVirtual(itemId, metadata).accounts({
		buyer,
		marketplaceAuthority,
		mint: mint.publicKey,
		collectionConfig: this.carbon.pdas.collectionConfig(collectionConfig.collectionMint),
		mintRecord: this.carbon.pdas.mintRecord(
			this.carbon.pdas.collectionConfig(collectionConfig.collectionMint),
			itemId
		),
		buyerTokenAccount: getAssociatedTokenAddressSync(mint.publicKey, buyer),
		metadataAccount: getMetadataPDA(mint.publicKey),
		edition: getEditionPDA(mint.publicKey),
		collectionMint: collectionConfig.collectionMint,
		collectionMetadataAccount: getMetadataPDA(collectionConfig.collectionMint),
		collectionEdition: getEditionPDA(collectionConfig.collectionMint),
		tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
		associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
	});

	return {
		mint,
		instruction: await builder.instruction(),
	};
}
