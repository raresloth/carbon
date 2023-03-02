import {PublicKey} from "@solana/web3.js";
import Carbon from "./carbon";

export class Pdas {
	constructor(
		public carbon: Carbon,
	) {}

	marketplaceConfig(marketplaceAuthority: PublicKey): PublicKey {
		return PublicKey.findProgramAddressSync([
			Buffer.from("marketplace_config"),
			marketplaceAuthority.toBuffer(),
		], this.carbon.programId)[0];
	}

	collectionConfig(collectionMint: PublicKey): PublicKey {
		return PublicKey.findProgramAddressSync([
			Buffer.from("collection_config"),
			collectionMint.toBuffer(),
		], this.carbon.programId)[0];
	}

	listing(itemId: number[]): PublicKey {
		return PublicKey.findProgramAddressSync([
			Buffer.from("listing"),
			Buffer.from(itemId),
		], this.carbon.programId)[0];
	}

	custodyAccount(mint: PublicKey): PublicKey {
		return PublicKey.findProgramAddressSync([
			Buffer.from("custody_account"),
			mint.toBuffer(),
		], this.carbon.programId)[0];
	}
}

export default Pdas;