import {ComputeBudgetProgram, Transaction} from "@solana/web3.js";
import Carbon from "./carbon";
import { Wallet } from "@coral-xyz/anchor/dist/esm/provider";
import {
	BuyNftArgs, CustodyArgs,
	DelistItemArgs, DelistNftArgs, DelistOrBuyItemArgs, DelistVirtualArgs,
	InitCollectionConfigArgs,
	InitMarketplaceConfigArgs,
	ListItemArgs, ListNftArgs, ListVirtualArgs, TakeOwnershipArgs, UncustodyArgs
} from "./instructions";

export class Methods {
	constructor(
		public carbon: Carbon,
	) {}

	async initMarketplaceConfig(
		args: Omit<InitMarketplaceConfigArgs, 'marketplaceAuthority'> & { marketplaceAuthority?: Wallet }
	): Promise<string> {
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.initMarketplaceConfig({
			...args,
			marketplaceAuthority: marketplaceAuthority!.publicKey,
		})
		const provider = this.carbon.getProviderWithWallet(marketplaceAuthority!)
		return await provider.sendAndConfirm(new Transaction().add(ix))
	}

	async initCollectionConfig(
		args: Omit<InitCollectionConfigArgs, 'marketplaceAuthority'> & { marketplaceAuthority?: Wallet }
	): Promise<string> {
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.initCollectionConfig({
			...args,
			marketplaceAuthority: marketplaceAuthority!.publicKey,
		})
		const provider = this.carbon.getProviderWithWallet(marketplaceAuthority!)
		return await provider.sendAndConfirm(new Transaction().add(ix))
	}

	async listItem(
		args: Omit<ListItemArgs, 'seller'> & { seller?: Wallet }
	): Promise<string> {
		const seller = args.seller ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.listItem({
			...args,
			seller: seller!.publicKey
		})
		const provider = this.carbon.getProviderWithWallet(seller!)
		return await provider.sendAndConfirm(new Transaction().add(ix))
	}

	async delistItem(
		args: Omit<DelistItemArgs, 'seller'> & { seller?: Wallet }
	): Promise<string|undefined> {
		const seller = args.seller ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.delistItem({
			...args,
			seller: seller!.publicKey
		})

		// No delist necessary as the listing doesn't exist
		if (ix == null) {
			return
		}

		const provider = this.carbon.getProviderWithWallet(seller!)
		return await provider.sendAndConfirm(new Transaction().add(ix))
	}

	async delistOrBuyItem(
		args: DelistOrBuyItemArgs
	): Promise<string> {
		const ix = await this.carbon.instructions.delistOrBuyItem(args)
		return await this.carbon.provider.sendAndConfirm(new Transaction().add(ix))
	}

	async listNft(
		args: Omit<ListNftArgs, 'seller'> & { seller?: Wallet }
	): Promise<string> {
		const seller = args.seller ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.listNft({
			...args,
			seller: seller!.publicKey
		})
		const provider = this.carbon.getProviderWithWallet(seller!)
		return await provider.sendAndConfirm(new Transaction().add(ix))
	}

	async delistNft(
		args: Omit<DelistNftArgs, 'seller'> & { seller?: Wallet }
	): Promise<string> {
		const seller = args.seller ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.delistNft({
			...args,
			seller: seller!.publicKey
		})
		const provider = this.carbon.getProviderWithWallet(seller!)
		return await provider.sendAndConfirm(new Transaction().add(ix))
	}

	async buyNft(
		args: Omit<BuyNftArgs, 'buyer'> & { buyer?: Wallet }
	): Promise<string> {
		const buyer = args.buyer ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.buyNft({
			...args,
			buyer: buyer!.publicKey
		})
		const provider = this.carbon.getProviderWithWallet(buyer!)
		return await provider.sendAndConfirm(
			new Transaction()
				.add(ComputeBudgetProgram.setComputeUnitLimit({
					units: 300_000
				}))
				.add(ix)
		)
	}

	async listVirtual(
		args: Omit<ListVirtualArgs, 'marketplaceAuthority'> & { marketplaceAuthority?: Wallet }
	): Promise<string> {
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.listVirtual({
			...args,
			marketplaceAuthority: marketplaceAuthority!.publicKey
		})
		const provider = this.carbon.getProviderWithWallet(marketplaceAuthority!)
		return await provider.sendAndConfirm(new Transaction().add(ix))
	}

	async delistVirtual(
		args: Omit<DelistVirtualArgs, 'marketplaceAuthority'> & { marketplaceAuthority?: Wallet }
	): Promise<string> {
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.delistVirtual({
			...args,
			marketplaceAuthority: marketplaceAuthority!.publicKey
		})
		const provider = this.carbon.getProviderWithWallet(marketplaceAuthority!)
		return await provider.sendAndConfirm(new Transaction().add(ix))
	}

	// buyVirtual requires a signature from the buyer and marketplace authority so the instruction
	// should be used instead of helper methods

	async custody(
		args: Omit<CustodyArgs, 'owner'> & { owner?: Wallet }
	): Promise<string> {
		const owner = args.owner ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.custody({
			...args,
			owner: owner!.publicKey
		})
		const provider = this.carbon.getProviderWithWallet(owner!)
		return await provider.sendAndConfirm(new Transaction().add(ix))
	}

	async uncustody(
		args: Omit<UncustodyArgs, 'owner'> & { owner?: Wallet }
	): Promise<string> {
		const owner = args.owner ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.uncustody({
			...args,
			owner: owner!.publicKey
		})
		const provider = this.carbon.getProviderWithWallet(owner!)
		return await provider.sendAndConfirm(new Transaction().add(ix))
	}

	async takeOwnership(
		args: Omit<TakeOwnershipArgs, 'marketplaceAuthority'> & { marketplaceAuthority?: Wallet }
	): Promise<string> {
		const marketplaceAuthority = args.marketplaceAuthority ?? this.carbon.provider.wallet
		const ix = await this.carbon.instructions.takeOwnership({
			...args,
			marketplaceAuthority: marketplaceAuthority!.publicKey
		})
		const provider = this.carbon.getProviderWithWallet(marketplaceAuthority!)
		return await provider.sendAndConfirm(new Transaction().add(ix))
	}

}

export default Methods;