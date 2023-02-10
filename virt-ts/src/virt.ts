import {PublicKey} from "@solana/web3.js";
import {Program, Provider} from "@coral-xyz/anchor";
import * as VirtIDL from "./idl/virt"
import Pdas from "./pdas";
import Methods from "./methods"

export class Virt {
	public program: Program<VirtIDL.Virt>;
	public pdas: Pdas;
	public methods: Methods;

	constructor(
		public programId: PublicKey,
		public provider: Provider
	) {
		this.program = new Program<VirtIDL.Virt>(VirtIDL.IDL, programId, provider);
		this.pdas = new Pdas(this);
		this.methods = new Methods(this);
	}
}

export default Virt;