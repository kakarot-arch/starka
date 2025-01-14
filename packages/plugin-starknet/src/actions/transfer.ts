// TODO: Implement this for Starknet.
// It should just transfer tokens from the agent's wallet to the recipient.

import {
    type Action,
    ActionExample,
    composeContext,
    Content,
    elizaLogger,
    generateObjectDeprecated,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@ai16z/eliza";
import { getStarknetAccount } from "../utils";
import { ERC20Token } from "../utils/ERC20Token";
import { validateStarknetConfig } from "../environment";
import { getAddressFromName, isStarkDomain } from "../utils/starknetId";

export interface TransferContent extends Content {
    tokenAddress: string;
    recipient?: string;
    // starkName?: string;
    amount: string | number;
}

export function isTransferContent(
    content: TransferContent
): content is TransferContent {
    // Validate types
    const validTypes =
        typeof content.tokenAddress === "string" &&
        (typeof content.recipient === "string") &&
        (typeof content.amount === "string" ||
            typeof content.amount === "number");
    if (!validTypes) {
        return false;
    }

    // Validate tokenAddress (must be 32-bytes long with 0x prefix)
    const validTokenAddress =
        content.tokenAddress.startsWith("0x") &&
        content.tokenAddress.length === 66;
    if (!validTokenAddress) {
        return false;
    }

    // Additional checks based on whether recipient or starkName is defined
    if (content.recipient) {
        // Validate recipient address (must be 32-bytes long with 0x prefix)
        const validRecipient =
            content.recipient.startsWith("0x") &&
            content.recipient.length === 66;
        if (!validRecipient) {
            return false;
        }
    }
    // } else if (content.starkName) {
    //     // .stark name validation
    //     const validStarkName = isStarkDomain(content.starkName);
    //     if (!validStarkName) {
    //         return false;
    //     }
    // }

    return true;
}

const transferTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

For the amount to send, use a value from 0.0001 - 100. Determine this based on your judgement of the recipient.

these are known addresses, if you get asked about them, use these:
- BTC/btc: 0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac
- ETH/eth: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7
- STRK/strk: 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
- LORDS/lords: 0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49

Example response:
\`\`\`json
{
    "tokenAddress": "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    "recipient": "0x008AD72dbC9e1d5feBdd8786F7D3C3e8B5dC3DaaD28cfaE0D8A055BB9463636C",
    "amount": "1"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested token transfer:
- Token contract address
- Recipient wallet address
- Amount to transfer


Respond with a JSON markdown block containing only the extracted values.`;

export default {
    name: "SEND_TOKEN",
    similes: [
        "TRANSFER_TOKEN_ON_STARKNET",
        "TRANSFER_TOKENS_ON_STARKNET",
        "SEND_TOKENS_ON_STARKNET",
        "SEND_ETH_ON_STARKNET",
        "PAY_ON_STARKNET",
    ],
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        await validateStarknetConfig(runtime);
        return true;
    },
    description:
        "MUST use this action if the user requests send a token or transfer a token, the request might be varied, but it will always be a token transfer. If the user requests a transfer of strk, use this action.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.log("Starting SEND_TOKEN handler...");

        // Initialize or update state
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        // Compose transfer context
        const transferContext = composeContext({
            state,
            template: transferTemplate,
        });

        // Generate transfer content
        const content = await generateObjectDeprecated({
            runtime,
            context: transferContext,
            modelClass: ModelClass.MEDIUM,
        });
        console.log("🚀 ~ content:", content)

        elizaLogger.debug("Transfer content:", content);
        console.log("🚀 ~ eliza content:", elizaLogger.debug("Transfer content:", content));


        // Validate transfer content
        // if (!isTransferContent(content)) {
        //     elizaLogger.error("Invalid content for TRANSFER_TOKEN action.");
        //     if (callback) {
        //         callback({
        //             text: "Not enough information to transfer tokens. Please respond with token address, recipient address or stark name, and amount.",
        //             content: { error: "Invalid transfer content" },
        //         });
        //     }
        //     return false;
        // }

        try {
            const account = getStarknetAccount(runtime);
            console.log("🚀 ~ account:", account)
            const erc20Token = new ERC20Token(content.tokenAddress, account);
            console.log("🚀 ~ erc20Token:", erc20Token)
            const decimals = await erc20Token.decimals();
            console.log("🚀 ~ decimals:", decimals)
            // Convert decimal amount to integer before converting to BigInt
            const amountInteger = Math.floor(
                Number(content.amount) * Math.pow(10, Number(decimals))
            );
            console.log("🚀 ~ amountInteger:", amountInteger)
            const amountWei = BigInt(amountInteger.toString());
            console.log("🚀 ~ amountWei:", amountWei)
            const recipient = content.recipient;
            console.log("🚀 ~ recipient:", recipient)
            const transferCall = erc20Token.transferCall(recipient, amountWei);
            console.log("🚀 ~ transferCall:", transferCall)

            elizaLogger.success(
                "Transferring",
                amountWei,
                "of",
                content.tokenAddress,
                "to",
                recipient
            );

            const tx = await account.execute(transferCall);

            elizaLogger.success(
                "Transfer completed successfully! tx: " + tx.transaction_hash
            );
            if (callback) {
                callback({
                    text:
                        "Transfer completed successfully! tx: " +
                        tx.transaction_hash,
                    content: {},
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error during token transfer:", error);
            if (callback) {
                callback({
                    text: `Error transferring tokens: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Send 0.00001 ETH to 0x008AD72dbC9e1d5feBdd8786F7D3C3e8B5dC3DaaD28cfaE0D8A055BB9463636C",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll transfer 0.00001 ETH to that address right away. Let me process that for you.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Send 0.00001 ETH to domain.stark",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll transfer 0.00001 ETH to domain.stark at address 0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49 right away. Let me process that for you.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you transfer 1 STRK tokens to 0x008AD72dbC9e1d5feBdd8786F7D3C3e8B5dC3DaaD28cfaE0D8A055BB9463636C?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Executing transfer of 1 STRK tokens to the specified address. One moment please.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you transfer 50 LORDS tokens to domain.stark?",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Executing transfer of 50 LORDS tokens to domain.stark at address 0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49. One moment please.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Please send 0.5 BTC to 0x008AD72dbC9e1d5feBdd8786F7D3C3e8B5dC3DaaD28cfaE0D8A055BB9463636C",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Got it, initiating transfer of 0.5 BTC to the provided address. I'll confirm once it's complete.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Please send 0.5 BTC to domain.stark",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Got it, initiating transfer of 0.5 BTC to domain.stark at address 0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac. I'll confirm once it's complete.",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
