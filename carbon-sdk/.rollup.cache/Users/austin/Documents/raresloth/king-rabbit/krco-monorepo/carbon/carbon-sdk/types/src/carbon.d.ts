import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor/dist/esm/provider";
import * as CarbonIDL from "./idl/carbon";
import Pdas from "./pdas";
import Methods from "./methods";
import Instructions from "./instructions";
import Transactions from "./transactions";
export declare class Carbon {
    provider: AnchorProvider;
    marketplaceAuthority: PublicKey;
    programId: PublicKey;
    program: Program<CarbonIDL.Carbon>;
    pdas: Pdas;
    instructions: Instructions;
    transactions: Transactions;
    methods: Methods;
    constructor(provider: AnchorProvider, marketplaceAuthority: PublicKey, programId?: PublicKey);
    getProviderWithWallet(wallet: Wallet): AnchorProvider;
}
export default Carbon;
//# sourceMappingURL=carbon.d.ts.map