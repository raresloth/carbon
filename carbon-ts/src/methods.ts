import {Keypair, PublicKey} from "@solana/web3.js";
import Carbon from "./carbon";
import {ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, NATIVE_MINT} from "@solana/spl-token";
import {BN, IdlAccounts, IdlTypes} from "@coral-xyz/anchor";
import {getEditionPDA, getMetadataPDA, TOKEN_METADATA_PROGRAM_ID} from "./solana";
import * as CarbonIDL from "./idl/carbon";

export class Methods {
	constructor(
		public carbon: Carbon,
	) {}

	async initCollectionConfig(
		authority: Keypair,
		args: IdlTypes<CarbonIDL.Carbon>["CollectionConfigArgs"]
	) {
		await this.carbon.program.methods.initCollectionConfig(args)
			.accounts({
				authority: authority.publicKey,
				collectionConfig: this.carbon.pdas.collectionConfig(authority.publicKey, args.collectionMint),
			}).signers([authority]).rpc();
	}

	async listNft(
		authority: Keypair,
		mint: PublicKey,
		price: number,
		expiry: number,
		currencyMint: PublicKey = NATIVE_MINT,
	) {
		await this.carbon.program.methods
			.listNft(
				new BN(price),
				new BN(expiry),
			)
			.accounts({
				authority: authority.publicKey,
				tokenAccount: getAssociatedTokenAddressSync(mint, authority.publicKey),
				mint,
				edition: getEditionPDA(mint),
				currencyMint,
				listing: this.carbon.pdas.listing(mint),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			})
			.signers([authority])
			.rpc();
	}

	async listVirtual(
		authority: Keypair,
		id: PublicKey,
		price: number,
		expiry: number,
		currencyMint: PublicKey = NATIVE_MINT,
	) {
		await this.carbon.program.methods
			.listVirtual(
				id,
				new BN(price),
				new BN(expiry),
			)
			.accounts({
				authority: authority.publicKey,
				currencyMint,
				listing: this.carbon.pdas.listing(id),
			})
			.signers([authority])
			.rpc();
	}

	async buyVirtual(
		buyer: Keypair,
		authority: Keypair,
		collectionAuthority: Keypair,
		mintAuthority: Keypair,
		collectionConfig: IdlAccounts<CarbonIDL.Carbon>["collectionConfig"],
		listing: IdlAccounts<CarbonIDL.Carbon>["listing"],
		metadata: IdlTypes<CarbonIDL.Carbon>["Metadata"]
	): Promise<PublicKey> {
		const mint = Keypair.generate();

		await this.carbon.program.methods
			.buyVirtual(
				listing.id,
				listing.price,
				metadata
			)
			.accounts({
				buyer: buyer.publicKey,
				authority: authority.publicKey,
				collectionAuthority: collectionAuthority.publicKey,
				mint: mint.publicKey,
				mintAuthority: mintAuthority.publicKey,
				collectionConfig: this.carbon.pdas.collectionConfig(authority.publicKey, collectionConfig.collectionMint),
				buyerTokenAccount: getAssociatedTokenAddressSync(mint.publicKey, buyer.publicKey),
				metadataAccount: getMetadataPDA(mint.publicKey),
				edition: getEditionPDA(mint.publicKey),
				collectionMint: collectionConfig.collectionMint,
				collectionMetadataAccount: getMetadataPDA(collectionConfig.collectionMint),
				collectionEdition: getEditionPDA(collectionConfig.collectionMint),
				listing: this.carbon.pdas.listing(listing.id),
				feeAccount: listing.feeConfig.feeAccount,
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			})
			.signers([buyer, authority, collectionAuthority, mint, mintAuthority])
			.rpc();

		return mint.publicKey;
	}

}

export default Methods;