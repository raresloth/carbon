import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";
export class Methods {
    constructor(carbon) {
        this.carbon = carbon;
    }
    async initMarketplaceConfig(args) {
        var _a;
        const marketplaceAuthority = (_a = args.marketplaceAuthority) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.initMarketplaceConfig({
            ...args,
            marketplaceAuthority: marketplaceAuthority.publicKey,
        });
        const provider = this.carbon.getProviderWithWallet(marketplaceAuthority);
        return await provider.sendAndConfirm(new Transaction().add(ix));
    }
    async initCollectionConfig(args) {
        var _a;
        const marketplaceAuthority = (_a = args.marketplaceAuthority) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.initCollectionConfig({
            ...args,
            marketplaceAuthority: marketplaceAuthority.publicKey,
        });
        const provider = this.carbon.getProviderWithWallet(marketplaceAuthority);
        return await provider.sendAndConfirm(new Transaction().add(ix));
    }
    async listItem(args) {
        var _a;
        const seller = (_a = args.seller) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.listItem({
            ...args,
            seller: seller.publicKey
        });
        const provider = this.carbon.getProviderWithWallet(seller);
        return await provider.sendAndConfirm(new Transaction().add(ix));
    }
    async delistItem(args) {
        var _a;
        const seller = (_a = args.seller) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.delistItem({
            ...args,
            seller: seller.publicKey
        });
        // No delist necessary as the listing doesn't exist
        if (ix == null) {
            return;
        }
        const provider = this.carbon.getProviderWithWallet(seller);
        return await provider.sendAndConfirm(new Transaction().add(ix));
    }
    async delistOrBuyItem(args) {
        const ix = await this.carbon.instructions.delistOrBuyItem(args);
        return await this.carbon.provider.sendAndConfirm(new Transaction().add(ix));
    }
    async listNft(args) {
        var _a;
        const seller = (_a = args.seller) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.listNft({
            ...args,
            seller: seller.publicKey
        });
        const provider = this.carbon.getProviderWithWallet(seller);
        return await provider.sendAndConfirm(new Transaction().add(ix));
    }
    async delistNft(args) {
        var _a;
        const seller = (_a = args.seller) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.delistNft({
            ...args,
            seller: seller.publicKey
        });
        const provider = this.carbon.getProviderWithWallet(seller);
        return await provider.sendAndConfirm(new Transaction().add(ix));
    }
    async buyNft(args) {
        var _a;
        const buyer = (_a = args.buyer) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.buyNft({
            ...args,
            buyer: buyer.publicKey
        });
        const provider = this.carbon.getProviderWithWallet(buyer);
        return await provider.sendAndConfirm(new Transaction()
            .add(ComputeBudgetProgram.setComputeUnitLimit({
            units: 300000
        }))
            .add(ix));
    }
    async buyNftAndCustody(args) {
        var _a;
        const buyer = (_a = args.buyer) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const buyIx = await this.carbon.instructions.buyNft({
            ...args,
            buyer: buyer.publicKey
        });
        const custodyIx = await this.carbon.instructions.custody({
            owner: buyer.publicKey,
            mint: new PublicKey(args.listing.itemId),
            itemId: args.listing.itemId
        });
        const provider = this.carbon.getProviderWithWallet(buyer);
        return await provider.sendAndConfirm(new Transaction()
            .add(ComputeBudgetProgram.setComputeUnitLimit({
            units: 400000
        }))
            .add(buyIx)
            .add(custodyIx));
    }
    async listVirtual(args) {
        var _a;
        const marketplaceAuthority = (_a = args.marketplaceAuthority) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.listVirtual({
            ...args,
            marketplaceAuthority: marketplaceAuthority.publicKey
        });
        const provider = this.carbon.getProviderWithWallet(marketplaceAuthority);
        return await provider.sendAndConfirm(new Transaction().add(ix));
    }
    async delistVirtual(args) {
        var _a;
        const marketplaceAuthority = (_a = args.marketplaceAuthority) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.delistVirtual({
            ...args,
            marketplaceAuthority: marketplaceAuthority.publicKey
        });
        const provider = this.carbon.getProviderWithWallet(marketplaceAuthority);
        return await provider.sendAndConfirm(new Transaction().add(ix));
    }
    // buyVirtual requires a signature from the buyer and marketplace authority so the instruction
    // should be used instead of helper methods
    async custody(args) {
        var _a;
        const owner = (_a = args.owner) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.custody({
            ...args,
            owner: owner.publicKey
        });
        const provider = this.carbon.getProviderWithWallet(owner);
        return await provider.sendAndConfirm(new Transaction().add(ix));
    }
    async uncustody(args) {
        var _a;
        const owner = (_a = args.owner) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.uncustody({
            ...args,
            owner: owner.publicKey
        });
        const provider = this.carbon.getProviderWithWallet(owner);
        return await provider.sendAndConfirm(new Transaction().add(ix));
    }
    async takeOwnership(args) {
        var _a;
        const marketplaceAuthority = (_a = args.marketplaceAuthority) !== null && _a !== void 0 ? _a : this.carbon.provider.wallet;
        const ix = await this.carbon.instructions.takeOwnership({
            ...args,
            marketplaceAuthority: marketplaceAuthority.publicKey
        });
        const provider = this.carbon.getProviderWithWallet(marketplaceAuthority);
        return await provider.sendAndConfirm(new Transaction().add(ix));
    }
}
export default Methods;
//# sourceMappingURL=methods.js.map