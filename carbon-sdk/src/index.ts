import { PublicKey } from "@solana/web3.js";

export * from "./carbon";
export * from "./types";
export * as CarbonIDL from "./idl/carbon";

export const PROGRAM_ADDRESS = "CRBNZ9mWZXkgX7Um6FsdFMGFHfeNgfwbyPYtuzHxbPWB";
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS);
export const FEE_ACCOUNT_ADDRESS = "FEERpjXuYbmyfbKMyNcLvEBTbyJh2nRsNbBWEUdar3e3";
export const FEE_ACCOUNT_KEY = new PublicKey(FEE_ACCOUNT_ADDRESS);
export const FEE_BPS = 0;

export function toItemId(value: string) {
	if (Buffer.byteLength(value) > 32) {
		throw new Error(`Item ID must not exceed 32 characters (${Buffer.byteLength(value)})`);
	}

	return Array.from(Buffer.from(value.padEnd(32, "\0")));
}

export function parseItemId(itemId: number[]) {
	if (itemId.length !== 32) {
		throw new Error(`Item ID must be 32 bytes`);
	}

	const i = itemId.indexOf(0x00);
	const trimmed = itemId.slice(0, i);
	return Buffer.from(trimmed).toString("utf8");
}
