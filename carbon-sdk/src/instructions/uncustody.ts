import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getEditionPDA, TOKEN_METADATA_PROGRAM_ID } from "../solana";
import { CustodyAccount } from "../types";

export type UncustodyArgs = {
	marketplaceAuthority?: PublicKey;
	owner: PublicKey;
	custodyAccount: CustodyAccount;
};

export async function uncustody(args: UncustodyArgs): Promise<TransactionInstruction> {
	const { owner, custodyAccount } = args;
	const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.marketplaceAuthority;

	return await this.carbon.program.methods
		.uncustody()
		.accounts({
			owner,
			marketplaceAuthority,
			tokenAccount: getAssociatedTokenAddressSync(custodyAccount.mint, owner),
			mint: custodyAccount.mint,
			edition: getEditionPDA(custodyAccount.mint),
			custodyAccount: this.carbon.pdas.custodyAccount(custodyAccount.mint),
			listing: this.carbon.pdas.listing(Array.from(custodyAccount.mint.toBuffer())),
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
		})
		.instruction();
}
