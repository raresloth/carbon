import { ComputeBudgetProgram, Transaction } from "@solana/web3.js";
export class Transactions {
    constructor(carbon) {
        this.carbon = carbon;
    }
    async listVirtual(args) {
        const { seller, itemId, collectionMint, price, expiry, currencyMint } = args;
        const tx = new Transaction();
        const listIx = await this.carbon.instructions.listVirtual({
            seller,
            itemId,
            collectionMint,
            price,
            expiry,
            currencyMint
        });
        tx.add(listIx);
        await this.populateBlockhashAndFeePayer(tx);
        return await this.carbon.provider.wallet.signTransaction(tx);
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
        await this.populateBlockhashAndFeePayer(tx);
        let signedTx = await this.carbon.provider.wallet.signTransaction(tx);
        signedTx.partialSign(buyVirtualIxInfo.mint);
        return {
            mint: buyVirtualIxInfo.mint,
            transaction: signedTx
        };
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
        await this.populateBlockhashAndFeePayer(tx);
        let signedTx = await this.carbon.provider.wallet.signTransaction(tx);
        signedTx.partialSign(buyVirtualIxInfo.mint);
        return {
            mint: buyVirtualIxInfo.mint,
            transaction: signedTx
        };
    }
    async populateBlockhashAndFeePayer(tx) {
        const provider = this.carbon.provider;
        tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
        tx.feePayer = provider.wallet.publicKey;
    }
}
export default Transactions;
//# sourceMappingURL=transactions.js.map