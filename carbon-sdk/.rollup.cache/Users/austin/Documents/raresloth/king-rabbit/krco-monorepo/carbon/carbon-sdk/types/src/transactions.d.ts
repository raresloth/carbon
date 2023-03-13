import { Transaction } from "@solana/web3.js";
import Carbon from "./carbon";
import { BuyVirtualArgs } from "./instructions";
export declare class Transactions {
    carbon: Carbon;
    constructor(carbon: Carbon);
    buyVirtual(args: BuyVirtualArgs): Promise<Transaction>;
    buyVirtualAndCustody(args: BuyVirtualArgs): Promise<Transaction>;
}
export default Transactions;
//# sourceMappingURL=transactions.d.ts.map