import {Keypair, PublicKey} from "@solana/web3.js";
import Virt from "./virt";
import {getAssociatedTokenAddressSync, NATIVE_MINT} from "@solana/spl-token";
import {BN} from "@coral-xyz/anchor";
import {getEditionPDA, TOKEN_METADATA_PROGRAM_ID} from "./solana";

export class Methods {
	constructor(
		public virt: Virt,
	) {}

	async listNft(
		authority: Keypair,
		mint: PublicKey,
		price: number,
		expiry: number,
		currencyMint: PublicKey = NATIVE_MINT,
	) {
		await this.virt.program.methods
			.listNft(
				new BN(price),
				new BN(expiry),
			)
			.accounts({
				authority: authority.publicKey,
				tokenAccount: getAssociatedTokenAddressSync(mint, authority.publicKey),
				mint,
				edition: getEditionPDA(mint),
				currencyMint,
				listing: this.virt.pdas.listing(mint),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			})
			.signers([authority])
			.rpc();
	}

	async listVirtual(
		authority: Keypair,
		id: PublicKey,
		price: number,
		expiry: number,
		currencyMint: PublicKey = NATIVE_MINT,
	) {
		await this.virt.program.methods
			.listVirtual(
				id,
				new BN(price),
				new BN(expiry),
			)
			.accounts({
				authority: authority.publicKey,
				currencyMint,
				listing: this.virt.pdas.listing(id),
			})
			.signers([authority])
			.rpc();
	}
}

export default Methods;