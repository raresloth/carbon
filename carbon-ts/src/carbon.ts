import {PublicKey} from "@solana/web3.js";
import {Program, Provider} from "@coral-xyz/anchor";
import * as CarbonIDL from "./idl/carbon"
import Pdas from "./pdas";
import Methods from "./methods"
import {PROGRAM_ID} from "./index";

export class Carbon {
	public program: Program<CarbonIDL.Carbon>;
	public pdas: Pdas;
	public methods: Methods;

	constructor(
		public provider: Provider,
		public marketplaceAuthority: PublicKey,
		public programId: PublicKey = PROGRAM_ID,
	) {
		this.program = new Program<CarbonIDL.Carbon>(CarbonIDL.IDL, programId, provider);
		this.pdas = new Pdas(this);
		this.methods = new Methods(this);
	}
}

export default Carbon;