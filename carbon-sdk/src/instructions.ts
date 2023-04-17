import { ComputeBudgetProgram, Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import Carbon from "./carbon";
import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	getAssociatedTokenAddressSync,
	NATIVE_MINT,
} from "@solana/spl-token";
import { BN, IdlAccounts, IdlTypes } from "@coral-xyz/anchor";
import { getEditionPDA, getMetadataPDA, TOKEN_METADATA_PROGRAM_ID } from "./solana";
import * as CarbonIDL from "./idl/carbon";
import { CollectionConfig, CustodyAccount, Listing } from "./types";

export type InitMarketplaceConfigArgs = {
	marketplaceAuthority: PublicKey;
	args: IdlTypes<CarbonIDL.Carbon>["MarketplaceConfigArgs"];
};

export type InitCollectionConfigArgs = {
	marketplaceAuthority: PublicKey;
	args: IdlTypes<CarbonIDL.Carbon>["CollectionConfigArgs"];
};

export type ListItemArgs = {
	seller?: PublicKey;
	itemId: number[];
	collectionMint: PublicKey;
	price: number;
	expiry: number;
	currencyMint?: PublicKey;
};

export type DelistItemArgs = {
	seller?: PublicKey;
	itemId: number[];
};

export type DelistOrBuyItemArgs = {
	listing: Listing;
	maxPrice?: number;
};

export type ListNftArgs = {
	seller: PublicKey;
	mint: PublicKey;
	collectionMint: PublicKey;
	price: number;
	expiry: number;
	currencyMint?: PublicKey;
	accounts?: any;
};

export type DelistNftArgs = {
	seller: PublicKey;
	mint: PublicKey;
};

export type BuyNftArgs = {
	buyer: PublicKey;
	listing: Listing;
	maxPrice?: number;
};

export type ListVirtualArgs = {
	seller?: PublicKey;
	marketplaceAuthority?: PublicKey;
	itemId: number[];
	collectionMint: PublicKey;
	price: number;
	expiry: number;
	currencyMint?: PublicKey;
};

export type DelistVirtualArgs = {
	seller?: PublicKey;
	itemId: number[];
};

export type BuyVirtualArgs = {
	marketplaceAuthority?: PublicKey;
	buyer: PublicKey;
	collectionConfig: CollectionConfig;
	listing: Listing;
	metadata: IdlTypes<CarbonIDL.Carbon>["Metadata"];
	maxPrice?: number;
};

export type MintVirtualArgs = {
	marketplaceAuthority?: PublicKey;
	buyer: PublicKey;
	itemId: number[];
	collectionConfig: CollectionConfig;
	metadata: IdlTypes<CarbonIDL.Carbon>["Metadata"];
};

export type CustodyArgs = {
	marketplaceAuthority?: PublicKey;
	owner: PublicKey;
	mint: PublicKey;
	itemId: number[];
	accounts?: any;
};

export type UncustodyArgs = {
	marketplaceAuthority?: PublicKey;
	owner: PublicKey;
	custodyAccount: CustodyAccount;
};

export type TakeOwnershipArgs = {
	marketplaceAuthority?: PublicKey;
	custodyAccount: CustodyAccount;
};

export class Instructions {
	constructor(public carbon: Carbon) {}

	async initMarketplaceConfig(args: InitMarketplaceConfigArgs): Promise<TransactionInstruction> {
		const { marketplaceAuthority, args: methodArgs } = args;
		return await this.carbon.program.methods
			.initMarketplaceConfig(methodArgs)
			.accounts({
				marketplaceAuthority,
				marketplaceConfig: this.carbon.pdas.marketplaceConfig(marketplaceAuthority),
			})
			.instruction();
	}

	async initCollectionConfig(args: InitCollectionConfigArgs): Promise<TransactionInstruction> {
		const { marketplaceAuthority, args: methodArgs } = args;
		return await this.carbon.program.methods
			.initCollectionConfig(methodArgs)
			.accounts({
				marketplaceAuthority,
				collectionConfig: this.carbon.pdas.collectionConfig(methodArgs.collectionMint),
			})
			.instruction();
	}

