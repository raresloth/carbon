import Carbon from "./carbon";
import { Wallet } from "@coral-xyz/anchor/dist/esm/provider";
import { BuyNftArgs, CustodyArgs, DelistItemArgs, DelistNftArgs, DelistOrBuyItemArgs, DelistVirtualArgs, InitCollectionConfigArgs, InitMarketplaceConfigArgs, ListItemArgs, ListNftArgs, ListVirtualArgs, TakeOwnershipArgs, UncustodyArgs } from "./instructions";
export declare class Methods {
    carbon: Carbon;
    constructor(carbon: Carbon);
    initMarketplaceConfig(args: Omit<InitMarketplaceConfigArgs, 'marketplaceAuthority'> & {
        marketplaceAuthority?: Wallet;
    }): Promise<string>;
    initCollectionConfig(args: Omit<InitCollectionConfigArgs, 'marketplaceAuthority'> & {
        marketplaceAuthority?: Wallet;
    }): Promise<string>;
    listItem(args: Omit<ListItemArgs, 'seller'> & {
        seller?: Wallet;
    }): Promise<string>;
    delistItem(args: Omit<DelistItemArgs, 'seller'> & {
        seller?: Wallet;
    }): Promise<string | undefined>;
    delistOrBuyItem(args: DelistOrBuyItemArgs): Promise<string>;
    listNft(args: Omit<ListNftArgs, 'seller'> & {
        seller?: Wallet;
    }): Promise<string>;
    delistNft(args: Omit<DelistNftArgs, 'seller'> & {
        seller?: Wallet;
    }): Promise<string>;
    buyNft(args: Omit<BuyNftArgs, 'buyer'> & {
        buyer?: Wallet;
    }): Promise<string>;
    listVirtual(args: Omit<ListVirtualArgs, 'marketplaceAuthority'> & {
        marketplaceAuthority?: Wallet;
    }): Promise<string>;
    delistVirtual(args: Omit<DelistVirtualArgs, 'marketplaceAuthority'> & {
        marketplaceAuthority?: Wallet;
    }): Promise<string>;
    custody(args: Omit<CustodyArgs, 'authority'> & {
        authority?: Wallet;
    }): Promise<string>;
    uncustody(args: Omit<UncustodyArgs, 'authority'> & {
        authority?: Wallet;
    }): Promise<string>;
    takeOwnership(args: Omit<TakeOwnershipArgs, 'marketplaceAuthority'> & {
        marketplaceAuthority?: Wallet;
    }): Promise<string>;
}
export default Methods;
//# sourceMappingURL=methods.d.ts.map