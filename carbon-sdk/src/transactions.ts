import {ComputeBudgetProgram, Transaction} from "@solana/web3.js";
import Carbon from "./carbon";
import {AnchorProvider} from "@coral-xyz/anchor";
import {BuyVirtualArgs} from "./instructions";

export class Transactions {
	constructor(
		public carbon: Carbon,
	) {}

	async buyVirtual(
		args: BuyVirtualArgs,
	): Promise<Transaction> {
		const { buyer, collectionConfig, listing, metadata, maxPrice } = args

		const tx = new Transaction()
			.add(ComputeBudgetProgram.setComputeUnitLimit({
				units: 300_000
			}))

		const buyVirtualIxInfo = await this.carbon.instructions.buyVirtual({
			buyer,
			collectionConfig,
			listing,
			metadata,
			maxPrice
		})

		tx.add(buyVirtualIxInfo.instruction)

		const provider: AnchorProvider = this.carbon.provider
		tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash
		tx.feePayer = provider.wallet.publicKey

		let signedTx = await provider.wallet.signTransaction(tx)
		signedTx.partialSign(buyVirtualIxInfo.mint)

		return signedTx
	}

	async buyVirtualAndCustody(
		args: BuyVirtualArgs,
	): Promise<Transaction> {
		const { buyer, collectionConfig, listing, metadata, maxPrice } = args

		const tx = new Transaction()
			.add(ComputeBudgetProgram.setComputeUnitLimit({
				units: 400_000
			}))

		const buyVirtualIxInfo = await this.carbon.instructions.buyVirtual({
			buyer,
			collectionConfig,
			listing,
			metadata,
			maxPrice
		})

		tx.add(buyVirtualIxInfo.instruction)

		const custodyIx = await this.carbon.instructions.custody({
			owner: buyer,
			mint: buyVirtualIxInfo.mint.publicKey,
			itemId: listing.itemId
		})

		tx.add(custodyIx)

		const provider: AnchorProvider = this.carbon.provider
		tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash
		tx.feePayer = provider.wallet.publicKey

		let signedTx = await provider.wallet.signTransaction(tx)
		signedTx.partialSign(buyVirtualIxInfo.mint)

		return signedTx
	}

}

export default Transactions;