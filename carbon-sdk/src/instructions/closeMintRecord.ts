import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { MintRecord } from "../types";
import { getEditionPDA } from "../solana";

export type CloseMintRecordArgs = {
	marketplaceAuthority?: PublicKey;
	mintRecord: MintRecord;
};

export async function closeMintRecord(args: CloseMintRecordArgs): Promise<TransactionInstruction> {
	const { mintRecord } = args;
	const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.marketplaceAuthority;

	return await this.carbon.program.methods
		.closeMintRecord()
		.accounts({
			marketplaceAuthority,
			mint: mintRecord.mint,
			edition: getEditionPDA(mintRecord.mint),
			collectionConfig: mintRecord.collectionConfig,
			mintRecord: this.carbon.pdas.mintRecord(mintRecord.collectionConfig, mintRecord.itemId),
		})
		.instruction();
}
