import {PublicKey} from "@solana/web3.js";
import Virt from "./virt";

export class Pdas {
	constructor(
		public virt: Virt,
	) {}

	listing(mint: PublicKey): PublicKey {
		return PublicKey.findProgramAddressSync([
			Buffer.from("listing"),
			mint.toBuffer(),
		], this.virt.programId)[0];
	}
}

export default Pdas;