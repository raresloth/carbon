import * as anchor from "@coral-xyz/anchor";
import {IdlAccounts, Program} from "@coral-xyz/anchor";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as VirtIDL from "../target/types/virt";
import {createCollectionNFT, createNFT, fetchNFT, setBalance} from "./helpers";
import moment from "moment";
import { Virt } from "@raresloth/virt-ts"
import {FEE_ACCOUNT_ADDRESS} from "@raresloth/virt-ts";
import {
	createAssociatedTokenAccount,
	getAccount,
	getAssociatedTokenAddressSync,
	NATIVE_MINT,
	transferChecked
} from "@solana/spl-token";
import { assert } from "chai";

describe("virt", () => {
	const provider = anchor.AnchorProvider.env();
	provider.opts.skipPreflight = true;
	anchor.setProvider(provider);

	const program = anchor.workspace.Virt as Program<VirtIDL.Virt>;
	const virt = new Virt(program.programId, provider);
	const defaultSellerFeeBps = 500;
	const defaultSymbol = 'KR';

	let marketplaceAuthority: Keypair;
	let collectionAuthority: Keypair;
	let mintAuthority: Keypair;
	let seller: Keypair;
	let sellerTokenAccount: PublicKey;
	let buyer: Keypair;
	let buyerTokenAccount: PublicKey;
	let id: PublicKey;
	let metadataAccount: PublicKey;
	let edition: PublicKey;
	let collectionMint: PublicKey;
	let collectionMetadataAccount: PublicKey;
	let collectionEdition: PublicKey;
	let currencyMint: PublicKey;
	let price: number;
	let expiry: number;
	let collectionConfigPDA: PublicKey;
	let listingPDA: PublicKey;

	beforeEach(setUpData)
	async function setUpData() {
		let promises = []

		marketplaceAuthority = Keypair.generate()
		promises.push(setBalance(provider, marketplaceAuthority, 100 * LAMPORTS_PER_SOL))

		seller = Keypair.generate()
		promises.push(setBalance(provider, seller, 5 * LAMPORTS_PER_SOL))

		buyer = Keypair.generate()
		promises.push(setBalance(provider, buyer, 5 * LAMPORTS_PER_SOL))

		await Promise.all(promises)

		collectionAuthority = Keypair.generate()
		mintAuthority = Keypair.generate()
		const collectionNft = await createCollectionNFT(provider, marketplaceAuthority, collectionAuthority)
		collectionMint = collectionNft.mint
		collectionMetadataAccount = collectionNft.metadataAccount
		collectionEdition = collectionNft.edition
		collectionConfigPDA = virt.pdas.collectionConfig(marketplaceAuthority.publicKey, collectionMint)
		currencyMint = NATIVE_MINT;
		price = LAMPORTS_PER_SOL
		expiry = moment().add(1, 'day').unix()
	}

	describe("init_collection_config", function () {

		it("should initialize the collection config correctly", async function () {
			await virt.methods.initCollectionConfig(marketplaceAuthority, {
				collectionMint,
				mintAuthority: mintAuthority.publicKey,
				sellerFeeBasisPoints: defaultSellerFeeBps,
				symbol: defaultSymbol
			})

			const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);
			assert.equal(collectionConfig.version, 1);
			assert.equal(collectionConfig.authority.toString(), marketplaceAuthority.publicKey.toString());
			assert.equal(collectionConfig.collectionMint.toString(), collectionMint.toString());
			assert.equal(collectionConfig.mintAuthority.toString(), mintAuthority.publicKey.toString());
			assert.equal(collectionConfig.sellerFeeBasisPoints, defaultSellerFeeBps)
			assert.equal(collectionConfig.symbol, defaultSymbol)
		});

	});

	describe("nft flows", function () {

		beforeEach(setUpData)
		async function setUpData() {
			const nft = await createNFT(provider, marketplaceAuthority, {
				tokenOwner: seller.publicKey
			});
			id = nft.mint
			metadataAccount = nft.metadataAccount
			edition = nft.edition
			sellerTokenAccount = getAssociatedTokenAddressSync(id, seller.publicKey)
			listingPDA = virt.pdas.listing(id)
		}

		describe("list_nft", function () {

			it("should list the nft correctly", async function () {
				await virt.methods.listNft(seller, id, price, expiry)

				const listing = await program.account.listing.fetch(listingPDA);
				assert.equal(listing.version, 1);
				assert.equal(listing.authority.toString(), seller.publicKey.toString());
				assert.equal(listing.id.toString(), id.toString());
				assert.equal(listing.isVirtual, false);
				assert.equal(listing.currencyMint.toString(), currencyMint.toString());
				assert.equal(listing.price.toNumber(), price);
				assert.equal(listing.expiry.toNumber(), expiry);
				assert.equal(listing.feeConfig.feeAccount.toString(), FEE_ACCOUNT_ADDRESS)
				assert.equal(listing.feeConfig.bps, 0)

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.equal(sellerTokenAccountObj.delegate.toString(), listingPDA.toString());
				assert.isTrue(sellerTokenAccountObj.isFrozen);
			});

		});

	});

	describe("virtual flows", function () {

		beforeEach(setUpData)
		async function setUpData() {
			id = Keypair.generate().publicKey
			listingPDA = virt.pdas.listing(id)
		}

		describe("list_virtual", function () {

			it("should list the virtual item correctly", async function () {
				await virt.methods.listVirtual(seller, id, price, expiry)

				const listing = await program.account.listing.fetch(listingPDA);
				assert.equal(listing.version, 1);
				assert.equal(listing.authority.toString(), seller.publicKey.toString());
				assert.equal(listing.id.toString(), id.toString());
				assert.equal(listing.isVirtual, true);
				assert.equal(listing.currencyMint.toString(), currencyMint.toString());
				assert.equal(listing.price.toNumber(), price);
				assert.equal(listing.expiry.toNumber(), expiry);
				assert.equal(listing.feeConfig.feeAccount.toString(), FEE_ACCOUNT_ADDRESS)
				assert.equal(listing.feeConfig.bps, 0)
			});

		});

		describe("buy_virtual", function () {

			it("should buy the virtual item correctly", async function () {
				await virt.methods.initCollectionConfig(marketplaceAuthority, {
					collectionMint,
					mintAuthority: mintAuthority.publicKey,
					sellerFeeBasisPoints: defaultSellerFeeBps,
					symbol: defaultSymbol
				})

				await virt.methods.listVirtual(marketplaceAuthority, id, price, expiry)
				const listing = await program.account.listing.fetch(listingPDA);
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);

				const mint = await virt.methods.buyVirtual(
					buyer,
					marketplaceAuthority,
					collectionAuthority,
					mintAuthority,
					collectionConfig as IdlAccounts<VirtIDL.Virt>["collectionConfig"],
					listing as IdlAccounts<VirtIDL.Virt>["listing"],
					{
						name: "Ghost #1",
						uri: "https://example.com",
					})

				// An NFT should now exist with the correct metadata
				const nft = await fetchNFT(provider, marketplaceAuthority, mint)
				assert.equal(nft.updateAuthorityAddress.toString(), mintAuthority.publicKey.toString())
				assert.equal(nft.name, "Ghost #1")
				assert.equal(nft.uri, "https://example.com")
				assert.equal(nft.symbol, defaultSymbol)
				assert.equal(nft.sellerFeeBasisPoints, defaultSellerFeeBps)
				assert.isTrue(nft.collection.verified)
				assert.equal(nft.collection.address.toString(), collectionMint.toString())
				assert.isTrue(nft.primarySaleHappened)

				// Make sure buyer is the owner and can transfer the NFT
				const sellerTokenAccount = await createAssociatedTokenAccount(provider.connection, buyer, mint, seller.publicKey)
				const buyerTokenAccount = getAssociatedTokenAddressSync(mint, buyer.publicKey)
				await transferChecked(provider.connection, buyer, buyerTokenAccount, mint, sellerTokenAccount, buyer, 1, 0)
				
				// Make sure correct amounts were sent to seller and fee account
			});

		});

	})

});
