import { BN } from "@coral-xyz/anchor";
import {
	getAssociatedTokenAddressSync,
	ASSOCIATED_TOKEN_PROGRAM_ID,
	NATIVE_MINT,
} from "@solana/spl-token";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { getMetadataPDA, getEditionPDA, TOKEN_METADATA_PROGRAM_ID } from "../solana";
import { Listing } from "../types";

export type BuyNftArgs = {
	buyer: PublicKey;
	tokenOwner?: PublicKey;
	listing: Listing;
	maxPrice?: number;
};

export async function buyNft(args: BuyNftArgs): Promise<TransactionInstruction> {
	const { buyer, listing, maxPrice } = args;
	const tokenOwner = args.tokenOwner ?? listing.seller;

	const mint: PublicKey = new PublicKey(listing.itemId);

	const builder = this.carbon.program.methods
		.buyNft(maxPrice ? new BN(maxPrice) : listing.price)
		.accounts({
			buyer,
			seller: listing.seller,
			mint,
			sellerTokenAccount: getAssociatedTokenAddressSync(mint, tokenOwner),
			buyerTokenAccount: getAssociatedTokenAddressSync(mint, buyer),
			metadataAccount: getMetadataPDA(mint),
			edition: getEditionPDA(mint),
			listing: this.carbon.pdas.listing(listing.itemId),
			custodyAccount: this.carbon.pdas.custodyAccount(mint),
			feeAccount: listing.feeConfig.feeAccount,
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
		});

	if (listing.currencyMint.equals(NATIVE_MINT)) {
		builder.remainingAccounts([
			{
				pubkey: this.carbon.marketplaceAuthority,
				isWritable: true,
				isSigner: false,
			},
		]);
	} else {
		builder.remainingAccounts([
			{
				pubkey: listing.currencyMint,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, buyer),
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: this.carbon.marketplaceAuthority,
				isWritable: false,
				isSigner: false,
			},
			{
				pubkey: getAssociatedTokenAddressSync(
					listing.currencyMint,
					this.carbon.marketplaceAuthority
				),
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, listing.feeConfig.feeAccount),
				isWritable: true,
				isSigner: false,
			},
			{
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, listing.seller),
				isWritable: true,
				isSigner: false,
			},
		]);
	}

	return await builder.instruction();
}
