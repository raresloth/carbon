import { createBurnNftInstruction } from "@metaplex-foundation/mpl-token-metadata";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TransactionInstruction } from "@solana/web3.js";
import { getMetadataPDA, getEditionPDA, TOKEN_METADATA_PROGRAM_ID } from "../solana";
import { MintRecord, Listing } from "../types";

export type BurnArgs = {
	mintRecord: MintRecord;
};

export async function burnAndCloseMintRecord(
	burnArgs: BurnArgs,
	listing: Listing
): Promise<TransactionInstruction[]> {
	const ixs: TransactionInstruction[] = [];
	const { mintRecord } = burnArgs;
	const mint = mintRecord.mint;

	ixs.push(
		createBurnNftInstruction(
			{
				metadata: getMetadataPDA(mint),
				owner: this.carbon.marketplaceAuthority,
				mint,
				tokenAccount: getAssociatedTokenAddressSync(mint, this.carbon.marketplaceAuthority),
				masterEditionAccount: getEditionPDA(mint),
				splTokenProgram: TOKEN_PROGRAM_ID,
				collectionMetadata: getMetadataPDA(listing.collectionMint),
			},
			TOKEN_METADATA_PROGRAM_ID
		)
	);

	ixs.push(
		await this.closeMintRecord({
			mintRecord,
		})
	);

	return ixs;
}
