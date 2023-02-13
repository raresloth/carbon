export type Virt = {
  "version": "0.1.0",
  "name": "virt",
  "instructions": [
    {
      "name": "initCollectionConfig",
      "accounts": [
        {
          "name": "authority",
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
          "name": "authority",
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
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Seller wallet."
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
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Marketplace authority wallet."
          ]
        },
        {
          "name": "collectionAuthority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Collection authority for the NFT."
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
          "name": "mintAuthority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Mint authority for the NFT."
          ]
        },
        {
          "name": "collectionConfig",
          "isMut": true,
          "isSigner": false
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
            "name": "authority",
            "docs": [
              "Pubkey of the marketplace authority's wallet"
            ],
            "type": "publicKey"
          },
          {
            "name": "collectionMint",
            "docs": [
              "The verified collection key"
            ],
            "type": "publicKey"
          },
          {
            "name": "mintAuthority",
            "docs": [
              "Pubkey of the mint authority to be used for newly minted items for this collection"
            ],
            "type": "publicKey"
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          },
          {
            "name": "symbol",
            "docs": [
              "Max 16 chars for symbol"
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
            "name": "authority",
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
            "name": "feeSchedule",
            "docs": [
              "Fee schedule for the listing"
            ],
            "type": {
              "defined": "FeeSchedule"
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
            "name": "mintAuthority",
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
      "name": "FeeSchedule",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "beneficiary",
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
    }
  ]
};

export const IDL: Virt = {
  "version": "0.1.0",
  "name": "virt",
  "instructions": [
    {
      "name": "initCollectionConfig",
      "accounts": [
        {
          "name": "authority",
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
          "name": "authority",
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
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Seller wallet."
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
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Marketplace authority wallet."
          ]
        },
        {
          "name": "collectionAuthority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Collection authority for the NFT."
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
          "name": "mintAuthority",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Mint authority for the NFT."
          ]
        },
        {
          "name": "collectionConfig",
          "isMut": true,
          "isSigner": false
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
            "name": "authority",
            "docs": [
              "Pubkey of the marketplace authority's wallet"
            ],
            "type": "publicKey"
          },
          {
            "name": "collectionMint",
            "docs": [
              "The verified collection key"
            ],
            "type": "publicKey"
          },
          {
            "name": "mintAuthority",
            "docs": [
              "Pubkey of the mint authority to be used for newly minted items for this collection"
            ],
            "type": "publicKey"
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          },
          {
            "name": "symbol",
            "docs": [
              "Max 16 chars for symbol"
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
            "name": "authority",
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
            "name": "feeSchedule",
            "docs": [
              "Fee schedule for the listing"
            ],
            "type": {
              "defined": "FeeSchedule"
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
            "name": "mintAuthority",
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
      "name": "FeeSchedule",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "beneficiary",
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
    }
  ]
};
