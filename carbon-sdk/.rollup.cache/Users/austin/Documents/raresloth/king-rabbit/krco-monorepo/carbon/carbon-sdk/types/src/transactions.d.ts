import { Keypair, Transaction } from "@solana/web3.js";
import Carbon from "./carbon";
import { BuyVirtualArgs, ListVirtualArgs } from "./instructions";
export declare class Transactions {
    carbon: Carbon;
    constructor(carbon: Carbon);
    listVirtual(args: ListVirtualArgs): Promise<Transaction>;
    buyVirtual(args: BuyVirtualArgs): Promise<{
        mint: Keypair;
        transaction: Transaction;
    }>;
    buyVirtualAndCustody(args: BuyVirtualArgs): Promise<{
        mint: Keypair;
        transaction: Transaction;
    }>;
    populateBlockhashAndFeePayer(tx: Transaction): Promise<void>;
}
export default Transactions;
//# sourceMappingURL=transactions.d.ts.map