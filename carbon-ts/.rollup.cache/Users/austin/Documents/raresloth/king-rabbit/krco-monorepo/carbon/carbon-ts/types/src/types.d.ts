import { IdlAccounts } from "@coral-xyz/anchor";
import { Carbon } from './idl/carbon';
export type MarketplaceConfig = IdlAccounts<Carbon>["marketplaceConfig"];
export type CollectionConfig = IdlAccounts<Carbon>["collectionConfig"];
export type Listing = IdlAccounts<Carbon>["listing"];
export type CustodyAccount = IdlAccounts<Carbon>["custodyAccount"];
//# sourceMappingURL=types.d.ts.map