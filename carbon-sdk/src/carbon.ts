import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor/dist/esm/provider";
import * as CarbonIDL from "./idl/carbon";
import Pdas from "./pdas";
import Methods from "./methods";
import { PROGRAM_ID } from "./index";
import Instructions from "./instructions";
import Transactions from "./transactions";

export class Carbon {
	public program: Program<CarbonIDL.Carbon>;
	public pdas: Pdas;
	public instructions: Instructions;
	public transactions: Transactions;
	public methods: Methods;

	constructor(
		public provider: AnchorProvider,
		public marketplaceAuthority: PublicKey,
		public programId: PublicKey = PROGRAM_ID
	) {
		this.program = new Program<CarbonIDL.Carbon>(CarbonIDL.IDL, programId, provider);
		this.pdas = new Pdas(this);
		this.instructions = new Instructions(this);
		this.transactions = new Transactions(this);
		this.methods = new Methods(this);
	}

	getProviderWithWallet(wallet: Wallet) {
		return new AnchorProvider(this.provider.connection, wallet, this.provider.opts);
	}
}

export default Carbon;
