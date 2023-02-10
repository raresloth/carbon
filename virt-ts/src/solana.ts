import {PublicKey} from "@solana/web3.js";
import {Buffer} from "buffer";

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

export function getEditionPDA(mint: PublicKey) {
	return PublicKey.findProgramAddressSync([
		Buffer.from('metadata', 'utf8'),
		TOKEN_METADATA_PROGRAM_ID.toBuffer(),
		mint.toBuffer(),
		Buffer.from('edition', 'utf8'),
	], TOKEN_METADATA_PROGRAM_ID)[0]
}