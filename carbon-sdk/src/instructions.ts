import Carbon from "./carbon";

import { initMarketplaceConfig } from "./instructions/initMarketplaceConfig";
import { initCollectionConfig } from "./instructions/initCollectionConfig";
import { listItem } from "./instructions/listItem";
import { delistItem } from "./instructions/delistItem";
import { delistOrBuyItem } from "./instructions/delistOrBuyItem";
import { listNft } from "./instructions/listNft";
import { delistNft } from "./instructions/delistNft";
import { buyNft } from "./instructions/buyNft";
import { listVirtual } from "./instructions/listVirtual";
import { delistVirtual } from "./instructions/delistVirtual";
import { buyVirtual } from "./instructions/buyVirtual";
import { mintVirtual } from "./instructions/mintVirtual";
import { custody } from "./instructions/custody";
import { uncustody } from "./instructions/uncustody";
import { takeOwnership } from "./instructions/takeOwnership";

export class Instructions {
	constructor(public carbon: Carbon) {}

	public initMarketplaceConfig = initMarketplaceConfig;
	public initCollectionConfig = initCollectionConfig;
	public listItem = listItem;
	public delistItem = delistItem;
	public delistOrBuyItem = delistOrBuyItem;
	public listNft = listNft;
	public delistNft = delistNft;
	public buyNft = buyNft;
	public listVirtual = listVirtual;
	public delistVirtual = delistVirtual;
	public buyVirtual = buyVirtual;
	public mintVirtual = mintVirtual;
	public custody = custody;
	public uncustody = uncustody;
	public takeOwnership = takeOwnership;
}

export default Instructions;
