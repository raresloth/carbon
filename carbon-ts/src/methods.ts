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

	async initMarketplaceConfig(
		marketplaceAuthority: Keypair,
		args: IdlTypes<CarbonIDL.Carbon>["MarketplaceConfigArgs"]
	) {
		await this.carbon.program.methods.initMarketplaceConfig(args)
			.accounts({
				marketplaceAuthority: marketplaceAuthority.publicKey,
				marketplaceConfig: this.carbon.pdas.marketplaceConfig(marketplaceAuthority.publicKey),
			}).signers([marketplaceAuthority]).rpc();
	}

	async initCollectionConfig(
		marketplaceAuthority: Keypair,
		args: IdlTypes<CarbonIDL.Carbon>["CollectionConfigArgs"]
	) {
		await this.carbon.program.methods.initCollectionConfig(args)
			.accounts({
				marketplaceAuthority: marketplaceAuthority.publicKey,
				collectionConfig: this.carbon.pdas.collectionConfig(args.collectionMint),
			}).signers([marketplaceAuthority]).rpc();
	}

	async listNft(
		seller: Keypair,
		mint: PublicKey,
		collectionMint: PublicKey,
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
				seller: seller.publicKey,
				tokenAccount: getAssociatedTokenAddressSync(mint, seller.publicKey),
				mint,
				collectionMint,
				metadataAccount: getMetadataPDA(mint),
				edition: getEditionPDA(mint),
				currencyMint,
				listing: this.carbon.pdas.listing(mint),
				collectionConfig: this.carbon.pdas.collectionConfig(collectionMint),
				marketplaceConfig: this.carbon.pdas.marketplaceConfig(this.carbon.marketplaceAuthority),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			})
			.signers([seller])
			.rpc();
	}

	async listVirtual(
		marketplaceAuthority: Keypair,
		id: PublicKey,
		collectionMint: PublicKey,
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
				marketplaceAuthority: marketplaceAuthority.publicKey,
				currencyMint,
				listing: this.carbon.pdas.listing(id),
				collectionConfig: this.carbon.pdas.collectionConfig(collectionMint),
				marketplaceConfig: this.carbon.pdas.marketplaceConfig(this.carbon.marketplaceAuthority),
			})
			.signers([marketplaceAuthority])
			.rpc();
	}

	async buyVirtual(
		buyer: Keypair,
		marketplaceAuthority: Keypair,
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
				marketplaceAuthority: marketplaceAuthority.publicKey,
				mint: mint.publicKey,
				collectionConfig: this.carbon.pdas.collectionConfig(collectionConfig.collectionMint),
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
			.signers([buyer, marketplaceAuthority, mint])
			.rpc();

		return mint.publicKey;
	}

}

export default Methods;