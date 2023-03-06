import { PublicKey } from "@solana/web3.js";
export * from './carbon';
export * as CarbonIDL from './idl/carbon';
export declare const PROGRAM_ADDRESS = "CRBNZ9mWZXkgX7Um6FsdFMGFHfeNgfwbyPYtuzHxbPWB";
export declare const PROGRAM_ID: PublicKey;
export declare const FEE_ACCOUNT_ADDRESS = "FEERpjXuYbmyfbKMyNcLvEBTbyJh2nRsNbBWEUdar3e3";
export declare const FEE_ACCOUNT_KEY: PublicKey;
export declare const FEE_BPS = 0;
export declare function toItemId(value: string): number[];
export declare function parseItemId(itemId: number[]): string;
//# sourceMappingURL=index.d.ts.map