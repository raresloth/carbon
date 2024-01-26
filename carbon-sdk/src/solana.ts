import { ComputeBudgetProgram, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
	"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export function getEditionPDA(mint: PublicKey) {
	return PublicKey.findProgramAddressSync(
		[
			Buffer.from("metadata", "utf8"),
			TOKEN_METADATA_PROGRAM_ID.toBuffer(),
			mint.toBuffer(),
			Buffer.from("edition", "utf8"),
		],
		TOKEN_METADATA_PROGRAM_ID
	)[0];
}

export function getMetadataPDA(mint: PublicKey) {
	return PublicKey.findProgramAddressSync(
		[Buffer.from("metadata", "utf8"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
		TOKEN_METADATA_PROGRAM_ID
	)[0];
}

export const GLOBAL_SETTINGS = {
	targetPriorityFeeLamports: 10_000,
};

export function getComputeIxs({
	targetPriorityFeeLamports = GLOBAL_SETTINGS.targetPriorityFeeLamports,
	computeBudget = 200_000,
}: {
	targetPriorityFeeLamports?: number;
	computeBudget?: number;
}) {
	const ixs = [getComputePriceIx({ targetPriorityFeeLamports, computeBudget })];

	if (computeBudget != null && computeBudget !== 200_000) {
		ixs.push(getComputeLimitIx({ units: computeBudget }));
	}

	return ixs;
}

export function getComputePriceIx({
	targetPriorityFeeLamports = GLOBAL_SETTINGS.targetPriorityFeeLamports,
	computeBudget = 200_000,
}: {
	targetPriorityFeeLamports?: number;
	computeBudget?: number;
}) {
	return ComputeBudgetProgram.setComputeUnitPrice({
		microLamports: Math.ceil((targetPriorityFeeLamports / computeBudget) * 100_000),
	});
}

export function getComputeLimitIx({ units = 200_000 }: { units: number }) {
	return ComputeBudgetProgram.setComputeUnitLimit({
		units,
	});
}
