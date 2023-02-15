import { Provider } from "@coral-xyz/anchor";
import {keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import {Keypair, Transaction, SystemProgram, PublicKey} from "@solana/web3.js";
import {createMint, getOrCreateAssociatedTokenAccount, mintTo} from "@solana/spl-token";
import {assert} from "chai";

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

export async function createSplToken(provider: Provider, payer: Keypair, mintToWallet: PublicKey, amount: number) {
	const mint = await createMint(provider.connection, payer, payer.publicKey, payer.publicKey, 0)

	const toWalletCurrencyAccount = await getOrCreateAssociatedTokenAccount(
		provider.connection,
		payer,
		mint,
		mintToWallet
	)

	await mintTo(
		provider.connection,
		payer,
		mint,
		toWalletCurrencyAccount.address,
		payer.publicKey,
		amount
	)

	return { mint }
}

export async function assertThrows(fn: () => Promise<any | void>, code?: number, message?: string) {
	let throws = false
	try {
		await fn()
	} catch (e) {
		console.log(`[${e.code ?? ''}] ${e.message}`)
		throws = true
		if (code) {
			throws = e.code === code
		}
		if (message) {
			throws = e.message.includes(message)
		}
	}
	assert.isTrue(throws, 'Expected error to be thrown')
}