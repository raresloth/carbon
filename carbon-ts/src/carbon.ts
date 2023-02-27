import {Keypair, PublicKey} from "@solana/web3.js";
import {Program, Provider} from "@coral-xyz/anchor";
import * as CarbonIDL from "./idl/carbon"
import Pdas from "./pdas";
import Methods from "./methods"
import {PROGRAM_ID} from "./index";

export class Carbon {
	public marketplaceAuthority: PublicKey;
	public marketplaceAuthorityKeypair?: Keypair;
	public program: Program<CarbonIDL.Carbon>;
	public pdas: Pdas;
	public methods: Methods;

	constructor(
		public provider: Provider,
		marketplaceAuthority: PublicKey | Keypair,
		public programId: PublicKey = PROGRAM_ID,
	) {
		if (marketplaceAuthority instanceof Keypair) {
			this.marketplaceAuthority = marketplaceAuthority.publicKey;
			this.marketplaceAuthorityKeypair = marketplaceAuthority;
		} else {
			this.marketplaceAuthority = marketplaceAuthority;
		}

		this.program = new Program<CarbonIDL.Carbon>(CarbonIDL.IDL, programId, provider);
		this.pdas = new Pdas(this);
		this.methods = new Methods(this);
	}

	async getIdFromString(value: string): Promise<PublicKey> {
		return await PublicKey.createWithSeed(
			this.marketplaceAuthority,
			value,
			this.programId
		)
	}
}

export default Carbon;