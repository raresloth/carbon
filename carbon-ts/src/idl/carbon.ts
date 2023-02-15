export type Carbon = {
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
          "name": "id",
          "type": "publicKey"
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
          "name": "price",
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
          "name": "id",
          "type": "publicKey"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "metadata",
          "type": {
            "defined": "Metadata"
          }
        }
      ]
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
            "name": "collectionMint",
            "docs": [
              "The verified collection to add newly minted items to."
            ],
            "type": "publicKey"
          },
          {
            "name": "marketplaceAuthority",
            "docs": [
              "Pubkey of the marketplace authority's wallet."
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
            "name": "seller",
            "docs": [
              "Pubkey of the seller's wallet"
            ],
            "type": "publicKey"
          },
          {
            "name": "id",
            "docs": [
              "Set to mint of NFT if listing is for NFT, otherwise a unique ID for the virtual item"
            ],
            "type": "publicKey"
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
      "name": "PriceMismatch",
      "msg": "Price mismatch"
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
    }
  ]
};

export const IDL: Carbon = {
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
          "name": "id",
          "type": "publicKey"
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
          "name": "price",
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
          "name": "id",
          "type": "publicKey"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "metadata",
          "type": {
            "defined": "Metadata"
          }
        }
      ]
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
            "name": "collectionMint",
            "docs": [
              "The verified collection to add newly minted items to."
            ],
            "type": "publicKey"
          },
          {
            "name": "marketplaceAuthority",
            "docs": [
              "Pubkey of the marketplace authority's wallet."
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
            "name": "seller",
            "docs": [
              "Pubkey of the seller's wallet"
            ],
            "type": "publicKey"
          },
          {
            "name": "id",
            "docs": [
              "Set to mint of NFT if listing is for NFT, otherwise a unique ID for the virtual item"
            ],
            "type": "publicKey"
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
      "name": "PriceMismatch",
      "msg": "Price mismatch"
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
    }
  ]
};
