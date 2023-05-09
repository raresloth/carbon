import { BN } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

export type UpdateListingArgs = {
	seller?: PublicKey;
	listing: PublicKey;
	price: number;
	expiry: number;
};

export async function updateListing(args: UpdateListingArgs): Promise<TransactionInstruction> {
	const { listing, price, expiry } = args;
	const seller = args.seller ?? this.carbon.marketplaceAuthority;

	return await this.carbon.program.methods
		.updateListing(new BN(price), new BN(expiry))
		.accounts({
			seller,
			listing,
		})
		.instruction();
}
