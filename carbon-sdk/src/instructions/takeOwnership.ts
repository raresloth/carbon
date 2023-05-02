import { getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getEditionPDA, TOKEN_METADATA_PROGRAM_ID } from "../solana";
import { CustodyAccount } from "../types";

export type TakeOwnershipArgs = {
	marketplaceAuthority?: PublicKey;
	custodyAccount: CustodyAccount;
};

export async function takeOwnership(args: TakeOwnershipArgs): Promise<TransactionInstruction> {
	const { custodyAccount } = args;
	const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.marketplaceAuthority;

	return await this.carbon.program.methods
		.takeOwnership()
		.accounts({
			marketplaceAuthority,
			owner: custodyAccount.owner,
			tokenAccount: getAssociatedTokenAddressSync(custodyAccount.mint, custodyAccount.owner),
			marketplaceAuthorityTokenAccount: getAssociatedTokenAddressSync(
				custodyAccount.mint,
				marketplaceAuthority!
			),
			mint: custodyAccount.mint,
			edition: getEditionPDA(custodyAccount.mint),
			custodyAccount: this.carbon.pdas.custodyAccount(custodyAccount.mint),
			listing: this.carbon.pdas.listing(Array.from(custodyAccount.mint.toBuffer())),
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
		})
		.instruction();
}
