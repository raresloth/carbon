import {PublicKey} from "@solana/web3.js";
import Carbon from "./carbon";

export class Pdas {
	constructor(
		public carbon: Carbon,
	) {}

	collectionConfig(authority: PublicKey, collectionMint: PublicKey): PublicKey {
		return PublicKey.findProgramAddressSync([
			Buffer.from("collection_config"),
			authority.toBuffer(),
			collectionMint.toBuffer(),
		], this.carbon.programId)[0];
	}

	listing(id: PublicKey): PublicKey {
		return PublicKey.findProgramAddressSync([
			Buffer.from("listing"),
			id.toBuffer(),
		], this.carbon.programId)[0];
	}
}

export default Pdas;