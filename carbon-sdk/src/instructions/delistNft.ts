import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getEditionPDA, TOKEN_METADATA_PROGRAM_ID } from "../solana";

export type DelistNftArgs = {
	seller: PublicKey;
	mint: PublicKey;
	tokenOwner?: PublicKey;
};

export async function delistNft(args: DelistNftArgs): Promise<TransactionInstruction> {
	const { seller, mint } = args;
	const tokenOwner = args.tokenOwner ?? seller;

	return await this.carbon.program.methods
		.delistNft()
		.accounts({
			seller,
			tokenAccount: getAssociatedTokenAddressSync(mint, tokenOwner),
			mint,
			edition: getEditionPDA(mint),
			listing: this.carbon.pdas.listing(Array.from(mint.toBuffer())),
			custodyAccount: this.carbon.pdas.custodyAccount(mint),
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
		})
		.instruction();
}
