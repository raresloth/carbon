import * as anchor from "@coral-xyz/anchor";
import {IdlAccounts, Program} from "@coral-xyz/anchor";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as CarbonIDL from "../target/types/carbon";
import {assertThrows, createCollectionNFT, createNFT, createSplToken, fetchNFT, setBalance} from "./helpers";
import moment from "moment";
import { Carbon, FEE_ACCOUNT_KEY } from "@raresloth/carbon-ts"
import {
	createAssociatedTokenAccount,
	getAccount,
	getAssociatedTokenAddressSync,
	NATIVE_MINT,
	transferChecked
} from "@solana/spl-token";
import { assert } from "chai";
import {getEditionPDA, TOKEN_METADATA_PROGRAM_ID} from "@raresloth/carbon-ts/dist/esm/solana";

describe("carbon", () => {
	const provider = anchor.AnchorProvider.env();
	provider.opts.skipPreflight = true;
	anchor.setProvider(provider);

	const program = anchor.workspace.Carbon as Program<CarbonIDL.Carbon>;
	const defaultFeeConfig = {
		feeAccount: FEE_ACCOUNT_KEY,
		bps: 200
	}
	const defaultSellerFeeBps = 500;
	const defaultSymbol = 'KR';

	let marketplaceAuthority: Keypair;
	let carbon: Carbon;
	let seller: Keypair;
	let sellerTokenAccount: PublicKey;
	let buyer: Keypair;
	let id: PublicKey;
	let metadataAccount: PublicKey;
	let edition: PublicKey;
	let collectionMint: PublicKey;
	let collectionMetadataAccount: PublicKey;
	let collectionEdition: PublicKey;
	let currencyMint: PublicKey;
	let price: number;
	let expiry: number;
	let marketplaceConfigPDA: PublicKey;
	let collectionConfigPDA: PublicKey;
	let listingPDA: PublicKey;
	let custodyAccountPDA: PublicKey;

	beforeEach(setUpData)
	async function setUpData() {
		let promises = []

		marketplaceAuthority = Keypair.generate()
		carbon = new Carbon(provider, marketplaceAuthority.publicKey, program.programId);
		marketplaceConfigPDA = carbon.pdas.marketplaceConfig(marketplaceAuthority.publicKey)
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

	describe("init_marketplace_config", function () {

		it("should initialize the marketplace config correctly", async function () {
			await carbon.methods.initMarketplaceConfig(marketplaceAuthority, {
				feeConfig: defaultFeeConfig
			})

			const marketplaceConfig = await program.account.marketplaceConfig.fetch(marketplaceConfigPDA);
			assert.equal(marketplaceConfig.version, 1);
			assert.equal(marketplaceConfig.marketplaceAuthority.toString(), marketplaceAuthority.publicKey.toString());
			assert.deepEqual(marketplaceConfig.feeConfig, defaultFeeConfig);
		});

	});

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
			const results = await Promise.all([
				carbon.methods.initMarketplaceConfig(marketplaceAuthority, {
					feeConfig: defaultFeeConfig
				}),
				carbon.methods.initCollectionConfig(marketplaceAuthority, {
					collectionMint,
					sellerFeeBasisPoints: defaultSellerFeeBps,
					symbol: defaultSymbol
				}),
				createNFT(provider, marketplaceAuthority, collectionMint, {
					tokenOwner: seller.publicKey
				})
			])

			const nft = results[2]
			id = nft.mint
			metadataAccount = nft.metadataAccount
			edition = nft.edition
			sellerTokenAccount = getAssociatedTokenAddressSync(id, seller.publicKey)
			listingPDA = carbon.pdas.listing(id)
			custodyAccountPDA = carbon.pdas.custodyAccount(id)
		}

		describe("list_nft", function () {

			it("should list the nft correctly", async function () {
				await carbon.methods.listNft(seller, id, collectionMint, price, expiry)

				const listing = await program.account.listing.fetch(listingPDA);
				assert.equal(listing.version, 1);
				assert.equal(listing.seller.toString(), seller.publicKey.toString());
				assert.equal(listing.id.toString(), id.toString());
				assert.equal(listing.isVirtual, false);
				assert.equal(listing.currencyMint.toString(), currencyMint.toString());
				assert.equal(listing.price.toNumber(), price);
				assert.equal(listing.expiry.toNumber(), expiry);
				assert.deepEqual(listing.feeConfig, defaultFeeConfig)

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.equal(sellerTokenAccountObj.delegate.toString(), listingPDA.toString());
				assert.isTrue(sellerTokenAccountObj.isFrozen);
			});

			it("should list the custodial nft correctly", async function () {
				await carbon.methods.custody(seller, id)
				await carbon.methods.listNft(seller, id, collectionMint, price, expiry)

				const listing = await program.account.listing.fetch(listingPDA);
				assert.equal(listing.version, 1);
				assert.equal(listing.seller.toString(), seller.publicKey.toString());
				assert.equal(listing.id.toString(), id.toString());
				assert.equal(listing.isVirtual, false);
				assert.equal(listing.currencyMint.toString(), currencyMint.toString());
				assert.equal(listing.price.toNumber(), price);
				assert.equal(listing.expiry.toNumber(), expiry);
				assert.deepEqual(listing.feeConfig, defaultFeeConfig)

				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA);
				assert.isTrue(custodyAccount.isListed);

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.equal(sellerTokenAccountObj.delegate.toString(), custodyAccountPDA.toString());
				assert.isTrue(sellerTokenAccountObj.isFrozen);
			});

			it("should throw when custody account key is incorrect", async function () {
				await assertThrows(async () =>
					await carbon.methods.listNft(seller, id, collectionMint, price, expiry, NATIVE_MINT, {
						custodyAccount: NATIVE_MINT
					})
				)
			});

		});

		describe("delist_nft", function () {

			it("should delist the nft correctly", async function () {
				await carbon.methods.listNft(seller, id, collectionMint, price, expiry)
				await carbon.methods.delistNft(seller, id)

				// Listing should no longer exist
				await assertThrows(async () => await program.account.listing.fetch(listingPDA));

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.isNull(sellerTokenAccountObj.delegate);
				assert.isFalse(sellerTokenAccountObj.isFrozen);
			});

			it("should delist the custodial nft correctly", async function () {
				await carbon.methods.custody(seller, id)
				await carbon.methods.listNft(seller, id, collectionMint, price, expiry)
				await carbon.methods.delistNft(seller, id)

				// Listing should no longer exist
				await assertThrows(async () => await program.account.listing.fetch(listingPDA));

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.equal(sellerTokenAccountObj.delegate.toString(), custodyAccountPDA.toString());
				assert.isTrue(sellerTokenAccountObj.isFrozen);

				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA);
				assert.isFalse(custodyAccount.isListed);
			});

		});

		describe("buy_nft", function () {

			it("should buy the nft correctly", async function () {
				const sellerPreBalance = await provider.connection.getBalance(seller.publicKey)
				await carbon.methods.listNft(seller, id, collectionMint, price, expiry)
				const listing = await program.account.listing.fetch(listingPDA);

				const buyerPreBalance = await provider.connection.getBalance(buyer.publicKey)
				const marketplacePreBalance = await provider.connection.getBalance(marketplaceAuthority.publicKey)
				const feeAccountPreBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY)
				await carbon.methods.buyNft(
					buyer,
					listing as IdlAccounts<CarbonIDL.Carbon>["listing"]
				)
				const sellerPostBalance = await provider.connection.getBalance(seller.publicKey)
				const buyerPostBalance = await provider.connection.getBalance(buyer.publicKey)
				const marketplacePostBalance = await provider.connection.getBalance(marketplaceAuthority.publicKey)
				const feeAccountPostBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY)

				// Make sure buyer is the owner and can transfer the NFT
				const buyerTokenAccount = getAssociatedTokenAddressSync(id, buyer.publicKey)
				await transferChecked(provider.connection, buyer, buyerTokenAccount, id, sellerTokenAccount, buyer, 1, 0)

				// Make sure correct amounts were sent to seller and fee account
				// Rent fee for creating NFT account is a bit over 0.002 SOL
				const ataRent = 0.002 * LAMPORTS_PER_SOL
				assert.isAtLeast(buyerPreBalance - buyerPostBalance, price + ataRent)

				const marketplaceFee = (price * defaultFeeConfig.bps / 10000)
				const royalty = (price * defaultSellerFeeBps / 10000)
				assert.equal(sellerPostBalance - sellerPreBalance,
					price - marketplaceFee - royalty)
				assert.equal(marketplacePostBalance - marketplacePreBalance, royalty)
				assert.equal(feeAccountPostBalance - feeAccountPreBalance, marketplaceFee)
			});

			it("should buy the nft with SPL correctly", async function () {
				price = 1000
				const { mint: splTokenMint } =
					await createSplToken(provider, marketplaceAuthority, buyer.publicKey, price)

				await carbon.methods.listNft(seller, id, collectionMint, price, expiry, splTokenMint)
				const listing = await program.account.listing.fetch(listingPDA);

				await carbon.methods.buyNft(
					buyer,
					listing as IdlAccounts<CarbonIDL.Carbon>["listing"]
				)

				const sellerCurrencyTokenAddress = await getAssociatedTokenAddressSync(splTokenMint, seller.publicKey)
				const sellerPostBalance = await provider.connection.getTokenAccountBalance(sellerCurrencyTokenAddress)
				const buyerTokenAddress = await getAssociatedTokenAddressSync(splTokenMint, buyer.publicKey)
				const buyerPostBalance = await provider.connection.getTokenAccountBalance(buyerTokenAddress)
				const marketplaceAuthTokenAddress = await getAssociatedTokenAddressSync(splTokenMint, marketplaceAuthority.publicKey)
				const marketplaceAuthPostBalance = await provider.connection.getTokenAccountBalance(marketplaceAuthTokenAddress)
				const feeAccountTokenAddress = await getAssociatedTokenAddressSync(splTokenMint, FEE_ACCOUNT_KEY)
				const feeAccountPostBalance = await provider.connection.getTokenAccountBalance(feeAccountTokenAddress)

				// Make sure correct amounts were sent to seller and fee account
				assert.equal(buyerPostBalance.value.uiAmount, 0)

				const marketplaceFee = (price * defaultFeeConfig.bps / 10000)
				const royalty = (price * defaultSellerFeeBps / 10000)
				assert.equal(sellerPostBalance.value.uiAmount, price - marketplaceFee - royalty)
				assert.equal(marketplaceAuthPostBalance.value.uiAmount, royalty)
				assert.equal(feeAccountPostBalance.value.uiAmount, marketplaceFee)
			});

			it("should buy the custodial nft correctly", async function () {
				await carbon.methods.custody(seller, id)
				const sellerPreBalance = await provider.connection.getBalance(seller.publicKey)
				await carbon.methods.listNft(seller, id, collectionMint, price, expiry)
				const listing = await program.account.listing.fetch(listingPDA);

				const buyerPreBalance = await provider.connection.getBalance(buyer.publicKey)
				const marketplacePreBalance = await provider.connection.getBalance(marketplaceAuthority.publicKey)
				const feeAccountPreBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY)
				await carbon.methods.buyNft(
					buyer,
					listing as IdlAccounts<CarbonIDL.Carbon>["listing"]
				)
				const sellerPostBalance = await provider.connection.getBalance(seller.publicKey)
				const buyerPostBalance = await provider.connection.getBalance(buyer.publicKey)
				const marketplacePostBalance = await provider.connection.getBalance(marketplaceAuthority.publicKey)
				const feeAccountPostBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY)

				// Make sure correct amounts were sent to seller and fee account
				// Rent fee for creating NFT account is a bit over 0.002 SOL
				const ataRent = 0.002 * LAMPORTS_PER_SOL
				assert.isAtLeast(buyerPreBalance - buyerPostBalance, price + ataRent)

				const marketplaceFee = (price * defaultFeeConfig.bps / 10000)
				const royalty = (price * defaultSellerFeeBps / 10000)
				assert.equal(sellerPostBalance - sellerPreBalance,
					price - marketplaceFee - royalty)
				assert.equal(marketplacePostBalance - marketplacePreBalance, royalty)
				assert.equal(feeAccountPostBalance - feeAccountPreBalance, marketplaceFee)

				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA);
				assert.isFalse(custodyAccount.isListed);
				assert.equal(custodyAccount.authority.toString(), buyer.publicKey.toString());

				const buyerTokenAccount = getAssociatedTokenAddressSync(id, buyer.publicKey)
				const buyerTokenAccountObj = await getAccount(provider.connection, buyerTokenAccount);
				assert.equal(buyerTokenAccountObj.delegate.toString(), custodyAccountPDA.toString());
				assert.isTrue(buyerTokenAccountObj.isFrozen);
			});

		});

		describe("custody", function () {

			it("should custody the nft correctly", async function () {
				await carbon.methods.custody(seller, id)

				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA);
				assert.equal(custodyAccount.version, 1);
				assert.equal(custodyAccount.marketplaceAuthority.toString(), marketplaceAuthority.publicKey.toString());
				assert.equal(custodyAccount.authority.toString(), seller.publicKey.toString());
				assert.equal(custodyAccount.mint.toString(), id.toString());

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.equal(sellerTokenAccountObj.delegate.toString(), custodyAccountPDA.toString());
				assert.isTrue(sellerTokenAccountObj.isFrozen);
			});

			it("should throw when nft is listed", async function () {
				await carbon.methods.listNft(seller, id, collectionMint, price, expiry)
				await assertThrows(async () => await carbon.methods.custody(seller, id))
			});

			it("should throw when listing key is incorrect", async function () {
				await assertThrows(async () => await carbon.methods.custody(seller, id, {
					listing: NATIVE_MINT
				}))
			});

		});

		describe("uncustody", function () {

			it("should uncustody the nft correctly", async function () {
				await carbon.methods.custody(seller, id)

				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA)
				await carbon.methods.uncustody(seller, custodyAccount)

				// Custody account should no longer exist
				await assertThrows(async () => await program.account.custodyAccount.fetch(custodyAccountPDA));

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.isNull(sellerTokenAccountObj.delegate);
				assert.isFalse(sellerTokenAccountObj.isFrozen);
			});

			it("should throw when nft is listed", async function () {
				await carbon.methods.custody(seller, id)
				await carbon.methods.listNft(seller, id, collectionMint, price, expiry)
				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA)
				await assertThrows(async () => await carbon.methods.uncustody(seller, custodyAccount))
			});

		});

		describe("take_ownership", function () {

			it("should take ownership of the nft correctly", async function () {
				await carbon.methods.custody(seller, id)

				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA)
				await carbon.methods.takeOwnership(marketplaceAuthority, custodyAccount)

				// Custody account should no longer exist
				await assertThrows(async () => await program.account.custodyAccount.fetch(custodyAccountPDA));

				// Should now be owned by the marketplace authority
				const marketplaceTokenAccount = getAssociatedTokenAddressSync(id, marketplaceAuthority.publicKey)
				const marketplaceTokenAccountObj = await getAccount(provider.connection, marketplaceTokenAccount);
				assert.equal(marketplaceTokenAccountObj.amount.toString(), "1");
				assert.isNull(marketplaceTokenAccountObj.delegate);
				assert.isFalse(marketplaceTokenAccountObj.isFrozen);
			});

			it("should throw when nft is listed", async function () {
				await carbon.methods.custody(seller, id)
				await carbon.methods.listNft(seller, id, collectionMint, price, expiry)
				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA)
				await assertThrows(async () => await carbon.methods.takeOwnership(marketplaceAuthority, custodyAccount))
			});

		});

	});

	describe("virtual flows", function () {

		beforeEach(setUpData)
		async function setUpData() {
			await Promise.all([
				carbon.methods.initMarketplaceConfig(marketplaceAuthority, {
					feeConfig: defaultFeeConfig
				}),
				carbon.methods.initCollectionConfig(marketplaceAuthority, {
					collectionMint,
					sellerFeeBasisPoints: defaultSellerFeeBps,
					symbol: defaultSymbol
				})
			])

			id = Keypair.generate().publicKey
			listingPDA = carbon.pdas.listing(id)
		}

		describe("list_virtual", function () {

			it("should list the virtual item correctly", async function () {
				await carbon.methods.listVirtual(marketplaceAuthority, id, collectionMint, price, expiry)

				const listing = await program.account.listing.fetch(listingPDA);
				assert.equal(listing.version, 1);
				assert.equal(listing.seller.toString(), marketplaceAuthority.publicKey.toString());
				assert.equal(listing.id.toString(), id.toString());
				assert.equal(listing.isVirtual, true);
				assert.equal(listing.currencyMint.toString(), currencyMint.toString());
				assert.equal(listing.price.toNumber(), price);
				assert.equal(listing.expiry.toNumber(), expiry);
				assert.equal(listing.feeConfig.feeAccount.toString(), FEE_ACCOUNT_KEY.toString())
				assert.equal(listing.feeConfig.bps, defaultFeeConfig.bps)
			});

		});

		describe("delist_virtual", function () {

			it("should delist the virtual item correctly", async function () {
				await carbon.methods.listVirtual(marketplaceAuthority, id, collectionMint, price, expiry)
				await carbon.methods.delistVirtual(marketplaceAuthority, id)

				// Listing should no longer exist
				await assertThrows(async () => await program.account.listing.fetch(listingPDA));
			});

		});

		describe("buy_virtual", function () {

			it("should buy the virtual item correctly", async function () {
				const marketplaceAuthPreBalance = await provider.connection.getBalance(marketplaceAuthority.publicKey)
				await carbon.methods.listVirtual(marketplaceAuthority, id, collectionMint, price, expiry)
				const listing = await program.account.listing.fetch(listingPDA);
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);

				const buyerPreBalance = await provider.connection.getBalance(buyer.publicKey)
				const feeAccountPreBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY)
				const mint = await carbon.methods.buyVirtual(
					buyer,
					marketplaceAuthority,
					collectionConfig as IdlAccounts<CarbonIDL.Carbon>["collectionConfig"],
					listing as IdlAccounts<CarbonIDL.Carbon>["listing"],
					{
						name: "Ghost #1",
						uri: "https://example.com",
					})
				const marketplaceAuthPostBalance = await provider.connection.getBalance(marketplaceAuthority.publicKey)
				const buyerPostBalance = await provider.connection.getBalance(buyer.publicKey)
				const feeAccountPostBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY)

				// An NFT should now exist with the correct metadata
				const nft = await fetchNFT(provider, marketplaceAuthority, mint)
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
				assert.equal(buyerPreBalance - buyerPostBalance, price)

				const mintingFee = (0.02 * LAMPORTS_PER_SOL)
				const marketplaceFee = (price * defaultFeeConfig.bps / 10000)
				assert.isAtLeast(marketplaceAuthPostBalance - marketplaceAuthPreBalance,
					price - marketplaceFee - mintingFee)

				assert.equal(feeAccountPostBalance - feeAccountPreBalance, marketplaceFee)
			});

			it("should buy the virtual item with SPL correctly", async function () {
				price = 1000
				const { mint: splTokenMint } =
					await createSplToken(provider, marketplaceAuthority, buyer.publicKey, price)

				await carbon.methods.listVirtual(marketplaceAuthority, id, collectionMint, price, expiry, splTokenMint)
				const listing = await program.account.listing.fetch(listingPDA);
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);

				await carbon.methods.buyVirtual(
					buyer,
					marketplaceAuthority,
					collectionConfig as IdlAccounts<CarbonIDL.Carbon>["collectionConfig"],
					listing as IdlAccounts<CarbonIDL.Carbon>["listing"],
					{
						name: "Ghost #1",
						uri: "https://example.com",
					})

				const marketplaceAuthTokenAddress = await getAssociatedTokenAddressSync(splTokenMint, marketplaceAuthority.publicKey)
				const marketplaceAuthPostBalance = await provider.connection.getTokenAccountBalance(marketplaceAuthTokenAddress)
				const buyerTokenAddress = await getAssociatedTokenAddressSync(splTokenMint, buyer.publicKey)
				const buyerPostBalance = await provider.connection.getTokenAccountBalance(buyerTokenAddress)
				const feeAccountTokenAddress = await getAssociatedTokenAddressSync(splTokenMint, FEE_ACCOUNT_KEY)
				const feeAccountPostBalance = await provider.connection.getTokenAccountBalance(feeAccountTokenAddress)

				// Make sure correct amounts were sent to seller and fee account
				assert.equal(buyerPostBalance.value.uiAmount, 0)

				const marketplaceFee = (price * defaultFeeConfig.bps / 10000)
				assert.isAtLeast(marketplaceAuthPostBalance.value.uiAmount, price - marketplaceFee)

				assert.equal(feeAccountPostBalance.value.uiAmount, marketplaceFee)
			});

		});

	})

});
