import { Keypair, PublicKey } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, NATIVE_MINT } from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { getEditionPDA, getMetadataPDA, TOKEN_METADATA_PROGRAM_ID } from "./solana";
export class Instructions {
    constructor(carbon) {
        this.carbon = carbon;
    }
    async initMarketplaceConfig(args) {
        const { marketplaceAuthority, args: methodArgs } = args;
        return await this.carbon.program.methods.initMarketplaceConfig(methodArgs)
            .accounts({
            marketplaceAuthority,
            marketplaceConfig: this.carbon.pdas.marketplaceConfig(marketplaceAuthority),
        }).instruction();
    }
    async initCollectionConfig(args) {
        const { marketplaceAuthority, args: methodArgs } = args;
        return await this.carbon.program.methods.initCollectionConfig(methodArgs)
            .accounts({
            marketplaceAuthority,
            collectionConfig: this.carbon.pdas.collectionConfig(methodArgs.collectionMint),
        }).instruction();
    }
    async listItem(args) {
        const { seller, itemId, collectionMint, price, expiry, currencyMint } = args;
        let mintAccountInfo;
        try {
            const mint = new PublicKey(itemId);
            mintAccountInfo = await this.carbon.program.provider.connection.getAccountInfo(mint);
        }
        catch (e) { }
        // Account info does not exist, therefore has not been minted
        if (mintAccountInfo == null) {
            return await this.listVirtual({
                itemId,
                collectionMint,
                price,
                expiry,
                currencyMint,
                marketplaceAuthority: seller !== null && seller !== void 0 ? seller : this.carbon.marketplaceAuthority,
            });
        }
        else {
            return await this.listNft({
                seller: seller !== null && seller !== void 0 ? seller : this.carbon.marketplaceAuthority,
                mint: new PublicKey(itemId),
                collectionMint,
                price,
                expiry,
                currencyMint,
            });
        }
    }
    async delistItem(args) {
        const { seller, itemId } = args;
        try {
            const listing = await this.carbon.program.account.listing.fetch(this.carbon.pdas.listing(itemId));
            if (listing.isVirtual) {
                return await this.delistVirtual({
                    marketplaceAuthority: seller,
                    itemId
                });
            }
            else {
                return await this.delistNft({
                    seller: seller !== null && seller !== void 0 ? seller : this.carbon.marketplaceAuthority,
                    mint: new PublicKey(itemId),
                });
            }
        }
        catch (e) {
            if (e === null || e === void 0 ? void 0 : e.message.includes('Account does not exist')) {
                return;
            }
            else {
                throw e;
            }
        }
    }
    async delistOrBuyItem(args) {
        const { listing, maxPrice } = args;
        if (listing.isVirtual) {
            return await this.delistVirtual({
                marketplaceAuthority: this.carbon.marketplaceAuthority,
                itemId: listing.itemId
            });
        }
        else {
            if (listing.seller.equals(this.carbon.marketplaceAuthority)) {
                return await this.delistNft({
                    seller: this.carbon.marketplaceAuthority,
                    mint: new PublicKey(listing.itemId),
                });
            }
            else {
                return await this.buyNft({
                    buyer: this.carbon.marketplaceAuthority,
                    listing,
                    maxPrice
                });
            }
        }
    }
    async listNft(args) {
        const { seller, mint, collectionMint, price, expiry, currencyMint, accounts } = args;
        return await this.carbon.program.methods
            .listNft(new BN(price), new BN(expiry))
            .accounts({
            seller,
            tokenAccount: getAssociatedTokenAddressSync(mint, seller),
            mint,
            collectionMint,
            metadataAccount: getMetadataPDA(mint),
            edition: getEditionPDA(mint),
            currencyMint: currencyMint !== null && currencyMint !== void 0 ? currencyMint : NATIVE_MINT,
            listing: this.carbon.pdas.listing(Array.from(mint.toBytes())),
            collectionConfig: this.carbon.pdas.collectionConfig(collectionMint),
            marketplaceConfig: this.carbon.pdas.marketplaceConfig(this.carbon.marketplaceAuthority),
            custodyAccount: this.carbon.pdas.custodyAccount(mint),
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            ...(accounts || {})
        }).instruction();
    }
    async delistNft(args) {
        const { seller, mint } = args;
        return await this.carbon.program.methods
            .delistNft()
            .accounts({
            seller,
            tokenAccount: getAssociatedTokenAddressSync(mint, seller),
            mint,
            edition: getEditionPDA(mint),
            listing: this.carbon.pdas.listing(Array.from(mint.toBuffer())),
            custodyAccount: this.carbon.pdas.custodyAccount(mint),
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        }).instruction();
    }
    async buyNft(args) {
        const { buyer, listing, maxPrice } = args;
        const mint = new PublicKey(listing.itemId);
        const builder = this.carbon.program.methods
            .buyNft(maxPrice ? new BN(maxPrice) : listing.price)
            .accounts({
            buyer,
            seller: listing.seller,
            mint,
            sellerTokenAccount: getAssociatedTokenAddressSync(mint, listing.seller),
            buyerTokenAccount: getAssociatedTokenAddressSync(mint, buyer),
            metadataAccount: getMetadataPDA(mint),
            edition: getEditionPDA(mint),
            listing: this.carbon.pdas.listing(listing.itemId),
            custodyAccount: this.carbon.pdas.custodyAccount(mint),
            feeAccount: listing.feeConfig.feeAccount,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        });
        if (listing.currencyMint.equals(NATIVE_MINT)) {
            builder.remainingAccounts([{
                    pubkey: this.carbon.marketplaceAuthority,
                    isWritable: true,
                    isSigner: false,
                }]);
        }
        else {
            builder.remainingAccounts([{
                    pubkey: listing.currencyMint,
                    isWritable: false,
                    isSigner: false,
                }, {
                    pubkey: getAssociatedTokenAddressSync(listing.currencyMint, buyer),
                    isWritable: true,
                    isSigner: false,
                }, {
                    pubkey: this.carbon.marketplaceAuthority,
                    isWritable: false,
                    isSigner: false,
                }, {
                    pubkey: getAssociatedTokenAddressSync(listing.currencyMint, this.carbon.marketplaceAuthority),
                    isWritable: true,
                    isSigner: false,
                }, {
                    pubkey: getAssociatedTokenAddressSync(listing.currencyMint, listing.feeConfig.feeAccount),
                    isWritable: true,
                    isSigner: false,
                }, {
                    pubkey: getAssociatedTokenAddressSync(listing.currencyMint, listing.seller),
                    isWritable: true,
                    isSigner: false,
                }]);
        }
        return await builder.instruction();
    }
    async listVirtual(args) {
        var _a;
        const { itemId, price, expiry, collectionMint, currencyMint } = args;
        const marketplaceAuthority = (_a = args.marketplaceAuthority) !== null && _a !== void 0 ? _a : this.carbon.marketplaceAuthority;
        return await this.carbon.program.methods
            .listVirtual(itemId, new BN(price), new BN(expiry))
            .accounts({
            marketplaceAuthority,
            currencyMint: currencyMint !== null && currencyMint !== void 0 ? currencyMint : NATIVE_MINT,
            listing: this.carbon.pdas.listing(itemId),
            collectionConfig: this.carbon.pdas.collectionConfig(collectionMint),
            marketplaceConfig: this.carbon.pdas.marketplaceConfig(marketplaceAuthority),
        })
            .instruction();
    }
    async delistVirtual(args) {
        var _a;
        const { itemId } = args;
        const marketplaceAuthority = (_a = args.marketplaceAuthority) !== null && _a !== void 0 ? _a : this.carbon.marketplaceAuthority;
        return await this.carbon.program.methods
            .delistVirtual(itemId)
            .accounts({
            marketplaceAuthority,
            listing: this.carbon.pdas.listing(itemId),
        })
            .instruction();
    }
    async buyVirtual(args) {
        var _a;
        const { buyer, listing, metadata, collectionConfig, maxPrice } = args;
        const marketplaceAuthority = (_a = args.marketplaceAuthority) !== null && _a !== void 0 ? _a : this.carbon.marketplaceAuthority;
        const mint = Keypair.generate();
        const builder = this.carbon.program.methods
            .buyVirtual(listing.itemId, maxPrice ? new BN(maxPrice) : listing.price, metadata)
            .accounts({
            buyer,
            marketplaceAuthority,
            mint: mint.publicKey,
            collectionConfig: this.carbon.pdas.collectionConfig(collectionConfig.collectionMint),
            buyerTokenAccount: getAssociatedTokenAddressSync(mint.publicKey, buyer),
            metadataAccount: getMetadataPDA(mint.publicKey),
            edition: getEditionPDA(mint.publicKey),
            collectionMint: collectionConfig.collectionMint,
            collectionMetadataAccount: getMetadataPDA(collectionConfig.collectionMint),
            collectionEdition: getEditionPDA(collectionConfig.collectionMint),
            listing: this.carbon.pdas.listing(listing.itemId),
            feeAccount: listing.feeConfig.feeAccount,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        });
        if (listing.currencyMint.equals(NATIVE_MINT)) {
            builder.remainingAccounts([{
                    pubkey: marketplaceAuthority,
                    isWritable: true,
                    isSigner: false,
                }]);
        }
        else {
            builder.remainingAccounts([{
                    pubkey: listing.currencyMint,
                    isWritable: false,
                    isSigner: false,
                }, {
                    pubkey: getAssociatedTokenAddressSync(listing.currencyMint, buyer),
                    isWritable: true,
                    isSigner: false,
                }, {
                    pubkey: marketplaceAuthority,
                    isWritable: false,
                    isSigner: false,
                }, {
                    pubkey: getAssociatedTokenAddressSync(listing.currencyMint, marketplaceAuthority),
                    isWritable: true,
                    isSigner: false,
                }, {
                    pubkey: getAssociatedTokenAddressSync(listing.currencyMint, listing.feeConfig.feeAccount),
                    isWritable: true,
                    isSigner: false,
                }]);
        }
        return {
            mint,
            instruction: await builder.instruction()
        };
    }
    async custody(args) {
        var _a;
        const { owner, mint, itemId, accounts } = args;
        const marketplaceAuthority = (_a = args.marketplaceAuthority) !== null && _a !== void 0 ? _a : this.carbon.marketplaceAuthority;
        return await this.carbon.program.methods
            .custody(itemId)
            .accounts({
            owner,
            marketplaceAuthority,
            tokenAccount: getAssociatedTokenAddressSync(mint, owner),
            mint,
            edition: getEditionPDA(mint),
            custodyAccount: this.carbon.pdas.custodyAccount(mint),
            listing: this.carbon.pdas.listing(Array.from(mint.toBuffer())),
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            ...(accounts || {})
        })
            .instruction();
    }
    async uncustody(args) {
        var _a;
        const { owner, custodyAccount } = args;
        const marketplaceAuthority = (_a = args.marketplaceAuthority) !== null && _a !== void 0 ? _a : this.carbon.marketplaceAuthority;
        return await this.carbon.program.methods
            .uncustody()
            .accounts({
            owner,
            marketplaceAuthority,
            tokenAccount: getAssociatedTokenAddressSync(custodyAccount.mint, owner),
            mint: custodyAccount.mint,
            edition: getEditionPDA(custodyAccount.mint),
            custodyAccount: this.carbon.pdas.custodyAccount(custodyAccount.mint),
            listing: this.carbon.pdas.listing(Array.from(custodyAccount.mint.toBuffer())),
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
            .instruction();
    }
    async takeOwnership(args) {
        var _a;
        const { custodyAccount } = args;
        const marketplaceAuthority = (_a = args.marketplaceAuthority) !== null && _a !== void 0 ? _a : this.carbon.marketplaceAuthority;
        return await this.carbon.program.methods
            .takeOwnership()
            .accounts({
            marketplaceAuthority,
            owner: custodyAccount.owner,
            tokenAccount: getAssociatedTokenAddressSync(custodyAccount.mint, custodyAccount.owner),
            marketplaceAuthorityTokenAccount: getAssociatedTokenAddressSync(custodyAccount.mint, marketplaceAuthority),
            mint: custodyAccount.mint,
            edition: getEditionPDA(custodyAccount.mint),
            custodyAccount: this.carbon.pdas.custodyAccount(custodyAccount.mint),
            listing: this.carbon.pdas.listing(Array.from(custodyAccount.mint.toBuffer())),
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
            .instruction();
    }
}
export default Instructions;
//# sourceMappingURL=instructions.js.map