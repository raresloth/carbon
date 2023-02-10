import {Keypair, PublicKey} from "@solana/web3.js";
import {Program, Provider, BN} from "@coral-xyz/anchor";
import * as VirtIDL from "./idl/virt"
import {getAssociatedTokenAddressSync, NATIVE_MINT} from "@solana/spl-token";
import {getEditionPDA, TOKEN_METADATA_PROGRAM_ID} from "./solana";

export class Virt {
	program: Program<VirtIDL.Virt>;

	constructor(
		public programId: PublicKey,
		public provider: Provider
	) {
		this.program = new Program<VirtIDL.Virt>(VirtIDL.IDL, programId, provider);
	}

	getListingPDA(mint: PublicKey): PublicKey {
		return PublicKey.findProgramAddressSync([
			Buffer.from("listing"),
			mint.toBuffer(),
		], this.programId)[0];
	}

	async listNft(
		authority: Keypair,
		mint: PublicKey,
		price: number,
		expiry: number,
		currencyMint: PublicKey = NATIVE_MINT,
	) {
		await this.program.methods
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
				listing: this.getListingPDA(mint),
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			})
			.signers([authority])
			.rpc();
	}
}

export default Virt;