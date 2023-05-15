import { PublicKey } from "@solana/web3.js";
import { CustodyAccount } from "./types";
import Carbon from "./carbon";

const DOES_NOT_EXIST_ERROR = "Account does not exist";

export class Accounts {
	constructor(public carbon: Carbon) {}

	async getAccountInfo(publicKey: PublicKey) {
		try {
			return await this.carbon.program.provider.connection.getAccountInfo(publicKey);
		} catch (e) {
			if (!e?.message.includes(DOES_NOT_EXIST_ERROR)) {
				throw e;
			}
		}
	}

	async custodyAccount(mint: PublicKey): Promise<CustodyAccount | undefined> {
		try {
			return await this.carbon.program.account.custodyAccount.fetch(
				this.carbon.pdas.custodyAccount(mint)
			);
		} catch (e) {
			if (!e?.message.includes(DOES_NOT_EXIST_ERROR)) {
				throw e;
			}
		}
	}
}

export default Accounts;
