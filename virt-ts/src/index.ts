import {PublicKey} from "@solana/web3.js";

export * from './virt';
export * as VirtIDL from './idl/virt';

export const PROGRAM_ADDRESS = 'VRTEittKzMw7RxcmwAvk9WEQwjrceHawEM3fpzg9LUc'
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS)
export const FEE_ACCOUNT_ADDRESS = 'FEERpjXuYbmyfbKMyNcLvEBTbyJh2nRsNbBWEUdar3e3'
export const FEE_BPS = 0