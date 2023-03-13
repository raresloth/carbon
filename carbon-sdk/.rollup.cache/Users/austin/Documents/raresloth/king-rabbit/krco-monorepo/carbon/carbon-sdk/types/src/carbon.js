import { Program, AnchorProvider } from "@coral-xyz/anchor";
import * as CarbonIDL from "./idl/carbon";
import Pdas from "./pdas";
import Methods from "./methods";
import { PROGRAM_ID } from "./index";
import Instructions from "./instructions";
import Transactions from "./transactions";
export class Carbon {
    constructor(provider, marketplaceAuthority, programId = PROGRAM_ID) {
        this.provider = provider;
        this.marketplaceAuthority = marketplaceAuthority;
        this.programId = programId;
        this.program = new Program(CarbonIDL.IDL, programId, provider);
        this.pdas = new Pdas(this);
        this.instructions = new Instructions(this);
        this.transactions = new Transactions(this);
        this.methods = new Methods(this);
    }
    getProviderWithWallet(wallet) {
        return new AnchorProvider(this.provider.connection, wallet, this.provider.opts);
    }
}
export default Carbon;
//# sourceMappingURL=carbon.js.map