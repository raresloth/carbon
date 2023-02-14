import * as anchor from "@coral-xyz/anchor";
import {IdlAccounts, Program} from "@coral-xyz/anchor";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as CarbonIDL from "../target/types/carbon";
import {createCollectionNFT, createNFT, fetchNFT, setBalance} from "./helpers";
import moment from "moment";
import { Carbon } from "@raresloth/carbon-ts"
import {FEE_ACCOUNT_ADDRESS} from "@raresloth/carbon-ts";
import {
	createAssociatedTokenAccount,
	getAccount,
	getAssociatedTokenAddressSync,
	NATIVE_MINT,
	transferChecked
} from "@solana/spl-token";
import { assert } from "chai";

describe("carbon", () => {
	const provider = anchor.AnchorProvider.env();
	provider.opts.skipPreflight = true;
	anchor.setProvider(provider);

	const program = anchor.workspace.Carbon as Program<CarbonIDL.Carbon>;
	const carbon = new Carbon(program.programId, provider);
	const defaultSellerFeeBps = 500;
	const defaultSymbol = 'KR';

	let marketplaceAuthority: Keypair;
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

		const collectionNft = await createCollectionNFT(provider, marketplaceAuthority, marketplaceAuthority)
		collectionMint = collectionNft.mint
		collectionMetadataAccount = collectionNft.metadataAccount
		collectionEdition = collectionNft.edition
		collectionConfigPDA = carbon.pdas.collectionConfig(collectionMint)
		currencyMint = NATIVE_MINT;
		price = LAMPORTS_PER_SOL
		expiry = moment().add(1, 'day').unix()
	}

	describe("init_collection_config", function () {

		it("should initialize the collection config correctly", async function () {
			await carbon.methods.initCollectionConfig(marketplaceAuthority, {
				collectionMint,
				sellerFeeBasisPoints: defaultSellerFeeBps,
				symbol: defaultSymbol
			})

			const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);
			assert.equal(collectionConfig.version, 1);
			assert.equal(collectionConfig.marketplaceAuthority.toString(), marketplaceAuthority.publicKey.toString());
			assert.equal(collectionConfig.collectionMint.toString(), collectionMint.toString());
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
			listingPDA = carbon.pdas.listing(id)
		}

		describe("list_nft", function () {

			it("should list the nft correctly", async function () {
				await carbon.methods.listNft(seller, id, price, expiry)

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
			listingPDA = carbon.pdas.listing(id)
		}

		describe("list_virtual", function () {

			it("should list the virtual item correctly", async function () {
				await carbon.methods.listVirtual(seller, id, price, expiry)

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
				await carbon.methods.initCollectionConfig(marketplaceAuthority, {
					collectionMint,
					sellerFeeBasisPoints: defaultSellerFeeBps,
					symbol: defaultSymbol
				})

				await carbon.methods.listVirtual(marketplaceAuthority, id, price, expiry)
				const listing = await program.account.listing.fetch(listingPDA);
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);

				const mint = await carbon.methods.buyVirtual(
					buyer,
					marketplaceAuthority,
					collectionConfig as IdlAccounts<CarbonIDL.Carbon>["collectionConfig"],
					listing as IdlAccounts<CarbonIDL.Carbon>["listing"],
					{
						name: "Ghost #1",
						uri: "https://example.com",
					})

				// An NFT should now exist with the correct metadata
				const nft = await fetchNFT(provider, marketplaceAuthority, mint)
				console.log(nft)
				assert.equal(nft.updateAuthorityAddress.toString(), marketplaceAuthority.publicKey.toString())
				assert.equal(nft.name, "Ghost #1")
				assert.equal(nft.uri, "https://example.com")
				assert.equal(nft.symbol, defaultSymbol)
				assert.equal(nft.sellerFeeBasisPoints, defaultSellerFeeBps)
				assert.isTrue(nft.collection.verified)
				assert.equal(nft.collection.address.toString(), collectionMint.toString())
				assert.isTrue(nft.primarySaleHappened)
				assert.deepEqual(nft.creators, [{
					address: marketplaceAuthority.publicKey,
					verified: true,
					share: 100
				}])

				// Make sure buyer is the owner and can transfer the NFT
				const sellerTokenAccount = await createAssociatedTokenAccount(provider.connection, buyer, mint, seller.publicKey)
				const buyerTokenAccount = getAssociatedTokenAddressSync(mint, buyer.publicKey)
				await transferChecked(provider.connection, buyer, buyerTokenAccount, mint, sellerTokenAccount, buyer, 1, 0)
				
				// Make sure correct amounts were sent to seller and fee account
			});

		});

	})

});
