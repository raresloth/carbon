import { IdlAccounts, IdlEvents } from "@coral-xyz/anchor";
import { Carbon } from "./idl/carbon";
import { PublicKey } from "@solana/web3.js";

export type MarketplaceConfig = IdlAccounts<Carbon>["marketplaceConfig"];
export type CollectionConfig = IdlAccounts<Carbon>["collectionConfig"];
export type Listing = IdlAccounts<Carbon>["listing"];
export type CustodyAccount = IdlAccounts<Carbon>["custodyAccount"];

export type ListingWithKey = {
	publicKey: PublicKey;
	account: Listing;
};
export type CustodyAccountWithKey = {
	publicKey: PublicKey;
	account: CustodyAccount;
};

export type ListEvent = IdlEvents<Carbon>["List"];
export type BuyEvent = IdlEvents<Carbon>["Buy"];
export type DelistEvent = IdlEvents<Carbon>["Delist"];
export type CustodyEvent = IdlEvents<Carbon>["Custody"];
export type UncustodyEvent = IdlEvents<Carbon>["Uncustody"];