	async listItem(args: ListItemArgs): Promise<TransactionInstruction> {
		const { seller, itemId, collectionMint, price, expiry, currencyMint } = args;

		let mintAccountInfo;
		try {
			const mint = new PublicKey(itemId);
			mintAccountInfo = await this.carbon.program.provider.connection.getAccountInfo(mint);
		} catch (e) {}

		// Account info does not exist, therefore has not been minted
		if (mintAccountInfo == null) {
			return await this.listVirtual({
				seller: seller ?? this.carbon.marketplaceAuthority,
				itemId,
				collectionMint,
				price,
				expiry,
				currencyMint,
			});
		} else {
			return await this.listNft({
				seller: seller ?? this.carbon.marketplaceAuthority,
				mint: new PublicKey(itemId),
				collectionMint,
				price,
				expiry,
				currencyMint,
			});
		}
	}

	async delistItem(args: DelistItemArgs): Promise<TransactionInstruction | undefined> {
		const { seller, itemId } = args;
		try {
			const listing = await this.carbon.program.account.listing.fetch(
				this.carbon.pdas.listing(itemId)
			);
			if (listing.isVirtual) {
				return await this.delistVirtual({
					seller,
					itemId,
				});
			} else {
				return await this.delistNft({
					seller: seller ?? this.carbon.marketplaceAuthority,
					mint: new PublicKey(itemId),
				});
			}
		} catch (e) {
			if (e?.message.includes("Account does not exist")) {
				return;
			} else {
				throw e;
			}
		}
	}

	async delistOrBuyItem(args: DelistOrBuyItemArgs): Promise<TransactionInstruction> {
		const { listing, maxPrice } = args;

		if (listing.isVirtual) {
			return await this.delistVirtual({
				seller: this.carbon.marketplaceAuthority,
				itemId: listing.itemId,
			});
		} else {
			if (listing.seller.equals(this.carbon.marketplaceAuthority)) {
				return await this.delistNft({
					seller: this.carbon.marketplaceAuthority,
					mint: new PublicKey(listing.itemId),
				});
			} else {
				return await this.buyNft({
					buyer: this.carbon.marketplaceAuthority,
					listing,
					maxPrice,
				});
			}
		}
	}

	async listNft(args: ListNftArgs): Promise<TransactionInstruction> {
		const { seller, mint, collectionMint, price, expiry, currencyMint, accounts } = args;

		return await this.carbon.program.methods
			.listNft(new BN(price), new BN(expiry))
			.accounts({
				seller,
				tokenAccount: getAssociatedTokenAddressSync(mint, seller),
				mint,
				collectionMint,
				metadataAccount: getMetadataPDA(mint),
				edition: getEditionPDA(mint),
				currencyMint: currencyMint ?? NATIVE_MINT,
				listing: this.carbon.pdas.listing(Array.from(mint.toBytes())),
				collectionConfig: this.carbon.pdas.collectionConfig(collectionMint),
				marketplaceConfig: this.carbon.pdas.marketplaceConfig(this.carbon.marketplaceAuthority),
				custodyAccount: this.carbon.pdas.custodyAccount(mint),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				...(accounts || {}),
			})
			.instruction();
	}

	async delistNft(args: DelistNftArgs): Promise<TransactionInstruction> {
		const { seller, mint } = args;

		return await this.carbon.program.methods
			.delistNft()
			.accounts({
				seller,
				tokenAccount: getAssociatedTokenAddressSync(mint, seller),
				mint,
				edition: getEditionPDA(mint),
				listing: this.carbon.pdas.listing(Array.from(mint.toBuffer())),
				custodyAccount: this.carbon.pdas.custodyAccount(mint),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			})
			.instruction();
	}

