export const transferTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested transfer:
- Chain to execute on: Must be one of ["bscTestnet", ...] (like in viem/chains)
- Amount to transfer: Must be a string representing the amount in BNB (only number without coin symbol, e.g., "0.1")
- Recipient address: Must be a valid Ethereum address starting with "0x"
- Token symbol or address (if not native token): Optional, leave as null for ETH transfers

Respond with a JSON markdown block containing only the extracted values. All fields except 'token' are required:

\`\`\`json
{
    "fromChain": SUPPORTED_CHAINS,
    "amount": string,
    "toAddress": string,
    "token": string | null
}
\`\`\`
`;

export const bridgeTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested token bridge:
- Token symbol or address to bridge
- Source chain
- Destination chain
- Amount to bridge
- Destination address (if specified)

Respond with a JSON markdown block containing only the extracted values:

\`\`\`json
{
    "token": string | null,
    "fromChain": "ethereum" | "base" | "sepolia" | "bsc" | "arbitrum" | "avalanche" | "polygon" | "optimism" | "cronos" | "gnosis" | "fantom" | "klaytn" | "celo" | "moonbeam" | "aurora" | "harmonyOne" | "moonriver" | "arbitrumNova" | "mantle" | "linea" | "scroll" | "filecoin" | "taiko" | "zksync" | "canto" | null,
    "toChain": "ethereum" | "base" | "sepolia" | "bsc" | "arbitrum" | "avalanche" | "polygon" | "optimism" | "cronos" | "gnosis" | "fantom" | "klaytn" | "celo" | "moonbeam" | "aurora" | "harmonyOne" | "moonriver" | "arbitrumNova" | "mantle" | "linea" | "scroll" | "filecoin" | "taiko" | "zksync" | "canto" | null,
    "amount": string | null,
    "toAddress": string | null
}
\`\`\`
`;

export const swapTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested token swap:
- Input token symbol or address (the token being sold)
- Output token symbol or address (the token being bought)
- Amount to swap
- Chain to execute on

Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined:

\`\`\`json
{
    "inputToken": string | null,
    "outputToken": string | null,
    "amount": string | null,
    "chain": "ethereum" | "base" | "sepolia" | "bsc" | "arbitrum" | "avalanche" | "polygon" | "optimism" | "cronos" | "gnosis" | "fantom" | "klaytn" | "celo" | "moonbeam" | "aurora" | "harmonyOne" | "moonriver" | "arbitrumNova" | "mantle" | "linea" | "scroll" | "filecoin" | "taiko" | "zksync" | "canto" | null,
    "slippage": number | null
}
\`\`\`
`;

export const deployTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested token deployment:
- Token Name: The name of the token being deployed
- Token Symbol: The symbol for the token being deployed
- Initial Supply: The initial supply of the token (must be a string representing the amount)
- Chain to deploy on: Must be one of ["ethereum", "bsc", "polygon", "arbitrum", "avalanche", "optimism", "fantom", "gnosis", "klaytn", "celo", "moonbeam", "aurora", "harmonyOne", "moonriver", "arbitrumNova", "mantle", "linea", "scroll", "filecoin", "taiko", "zksync", "canto"]

Respond with a JSON markdown block containing only the extracted values:

\`\`\`json
{
    "tokenName": string,
    "tokenSymbol": string,
    "initialSupply": string,
    "decimals": number,
    "chain": "ethereum" | "bscTestnet" | "polygon" | "arbitrum" | "avalanche" | "optimism" | "fantom" | "gnosis" | "klaytn" | "celo" | "moonbeam" | "aurora" | "harmonyOne" | "moonriver" | "arbitrumNova" | "mantle" | "linea" | "scroll" | "filecoin" | "taiko" | "zksync" | "canto"
}
\`\`\`
`;

