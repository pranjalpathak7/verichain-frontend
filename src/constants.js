// This is the deployed contract address
export const contractAddress = "0x05ea136E2402FF0db77d24d0D07f60a6C0AECc94";

// This is the ABI from verichain-project/artifacts/contracts/AcademicCredentialLedger.sol/AcademicCredentialLedger.json
export const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "student",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "documentHash",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "credentialType",
          "type": "string"
        }
      ],
      "name": "CredentialIssued",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "student",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "documentHash",
          "type": "string"
        }
      ],
      "name": "CredentialRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "student",
          "type": "address"
        }
      ],
      "name": "getCredentialsForStudent",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "documentHash",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "credentialType",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "metadataCid",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "issueDate",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "active",
              "type": "bool"
            }
          ],
          "internalType": "struct AcademicCredentialLedger.Credential[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyCredentials",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "documentHash",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "credentialType",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "metadataCid",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "issueDate",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "active",
              "type": "bool"
            }
          ],
          "internalType": "struct AcademicCredentialLedger.Credential[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "isHashVerified",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "student",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "documentHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "credentialType",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "metadataCid",
          "type": "string"
        }
      ],
      "name": "issueCredential",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "student",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "documentHash",
          "type": "string"
        }
      ],
      "name": "revokeCredential",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "studentCredentials",
      "outputs": [
        {
          "internalType": "string",
          "name": "documentHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "credentialType",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "metadataCid",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "issueDate",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "active",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "documentHash",
          "type": "string"
        }
      ],
      "name": "verifyDocument",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
];