import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
	Keypair,
	PublicKey,
	LAMPORTS_PER_SOL,
	Transaction,
	ComputeBudgetProgram,
} from "@solana/web3.js";
import * as CarbonIDL from "../target/types/carbon";
import {
	assertThrows,
	createCollectionNFT,
	createNFT,
	createSplToken,
	createVirtualItemId,
	fetchNFT,
	setBalance,
} from "./helpers";
import moment from "moment";
import { Carbon, FEE_ACCOUNT_KEY } from "@raresloth/carbon-sdk";
import {
	createAssociatedTokenAccount,
	getAccount,
	getAssociatedTokenAddressSync,
	NATIVE_MINT,
	transferChecked,
} from "@solana/spl-token";
import { assert } from "chai";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

describe("carbon", () => {
	const localProvider = AnchorProvider.env();
	const program = anchor.workspace.Carbon as Program<CarbonIDL.Carbon>;
	const TX_FEE = 0.000006 * LAMPORTS_PER_SOL;
	const defaultFeeConfig = {
		feeAccount: FEE_ACCOUNT_KEY,
		bps: 200,
	};
	const defaultSellerFeeBps = 500;
	const defaultSymbol = "KR";
	const mintRecordStorageFee = 1614720;

	let provider: AnchorProvider;
	let marketplaceAuthority: Keypair;
	let carbon: Carbon;
	let seller: Keypair;
	let sellerTokenAccount: PublicKey;
	let buyer: Keypair;
	let itemId: number[];
	let collectionMint: PublicKey;
	let currencyMint: PublicKey;
	let price: number;
	let expiry: number;
	let marketplaceConfigPDA: PublicKey;
	let collectionConfigPDA: PublicKey;
	let listingPDA: PublicKey;
	let custodyAccountPDA: PublicKey;
	let mint;

	beforeEach(setUpData);
	async function setUpData() {
		let promises = [];

		marketplaceAuthority = Keypair.generate();
		provider = new AnchorProvider(localProvider.connection, new Wallet(marketplaceAuthority), {
			...localProvider.opts,
			skipPreflight: true,
		});
		anchor.setProvider(provider);

		carbon = new Carbon(provider, marketplaceAuthority.publicKey, program.programId);
		marketplaceConfigPDA = carbon.pdas.marketplaceConfig(marketplaceAuthority.publicKey);
		promises.push(setBalance(provider, marketplaceAuthority, 100 * LAMPORTS_PER_SOL));

		seller = Keypair.generate();
		promises.push(setBalance(provider, seller, 5 * LAMPORTS_PER_SOL));

		buyer = Keypair.generate();
		promises.push(setBalance(provider, buyer, 5 * LAMPORTS_PER_SOL));

		await Promise.all(promises);

		const collectionNft = await createCollectionNFT(
			provider,
			marketplaceAuthority,
			marketplaceAuthority
		);
		collectionMint = collectionNft.mint;
		collectionConfigPDA = carbon.pdas.collectionConfig(collectionMint);
		currencyMint = NATIVE_MINT;
		price = LAMPORTS_PER_SOL;
		expiry = moment().add(1, "day").unix();
	}

	describe("init_marketplace_config", function () {
		it("should initialize the marketplace config correctly", async function () {
			await carbon.methods.initMarketplaceConfig({
				args: {
					feeConfig: defaultFeeConfig,
				},
			});

			const marketplaceConfig = await program.account.marketplaceConfig.fetch(marketplaceConfigPDA);
			assert.equal(marketplaceConfig.version, 1);
			assert.equal(
				marketplaceConfig.marketplaceAuthority.toString(),
				marketplaceAuthority.publicKey.toString()
			);
			assert.equal(
				marketplaceConfig.feeConfig.feeAccount.toString(),
				defaultFeeConfig.feeAccount.toString()
			);
			assert.equal(marketplaceConfig.feeConfig.bps, defaultFeeConfig.bps);
		});
	});

	describe("init_collection_config", function () {
		it("should initialize the collection config correctly", async function () {
			await carbon.methods.initCollectionConfig({
				args: {
					collectionMint,
					sellerFeeBasisPoints: defaultSellerFeeBps,
					symbol: defaultSymbol,
				},
			});

			const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);
			assert.equal(collectionConfig.version, 1);
			assert.equal(
				collectionConfig.marketplaceAuthority.toString(),
				marketplaceAuthority.publicKey.toString()
			);
			assert.equal(collectionConfig.collectionMint.toString(), collectionMint.toString());
			assert.equal(collectionConfig.sellerFeeBasisPoints, defaultSellerFeeBps);
			assert.equal(collectionConfig.symbol, defaultSymbol);
		});
	});

	describe("nft flows", function () {
		beforeEach(setUpData);
		async function setUpData() {
			const results = await Promise.all([
				carbon.methods.initMarketplaceConfig({
					args: {
						feeConfig: defaultFeeConfig,
					},
				}),
				carbon.methods.initCollectionConfig({
					args: {
						collectionMint,
						sellerFeeBasisPoints: defaultSellerFeeBps,
						symbol: defaultSymbol,
					},
				}),
				createNFT(provider, marketplaceAuthority, collectionMint, {
					tokenOwner: seller.publicKey,
				}),
			]);

			const nft = results[2];
			mint = nft.mint;
			itemId = Array.from(mint.toBuffer());
			sellerTokenAccount = getAssociatedTokenAddressSync(mint, seller.publicKey);
			listingPDA = carbon.pdas.listing(itemId);
			custodyAccountPDA = carbon.pdas.custodyAccount(mint);
		}

		describe("list_nft", function () {
			it("should list the nft correctly", async function () {
				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
				});

				const listing = await program.account.listing.fetch(listingPDA);
				assert.equal(listing.version, 1);
				assert.equal(listing.seller.toString(), seller.publicKey.toString());
				assert.deepEqual(listing.itemId, itemId);
				assert.equal(listing.isVirtual, false);
				assert.equal(listing.currencyMint.toString(), currencyMint.toString());
				assert.equal(listing.price.toNumber(), price);
				assert.equal(listing.expiry.toNumber(), expiry);
				assert.equal(
					listing.feeConfig.feeAccount.toString(),
					defaultFeeConfig.feeAccount.toString()
				);
				assert.equal(listing.feeConfig.bps, defaultFeeConfig.bps);

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.equal(sellerTokenAccountObj.delegate.toString(), listingPDA.toString());
				assert.isTrue(sellerTokenAccountObj.isFrozen);
			});

			it("should list the custodial nft correctly", async function () {
				await carbon.methods.custody({
					owner: new Wallet(seller),
					mint,
					itemId,
				});
				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
				});

				const listing = await program.account.listing.fetch(listingPDA);
				assert.equal(listing.version, 1);
				assert.equal(listing.seller.toString(), seller.publicKey.toString());
				assert.deepEqual(listing.itemId, itemId);
				assert.equal(listing.isVirtual, false);
				assert.equal(listing.currencyMint.toString(), currencyMint.toString());
				assert.equal(listing.price.toNumber(), price);
				assert.equal(listing.expiry.toNumber(), expiry);
				assert.equal(
					listing.feeConfig.feeAccount.toString(),
					defaultFeeConfig.feeAccount.toString()
				);
				assert.equal(listing.feeConfig.bps, defaultFeeConfig.bps);

				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA);
				assert.isTrue(custodyAccount.isListed);

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.equal(sellerTokenAccountObj.delegate.toString(), custodyAccountPDA.toString());
				assert.isTrue(sellerTokenAccountObj.isFrozen);
			});

			it("should throw when custody account key is incorrect", async function () {
				await assertThrows(
					async () =>
						await carbon.methods.listNft({
							seller: new Wallet(seller),
							mint,
							collectionMint,
							price,
							expiry,
							accounts: {
								custodyAccount: NATIVE_MINT,
							},
						})
				);
			});
		});

		describe("update_listing", function () {
			it("should update the listing correctly", async function () {
				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
				});

				const newPrice = price / 2;
				const newExpiry = 0;
				await carbon.methods.updateListing({
					seller: new Wallet(seller),
					listing: listingPDA,
					price: newPrice,
					expiry: newExpiry,
				});

				const listing = await program.account.listing.fetch(listingPDA);
				assert.equal(listing.price.toNumber(), newPrice);
				assert.equal(listing.expiry.toNumber(), newExpiry);
			});

			it("should throw when listing is expired", async function () {
				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry: (expiry = moment().add(2, "seconds").unix()),
				});

				await new Promise((resolve) => setTimeout(resolve, 3000));

				await assertThrows(
					async () =>
						await carbon.methods.updateListing({
							seller: new Wallet(seller),
							listing: listingPDA,
							price: price / 2,
							expiry: 0,
						})
				);
			});
		});

		describe("delist_nft", function () {
			it("should delist the nft correctly", async function () {
				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
				});
				await carbon.methods.delistNft({
					seller: new Wallet(seller),
					mint,
				});

				// Listing should no longer exist
				await assertThrows(async () => await program.account.listing.fetch(listingPDA));

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.isNull(sellerTokenAccountObj.delegate);
				assert.isFalse(sellerTokenAccountObj.isFrozen);
			});

			it("should delist the custodial nft correctly", async function () {
				await carbon.methods.custody({
					owner: new Wallet(seller),
					mint,
					itemId,
				});
				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
				});
				await carbon.methods.delistNft({
					seller: new Wallet(seller),
					mint,
				});

				// Listing should no longer exist
				await assertThrows(async () => await program.account.listing.fetch(listingPDA));

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.equal(sellerTokenAccountObj.delegate.toString(), custodyAccountPDA.toString());
				assert.isTrue(sellerTokenAccountObj.isFrozen);

				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA);
				assert.isFalse(custodyAccount.isListed);
			});

			it("should delist the marketplace listed custodial nft correctly", async function () {
				await carbon.methods.custody({
					owner: new Wallet(seller),
					mint,
					itemId,
				});
				await carbon.methods.listNft({
					tokenOwner: seller.publicKey,
					mint,
					collectionMint,
					price,
					expiry,
				});
				await carbon.methods.delistNft({
					tokenOwner: seller.publicKey,
					mint,
				});

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
				const sellerPreBalance = await provider.connection.getBalance(seller.publicKey);
				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
				});
				const listing = await program.account.listing.fetch(listingPDA);

				const buyerPreBalance = await provider.connection.getBalance(buyer.publicKey);
				const marketplacePreBalance = await provider.connection.getBalance(
					marketplaceAuthority.publicKey
				);
				const feeAccountPreBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY);
				await carbon.methods.buyNft({
					buyer: new Wallet(buyer),
					listing,
				});
				const sellerPostBalance = await provider.connection.getBalance(seller.publicKey);
				const buyerPostBalance = await provider.connection.getBalance(buyer.publicKey);
				const marketplacePostBalance = await provider.connection.getBalance(
					marketplaceAuthority.publicKey
				);
				const feeAccountPostBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY);

				// Make sure buyer is the owner and can transfer the NFT
				const buyerTokenAccount = getAssociatedTokenAddressSync(mint, buyer.publicKey);
				await transferChecked(
					provider.connection,
					buyer,
					buyerTokenAccount,
					mint,
					sellerTokenAccount,
					buyer,
					1,
					0
				);

				// Make sure correct amounts were sent to seller and fee account
				// Rent fee for creating NFT account is a bit over 0.002 SOL
				const ataRent = 0.002 * LAMPORTS_PER_SOL;
				assert.isAtLeast(buyerPreBalance - buyerPostBalance, price + ataRent);

				const marketplaceFee = (price * defaultFeeConfig.bps) / 10000;
				const royalty = (price * defaultSellerFeeBps) / 10000;
				assert.equal(
					sellerPostBalance - sellerPreBalance,
					price - marketplaceFee - royalty - TX_FEE
				);
				assert.equal(marketplacePostBalance - marketplacePreBalance, royalty);
				assert.equal(feeAccountPostBalance - feeAccountPreBalance, marketplaceFee);
			});

			it("should buy the nft with SPL correctly", async function () {
				price = 1000;
				const { mint: splTokenMint } = await createSplToken(
					provider,
					marketplaceAuthority,
					buyer.publicKey,
					price
				);

				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
					currencyMint: splTokenMint,
				});
				const listing = await program.account.listing.fetch(listingPDA);

				await carbon.methods.buyNft({
					buyer: new Wallet(buyer),
					listing,
				});

				const sellerCurrencyTokenAddress = await getAssociatedTokenAddressSync(
					splTokenMint,
					seller.publicKey
				);
				const sellerPostBalance = await provider.connection.getTokenAccountBalance(
					sellerCurrencyTokenAddress
				);
				const buyerTokenAddress = await getAssociatedTokenAddressSync(
					splTokenMint,
					buyer.publicKey
				);
				const buyerPostBalance = await provider.connection.getTokenAccountBalance(
					buyerTokenAddress
				);
				const marketplaceAuthTokenAddress = await getAssociatedTokenAddressSync(
					splTokenMint,
					marketplaceAuthority.publicKey
				);
				const marketplaceAuthPostBalance = await provider.connection.getTokenAccountBalance(
					marketplaceAuthTokenAddress
				);
				const feeAccountTokenAddress = await getAssociatedTokenAddressSync(
					splTokenMint,
					FEE_ACCOUNT_KEY
				);
				const feeAccountPostBalance = await provider.connection.getTokenAccountBalance(
					feeAccountTokenAddress
				);

				// Make sure correct amounts were sent to seller and fee account
				assert.equal(buyerPostBalance.value.uiAmount, 0);

				const marketplaceFee = (price * defaultFeeConfig.bps) / 10000;
				const royalty = (price * defaultSellerFeeBps) / 10000;
				assert.equal(sellerPostBalance.value.uiAmount, price - marketplaceFee - royalty);
				assert.equal(marketplaceAuthPostBalance.value.uiAmount, royalty);
				assert.equal(feeAccountPostBalance.value.uiAmount, marketplaceFee);
			});

			it("should buy the custodial nft correctly", async function () {
				const sellerPreBalance = await provider.connection.getBalance(seller.publicKey);
				await carbon.methods.custody({
					owner: new Wallet(seller),
					mint,
					itemId,
				});
				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
				});
				const listing = await program.account.listing.fetch(listingPDA);

				const buyerPreBalance = await provider.connection.getBalance(buyer.publicKey);
				const marketplacePreBalance = await provider.connection.getBalance(
					marketplaceAuthority.publicKey
				);
				const feeAccountPreBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY);
				await carbon.methods.buyNft({
					buyer: new Wallet(buyer),
					listing,
				});
				const sellerPostBalance = await provider.connection.getBalance(seller.publicKey);
				const buyerPostBalance = await provider.connection.getBalance(buyer.publicKey);
				const marketplacePostBalance = await provider.connection.getBalance(
					marketplaceAuthority.publicKey
				);
				const feeAccountPostBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY);

				// Make sure buyer is the owner and can transfer the NFT
				const buyerTokenAccount = getAssociatedTokenAddressSync(mint, buyer.publicKey);
				await transferChecked(
					provider.connection,
					buyer,
					buyerTokenAccount,
					mint,
					sellerTokenAccount,
					buyer,
					1,
					0
				);

				// Make sure correct amounts were sent to seller and fee account
				// Rent fee for creating NFT account is a bit over 0.002 SOL
				const ataRent = 0.002 * LAMPORTS_PER_SOL;
				assert.isAtLeast(buyerPreBalance - buyerPostBalance, price + ataRent);

				const marketplaceFee = (price * defaultFeeConfig.bps) / 10000;
				const royalty = (price * defaultSellerFeeBps) / 10000;
				assert.equal(
					sellerPostBalance - sellerPreBalance,
					price - marketplaceFee - royalty - TX_FEE * 2
				);
				assert.equal(marketplacePostBalance - marketplacePreBalance, royalty);
				assert.equal(feeAccountPostBalance - feeAccountPreBalance, marketplaceFee);

				// Custody account should no longer exist
				await assertThrows(
					async () => await program.account.custodyAccount.fetch(custodyAccountPDA)
				);
			});

			it("should buy the marketplace listed custodial nft correctly", async function () {
				await carbon.methods.custody({
					owner: new Wallet(seller),
					mint,
					itemId,
				});
				await carbon.methods.listNft({
					tokenOwner: seller.publicKey,
					mint,
					collectionMint,
					price,
					expiry,
				});
				const listing = await program.account.listing.fetch(listingPDA);

				await carbon.methods.buyNft({
					buyer: new Wallet(buyer),
					tokenOwner: seller.publicKey,
					listing,
				});

				// Make sure buyer is the owner and can transfer the NFT
				const buyerTokenAccount = getAssociatedTokenAddressSync(mint, buyer.publicKey);
				await transferChecked(
					provider.connection,
					buyer,
					buyerTokenAccount,
					mint,
					sellerTokenAccount,
					buyer,
					1,
					0
				);
			});
		});

		describe("custody", function () {
			it("should custody the nft correctly", async function () {
				await carbon.methods.custody({
					owner: new Wallet(seller),
					mint,
					itemId,
				});

				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA);
				assert.equal(custodyAccount.version, 1);
				assert.equal(
					custodyAccount.marketplaceAuthority.toString(),
					marketplaceAuthority.publicKey.toString()
				);
				assert.equal(custodyAccount.owner.toString(), seller.publicKey.toString());
				assert.deepEqual(Array.from(custodyAccount.mint.toBuffer()), itemId);

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.equal(sellerTokenAccountObj.delegate.toString(), custodyAccountPDA.toString());
				assert.isTrue(sellerTokenAccountObj.isFrozen);
			});

			it("should throw when nft is listed", async function () {
				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
				});
				await assertThrows(
					async () =>
						await carbon.methods.custody({
							owner: new Wallet(seller),
							mint,
							itemId,
						})
				);
			});

			it("should throw when listing key is incorrect", async function () {
				await assertThrows(
					async () =>
						await carbon.methods.custody({
							owner: new Wallet(seller),
							mint,
							itemId,
							accounts: {
								listing: NATIVE_MINT,
							},
						})
				);
			});
		});

		describe("uncustody", function () {
			it("should uncustody the nft correctly", async function () {
				await carbon.methods.custody({
					owner: new Wallet(seller),
					mint,
					itemId,
				});

				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA);
				await carbon.methods.uncustody({
					owner: new Wallet(seller),
					custodyAccount,
				});

				// Custody account should no longer exist
				await assertThrows(
					async () => await program.account.custodyAccount.fetch(custodyAccountPDA)
				);

				const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
				assert.isNull(sellerTokenAccountObj.delegate);
				assert.isFalse(sellerTokenAccountObj.isFrozen);
			});

			it("should throw when nft is listed", async function () {
				await carbon.methods.custody({
					owner: new Wallet(seller),
					mint,
					itemId,
				});
				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
				});
				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA);
				await assertThrows(
					async () =>
						await carbon.methods.uncustody({
							owner: new Wallet(seller),
							custodyAccount,
						})
				);
			});
		});

		describe("take_ownership", function () {
			it("should take ownership of the nft correctly", async function () {
				await carbon.methods.custody({
					owner: new Wallet(seller),
					mint,
					itemId,
				});

				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA);
				await carbon.methods.takeOwnership({
					custodyAccount,
				});

				// Custody account should no longer exist
				await assertThrows(
					async () => await program.account.custodyAccount.fetch(custodyAccountPDA)
				);

				// Should now be owned by the marketplace authority
				const marketplaceTokenAccount = getAssociatedTokenAddressSync(
					mint,
					marketplaceAuthority.publicKey
				);
				const marketplaceTokenAccountObj = await getAccount(
					provider.connection,
					marketplaceTokenAccount
				);
				assert.equal(marketplaceTokenAccountObj.amount.toString(), "1");
				assert.isNull(marketplaceTokenAccountObj.delegate);
				assert.isFalse(marketplaceTokenAccountObj.isFrozen);
			});

			it("should throw when nft is listed", async function () {
				await carbon.methods.custody({
					owner: new Wallet(seller),
					mint,
					itemId,
				});
				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
				});
				const custodyAccount = await program.account.custodyAccount.fetch(custodyAccountPDA);
				await assertThrows(
					async () =>
						await carbon.methods.takeOwnership({
							custodyAccount,
						})
				);
			});
		});
	});

	describe("virtual flows", function () {
		beforeEach(setUpData);

		async function setUpData() {
			await Promise.all([
				carbon.methods.initMarketplaceConfig({
					args: {
						feeConfig: defaultFeeConfig,
					},
				}),
				carbon.methods.initCollectionConfig({
					args: {
						collectionMint,
						sellerFeeBasisPoints: defaultSellerFeeBps,
						symbol: defaultSymbol,
					},
				}),
			]);

			itemId = createVirtualItemId();
			listingPDA = carbon.pdas.listing(itemId);
		}

		describe("list_virtual", function () {
			it("should list the virtual item correctly", async function () {
				await carbon.methods.listVirtual({ itemId, collectionMint, price, expiry });

				const listing = await program.account.listing.fetch(listingPDA);
				assert.equal(listing.version, 1);
				assert.equal(listing.seller.toString(), marketplaceAuthority.publicKey.toString());
				assert.deepEqual(listing.itemId, itemId);
				assert.equal(listing.isVirtual, true);
				assert.equal(listing.currencyMint.toString(), currencyMint.toString());
				assert.equal(listing.price.toNumber(), price);
				assert.equal(listing.expiry.toNumber(), expiry);
				assert.equal(listing.feeConfig.feeAccount.toString(), FEE_ACCOUNT_KEY.toString());
				assert.equal(listing.feeConfig.bps, defaultFeeConfig.bps);
			});

			it("should list the virtual item correctly as a third-party seller", async function () {
				const listTx = await carbon.transactions.listVirtual({
					seller: seller.publicKey,
					itemId,
					collectionMint,
					price,
					expiry,
				});
				await provider.sendAndConfirm(listTx, [seller]);

				const listing = await program.account.listing.fetch(listingPDA);
				assert.equal(listing.version, 1);
				assert.equal(listing.seller.toString(), seller.publicKey.toString());
				assert.deepEqual(listing.itemId, itemId);
				assert.equal(listing.isVirtual, true);
				assert.equal(listing.currencyMint.toString(), currencyMint.toString());
				assert.equal(listing.price.toNumber(), price);
				assert.equal(listing.expiry.toNumber(), expiry);
				assert.equal(listing.feeConfig.feeAccount.toString(), FEE_ACCOUNT_KEY.toString());
				assert.equal(listing.feeConfig.bps, defaultFeeConfig.bps);
			});

			it("should throw when seller is not a signer", async function () {
				const listTx = await carbon.transactions.listVirtual({
					seller: seller.publicKey,
					itemId,
					collectionMint,
					price,
					expiry,
				});

				await assertThrows(async () => await provider.sendAndConfirm(listTx, []));
			});
		});

		describe("update_listing", function () {
			it("should update the listing correctly", async function () {
				await carbon.methods.listVirtual({ itemId, collectionMint, price, expiry });

				const newPrice = price / 2;
				const newExpiry = 0;
				await carbon.methods.updateListing({
					listing: listingPDA,
					price: newPrice,
					expiry: newExpiry,
				});

				const listing = await program.account.listing.fetch(listingPDA);
				assert.equal(listing.price.toNumber(), newPrice);
				assert.equal(listing.expiry.toNumber(), newExpiry);
			});

			it("should throw when listing is expired", async function () {
				await carbon.methods.listVirtual({
					itemId,
					collectionMint,
					price,
					expiry: (expiry = moment().add(2, "seconds").unix()),
				});

				await new Promise((resolve) => setTimeout(resolve, 3000));

				await assertThrows(
					async () =>
						await carbon.methods.updateListing({
							listing: listingPDA,
							price: price / 2,
							expiry: 0,
						})
				);
			});
		});

		describe("delist_virtual", function () {
			it("should delist the virtual item correctly", async function () {
				await carbon.methods.listVirtual({ itemId, collectionMint, price, expiry });
				await carbon.methods.delistVirtual({ itemId });

				// Listing should no longer exist
				await assertThrows(async () => await program.account.listing.fetch(listingPDA));
			});

			it("should delist the virtual item correctly with a third-party seller", async function () {
				const listTx = await carbon.transactions.listVirtual({
					seller: seller.publicKey,
					itemId,
					collectionMint,
					price,
					expiry,
				});
				await provider.sendAndConfirm(listTx, [seller]);

				await carbon.methods.delistVirtual({
					seller: new Wallet(seller),
					itemId,
				});

				// Listing should no longer exist
				await assertThrows(async () => await program.account.listing.fetch(listingPDA));
			});

			it("should throw when delisting as a different seller", async function () {
				const listTx = await carbon.transactions.listVirtual({
					seller: seller.publicKey,
					itemId,
					collectionMint,
					price,
					expiry,
				});
				await provider.sendAndConfirm(listTx, [seller]);

				await assertThrows(
					async () =>
						await carbon.methods.delistVirtual({
							seller: new Wallet(marketplaceAuthority),
							itemId,
						})
				);
			});
		});

		describe("buy_virtual", function () {
			it("should buy the virtual item correctly", async function () {
				const marketplaceAuthPreBalance = await provider.connection.getBalance(
					marketplaceAuthority.publicKey
				);
				await carbon.methods.listVirtual({ itemId, collectionMint, price, expiry });
				const listing = await program.account.listing.fetch(listingPDA);
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);

				const buyerPreBalance = await provider.connection.getBalance(buyer.publicKey);
				const feeAccountPreBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY);
				const { mint: mintKeypair, transaction } = await carbon.transactions.buyVirtual({
					buyer: buyer.publicKey,
					collectionConfig,
					listing,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});
				await provider.sendAndConfirm(transaction, [marketplaceAuthority, mintKeypair, buyer]);

				const marketplaceAuthPostBalance = await provider.connection.getBalance(
					marketplaceAuthority.publicKey
				);
				const buyerPostBalance = await provider.connection.getBalance(buyer.publicKey);
				const feeAccountPostBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY);

				// An NFT should now exist with the correct metadata
				const mint = mintKeypair.publicKey;
				const nft = await fetchNFT(provider, marketplaceAuthority, mint);
				assert.equal(
					nft.updateAuthorityAddress.toString(),
					marketplaceAuthority.publicKey.toString()
				);
				assert.equal(nft.name, "Ghost #1");
				assert.equal(nft.uri, "https://example.com");
				assert.equal(nft.symbol, defaultSymbol);
				assert.equal(nft.sellerFeeBasisPoints, defaultSellerFeeBps);
				assert.isTrue(nft.collection.verified);
				assert.equal(nft.collection.address.toString(), collectionMint.toString());
				assert.isTrue(nft.primarySaleHappened);
				assert.deepEqual(nft.creators, [
					{
						address: marketplaceAuthority.publicKey,
						verified: true,
						share: 100,
					},
				]);

				// The mint record should exist
				const mintRecordPDA = carbon.pdas.mintRecord(collectionConfigPDA, itemId);
				const mintRecord = await program.account.mintRecord.fetch(mintRecordPDA);
				assert.equal(mintRecord.collectionConfig.toString(), collectionConfigPDA.toString());
				assert.deepEqual(mintRecord.itemId, itemId);
				assert.equal(mintRecord.mint.toString(), mint.toString());

				// Make sure buyer is the owner and can transfer the NFT
				const sellerTokenAccount = await createAssociatedTokenAccount(
					provider.connection,
					buyer,
					mint,
					seller.publicKey
				);
				const buyerTokenAccount = getAssociatedTokenAddressSync(mint, buyer.publicKey);
				await transferChecked(
					provider.connection,
					buyer,
					buyerTokenAccount,
					mint,
					sellerTokenAccount,
					buyer,
					1,
					0
				);

				// Make sure correct amounts were sent to seller and fee account
				assert.equal(buyerPreBalance - buyerPostBalance, price + mintRecordStorageFee);

				const mintingFee = 0.02 * LAMPORTS_PER_SOL;
				const marketplaceFee = (price * defaultFeeConfig.bps) / 10000;
				assert.isAtLeast(
					marketplaceAuthPostBalance - marketplaceAuthPreBalance,
					price - marketplaceFee - mintingFee
				);

				assert.equal(feeAccountPostBalance - feeAccountPreBalance, marketplaceFee);
			});

			it("should buy the virtual item with SPL correctly", async function () {
				price = 1000;
				const { mint: splTokenMint } = await createSplToken(
					provider,
					marketplaceAuthority,
					buyer.publicKey,
					price
				);

				await carbon.methods.listVirtual({
					itemId,
					collectionMint,
					price,
					expiry,
					currencyMint: splTokenMint,
				});
				const listing = await program.account.listing.fetch(listingPDA);
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);

				const { mint: mintKeypair, instruction } = await carbon.instructions.buyVirtual({
					buyer: buyer.publicKey,
					collectionConfig,
					listing,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});
				await provider.sendAndConfirm(
					new Transaction()
						.add(
							ComputeBudgetProgram.setComputeUnitLimit({
								units: 400_000,
							})
						)
						.add(instruction),
					[marketplaceAuthority, mintKeypair, buyer]
				);

				const marketplaceAuthTokenAddress = await getAssociatedTokenAddressSync(
					splTokenMint,
					marketplaceAuthority.publicKey
				);
				const marketplaceAuthPostBalance = await provider.connection.getTokenAccountBalance(
					marketplaceAuthTokenAddress
				);
				const buyerTokenAddress = await getAssociatedTokenAddressSync(
					splTokenMint,
					buyer.publicKey
				);
				const buyerPostBalance = await provider.connection.getTokenAccountBalance(
					buyerTokenAddress
				);
				const feeAccountTokenAddress = await getAssociatedTokenAddressSync(
					splTokenMint,
					FEE_ACCOUNT_KEY
				);
				const feeAccountPostBalance = await provider.connection.getTokenAccountBalance(
					feeAccountTokenAddress
				);

				// Make sure correct amounts were sent to seller and fee account
				assert.equal(buyerPostBalance.value.uiAmount, 0);

				const marketplaceFee = (price * defaultFeeConfig.bps) / 10000;
				assert.isAtLeast(
					marketplaceAuthPostBalance.value.uiAmount,
					price - marketplaceFee - TX_FEE
				);

				assert.equal(feeAccountPostBalance.value.uiAmount, marketplaceFee);
			});

			it("should buy the virtual item correctly with a third-party seller", async function () {
				const sellerPreBalance = await provider.connection.getBalance(seller.publicKey);
				const marketplaceAuthPreBalance = await provider.connection.getBalance(
					marketplaceAuthority.publicKey
				);

				const listTx = await carbon.transactions.listVirtual({
					seller: seller.publicKey,
					itemId,
					collectionMint,
					price,
					expiry,
				});
				await provider.sendAndConfirm(listTx, [seller]);

				const listing = await program.account.listing.fetch(listingPDA);
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);

				const buyerPreBalance = await provider.connection.getBalance(buyer.publicKey);
				const feeAccountPreBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY);
				const { mint: mintKeypair, transaction } = await carbon.transactions.buyVirtual({
					buyer: buyer.publicKey,
					collectionConfig,
					listing,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});
				await provider.sendAndConfirm(transaction, [buyer]);

				const sellerPostBalance = await provider.connection.getBalance(seller.publicKey);
				const marketplaceAuthPostBalance = await provider.connection.getBalance(
					marketplaceAuthority.publicKey
				);
				const buyerPostBalance = await provider.connection.getBalance(buyer.publicKey);
				const feeAccountPostBalance = await provider.connection.getBalance(FEE_ACCOUNT_KEY);

				// An NFT should now exist with the correct metadata
				const mint = mintKeypair.publicKey;
				const nft = await fetchNFT(provider, marketplaceAuthority, mint);
				assert.equal(
					nft.updateAuthorityAddress.toString(),
					marketplaceAuthority.publicKey.toString()
				);
				assert.equal(nft.name, "Ghost #1");
				assert.equal(nft.uri, "https://example.com");
				assert.equal(nft.symbol, defaultSymbol);
				assert.equal(nft.sellerFeeBasisPoints, defaultSellerFeeBps);
				assert.isTrue(nft.collection.verified);
				assert.equal(nft.collection.address.toString(), collectionMint.toString());
				assert.isTrue(nft.primarySaleHappened);
				assert.deepEqual(nft.creators, [
					{
						address: marketplaceAuthority.publicKey,
						verified: true,
						share: 100,
					},
				]);

				// Make sure buyer is the owner and can transfer the NFT
				const sellerTokenAccount = await createAssociatedTokenAccount(
					provider.connection,
					buyer,
					mint,
					seller.publicKey
				);
				const buyerTokenAccount = getAssociatedTokenAddressSync(mint, buyer.publicKey);
				await transferChecked(
					provider.connection,
					buyer,
					buyerTokenAccount,
					mint,
					sellerTokenAccount,
					buyer,
					1,
					0
				);

				assert.equal(buyerPreBalance - buyerPostBalance, price + mintRecordStorageFee);

				// Make sure correct amounts were sent to seller and fee account
				const royalty = (price * defaultSellerFeeBps) / 10000;
				const marketplaceFee = (price * defaultFeeConfig.bps) / 10000;
				assert.isAtLeast(sellerPostBalance - sellerPreBalance, price - marketplaceFee - royalty);

				const mintingFee = 0.02 * LAMPORTS_PER_SOL;
				assert.isAtLeast(
					marketplaceAuthPostBalance,
					marketplaceAuthPreBalance + royalty - mintingFee
				);

				assert.equal(feeAccountPostBalance - feeAccountPreBalance, marketplaceFee);
			});

			it("should throw when giving an incorrect collection config", async function () {
				await carbon.methods.listVirtual({ itemId, collectionMint, price, expiry });

				const listing = await program.account.listing.fetch(listingPDA);
				collectionMint = Keypair.generate().publicKey;
				await carbon.methods.initCollectionConfig({
					args: {
						collectionMint,
						sellerFeeBasisPoints: defaultSellerFeeBps,
						symbol: defaultSymbol,
					},
				});

				collectionConfigPDA = carbon.pdas.collectionConfig(collectionMint);
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);

				const { mint: mintKeypair, instruction } = await carbon.instructions.buyVirtual({
					buyer: buyer.publicKey,
					collectionConfig,
					listing,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});

				await assertThrows(async () => {
					await provider.sendAndConfirm(new Transaction().add(instruction), [
						marketplaceAuthority,
						mintKeypair,
						buyer,
					]);
				});
			});
		});

		describe("mint_virtual", function () {
			it("should mint the virtual item correctly", async function () {
				const marketplaceAuthPreBalance = await provider.connection.getBalance(
					marketplaceAuthority.publicKey
				);

				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);
				const buyerPreBalance = await provider.connection.getBalance(buyer.publicKey);

				itemId = createVirtualItemId();
				const { mint: mintKeypair, transaction } = await carbon.transactions.mintVirtual({
					buyer: buyer.publicKey,
					itemId,
					collectionConfig,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});
				await provider.sendAndConfirm(transaction, [marketplaceAuthority, mintKeypair, buyer]);

				const marketplaceAuthPostBalance = await provider.connection.getBalance(
					marketplaceAuthority.publicKey
				);
				const buyerPostBalance = await provider.connection.getBalance(buyer.publicKey);

				// An NFT should now exist with the correct metadata
				const mint = mintKeypair.publicKey;
				const nft = await fetchNFT(provider, marketplaceAuthority, mint);
				assert.equal(
					nft.updateAuthorityAddress.toString(),
					marketplaceAuthority.publicKey.toString()
				);
				assert.equal(nft.name, "Ghost #1");
				assert.equal(nft.uri, "https://example.com");
				assert.equal(nft.symbol, defaultSymbol);
				assert.equal(nft.sellerFeeBasisPoints, defaultSellerFeeBps);
				assert.isTrue(nft.collection.verified);
				assert.equal(nft.collection.address.toString(), collectionMint.toString());
				assert.isTrue(nft.primarySaleHappened);
				assert.deepEqual(nft.creators, [
					{
						address: marketplaceAuthority.publicKey,
						verified: true,
						share: 100,
					},
				]);

				// The mint record should exist
				const mintRecordPDA = carbon.pdas.mintRecord(collectionConfigPDA, itemId);
				const mintRecord = await program.account.mintRecord.fetch(mintRecordPDA);
				assert.equal(mintRecord.collectionConfig.toString(), collectionConfigPDA.toString());
				assert.deepEqual(mintRecord.itemId, itemId);
				assert.equal(mintRecord.mint.toString(), mint.toString());

				// Make sure buyer is the owner and can transfer the NFT
				const sellerTokenAccount = await createAssociatedTokenAccount(
					provider.connection,
					buyer,
					mint,
					seller.publicKey
				);
				const buyerTokenAccount = getAssociatedTokenAddressSync(mint, buyer.publicKey);
				await transferChecked(
					provider.connection,
					buyer,
					buyerTokenAccount,
					mint,
					sellerTokenAccount,
					buyer,
					1,
					0
				);

				// Make sure correct amounts were sent to seller and fee account
				const mintingFee = 0.01 * LAMPORTS_PER_SOL;
				assert.isAtLeast(buyerPreBalance - buyerPostBalance, mintingFee);

				assert.equal(marketplaceAuthPreBalance - marketplaceAuthPostBalance, 15000);
			});

			it("should throw when trying to mint the same item id twice", async function () {
				const marketplaceAuthPreBalance = await provider.connection.getBalance(
					marketplaceAuthority.publicKey
				);

				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);
				const buyerPreBalance = await provider.connection.getBalance(buyer.publicKey);

				itemId = createVirtualItemId();
				const { mint: mintKeypair, transaction } = await carbon.transactions.mintVirtual({
					buyer: buyer.publicKey,
					itemId,
					collectionConfig,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});
				await provider.sendAndConfirm(transaction, [marketplaceAuthority, mintKeypair, buyer]);

				await assertThrows(async () => {
					const { mint: mintKeypair, transaction } = await carbon.transactions.mintVirtual({
						buyer: buyer.publicKey,
						itemId,
						collectionConfig,
						metadata: {
							name: "Ghost #1",
							uri: "https://example.com",
						},
					});
					await provider.sendAndConfirm(transaction, [marketplaceAuthority, mintKeypair, buyer]);
				});
			});
		});

		describe("close_mint_record", function () {
			it("should close the mint record correctly", async function () {
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);

				itemId = createVirtualItemId();
				const { mint: mintKeypair, transaction } = await carbon.transactions.mintVirtual({
					buyer: buyer.publicKey,
					itemId,
					collectionConfig,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});
				await provider.sendAndConfirm(transaction, [marketplaceAuthority, mintKeypair, buyer]);

				const metaplex = new Metaplex(provider.connection).use(keypairIdentity(buyer));
				await metaplex.nfts().delete({
					mintAddress: mintKeypair.publicKey,
					collection: collectionMint,
				});

				const mintRecordPDA = carbon.pdas.mintRecord(collectionConfigPDA, itemId);
				let mintRecord = await program.account.mintRecord.fetch(mintRecordPDA);

				await carbon.methods.closeMintRecord({
					mintRecord,
				});

				// The mint record should no longer exist
				let account = await provider.connection.getAccountInfo(mintRecordPDA);
				assert.isNull(account);
			});

			it("should throw when closing a mint record with an existing mint", async function () {
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);

				itemId = createVirtualItemId();
				const { mint: mintKeypair, transaction } = await carbon.transactions.mintVirtual({
					buyer: buyer.publicKey,
					itemId,
					collectionConfig,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});
				await provider.sendAndConfirm(transaction, [marketplaceAuthority, mintKeypair, buyer]);

				const mintRecordPDA = carbon.pdas.mintRecord(collectionConfigPDA, itemId);
				let mintRecord = await program.account.mintRecord.fetch(mintRecordPDA);

				await assertThrows(async () => {
					await carbon.methods.closeMintRecord({
						mintRecord,
					});
				});
			});

			it("should throw when closing a mint record as non-authority", async function () {
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);

				itemId = createVirtualItemId();
				const { mint: mintKeypair, transaction } = await carbon.transactions.mintVirtual({
					buyer: buyer.publicKey,
					itemId,
					collectionConfig,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});
				await provider.sendAndConfirm(transaction, [marketplaceAuthority, mintKeypair, buyer]);

				const metaplex = new Metaplex(provider.connection).use(keypairIdentity(buyer));
				await metaplex.nfts().delete({
					mintAddress: mintKeypair.publicKey,
					collection: collectionMint,
				});

				const mintRecordPDA = carbon.pdas.mintRecord(collectionConfigPDA, itemId);
				let mintRecord = await program.account.mintRecord.fetch(mintRecordPDA);

				await assertThrows(async () => {
					const ix = await carbon.instructions.closeMintRecord({
						marketplaceAuthority: buyer.publicKey,
						mintRecord,
					});

					await provider.sendAndConfirm(new Transaction().add(ix), [buyer]);
				});
			});
		});
	});

	describe("combined flows", function () {
		describe("listItem", function () {
			it("should list as virtual if account for id does not exist", async function () {
				await Promise.all([
					carbon.methods.initMarketplaceConfig({
						args: {
							feeConfig: defaultFeeConfig,
						},
					}),
					carbon.methods.initCollectionConfig({
						args: {
							collectionMint,
							sellerFeeBasisPoints: defaultSellerFeeBps,
							symbol: defaultSymbol,
						},
					}),
				]);

				itemId = createVirtualItemId();
				listingPDA = carbon.pdas.listing(itemId);

				await carbon.methods.listItem({
					itemId,
					collectionMint,
					price,
					expiry,
				});

				const listing = await program.account.listing.fetch(listingPDA);
				assert.isTrue(listing.isVirtual);
			});

			it("should list as nft if account for id exists", async function () {
				const results = await Promise.all([
					carbon.methods.initMarketplaceConfig({
						args: {
							feeConfig: defaultFeeConfig,
						},
					}),
					carbon.methods.initCollectionConfig({
						args: {
							collectionMint,
							sellerFeeBasisPoints: defaultSellerFeeBps,
							symbol: defaultSymbol,
						},
					}),
					createNFT(provider, marketplaceAuthority, collectionMint, {
						tokenOwner: seller.publicKey,
					}),
				]);

				const nft = results[2];
				itemId = Array.from(nft.mint.toBuffer());
				mint = nft.mint;
				sellerTokenAccount = getAssociatedTokenAddressSync(mint, seller.publicKey);
				listingPDA = carbon.pdas.listing(itemId);
				custodyAccountPDA = carbon.pdas.custodyAccount(mint);

				await carbon.methods.listItem({
					seller: new Wallet(seller),
					itemId,
					collectionMint,
					price,
					expiry,
				});

				const listing = await program.account.listing.fetch(listingPDA);
				assert.isFalse(listing.isVirtual);
			});

			it("should allow marketplace to list nft if custodial", async function () {
				const results = await Promise.all([
					carbon.methods.initMarketplaceConfig({
						args: {
							feeConfig: defaultFeeConfig,
						},
					}),
					carbon.methods.initCollectionConfig({
						args: {
							collectionMint,
							sellerFeeBasisPoints: defaultSellerFeeBps,
							symbol: defaultSymbol,
						},
					}),
					createNFT(provider, marketplaceAuthority, collectionMint, {
						tokenOwner: seller.publicKey,
					}),
				]);

				const nft = results[2];
				itemId = Array.from(nft.mint.toBuffer());
				mint = nft.mint;
				sellerTokenAccount = getAssociatedTokenAddressSync(mint, seller.publicKey);
				listingPDA = carbon.pdas.listing(itemId);
				custodyAccountPDA = carbon.pdas.custodyAccount(mint);

				await carbon.methods.custody({
					owner: new Wallet(seller),
					mint,
					itemId,
				});

				await carbon.methods.listItem({
					tokenOwner: seller.publicKey,
					itemId,
					collectionMint,
					price,
					expiry,
				});

				const listing = await program.account.listing.fetch(listingPDA);
				assert.isFalse(listing.isVirtual);
			});
		});

		describe("delistOrBuyItem", function () {
			beforeEach(setUpData);

			async function setUpData() {
				await Promise.all([
					carbon.methods.initMarketplaceConfig({
						args: {
							feeConfig: defaultFeeConfig,
						},
					}),
					carbon.methods.initCollectionConfig({
						args: {
							collectionMint,
							sellerFeeBasisPoints: defaultSellerFeeBps,
							symbol: defaultSymbol,
						},
					}),
				]);

				itemId = createVirtualItemId();
				listingPDA = carbon.pdas.listing(itemId);
			}

			it("should delist the virtual listing if listed by marketplace", async function () {
				await carbon.methods.listItem({
					itemId,
					collectionMint,
					price,
					expiry,
				});

				let listing = await carbon.accounts.listing(itemId);
				const tx = await carbon.transactions.delistOrBuyItem({
					listing,
					burnMint: true,
				});
				await provider.sendAndConfirm(tx);

				const mintRecord = await carbon.accounts.mintRecord(collectionConfigPDA, itemId);
				assert.isUndefined(mintRecord);

				listing = await carbon.accounts.listing(itemId);
				assert.isUndefined(listing);
			});

			it("should buy and burn the virtual listing if listed by third party seller", async function () {
				const listTx = await carbon.transactions.listVirtual({
					seller: seller.publicKey,
					itemId,
					collectionMint,
					price,
					expiry,
				});
				await provider.sendAndConfirm(listTx, [seller]);

				let listing = await carbon.accounts.listing(itemId);

				const tx = await carbon.transactions.delistOrBuyItem({
					listing,
					burnMint: true,
					collectionConfig: collectionConfigPDA,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});
				await provider.sendAndConfirm(tx);

				const mintRecord = await carbon.accounts.mintRecord(collectionConfigPDA, itemId);
				assert.isUndefined(mintRecord);

				listing = await carbon.accounts.listing(itemId);
				assert.isUndefined(listing);
			});

			it("should burn the nft and mint record when given and delisting", async function () {
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);
				itemId = createVirtualItemId();

				const { mint: mintKeypair, transaction } = await carbon.transactions.mintVirtual({
					buyer: seller.publicKey,
					itemId,
					collectionConfig,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});

				transaction.add(
					await carbon.instructions.custody({
						owner: seller.publicKey,
						mint: mintKeypair.publicKey,
						itemId,
					})
				);

				await provider.sendAndConfirm(transaction, [marketplaceAuthority, mintKeypair, seller]);

				mint = mintKeypair.publicKey;

				await carbon.methods.listNft({
					tokenOwner: seller.publicKey,
					mint,
					collectionMint,
					price,
					expiry,
				});

				const listing = await carbon.accounts.listing(mint.toBuffer());
				let mintRecord = await carbon.accounts.mintRecord(collectionConfigPDA, itemId);

				const tx = await carbon.transactions.delistOrBuyItem({
					listing,
					burnMint: true,
					burnArgs: {
						mintRecord,
					},
				});

				await provider.sendAndConfirm(tx);

				mintRecord = await carbon.accounts.mintRecord(collectionConfigPDA, itemId);
				assert.isUndefined(mintRecord);
			});

			it("should burn the nft and mint record when given and buying", async function () {
				const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);
				itemId = createVirtualItemId();

				const { mint: mintKeypair, transaction } = await carbon.transactions.mintVirtual({
					buyer: seller.publicKey,
					itemId,
					collectionConfig,
					metadata: {
						name: "Ghost #1",
						uri: "https://example.com",
					},
				});
				await provider.sendAndConfirm(transaction, [marketplaceAuthority, mintKeypair, seller]);

				mint = mintKeypair.publicKey;

				await carbon.methods.listNft({
					seller: new Wallet(seller),
					mint,
					collectionMint,
					price,
					expiry,
				});

				const listing = await carbon.accounts.listing(mint.toBuffer());
				let mintRecord = await carbon.accounts.mintRecord(collectionConfigPDA, itemId);

				const tx = await carbon.transactions.delistOrBuyItem({
					listing,
					burnMint: true,
					burnArgs: {
						mintRecord,
					},
				});
				await provider.sendAndConfirm(tx);

				mintRecord = await carbon.accounts.mintRecord(collectionConfigPDA, itemId);
				assert.isUndefined(mintRecord);
			});
		});
	});

	describe("integration", function () {
		beforeEach(setUpData);

		async function setUpData() {
			await Promise.all([
				carbon.methods.initMarketplaceConfig({
					args: {
						feeConfig: defaultFeeConfig,
					},
				}),
				carbon.methods.initCollectionConfig({
					args: {
						collectionMint,
						sellerFeeBasisPoints: defaultSellerFeeBps,
						symbol: defaultSymbol,
					},
				}),
			]);

			itemId = createVirtualItemId();
		}

		it("should buy virtual, then buy minted nft correctly", async function () {
			await carbon.methods.listVirtual({ itemId, collectionMint, price, expiry });
			let listing = await carbon.accounts.listing(itemId);
			const collectionConfig = await program.account.collectionConfig.fetch(collectionConfigPDA);
			const { mint: mintKeypair, transaction } = await carbon.transactions.buyVirtual({
				buyer: buyer.publicKey,
				collectionConfig,
				listing,
				metadata: {
					name: "Ghost #1",
					uri: "https://example.com",
				},
			});
			mint = mintKeypair.publicKey;
			await provider.sendAndConfirm(transaction, [marketplaceAuthority, mintKeypair, buyer]);

			await carbon.methods.listNft({
				seller: new Wallet(buyer),
				mint,
				collectionMint,
				price,
				expiry,
			});
			listing = await carbon.accounts.listing(mint.toBuffer());
			await carbon.methods.buyNft({ buyer: new Wallet(seller), listing });

			// Seller is now the owner and can transfer the nft
			const buyerTokenAccount = getAssociatedTokenAddressSync(mint, buyer.publicKey);
			await transferChecked(
				provider.connection,
				seller,
				getAssociatedTokenAddressSync(mint, seller.publicKey),
				mint,
				buyerTokenAccount,
				seller,
				1,
				0
			);
		});
	});
});
