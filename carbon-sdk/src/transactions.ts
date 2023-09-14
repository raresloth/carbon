import {
	ComputeBudgetProgram,
	Keypair,
	PublicKey,
	Transaction,
	TransactionInstruction,
} from "@solana/web3.js";
import Carbon from "./carbon";
import { AnchorProvider } from "@coral-xyz/anchor";
import { BuyVirtualArgs } from "./instructions/buyVirtual";
import { ListVirtualArgs } from "./instructions/listVirtual";
import { MintVirtualArgs } from "./instructions/mintVirtual";
import { Listing, Metadata } from "./types";
import { BurnArgs } from "./instructions/burnAndCloseMintRecord";

export type DelistOrBuyItemArgs = {
	listing: Listing;
	burnMint: boolean;
	collectionConfig?: PublicKey;
	metadata?: Metadata;
	maxPrice?: number;
	burnArgs?: BurnArgs;
};

export class Transactions {
	constructor(public carbon: Carbon) {}

	async delistOrBuyItem(args: DelistOrBuyItemArgs, recentBlockhash?: string): Promise<Transaction> {
		const carbon: Carbon = this.carbon;

		const { listing, burnMint, collectionConfig, metadata, maxPrice } = args;

		let mint: Keypair | undefined;
		const ixs: TransactionInstruction[] = [];

		if (listing.isVirtual) {
			if (listing.seller.equals(carbon.marketplaceAuthority)) {
				ixs.push(
					await carbon.instructions.delistVirtual({
						seller: carbon.marketplaceAuthority,
						itemId: listing.itemId,
					})
				);
			} else {
				if (collectionConfig == null || metadata == null) {
					throw new Error(`collectionConfig and metadata are required for this transaction`);
				}

				const buyVirtualTxInfo = await carbon.instructions.buyVirtual({
					buyer: carbon.marketplaceAuthority,
					collectionConfig: await carbon.program.account.collectionConfig.fetch(collectionConfig),
					listing,
					metadata,
					maxPrice,
				});

				ixs.push(buyVirtualTxInfo.instruction);

				if (burnMint) {
					ixs.push(
						...(await carbon.instructions.burnAndCloseMintRecord(
							{
								mintRecord: {
									mint: buyVirtualTxInfo.mint.publicKey,
									collectionConfig,
									itemId: listing.itemId,
								},
							},
							listing
						))
					);
				}

				mint = buyVirtualTxInfo.mint;
			}
		} else {
			if (listing.seller.equals(carbon.marketplaceAuthority)) {
				const custodyAccount = await carbon.accounts.custodyAccount(new PublicKey(listing.itemId));

				ixs.push(
					await carbon.instructions.delistNft({
						seller: carbon.marketplaceAuthority,
						mint: new PublicKey(listing.itemId),
						tokenOwner: custodyAccount?.owner ?? listing.seller,
					})
				);

				if (custodyAccount != null) {
					ixs.push(
						await carbon.instructions.takeOwnership({
							custodyAccount,
						})
					);
				}

				if (burnMint) {
					if (args.burnArgs == null) {
						throw new Error(`burnArgs is required for this transaction`);
					}
					ixs.push(...(await carbon.instructions.burnAndCloseMintRecord(args.burnArgs, listing)));
				}
			} else {
				ixs.push(
					await carbon.instructions.buyNft({
						buyer: carbon.marketplaceAuthority,
						listing,
						maxPrice,
					})
				);

				if (burnMint) {
					if (args.burnArgs == null) {
						throw new Error(`burnArgs is required for this transaction`);
					}
					ixs.push(...(await carbon.instructions.burnAndCloseMintRecord(args.burnArgs, listing)));
				}
			}
		}

		const tx = new Transaction().add(
			ComputeBudgetProgram.setComputeUnitLimit({
				units: 500_000,
			})
		).add(...ixs);
		await this.populateBlockhashAndFeePayer(tx, recentBlockhash);

		const signedTx = await this.carbon.provider.wallet.signTransaction(tx);

		if (mint) {
			signedTx.partialSign(mint);
		}

		return signedTx;
	}

