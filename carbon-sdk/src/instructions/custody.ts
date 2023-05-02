import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getEditionPDA, TOKEN_METADATA_PROGRAM_ID } from "../solana";

export type CustodyArgs = {
	marketplaceAuthority?: PublicKey;
	owner: PublicKey;
	mint: PublicKey;
	itemId: number[];
	accounts?: any;
};

export async function custody(args: CustodyArgs): Promise<TransactionInstruction> {
	const { owner, mint, itemId, accounts } = args;
	const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.marketplaceAuthority;

	return await this.carbon.program.methods
		.custody(itemId)
		.accounts({
			owner,
			marketplaceAuthority,
			tokenAccount: getAssociatedTokenAddressSync(mint, owner),
			mint,
			edition: getEditionPDA(mint),
			custodyAccount: this.carbon.pdas.custodyAccount(mint),
			listing: this.carbon.pdas.listing(Array.from(mint.toBuffer())),
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			...(accounts || {}),
		})
		.instruction();
}
