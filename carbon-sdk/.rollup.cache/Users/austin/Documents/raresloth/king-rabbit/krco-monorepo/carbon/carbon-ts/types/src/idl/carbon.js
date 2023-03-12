export const IDL = {
    "version": "0.1.0",
    "name": "carbon",
    "instructions": [
        {
            "name": "initMarketplaceConfig",
            "accounts": [
                {
                    "name": "marketplaceAuthority",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Marketplace authority wallet."
                    ]
                },
                {
                    "name": "marketplaceConfig",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "args",
                    "type": {
                        "defined": "MarketplaceConfigArgs"
                    }
                }
            ]
        },
        {
            "name": "initCollectionConfig",
            "accounts": [
                {
                    "name": "marketplaceAuthority",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Marketplace authority wallet."
                    ]
                },
                {
                    "name": "collectionConfig",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "args",
                    "type": {
                        "defined": "CollectionConfigArgs"
                    }
                }
            ]
        },
        {
            "name": "listNft",
            "accounts": [
                {
                    "name": "seller",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Seller wallet."
                    ]
                },
                {
                    "name": "tokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Seller's token account of the mint to sell."
                    ]
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Mint of the NFT to sell."
                    ]
                },
                {
                    "name": "collectionMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The verified collection mint of the NFT to sell."
                    ]
                },
                {
                    "name": "metadataAccount",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Metadata of the NFT to sell."
                    ]
                },
                {
                    "name": "edition",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Edition of the NFT to sell."
                    ]
                },
                {
                    "name": "currencyMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The currency to use or native mint if using SOL"
                    ]
                },
                {
                    "name": "listing",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "collectionConfig",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "marketplaceConfig",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "custodyAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "price",
                    "type": "u64"
                },
                {
                    "name": "expiry",
                    "type": "i64"
                }
            ]
        },
        {
            "name": "listVirtual",
            "accounts": [
                {
                    "name": "marketplaceAuthority",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Marketplace authority wallet."
                    ]
                },
                {
                    "name": "currencyMint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The currency to use or native mint if using SOL"
                    ]
                },
                {
                    "name": "listing",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "collectionConfig",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "marketplaceConfig",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "itemId",
                    "type": {
                        "array": [
                            "u8",
                            32
                        ]
                    }
                },
                {
                    "name": "price",
                    "type": "u64"
                },
                {
                    "name": "expiry",
                    "type": "i64"
                }
            ]
        },
        {
            "name": "delistNft",
            "accounts": [
                {
                    "name": "seller",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Seller wallet."
                    ]
                },
                {
                    "name": "tokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Seller's token account of the mint to delist."
                    ]
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Mint of the NFT to sell."
                    ]
                },
                {
                    "name": "edition",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Edition of the NFT to sell."
                    ]
                },
                {
                    "name": "listing",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "custodyAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "delistVirtual",
            "accounts": [
                {
                    "name": "marketplaceAuthority",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Marketplace authority wallet."
                    ]
                },
                {
                    "name": "listing",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "itemId",
                    "type": {
                        "array": [
                            "u8",
                            32
                        ]
                    }
                }
            ]
        },
        {
            "name": "buyNft",
            "accounts": [
                {
                    "name": "buyer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Buyer wallet."
                    ]
                },
                {
                    "name": "seller",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Seller wallet."
                    ]
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "The new mint to be used for the NFT."
                    ]
                },
                {
                    "name": "sellerTokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Seller NFT token account."
                    ]
                },
                {
                    "name": "buyerTokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Buyer NFT token account."
                    ]
                },
                {
                    "name": "metadataAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Metadata account for the NFT."
                    ]
                },
                {
                    "name": "edition",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Edition account for the NFT."
                    ]
                },
                {
                    "name": "listing",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "custodyAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "feeAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Account to send fees to."
                    ]
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "maxPrice",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "buyVirtual",
            "accounts": [
                {
                    "name": "buyer",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Buyer wallet."
                    ]
                },
                {
                    "name": "marketplaceAuthority",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Marketplace authority wallet."
                    ]
                },
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "The new mint to be used for the NFT."
                    ]
                },
                {
                    "name": "buyerTokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Buyer NFT token account."
                    ]
                },
                {
                    "name": "metadataAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Metadata account for the NFT."
                    ]
                },
                {
                    "name": "edition",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Edition of the NFT to mint."
                    ]
                },
                {
                    "name": "collectionMint",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Mint of the collection NFT."
                    ]
                },
                {
                    "name": "collectionMetadataAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Metadata for the collection NFT."
                    ]
                },
                {
                    "name": "collectionEdition",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Edition of the collection NFT."
                    ]
                },
                {
                    "name": "listing",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "collectionConfig",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "feeAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Account to send fees to."
                    ]
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "itemId",
                    "type": {
                        "array": [
                            "u8",
                            32
                        ]
                    }
                },
                {
                    "name": "maxPrice",
                    "type": "u64"
                },
                {
                    "name": "metadata",
                    "type": {
                        "defined": "Metadata"
                    }
                }
            ]
        },
        {
            "name": "custody",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "User wallet."
                    ]
                },
                {
                    "name": "marketplaceAuthority",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Marketplace authority wallet."
                    ]
                },
                {
                    "name": "tokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "User's token account of the mint to custody."
                    ]
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Mint to be custodied"
                    ]
                },
                {
                    "name": "edition",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Edition of the NFT to custody."
                    ]
                },
                {
                    "name": "custodyAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "listing",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "itemId",
                    "type": {
                        "array": [
                            "u8",
                            32
                        ]
                    }
                }
            ]
        },
        {
            "name": "uncustody",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "User wallet."
                    ]
                },
                {
                    "name": "marketplaceAuthority",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Marketplace authority wallet."
                    ]
                },
                {
                    "name": "tokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "User's token account of the mint to uncustody."
                    ]
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Mint to be uncustodied"
                    ]
                },
                {
                    "name": "edition",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Edition of the NFT to uncustody."
                    ]
                },
                {
                    "name": "custodyAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "listing",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "takeOwnership",
            "accounts": [
                {
                    "name": "marketplaceAuthority",
                    "isMut": true,
                    "isSigner": true,
                    "docs": [
                        "Marketplace authority wallet."
                    ]
                },
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "User wallet with authority over the custodial mint."
                    ]
                },
                {
                    "name": "tokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "User's token account of the custodial mint."
                    ]
                },
                {
                    "name": "marketplaceAuthorityTokenAccount",
                    "isMut": true,
                    "isSigner": false,
                    "docs": [
                        "Marketplace authority's token account of the custodied mint."
                    ]
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Mint custodied"
                    ]
                },
                {
                    "name": "edition",
                    "isMut": false,
                    "isSigner": false,
                    "docs": [
                        "Edition of the custodied mint."
                    ]
                },
                {
                    "name": "custodyAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "listing",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "collectionConfig",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "bump",
                        "type": {
                            "array": [
                                "u8",
                                1
                            ]
                        }
                    },
                    {
                        "name": "version",
                        "type": "u8"
                    },
                    {
                        "name": "marketplaceAuthority",
                        "docs": [
                            "Pubkey of the marketplace authority's wallet."
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "collectionMint",
                        "docs": [
                            "The verified collection to add newly minted items to."
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "sellerFeeBasisPoints",
                        "docs": [
                            "Royalty bps. Inserted into newly minted metadata."
                        ],
                        "type": "u16"
                    },
                    {
                        "name": "symbol",
                        "docs": [
                            "Max 16 chars for symbol. Inserted into newly minted metadata."
                        ],
                        "type": "string"
                    }
                ]
            }
        },
        {
            "name": "custodyAccount",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "bump",
                        "type": {
                            "array": [
                                "u8",
                                1
                            ]
                        }
                    },
                    {
                        "name": "version",
                        "type": "u8"
                    },
                    {
                        "name": "marketplaceAuthority",
                        "docs": [
                            "Pubkey of the marketplace authority's wallet"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "owner",
                        "docs": [
                            "Pubkey of the user's wallet"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "mint",
                        "docs": [
                            "Pubkey of the mint being custodied"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "itemId",
                        "docs": [
                            "A unique ID for the virtual item matching the mint"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "isListed",
                        "docs": [
                            "True if the mint is listed for sale"
                        ],
                        "type": "bool"
                    }
                ]
            }
        },
        {
            "name": "listing",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "bump",
                        "type": {
                            "array": [
                                "u8",
                                1
                            ]
                        }
                    },
                    {
                        "name": "version",
                        "type": "u8"
                    },
                    {
                        "name": "marketplaceAuthority",
                        "docs": [
                            "Pubkey of the marketplace authority's wallet"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "seller",
                        "docs": [
                            "Pubkey of the seller's wallet"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "itemId",
                        "docs": [
                            "Set to bytes of NFT mint if listing is for NFT, otherwise a unique ID for the virtual item"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "isVirtual",
                        "docs": [
                            "True if the listing is for a virtual item, false if it is for an NFT"
                        ],
                        "type": "bool"
                    },
                    {
                        "name": "currencyMint",
                        "docs": [
                            "Currency to accept for payment"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "collectionConfig",
                        "docs": [
                            "Collection config for the item"
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "price",
                        "docs": [
                            "Price of the item"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "expiry",
                        "docs": [
                            "Unix timestamp of when the listing expires"
                        ],
                        "type": "i64"
                    },
                    {
                        "name": "feeConfig",
                        "docs": [
                            "Fee config for the listing"
                        ],
                        "type": {
                            "defined": "FeeConfig"
                        }
                    }
                ]
            }
        },
        {
            "name": "marketplaceConfig",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "bump",
                        "type": {
                            "array": [
                                "u8",
                                1
                            ]
                        }
                    },
                    {
                        "name": "version",
                        "type": "u8"
                    },
                    {
                        "name": "marketplaceAuthority",
                        "docs": [
                            "Pubkey of the marketplace authority's wallet."
                        ],
                        "type": "publicKey"
                    },
                    {
                        "name": "feeConfig",
                        "docs": [
                            "Royalty bps. Inserted into newly minted metadata."
                        ],
                        "type": {
                            "defined": "FeeConfig"
                        }
                    }
                ]
            }
        }
    ],
    "types": [
        {
            "name": "CollectionConfigArgs",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "collectionMint",
                        "type": "publicKey"
                    },
                    {
                        "name": "sellerFeeBasisPoints",
                        "type": "u16"
                    },
                    {
                        "name": "symbol",
                        "type": "string"
                    }
                ]
            }
        },
        {
            "name": "MarketplaceConfigArgs",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "feeConfig",
                        "type": {
                            "defined": "FeeConfig"
                        }
                    }
                ]
            }
        },
        {
            "name": "FeeConfig",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "feeAccount",
                        "type": "publicKey"
                    },
                    {
                        "name": "bps",
                        "type": "u16"
                    }
                ]
            }
        },
        {
            "name": "Metadata",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "uri",
                        "type": "string"
                    }
                ]
            }
        }
    ],
    "events": [
        {
            "name": "Buy",
            "fields": [
                {
                    "name": "itemId",
                    "type": {
                        "array": [
                            "u8",
                            32
                        ]
                    },
                    "index": false
                },
                {
                    "name": "mint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "price",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "seller",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "buyer",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "isVirtual",
                    "type": "bool",
                    "index": false
                },
                {
                    "name": "currencyMint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "marketplaceAuthority",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "feeConfig",
                    "type": {
                        "defined": "FeeConfig"
                    },
                    "index": false
                }
            ]
        },
        {
            "name": "Custody",
            "fields": [
                {
                    "name": "marketplaceAuthority",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "owner",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "mint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "itemId",
                    "type": {
                        "array": [
                            "u8",
                            32
                        ]
                    },
                    "index": false
                }
            ]
        },
        {
            "name": "Delist",
            "fields": [
                {
                    "name": "itemId",
                    "type": {
                        "array": [
                            "u8",
                            32
                        ]
                    },
                    "index": false
                },
                {
                    "name": "seller",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "marketplaceAuthority",
                    "type": "publicKey",
                    "index": false
                }
            ]
        },
        {
            "name": "List",
            "fields": [
                {
                    "name": "itemId",
                    "type": {
                        "array": [
                            "u8",
                            32
                        ]
                    },
                    "index": false
                },
                {
                    "name": "price",
                    "type": "u64",
                    "index": false
                },
                {
                    "name": "expiry",
                    "type": "i64",
                    "index": false
                },
                {
                    "name": "seller",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "isVirtual",
                    "type": "bool",
                    "index": false
                },
                {
                    "name": "currencyMint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "collectionMint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "marketplaceAuthority",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "feeConfig",
                    "type": {
                        "defined": "FeeConfig"
                    },
                    "index": false
                }
            ]
        },
        {
            "name": "Uncustody",
            "fields": [
                {
                    "name": "marketplaceAuthority",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "owner",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "mint",
                    "type": "publicKey",
                    "index": false
                },
                {
                    "name": "itemId",
                    "type": {
                        "array": [
                            "u8",
                            32
                        ]
                    },
                    "index": false
                }
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "BumpSeedNotInHashMap",
            "msg": "Bump seed not in hash map"
        },
        {
            "code": 6001,
            "name": "InvalidExpiry",
            "msg": "Invalid expiry"
        },
        {
            "code": 6002,
            "name": "NotVirtual",
            "msg": "Not virtual"
        },
        {
            "code": 6003,
            "name": "ListingExpired",
            "msg": "Listing expired"
        },
        {
            "code": 6004,
            "name": "MaxPriceExceeded",
            "msg": "Max price exceeded"
        },
        {
            "code": 6005,
            "name": "InvalidListingAuthority",
            "msg": "Invalid listing authority"
        },
        {
            "code": 6006,
            "name": "OverflowError",
            "msg": "Overflow error"
        },
        {
            "code": 6007,
            "name": "InvalidFeeAccount",
            "msg": "Invalid fee account"
        },
        {
            "code": 6008,
            "name": "IsVirtual",
            "msg": "Item is virtual"
        },
        {
            "code": 6009,
            "name": "InvalidMint",
            "msg": "Invalid mint"
        },
        {
            "code": 6010,
            "name": "NftIsListed",
            "msg": "Nft is listed"
        },
        {
            "code": 6011,
            "name": "InvalidCustodyAccount",
            "msg": "Invalid custody account"
        },
        {
            "code": 6012,
            "name": "InvalidListingAccount",
            "msg": "Invalid listing account"
        },
        {
            "code": 6013,
            "name": "InvalidSeller",
            "msg": "Invalid seller"
        },
        {
            "code": 6014,
            "name": "InvalidPrice",
            "msg": "Invalid price"
        }
    ]
};
//# sourceMappingURL=carbon.js.map