	async listVirtual(args: ListVirtualArgs, recentBlockhash?: string): Promise<Transaction> {
		const { seller, itemId, collectionMint, price, expiry, currencyMint } = args;

		const tx = new Transaction();

		const listIx = await this.carbon.instructions.listVirtual({
			seller,
			itemId,
			collectionMint,
			price,
			expiry,
			currencyMint,
		});

		tx.add(listIx);

		await this.populateBlockhashAndFeePayer(tx, recentBlockhash);

		return await this.carbon.provider.wallet.signTransaction(tx);
	}

	async buyVirtual(
		args: BuyVirtualArgs,
		recentBlockhash?: string
	): Promise<{ mint: Keypair; transaction: Transaction }> {
		const { buyer, collectionConfig, listing, metadata, maxPrice } = args;

		const tx = new Transaction().add(
			ComputeBudgetProgram.setComputeUnitLimit({
				units: 300_000,
			})
		);

		const buyVirtualIxInfo = await this.carbon.instructions.buyVirtual({
			buyer,
			collectionConfig,
			listing,
			metadata,
			maxPrice,
		});

		tx.add(buyVirtualIxInfo.instruction);

		await this.populateBlockhashAndFeePayer(tx, recentBlockhash);

		let signedTx = await this.carbon.provider.wallet.signTransaction(tx);
		signedTx.partialSign(buyVirtualIxInfo.mint);

		return {
			mint: buyVirtualIxInfo.mint,
			transaction: signedTx,
		};
	}

	async buyVirtualAndCustody(
		args: BuyVirtualArgs,
		recentBlockhash?: string
	): Promise<{ mint: Keypair; transaction: Transaction }> {
		const { buyer, collectionConfig, listing, metadata, maxPrice } = args;

		const tx = new Transaction().add(
			ComputeBudgetProgram.setComputeUnitLimit({
				units: 400_000,
			})
		);

		const buyVirtualIxInfo = await this.carbon.instructions.buyVirtual({
			buyer,
			collectionConfig,
			listing,
			metadata,
			maxPrice,
		});

		tx.add(buyVirtualIxInfo.instruction);

		const custodyIx = await this.carbon.instructions.custody({
			owner: buyer,
			mint: buyVirtualIxInfo.mint.publicKey,
			itemId: listing.itemId,
		});

		tx.add(custodyIx);

		await this.populateBlockhashAndFeePayer(tx, recentBlockhash);

		let signedTx = await this.carbon.provider.wallet.signTransaction(tx);
		signedTx.partialSign(buyVirtualIxInfo.mint);

		return {
			mint: buyVirtualIxInfo.mint,
			transaction: signedTx,
		};
	}

	async mintVirtual(
		args: MintVirtualArgs,
		recentBlockhash?: string
	): Promise<{ mint: Keypair; transaction: Transaction }> {
		const tx = new Transaction().add(
			ComputeBudgetProgram.setComputeUnitLimit({
				units: 300_000,
			})
		);

		const mintVirtualIxInfo = await this.carbon.instructions.mintVirtual(args);
		tx.add(mintVirtualIxInfo.instruction);

		await this.populateBlockhashAndFeePayer(tx, recentBlockhash);

		let signedTx = await this.carbon.provider.wallet.signTransaction(tx);
		signedTx.partialSign(mintVirtualIxInfo.mint);

		return {
			mint: mintVirtualIxInfo.mint,
			transaction: signedTx,
		};
	}

	async populateBlockhashAndFeePayer(tx: Transaction, recentBlockhash?: string) {
		const provider: AnchorProvider = this.carbon.provider;
		tx.recentBlockhash =
			recentBlockhash ?? (await provider.connection.getLatestBlockhash()).blockhash;
		tx.feePayer = provider.wallet.publicKey;
	}
}

export default Transactions;
