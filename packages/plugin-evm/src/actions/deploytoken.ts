import {
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@ai16z/eliza";

import { initWalletProvider, WalletProvider } from "../providers/wallet";
import type { ChainConfig } from "../types";
import { ERC20ABI, ERC20_BYTECODE } from "../abis/erc20";

export class DeployTokenAction {
    constructor(private walletProvider: WalletProvider) {}

    async deploy(params: {
        name: string;
        symbol: string;
        initialSupply: number;
    }): Promise<ChainConfig> {
        const { name, symbol, initialSupply } = params;
        const decimals = 18n;
        const totalSupply = BigInt(initialSupply) * 10n ** decimals;

        console.log(
            `Deploying token: Name - ${name}, Symbol - ${symbol}, Initial Supply - ${initialSupply} (${totalSupply} units)`
        );

        const walletClient = this.walletProvider.getWalletClient("bscTestnet");

        try {
            const hash = await walletClient.deployContract({
                abi: ERC20ABI,
                bytecode: ERC20_BYTECODE,
                args: [name, symbol, decimals, totalSupply],
                account: walletClient.account,
                chain: undefined,
            });

            const receipt = await this.walletProvider
                .getPublicClient("bscTestnet")
                .waitForTransactionReceipt({ hash });

            console.log(`Token deployed successfully at ${receipt.contractAddress}`);

            return {
                chain: walletClient.chain,
                walletClient,
                publicClient: this.walletProvider.getPublicClient("bscTestnet"),
            };
        } catch (error) {
            throw new Error(`Token deployment failed: ${error.message}`);
        }
    }
}

// const buildDeployDetails = async (
//     state: State,
//     runtime: IAgentRuntime
// ): Promise<{ name: string; symbol: string; initialSupply: number }> => {
//     const context = composeContext({
//         state,
//         template: "Create an ERC-20 token with name: NAME, symbol: SYMBOL, and supply: SUPPLY",
//     });

//     const deployDetails = (await generateObjectDeprecated({
//         runtime,
//         context,
//         modelClass: ModelClass.SMALL,
//     })) as { name: string; symbol: string; initialSupply: number };

//     if (!deployDetails.name || !deployDetails.symbol || !deployDetails.initialSupply) {
//         throw new Error("Invalid token details provided.");
//     }

//     return deployDetails;
// };

export const deployTokenAction = {
    name: "deploy_token",
    description: "Deploy a new ERC-20 token on BNB Testnet.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback?: HandlerCallback
    ) => {
        console.log("Deploy token action handler called");
        const walletProvider = initWalletProvider(runtime);
        const action = new DeployTokenAction(walletProvider);

        // const deployParams = await buildDeployDetails(state, runtime);

        try {
            const deployResp = await action.deploy(deployParams);

            if (callback) {
                callback({
                    text: `Token ${deployParams.name} (${deployParams.symbol}) deployed successfully!\nContract Address: ${deployResp.publicClient}`,
                    content: {
                        success: true,
                        name: deployParams.name,
                        symbol: deployParams.symbol,
                        initialSupply: deployParams.initialSupply,
                        contractAddress: deployResp.publicClient,
                    },
                });
            }
            return true;
        } catch (error) {
            console.error("Error during token deployment:", error);
            if (callback) {
                callback({
                    text: `Error deploying token: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: "Deploy a new token with specific name, symbol, and supply.",
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "Deploy a new token named Glitch with symbol GLH and supply 1,000,000.",
                    action: "DEPLOY_TOKEN",
                },
            },
            {
                user: "user",
                content: {
                    text: "Token Glitch (GLH) deployed successfully at address: 0x123456789abcdef",
                    action: "DEPLOY_TOKEN",
                },
            },
        ],
    ],
    similes: ["CREATE_TOKEN", "DEPLOY_NEW_TOKEN", "TOKEN_CREATION"],
};
