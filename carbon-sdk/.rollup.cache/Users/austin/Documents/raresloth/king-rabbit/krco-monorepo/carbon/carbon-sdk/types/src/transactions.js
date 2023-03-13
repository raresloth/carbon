import { ComputeBudgetProgram, Transaction } from "@solana/web3.js";
export class Transactions {
    constructor(carbon) {
        this.carbon = carbon;
    }
    async buyVirtual(args) {
        const { buyer, collectionConfig, listing, metadata, maxPrice } = args;
        const tx = new Transaction()
            .add(ComputeBudgetProgram.setComputeUnitLimit({
            units: 300000
        }));
        const buyVirtualIxInfo = await this.carbon.instructions.buyVirtual({
            buyer,
            collectionConfig,
            listing,
            metadata,
            maxPrice
        });
        tx.add(buyVirtualIxInfo.instruction);
        const provider = this.carbon.provider;
        tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
        tx.feePayer = provider.wallet.publicKey;
        let signedTx = await provider.wallet.signTransaction(tx);
        signedTx.partialSign(buyVirtualIxInfo.mint);
        return signedTx;
    }
    async buyVirtualAndCustody(args) {
        const { buyer, collectionConfig, listing, metadata, maxPrice } = args;
        const tx = new Transaction()
            .add(ComputeBudgetProgram.setComputeUnitLimit({
            units: 400000
        }));
        const buyVirtualIxInfo = await this.carbon.instructions.buyVirtual({
            buyer,
            collectionConfig,
            listing,
            metadata,
            maxPrice
        });
        tx.add(buyVirtualIxInfo.instruction);
        const custodyIx = await this.carbon.instructions.custody({
            owner: buyer,
            mint: buyVirtualIxInfo.mint.publicKey,
            itemId: listing.itemId
        });
        tx.add(custodyIx);
        const provider = this.carbon.provider;
        tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
        tx.feePayer = provider.wallet.publicKey;
        let signedTx = await provider.wallet.signTransaction(tx);
        signedTx.partialSign(buyVirtualIxInfo.mint);
        return signedTx;
    }
}
export default Transactions;
//# sourceMappingURL=transactions.js.map