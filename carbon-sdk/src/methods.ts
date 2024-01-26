import {
	ComputeBudgetProgram,
	PublicKey,
	Transaction,
	TransactionInstruction,
} from "@solana/web3.js";
import Carbon from "./carbon";
import { Wallet } from "@coral-xyz/anchor/dist/esm/provider";
import { CustodyAccountWithKey, ListingWithKey } from "./types";
import { BuyNftArgs } from "./instructions/buyNft";
import { CustodyArgs } from "./instructions/custody";
import { DelistItemArgs } from "./instructions/delistItem";
import { DelistNftArgs } from "./instructions/delistNft";
import { DelistVirtualArgs } from "./instructions/delistVirtual";
import { InitCollectionConfigArgs } from "./instructions/initCollectionConfig";
import { InitMarketplaceConfigArgs } from "./instructions/initMarketplaceConfig";
import { ListItemArgs } from "./instructions/listItem";
import { ListNftArgs } from "./instructions/listNft";
import { ListVirtualArgs } from "./instructions/listVirtual";
import { TakeOwnershipArgs } from "./instructions/takeOwnership";
import { UncustodyArgs } from "./instructions/uncustody";
import { CloseMintRecordArgs } from "./instructions/closeMintRecord";
import { UpdateListingArgs } from "./instructions/updateListing";
import { getComputeIxs } from "./solana";

export class Methods {
	constructor(public carbon: Carbon) {}

	async initMarketplaceConfig(
		args: Omit<InitMarketplaceConfigArgs, "marketplaceAuthority"> & {
			marketplaceAuthority?: Wallet;
		}
	): Promise<string> {
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.initMarketplaceConfig({
			...args,
			marketplaceAuthority: marketplaceAuthority.publicKey,
		});
		return await this.sendIxWithWallet(ix, marketplaceAuthority);
	}

	async initCollectionConfig(
		args: Omit<InitCollectionConfigArgs, "marketplaceAuthority"> & {
			marketplaceAuthority?: Wallet;
		}
	): Promise<string> {
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.initCollectionConfig({
			...args,
			marketplaceAuthority: marketplaceAuthority.publicKey,
		});
		return await this.sendIxWithWallet(ix, marketplaceAuthority);
	}

	async listItem(args: Omit<ListItemArgs, "seller"> & { seller?: Wallet }): Promise<string> {
		const seller = args.seller ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.listItem({
			...args,
			seller: seller.publicKey,
		});
		return await this.sendIxWithWallet(ix, seller);
	}

	async delistItem(
		args: Omit<DelistItemArgs, "seller"> & { seller?: Wallet }
	): Promise<string | undefined> {
		const seller = args.seller ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.delistItem({
			...args,
			seller: seller.publicKey,
		});

		// No delist necessary as the listing doesn't exist
		if (ix == null) {
			return;
		}

		return await this.sendIxWithWallet(ix, seller);
	}

	// delistOrBuyItem may require a signature from the mint if buying a virtual item so
	// transaction helpers should be used instead

	async listNft(args: Omit<ListNftArgs, "seller"> & { seller?: Wallet }): Promise<string> {
		const seller = args.seller ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.listNft({
			...args,
			seller: seller.publicKey,
		});
		return await this.sendIxWithWallet(ix, seller);
	}

	async updateListing(
		args: Omit<UpdateListingArgs, "seller"> & { seller?: Wallet }
	): Promise<string> {
		const seller = args.seller ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.updateListing({
			...args,
			seller: seller.publicKey,
		});
		return await this.sendIxWithWallet(ix, seller);
	}

	async delistNft(args: Omit<DelistNftArgs, "seller"> & { seller?: Wallet }): Promise<string> {
		const seller = args.seller ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.delistNft({
			...args,
			seller: seller.publicKey,
		});
		return await this.sendIxWithWallet(ix, seller);
	}

	async buyNft(args: Omit<BuyNftArgs, "buyer"> & { buyer?: Wallet }): Promise<string> {
		const buyer = args.buyer ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.buyNft({
			...args,
			buyer: buyer.publicKey,
		});
		return await this.sendIxWithWallet(ix, buyer, 300_000);
	}

