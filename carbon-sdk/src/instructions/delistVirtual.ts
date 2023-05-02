import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export type DelistVirtualArgs = {
	seller?: PublicKey;
	itemId: number[];
};

export async function delistVirtual(args: DelistVirtualArgs): Promise<TransactionInstruction> {
	const { itemId } = args;
	const seller = args.seller ?? this.carbon.marketplaceAuthority;

	return await this.carbon.program.methods
		.delistVirtual(itemId)
		.accounts({
			seller,
			listing: this.carbon.pdas.listing(itemId),
		})
		.instruction();
}
