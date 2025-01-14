import type { IAgentRuntime, Memory, State } from "@ai16z/eliza";
import { ethers } from "ethers";
import { WalletProvider } from "../providers/wallet";
import { swapTemplate } from "../templates";
import type { SwapParams, Transaction } from "../types";
import { UniswapV3RouterABI } from "../abis/UniswapV3Router";

export { swapTemplate };

export class SwapAction {
    private provider: ethers.providers.JsonRpcProvider;
    private signer: ethers.Signer;

    constructor(private walletProvider: WalletProvider) {
        // this.provider = this.walletProvider.getProvider();
        // this.signer = this.walletProvider.getSigner();
    }

    async swap(params: SwapParams): Promise<Transaction> {
        const { fromToken, toToken, amount, chain, slippage } = params;
        const chainId = this.walletProvider.getChainConfigs(chain).id;

        const uniswapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router
        const uniswapRouter = new ethers.Contract(uniswapRouterAddress, UniswapV3RouterABI, this.signer);

        const fromAddress = await this.signer.getAddress();

        // Approve token if necessary
        const fromTokenContract = new ethers.Contract(fromToken, ["function approve(address spender, uint256 amount) public returns (bool)"], this.signer);
        const allowance = await fromTokenContract.allowance(fromAddress, uniswapRouterAddress);
        if (allowance.lt(amount)) {
            const approveTx = await fromTokenContract.approve(uniswapRouterAddress, amount);
            await approveTx.wait();
        }

        // Execute swap
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20-minute deadline
        const tx = await uniswapRouter.exactInputSingle({
            tokenIn: fromToken,
            tokenOut: toToken,
            fee: 3000, // Assuming 0.3% fee tier
            recipient: fromAddress,
            deadline: deadline,
            amountIn: amount,
            amountOutMinimum: 0, // Set to 0 for simplicity; slippage can be handled better
            sqrtPriceLimitX96: 0, // No price limit
        });

        await tx.wait();

        return {
            hash: tx.hash as `0x${string}`,
            from: fromAddress as `0x${string}`,
            to: uniswapRouterAddress,
            value: BigInt(amount),
            data: tx.data as `0x${string}`,
            chainId: chainId,
        };
    }
}

export const swapAction = {
    name: "swap",
    description: "Swap tokens on Uniswap V3",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback?: any
    ) => {
        try {
            const privateKey = runtime.getSetting(
                "EVM_PRIVATE_KEY"
            ) as `0x${string}`;
            const walletProvider = new WalletProvider(privateKey);
            const action = new SwapAction(walletProvider);
            return await action.swap(options);
        } catch (error) {
            console.error("Error in swap handler:", error.message);
            if (callback) {
                callback({ text: `Error: ${error.message}` });
            }
            return false;
        }
    },
    template: swapTemplate,
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "user",
                content: {
                    text: "Swap 1 ETH for USDC on Base",
                    action: "TOKEN_SWAP",
                },
            },
        ],
    ],
    similes: ["TOKEN_SWAP", "EXCHANGE_TOKENS", "TRADE_TOKENS"],
}; // TODO: add more examples