	async buyNftAndCustody(args: Omit<BuyNftArgs, "buyer"> & { buyer?: Wallet }): Promise<string> {
		const buyer = args.buyer ?? this.carbon.provider.wallet;
		const buyIx = await this.carbon.instructions.buyNft({
			...args,
			buyer: buyer.publicKey,
		});

		const custodyIx = await this.carbon.instructions.custody({
			owner: buyer.publicKey,
			mint: new PublicKey(args.listing.itemId),
			itemId: args.listing.itemId,
		});

		return await this.sendIxsWithWallet([buyIx, custodyIx], buyer, 400_000);
	}

	async listVirtual(
		args: Omit<ListVirtualArgs, "marketplaceAuthority"> & { marketplaceAuthority?: Wallet }
	): Promise<string> {
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.listVirtual({
			...args,
			seller: marketplaceAuthority.publicKey,
			marketplaceAuthority: marketplaceAuthority.publicKey,
		});
		return await this.sendIxWithWallet(ix, marketplaceAuthority);
	}

	async delistVirtual(
		args: Omit<DelistVirtualArgs, "seller"> & { seller?: Wallet }
	): Promise<string> {
		const seller = args.seller ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.delistVirtual({
			...args,
			seller: seller.publicKey,
		});
		return await this.sendIxWithWallet(ix, seller);
	}

	// buyVirtual requires a signature from the buyer and marketplace authority so the
	// instruction or transaction helpers should be used instead

	async custody(args: Omit<CustodyArgs, "owner"> & { owner?: Wallet }): Promise<string> {
		const owner = args.owner ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.custody({
			...args,
			owner: owner.publicKey,
		});
		return await this.sendIxWithWallet(ix, owner);
	}

	async uncustody(args: Omit<UncustodyArgs, "owner"> & { owner?: Wallet }): Promise<string> {
		const owner = args.owner ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.uncustody({
			...args,
			owner: owner.publicKey,
		});
		return await this.sendIxWithWallet(ix, owner);
	}

	async takeOwnership(
		args: Omit<TakeOwnershipArgs, "marketplaceAuthority"> & { marketplaceAuthority?: Wallet }
	): Promise<string> {
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.takeOwnership({
			...args,
			marketplaceAuthority: marketplaceAuthority.publicKey,
		});
		return await this.sendIxWithWallet(ix, marketplaceAuthority);
	}

	async closeMintRecord(
		args: Omit<CloseMintRecordArgs, "marketplaceAuthority"> & { marketplaceAuthority?: Wallet }
	): Promise<string> {
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.provider.wallet;
		const ix = await this.carbon.instructions.closeMintRecord({
			...args,
			marketplaceAuthority: marketplaceAuthority.publicKey,
		});
		return await this.sendIxWithWallet(ix, marketplaceAuthority);
	}

	async getListingsForMarketplaceAuthority(
		marketplaceAuthority: PublicKey
	): Promise<ListingWithKey[]> {
		return await this.carbon.program.account.listing.all([
			{
				memcmp: {
					offset: 10,
					bytes: marketplaceAuthority.toBase58(),
				},
			},
		]);
	}

	async getCustodyAccountsForOwner(owner: PublicKey): Promise<CustodyAccountWithKey[]> {
		return await this.carbon.program.account.custodyAccount.all([
			{
				memcmp: {
					offset: 42,
					bytes: owner.toBase58(),
				},
			},
		]);
	}

	async sendIxWithWallet(
		ix: TransactionInstruction,
		wallet: Wallet,
		computeBudget?: number
	): Promise<string> {
		return await this.sendIxsWithWallet([ix], wallet, computeBudget);
	}

	async sendIxsWithWallet(
		ixs: TransactionInstruction[],
		wallet: Wallet,
		computeBudget?: number
	): Promise<string> {
		const provider = this.carbon.getProviderWithWallet(wallet);
		return provider.sendAndConfirm(this.getDefaultTransaction(computeBudget).add(...ixs));
	}

	getDefaultTransaction(computeBudget?: number): Transaction {
		return new Transaction().add(
			...getComputeIxs({
				computeBudget,
				targetPriorityFeeLamports: this.carbon.targetPriorityFeeLamports,
			})
		);
	}
}

export default Methods;
