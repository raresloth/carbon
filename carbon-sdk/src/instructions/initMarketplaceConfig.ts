import { IdlTypes } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { CarbonIDL } from "..";

export type InitMarketplaceConfigArgs = {
	marketplaceAuthority: PublicKey;
	args: IdlTypes<CarbonIDL.Carbon>["MarketplaceConfigArgs"];
};
export async function initMarketplaceConfig(
	args: InitMarketplaceConfigArgs
): Promise<TransactionInstruction> {
	const { marketplaceAuthority, args: methodArgs } = args;
	return await this.carbon.program.methods
		.initMarketplaceConfig(methodArgs)
		.accounts({
			marketplaceAuthority,
			marketplaceConfig: this.carbon.pdas.marketplaceConfig(marketplaceAuthority),
		})
		.instruction();
}
