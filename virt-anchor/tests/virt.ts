import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Virt } from "../target/types/virt";
import {createNFT, setBalance} from "./helpers";
import moment from "moment";
import * as virt from "@raresloth/virt-ts"
import {FEE_ACCOUNT_ADDRESS} from "@raresloth/virt-ts";
import {getAccount, getAssociatedTokenAddressSync, NATIVE_MINT} from "@solana/spl-token";
import { assert } from "chai";

describe("virt", () => {
	const provider = anchor.AnchorProvider.env();
	provider.opts.skipPreflight = true;
	anchor.setProvider(provider);

	const program = anchor.workspace.Virt as Program<Virt>;
	const virtInstance = new virt.Virt(program.programId, provider);

	let payer: Keypair;
	let seller: Keypair;
	let sellerTokenAccount: PublicKey;
	let buyer: Keypair;
	let buyerTokenAccount: PublicKey;
	let mint: PublicKey;
	let metadataAccount: PublicKey;
	let edition: PublicKey;
	let currencyMint: PublicKey;
	let price: number;
	let expiry: number;
	let listingPDA: PublicKey;

	beforeEach(setUpData)
	async function setUpData() {
		let promises = []

		payer = Keypair.generate()
		promises.push(setBalance(provider, payer, 100 * LAMPORTS_PER_SOL))

		seller = Keypair.generate()
		promises.push(setBalance(provider, seller, 5 * LAMPORTS_PER_SOL))

		buyer = Keypair.generate()
		promises.push(setBalance(provider, buyer, 5 * LAMPORTS_PER_SOL))

		await Promise.all(promises)

		currencyMint = NATIVE_MINT;
		price = LAMPORTS_PER_SOL
		expiry = moment().add(1, 'day').unix()

		const nft = await createNFT(provider, payer, {
			tokenOwner: seller.publicKey
		});
		mint = nft.mint

		sellerTokenAccount = getAssociatedTokenAddressSync(mint, seller.publicKey)
		listingPDA = virtInstance.getListingPDA(mint)
	}

	describe("list_nft", function () {

		it("should list the nft correctly", async function () {
			await virtInstance.listNft(seller, mint, price, expiry)

			const listing = await program.account.listing.fetch(listingPDA);
			assert.equal(listing.version, 1);
			assert.equal(listing.authority.toString(), seller.publicKey.toString());
			assert.equal(listing.mint.toString(), mint.toString());
			assert.equal(listing.currencyMint.toString(), currencyMint.toString());
			assert.equal(listing.price.toNumber(), price);
			assert.equal(listing.expiry.toNumber(), expiry);
			assert.equal(listing.feeSchedule.beneficiary.toString(), FEE_ACCOUNT_ADDRESS)
			assert.equal(listing.feeSchedule.bps, 0)

			const sellerTokenAccountObj = await getAccount(provider.connection, sellerTokenAccount);
			assert.equal(sellerTokenAccountObj.delegate.toString(), listingPDA.toString());
			assert.isTrue(sellerTokenAccountObj.isFrozen);
		});

	});

});
