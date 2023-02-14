import {PublicKey} from "@solana/web3.js";
import {Program, Provider} from "@coral-xyz/anchor";
import * as CarbonIDL from "./idl/carbon"
import Pdas from "./pdas";
import Methods from "./methods"

export class Carbon {
	public program: Program<CarbonIDL.Carbon>;
	public pdas: Pdas;
	public methods: Methods;

	constructor(
		public programId: PublicKey,
		public provider: Provider,
		public marketplaceAuthority: PublicKey
	) {
		this.program = new Program<CarbonIDL.Carbon>(CarbonIDL.IDL, programId, provider);
		this.pdas = new Pdas(this);
		this.methods = new Methods(this);
	}
}

export default Carbon;