import { Provider } from "@coral-xyz/anchor";
import {keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import {Keypair, Transaction, SystemProgram, PublicKey} from "@solana/web3.js";

export async function setBalance(provider: Provider, keypair: Keypair, amount: number) {
	const balance = await provider.connection.getBalance(keypair.publicKey);
	let diff = amount - balance

	if (diff > 0) {
		await provider.connection.confirmTransaction(
			await provider.connection.requestAirdrop(keypair.publicKey, diff),
			"processed"
		);
	} else {
		var transaction = new Transaction().add(
			SystemProgram.transfer({
				fromPubkey: provider.publicKey,
				toPubkey: Keypair.generate().publicKey,
				lamports: diff * -1
			}),
		);
		await provider.sendAndConfirm(transaction, [keypair]);
	}
}

export async function createCollectionNFT(
	provider: Provider,
	payer: Keypair,
	updateAuthority: Keypair,
	mintArgs?: any
) {
	const metaplex = new Metaplex(provider.connection).use(keypairIdentity(payer))
	const result = await metaplex.nfts().create({
		name: 'Collection NFT',
		uri: 'https://arweave.net/Rb9SwSImzCInyGbaxbT1bpnjJGiTszkCTLWZiomnerw',
		sellerFeeBasisPoints: 500,
		isCollection: true,
		updateAuthority,
		...(mintArgs || {}),
	})
	const mint = result.mintAddress
	const metadataAccount = metaplex.nfts().pdas().metadata({
		mint
	})
	const edition = result.masterEditionAddress

	return {mint, metadataAccount, edition}
}

export async function createNFT(provider: Provider, payer: Keypair, collectionMint: PublicKey, mintArgs?: any) {
	const metaplex = new Metaplex(provider.connection).use(keypairIdentity(payer))
	const result = await metaplex.nfts().create({
		name: 'NFT Item',
		uri: 'https://arweave.net/Rb9SwSImzCInyGbaxbT1bpnjJGiTszkCTLWZiomnerw',
		sellerFeeBasisPoints: 500,
		collection: collectionMint,
		collectionAuthority: payer,
		...(mintArgs || {}),
	})
	const mint = result.mintAddress
	const metadataAccount = metaplex.nfts().pdas().metadata({
		mint
	})
	const edition = result.masterEditionAddress

	return {mint, metadataAccount, edition}
}

export async function fetchNFT(provider: Provider, payer: Keypair, mint: PublicKey) {
	const metaplex = new Metaplex(provider.connection).use(keypairIdentity(payer))
	return await metaplex.nfts().findByMint({
		mintAddress: mint
	})
}