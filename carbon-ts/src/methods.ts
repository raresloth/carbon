import {ComputeBudgetProgram, Keypair, PublicKey} from "@solana/web3.js";
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
		args: IdlTypes<CarbonIDL.Carbon>["MarketplaceConfigArgs"],
		marketplaceAuthority: Keypair | undefined = this.carbon.marketplaceAuthorityKeypair,
	) {
		await this.carbon.program.methods.initMarketplaceConfig(args)
			.accounts({
				marketplaceAuthority: marketplaceAuthority!.publicKey,
				marketplaceConfig: this.carbon.pdas.marketplaceConfig(marketplaceAuthority!.publicKey),
			}).signers([marketplaceAuthority!]).rpc();
	}

	async initCollectionConfig(
		args: IdlTypes<CarbonIDL.Carbon>["CollectionConfigArgs"],
		marketplaceAuthority: Keypair | undefined = this.carbon.marketplaceAuthorityKeypair,
	) {
		await this.carbon.program.methods.initCollectionConfig(args)
			.accounts({
				marketplaceAuthority: marketplaceAuthority!.publicKey,
				collectionConfig: this.carbon.pdas.collectionConfig(args.collectionMint),
			}).signers([marketplaceAuthority!]).rpc();
	}

	async listItem(
		itemId: number[],
		collectionMint: PublicKey,
		price: number,
		expiry: number,
		currencyMint: PublicKey = NATIVE_MINT,
		seller: Keypair | undefined = this.carbon.marketplaceAuthorityKeypair,
	) {
		let mintAccountInfo
		try {
			const mint = new PublicKey(itemId)
			mintAccountInfo = await this.carbon.program.provider.connection.getAccountInfo(mint);
		} catch (e) {}

		// Account info does not exist, therefore has not been minted
		if (mintAccountInfo == null) {
			await this.listVirtual(
				itemId,
				collectionMint,
				price,
				expiry,
				currencyMint,
				seller,
			)
		} else {
			await this.listNft(
				seller!,
				new PublicKey(itemId),
				collectionMint,
				price,
				expiry,
				currencyMint,
			)
		}
	}

	async delistItem(
		itemId: number[],
		seller: Keypair | undefined = this.carbon.marketplaceAuthorityKeypair,
	) {
		try {
			const listing = await this.carbon.program.account.listing.fetch(this.carbon.pdas.listing(itemId));
			if (listing.isVirtual) {
				await this.delistVirtual(
					itemId,
					seller,
				)
			} else {
				await this.delistNft(
					seller!,
					new PublicKey(itemId),
				)
			}
		} catch (e) {
			if (e?.message.includes('Account does not exist')) {
				return
			} else {
				throw e
			}
		}
	}

	async delistOrBuyItem(
		listing: IdlAccounts<CarbonIDL.Carbon>["listing"],
		maxPrice?: number,
	) {
		if (listing.isVirtual) {
			await this.delistVirtual(
				listing.itemId,
				this.carbon.marketplaceAuthorityKeypair,
			)
		} else {
			if (listing.seller.equals(this.carbon.marketplaceAuthorityKeypair!.publicKey)) {
				await this.delistNft(
					this.carbon.marketplaceAuthorityKeypair!,
					new PublicKey(listing.itemId),
				)
			} else {
				await this.buyNft(
					this.carbon.marketplaceAuthorityKeypair!,
					listing,
					maxPrice
				)
			}
		}
	}

	async listNft(
		seller: Keypair,
		mint: PublicKey,
		collectionMint: PublicKey,
		price: number,
		expiry: number,
		currencyMint: PublicKey = NATIVE_MINT,
		accounts: any = {}
	) {
		await this.carbon.program.methods
			.listNft(
				new BN(price),
				new BN(expiry),
			)
			.accounts(Object.assign({
				seller: seller.publicKey,
				tokenAccount: getAssociatedTokenAddressSync(mint, seller.publicKey),
				mint,
				collectionMint,
				metadataAccount: getMetadataPDA(mint),
				edition: getEditionPDA(mint),
				currencyMint,
				listing: this.carbon.pdas.listing(Array.from(mint.toBytes())),
				collectionConfig: this.carbon.pdas.collectionConfig(collectionMint),
				marketplaceConfig: this.carbon.pdas.marketplaceConfig(this.carbon.marketplaceAuthority),
				custodyAccount: this.carbon.pdas.custodyAccount(mint),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			}, accounts))
			.signers([seller])
			.rpc();
	}

	async delistNft(
		seller: Keypair,
		mint: PublicKey,
	) {
		await this.carbon.program.methods
			.delistNft()
			.accounts({
				seller: seller.publicKey,
				tokenAccount: getAssociatedTokenAddressSync(mint, seller.publicKey),
				mint,
				edition: getEditionPDA(mint),
				listing: this.carbon.pdas.listing(Array.from(mint.toBuffer())),
				custodyAccount: this.carbon.pdas.custodyAccount(mint),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			})
			.signers([seller])
			.rpc();
	}

	async buyNft(
		buyer: Keypair,
		listing: IdlAccounts<CarbonIDL.Carbon>["listing"],
		maxPrice?: number,
	): Promise<void> {
		const mint: PublicKey = new PublicKey(listing.itemId);
		const builder = this.carbon.program.methods
			.buyNft(
				maxPrice ? new BN(maxPrice) : listing.price,
			)
			.accounts({
				buyer: buyer.publicKey,
				seller: listing.seller,
				mint,
				sellerTokenAccount: getAssociatedTokenAddressSync(mint, listing.seller),
				buyerTokenAccount: getAssociatedTokenAddressSync(mint, buyer.publicKey),
				metadataAccount: getMetadataPDA(mint),
				edition: getEditionPDA(mint),
				listing: this.carbon.pdas.listing(listing.itemId),
				custodyAccount: this.carbon.pdas.custodyAccount(mint),
				feeAccount: listing.feeConfig.feeAccount,
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			})

		if (listing.currencyMint.equals(NATIVE_MINT)) {
			builder.remainingAccounts([{
				pubkey: this.carbon.marketplaceAuthority,
				isWritable: true,
				isSigner: false,
			}])
		} else {
			builder.remainingAccounts([{
				pubkey: listing.currencyMint,
				isWritable: false,
				isSigner: false,
			}, {
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, buyer.publicKey),
				isWritable: true,
				isSigner: false,
			}, {
				pubkey: this.carbon.marketplaceAuthority,
				isWritable: false,
				isSigner: false,
			}, {
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, this.carbon.marketplaceAuthority),
				isWritable: true,
				isSigner: false,
			}, {
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, listing.feeConfig.feeAccount),
				isWritable: true,
				isSigner: false,
			}, {
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, listing.seller),
				isWritable: true,
				isSigner: false,
			}]).preInstructions([
				ComputeBudgetProgram.setComputeUnitLimit({
					units: 300_000
				})
			])
		}

		await builder.signers([buyer]).rpc();
	}

	async listVirtual(
		itemId: number[],
		collectionMint: PublicKey,
		price: number,
		expiry: number,
		currencyMint: PublicKey = NATIVE_MINT,
		marketplaceAuthority: Keypair | undefined = this.carbon.marketplaceAuthorityKeypair,
	) {
		await this.carbon.program.methods
			.listVirtual(
				itemId,
				new BN(price),
				new BN(expiry),
			)
			.accounts({
				marketplaceAuthority: marketplaceAuthority!.publicKey,
				currencyMint,
				listing: this.carbon.pdas.listing(itemId),
				collectionConfig: this.carbon.pdas.collectionConfig(collectionMint),
				marketplaceConfig: this.carbon.pdas.marketplaceConfig(this.carbon.marketplaceAuthority),
			})
			.signers([marketplaceAuthority!])
			.rpc();
	}

	async delistVirtual(
		itemId: number[],
		marketplaceAuthority: Keypair | undefined = this.carbon.marketplaceAuthorityKeypair,
	) {
		await this.carbon.program.methods
			.delistVirtual(
				itemId
			)
			.accounts({
				marketplaceAuthority: marketplaceAuthority!.publicKey,
				listing: this.carbon.pdas.listing(itemId),
			})
			.signers([marketplaceAuthority!])
			.rpc();
	}

	async buyVirtual(
		buyer: Keypair,
		collectionConfig: IdlAccounts<CarbonIDL.Carbon>["collectionConfig"],
		listing: IdlAccounts<CarbonIDL.Carbon>["listing"],
		metadata: IdlTypes<CarbonIDL.Carbon>["Metadata"],
		maxPrice?: number,
		marketplaceAuthority: Keypair | undefined = this.carbon.marketplaceAuthorityKeypair,
	): Promise<PublicKey> {
		const mint = Keypair.generate();

		const builder = this.carbon.program.methods
			.buyVirtual(
				listing.itemId,
				maxPrice ? new BN(maxPrice) : listing.price,
				metadata
			)
			.accounts({
				buyer: buyer.publicKey,
				marketplaceAuthority: marketplaceAuthority!.publicKey,
				mint: mint.publicKey,
				collectionConfig: this.carbon.pdas.collectionConfig(collectionConfig.collectionMint),
				buyerTokenAccount: getAssociatedTokenAddressSync(mint.publicKey, buyer.publicKey),
				metadataAccount: getMetadataPDA(mint.publicKey),
				edition: getEditionPDA(mint.publicKey),
				collectionMint: collectionConfig.collectionMint,
				collectionMetadataAccount: getMetadataPDA(collectionConfig.collectionMint),
				collectionEdition: getEditionPDA(collectionConfig.collectionMint),
				listing: this.carbon.pdas.listing(listing.itemId),
				feeAccount: listing.feeConfig.feeAccount,
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			})

		if (listing.currencyMint.equals(NATIVE_MINT)) {
			builder.remainingAccounts([{
				pubkey: marketplaceAuthority!.publicKey,
				isWritable: true,
				isSigner: false,
			}])
		} else {
			builder.remainingAccounts([{
				pubkey: listing.currencyMint,
				isWritable: false,
				isSigner: false,
			}, {
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, buyer.publicKey),
				isWritable: true,
				isSigner: false,
			}, {
				pubkey: marketplaceAuthority!.publicKey,
				isWritable: false,
				isSigner: false,
			}, {
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, marketplaceAuthority!.publicKey),
				isWritable: true,
				isSigner: false,
			}, {
				pubkey: getAssociatedTokenAddressSync(listing.currencyMint, listing.feeConfig.feeAccount),
				isWritable: true,
				isSigner: false,
			}]).preInstructions([
				ComputeBudgetProgram.setComputeUnitLimit({
					units: 400_000
				})
			])
		}

		await builder.signers([buyer, marketplaceAuthority!, mint]).rpc();

		return mint.publicKey;
	}

	async custody(
		authority: Keypair,
		mint: PublicKey,
		accounts: any = {},
		marketplaceAuthority: Keypair | undefined = this.carbon.marketplaceAuthorityKeypair,
	) {
		await this.carbon.program.methods
			.custody()
			.accounts(Object.assign({
				authority: authority.publicKey,
				marketplaceAuthority: marketplaceAuthority!.publicKey,
				tokenAccount: getAssociatedTokenAddressSync(mint, authority.publicKey),
				mint,
				edition: getEditionPDA(mint),
				custodyAccount: this.carbon.pdas.custodyAccount(mint),
				listing: this.carbon.pdas.listing(Array.from(mint.toBuffer())),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			}, accounts))
			.signers([authority])
			.rpc();
	}

	async uncustody(
		authority: Keypair,
		custodyAccount: IdlAccounts<CarbonIDL.Carbon>["custodyAccount"],
		marketplaceAuthority: Keypair | undefined = this.carbon.marketplaceAuthorityKeypair,
	) {
		await this.carbon.program.methods
			.uncustody()
			.accounts({
				authority: authority.publicKey,
				marketplaceAuthority: marketplaceAuthority!.publicKey,
				tokenAccount: getAssociatedTokenAddressSync(custodyAccount.mint, authority.publicKey),
				mint: custodyAccount.mint,
				edition: getEditionPDA(custodyAccount.mint),
				custodyAccount: this.carbon.pdas.custodyAccount(custodyAccount.mint),
				listing: this.carbon.pdas.listing(Array.from(custodyAccount.mint.toBuffer())),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			})
			.signers([authority])
			.rpc();
	}

	async takeOwnership(
		custodyAccount: IdlAccounts<CarbonIDL.Carbon>["custodyAccount"],
		marketplaceAuthority: Keypair | undefined = this.carbon.marketplaceAuthorityKeypair,
	) {
		await this.carbon.program.methods
			.takeOwnership()
			.accounts({
				marketplaceAuthority: this.carbon.marketplaceAuthority,
				authority: custodyAccount.authority,
				tokenAccount: getAssociatedTokenAddressSync(custodyAccount.mint, custodyAccount.authority),
				marketplaceAuthorityTokenAccount: getAssociatedTokenAddressSync(custodyAccount.mint, marketplaceAuthority!.publicKey),
				mint: custodyAccount.mint,
				edition: getEditionPDA(custodyAccount.mint),
				custodyAccount: this.carbon.pdas.custodyAccount(custodyAccount.mint),
				listing: this.carbon.pdas.listing(Array.from(custodyAccount.mint.toBuffer())),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			})
			.signers([marketplaceAuthority!])
			.rpc();
	}

}

export default Methods;