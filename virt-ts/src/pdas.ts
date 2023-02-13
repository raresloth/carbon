import {PublicKey} from "@solana/web3.js";
import Virt from "./virt";

export class Pdas {
	constructor(
		public virt: Virt,
	) {}

	collectionConfig(authority: PublicKey, collectionMint: PublicKey): PublicKey {
		return PublicKey.findProgramAddressSync([
			Buffer.from("collection_config"),
			authority.toBuffer(),
			collectionMint.toBuffer(),
		], this.virt.programId)[0];
	}

	listing(id: PublicKey): PublicKey {
		return PublicKey.findProgramAddressSync([
			Buffer.from("listing"),
			id.toBuffer(),
		], this.virt.programId)[0];
	}
}

export default Pdas;