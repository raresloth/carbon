import {PublicKey} from "@solana/web3.js";

export * from './carbon';
export * as CarbonIDL from './idl/carbon';

export const PROGRAM_ADDRESS = 'CRBNZ9mWZXkgX7Um6FsdFMGFHfeNgfwbyPYtuzHxbPWB'
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS)
export const FEE_ACCOUNT_ADDRESS = 'FEERpjXuYbmyfbKMyNcLvEBTbyJh2nRsNbBWEUdar3e3'
export const FEE_BPS = 0