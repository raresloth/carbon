import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import Carbon from "./carbon";
import { IdlAccounts, IdlTypes } from "@coral-xyz/anchor";
import * as CarbonIDL from "./idl/carbon";
export type InitMarketplaceConfigArgs = {
    marketplaceAuthority: PublicKey;
    args: IdlTypes<CarbonIDL.Carbon>["MarketplaceConfigArgs"];
};
export type InitCollectionConfigArgs = {
    marketplaceAuthority: PublicKey;
    args: IdlTypes<CarbonIDL.Carbon>["CollectionConfigArgs"];
};
export type ListItemArgs = {
    seller?: PublicKey;
    itemId: number[];
    collectionMint: PublicKey;
    price: number;
    expiry: number;
    currencyMint?: PublicKey;
};
export type DelistItemArgs = {
    seller?: PublicKey;
    itemId: number[];
};
export type DelistOrBuyItemArgs = {
    listing: IdlAccounts<CarbonIDL.Carbon>["listing"];
    maxPrice?: number;
};
export type ListNftArgs = {
    seller: PublicKey;
    mint: PublicKey;
    collectionMint: PublicKey;
    price: number;
    expiry: number;
    currencyMint?: PublicKey;
    accounts?: any;
};
export type DelistNftArgs = {
    seller: PublicKey;
    mint: PublicKey;
};
export type BuyNftArgs = {
    buyer: PublicKey;
    listing: IdlAccounts<CarbonIDL.Carbon>["listing"];
    maxPrice?: number;
};
export type ListVirtualArgs = {
    marketplaceAuthority?: PublicKey;
    itemId: number[];
    collectionMint: PublicKey;
    price: number;
    expiry: number;
    currencyMint?: PublicKey;
};
export type DelistVirtualArgs = {
    marketplaceAuthority?: PublicKey;
    itemId: number[];
};
export type BuyVirtualArgs = {
    marketplaceAuthority?: PublicKey;
    buyer: PublicKey;
    collectionConfig: IdlAccounts<CarbonIDL.Carbon>["collectionConfig"];
    listing: IdlAccounts<CarbonIDL.Carbon>["listing"];
    metadata: IdlTypes<CarbonIDL.Carbon>["Metadata"];
    maxPrice?: number;
};
export type CustodyArgs = {
    marketplaceAuthority?: PublicKey;
    authority: PublicKey;
    mint: PublicKey;
    accounts: any;
};
export type UncustodyArgs = {
    marketplaceAuthority?: PublicKey;
    authority: PublicKey;
    custodyAccount: IdlAccounts<CarbonIDL.Carbon>["custodyAccount"];
};
export type TakeOwnershipArgs = {
    marketplaceAuthority?: PublicKey;
    custodyAccount: IdlAccounts<CarbonIDL.Carbon>["custodyAccount"];
};
export declare class Instructions {
    carbon: Carbon;
    constructor(carbon: Carbon);
    initMarketplaceConfig(args: InitMarketplaceConfigArgs): Promise<TransactionInstruction>;
    initCollectionConfig(args: InitCollectionConfigArgs): Promise<TransactionInstruction>;
    listItem(args: ListItemArgs): Promise<TransactionInstruction>;
    delistItem(args: DelistItemArgs): Promise<TransactionInstruction | undefined>;
    delistOrBuyItem(args: DelistOrBuyItemArgs): Promise<TransactionInstruction>;
    listNft(args: ListNftArgs): Promise<TransactionInstruction>;
    delistNft(args: DelistNftArgs): Promise<TransactionInstruction>;
    buyNft(args: BuyNftArgs): Promise<TransactionInstruction>;
    listVirtual(args: ListVirtualArgs): Promise<TransactionInstruction>;
    delistVirtual(args: DelistVirtualArgs): Promise<TransactionInstruction>;
    buyVirtual(args: BuyVirtualArgs): Promise<{
        mint: PublicKey;
        instruction: TransactionInstruction;
    }>;
    custody(args: CustodyArgs): Promise<TransactionInstruction>;
    uncustody(args: UncustodyArgs): Promise<TransactionInstruction>;
    takeOwnership(args: TakeOwnershipArgs): Promise<TransactionInstruction>;
}
export default Instructions;
//# sourceMappingURL=instructions.d.ts.map