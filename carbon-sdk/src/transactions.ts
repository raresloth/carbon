import { ComputeBudgetProgram, Keypair, Transaction } from "@solana/web3.js";
import Carbon from "./carbon";
import { AnchorProvider } from "@coral-xyz/anchor";
import { BuyVirtualArgs, ListVirtualArgs, MintVirtualArgs } from "./instructions";

export class Transactions {
	constructor(public carbon: Carbon) {}

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
