import { IdlTypes } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { CarbonIDL } from "..";

export type InitCollectionConfigArgs = {
	marketplaceAuthority: PublicKey;
	args: IdlTypes<CarbonIDL.Carbon>["CollectionConfigArgs"];
};

export async function initCollectionConfig(
	args: InitCollectionConfigArgs
): Promise<TransactionInstruction> {
	const { marketplaceAuthority, args: methodArgs } = args;
	return await this.carbon.program.methods
		.initCollectionConfig(methodArgs)
		.accounts({
			marketplaceAuthority,
			collectionConfig: this.carbon.pdas.collectionConfig(methodArgs.collectionMint),
		})
		.instruction();
}
