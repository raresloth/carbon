import {Keypair, PublicKey} from "@solana/web3.js";
import Virt from "./virt";
import {ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, NATIVE_MINT} from "@solana/spl-token";
import {BN, IdlAccounts, IdlTypes} from "@coral-xyz/anchor";
import {getEditionPDA, getMetadataPDA, TOKEN_METADATA_PROGRAM_ID} from "./solana";
import * as VirtIDL from "./idl/virt";

export class Methods {
	constructor(
		public virt: Virt,
	) {}

	async initCollectionConfig(
		authority: Keypair,
		args: IdlTypes<VirtIDL.Virt>["CollectionConfigArgs"]
	) {
		await this.virt.program.methods.initCollectionConfig(args)
			.accounts({
				authority: authority.publicKey,
				collectionConfig: this.virt.pdas.collectionConfig(authority.publicKey, args.collectionMint),
			}).signers([authority]).rpc();
	}

	async listNft(
		authority: Keypair,
		mint: PublicKey,
		price: number,
		expiry: number,
		currencyMint: PublicKey = NATIVE_MINT,
	) {
		await this.virt.program.methods
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
				listing: this.virt.pdas.listing(mint),
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
		await this.virt.program.methods
			.listVirtual(
				id,
				new BN(price),
				new BN(expiry),
			)
			.accounts({
				authority: authority.publicKey,
				currencyMint,
				listing: this.virt.pdas.listing(id),
			})
			.signers([authority])
			.rpc();
	}

	async buyVirtual(
		buyer: Keypair,
		authority: Keypair,
		collectionAuthority: Keypair,
		mintAuthority: Keypair,
		collectionConfig: IdlAccounts<VirtIDL.Virt>["collectionConfig"],
		listing: IdlAccounts<VirtIDL.Virt>["listing"],
		metadata: IdlTypes<VirtIDL.Virt>["Metadata"]
	): Promise<PublicKey> {
		const mint = Keypair.generate();

		await this.virt.program.methods
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
				collectionConfig: this.virt.pdas.collectionConfig(authority.publicKey, collectionConfig.collectionMint),
				buyerTokenAccount: getAssociatedTokenAddressSync(mint.publicKey, buyer.publicKey),
				metadataAccount: getMetadataPDA(mint.publicKey),
				edition: getEditionPDA(mint.publicKey),
				collectionMint: collectionConfig.collectionMint,
				collectionMetadataAccount: getMetadataPDA(collectionConfig.collectionMint),
				collectionEdition: getEditionPDA(collectionConfig.collectionMint),
				listing: this.virt.pdas.listing(listing.id),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			})
			.signers([buyer, authority, collectionAuthority, mint, mintAuthority])
			.rpc();

		return mint.publicKey;
	}

}

export default Methods;