	async buyNft(args: BuyNftArgs): Promise<TransactionInstruction> {
		const { buyer, listing, maxPrice } = args;

		const mint: PublicKey = new PublicKey(listing.itemId);

		const builder = this.carbon.program.methods
			.buyNft(maxPrice ? new BN(maxPrice) : listing.price)
			.accounts({
				buyer,
				seller: listing.seller,
				mint,
				sellerTokenAccount: getAssociatedTokenAddressSync(mint, listing.seller),
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

	async listVirtual(args: ListVirtualArgs): Promise<TransactionInstruction> {
		const { itemId, price, expiry, collectionMint, currencyMint } = args;
		const seller = args.seller ?? this.carbon.marketplaceAuthority;
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.marketplaceAuthority;

		return await this.carbon.program.methods
			.listVirtual(itemId, new BN(price), new BN(expiry))
			.accounts({
				seller,
				marketplaceAuthority,
				currencyMint: currencyMint ?? NATIVE_MINT,
				listing: this.carbon.pdas.listing(itemId),
				collectionConfig: this.carbon.pdas.collectionConfig(collectionMint),
				marketplaceConfig: this.carbon.pdas.marketplaceConfig(marketplaceAuthority),
			})
			.instruction();
	}

	async delistVirtual(args: DelistVirtualArgs): Promise<TransactionInstruction> {
		const { itemId } = args;
		const seller = args.seller ?? this.carbon.marketplaceAuthority;

		return await this.carbon.program.methods
			.delistVirtual(itemId)
			.accounts({
				seller,
				listing: this.carbon.pdas.listing(itemId),
			})
			.instruction();
	}

	async buyVirtual(
		args: BuyVirtualArgs
	): Promise<{ mint: Keypair; instruction: TransactionInstruction }> {
		const { buyer, listing, metadata, collectionConfig, maxPrice } = args;
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.marketplaceAuthority;

		const mint = Keypair.generate();

		const builder = this.carbon.program.methods
			.buyVirtual(listing.itemId, maxPrice ? new BN(maxPrice) : listing.price, metadata)
			.accounts({
				buyer,
				seller: listing.seller,
				mint: mint.publicKey,
				collectionConfig: this.carbon.pdas.collectionConfig(collectionConfig.collectionMint),
				buyerTokenAccount: getAssociatedTokenAddressSync(mint.publicKey, buyer),
				metadataAccount: getMetadataPDA(mint.publicKey),
				edition: getEditionPDA(mint.publicKey),
				collectionMint: collectionConfig.collectionMint,
				collectionMetadataAccount: getMetadataPDA(collectionConfig.collectionMint),
				collectionEdition: getEditionPDA(collectionConfig.collectionMint),
				listing: this.carbon.pdas.listing(listing.itemId),
				feeAccount: listing.feeConfig.feeAccount,
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			});

		if (listing.currencyMint.equals(NATIVE_MINT)) {
			builder.remainingAccounts([
				{
					pubkey: marketplaceAuthority!,
					isWritable: true,
					isSigner: true,
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
					pubkey: marketplaceAuthority,
					isWritable: false,
					isSigner: true,
				},
				{
					pubkey: getAssociatedTokenAddressSync(listing.currencyMint, marketplaceAuthority),
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

		return {
			mint,
			instruction: await builder.instruction(),
		};
	}

	async mintVirtual(
		args: MintVirtualArgs
	): Promise<{ mint: Keypair; instruction: TransactionInstruction }> {
		const { buyer, metadata, itemId, collectionConfig } = args;
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.marketplaceAuthority;

		const mint = Keypair.generate();

		const builder = this.carbon.program.methods.mintVirtual(itemId, metadata).accounts({
			buyer,
			marketplaceAuthority,
			mint: mint.publicKey,
			collectionConfig: this.carbon.pdas.collectionConfig(collectionConfig.collectionMint),
			buyerTokenAccount: getAssociatedTokenAddressSync(mint.publicKey, buyer),
			metadataAccount: getMetadataPDA(mint.publicKey),
			edition: getEditionPDA(mint.publicKey),
			collectionMint: collectionConfig.collectionMint,
			collectionMetadataAccount: getMetadataPDA(collectionConfig.collectionMint),
			collectionEdition: getEditionPDA(collectionConfig.collectionMint),
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
		});

		return {
			mint,
			instruction: await builder.instruction(),
		};
	}

	async custody(args: CustodyArgs): Promise<TransactionInstruction> {
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

	async uncustody(args: UncustodyArgs): Promise<TransactionInstruction> {
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

	async takeOwnership(args: TakeOwnershipArgs): Promise<TransactionInstruction> {
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
}

export default Instructions;
