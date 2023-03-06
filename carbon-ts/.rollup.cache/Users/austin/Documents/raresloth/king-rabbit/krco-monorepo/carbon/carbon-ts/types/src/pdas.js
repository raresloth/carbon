import { PublicKey } from "@solana/web3.js";
export class Pdas {
    constructor(carbon) {
        this.carbon = carbon;
    }
    marketplaceConfig(marketplaceAuthority) {
        return PublicKey.findProgramAddressSync([
            Buffer.from("marketplace_config"),
            marketplaceAuthority.toBuffer(),
        ], this.carbon.programId)[0];
    }
    collectionConfig(collectionMint) {
        return PublicKey.findProgramAddressSync([
            Buffer.from("collection_config"),
            collectionMint.toBuffer(),
        ], this.carbon.programId)[0];
    }
    listing(itemId) {
        return PublicKey.findProgramAddressSync([
            Buffer.from("listing"),
            Buffer.from(itemId),
        ], this.carbon.programId)[0];
    }
    custodyAccount(mint) {
        return PublicKey.findProgramAddressSync([
            Buffer.from("custody_account"),
            mint.toBuffer(),
        ], this.carbon.programId)[0];
    }
}
export default Pdas;
//# sourceMappingURL=pdas.js.map