import { PublicKey } from "@solana/web3.js";
import Carbon from "./carbon";
export declare class Pdas {
    carbon: Carbon;
    constructor(carbon: Carbon);
    marketplaceConfig(marketplaceAuthority: PublicKey): PublicKey;
    collectionConfig(collectionMint: PublicKey): PublicKey;
    listing(itemId: number[]): PublicKey;
    custodyAccount(mint: PublicKey): PublicKey;
}
export default Pdas;
//# sourceMappingURL=pdas.d.ts.map