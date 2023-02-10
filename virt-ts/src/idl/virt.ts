export type Virt = {
  "version": "0.1.0",
  "name": "virt",
  "instructions": [
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
    }
  ],
  "accounts": [
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
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "currencyMint",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "expiry",
            "type": "i64"
          },
          {
            "name": "feeSchedule",
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
    }
  ]
};

export const IDL: Virt = {
  "version": "0.1.0",
  "name": "virt",
  "instructions": [
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
    }
  ],
  "accounts": [
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
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "currencyMint",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "expiry",
            "type": "i64"
          },
          {
            "name": "feeSchedule",
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
    }
  ]
};
