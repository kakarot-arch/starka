export * from "./actions/bridge";
export * from "./actions/swap";
export * from "./actions/transfer";
export * from "./providers/wallet";
export * from "./types";

import type { Plugin } from "@ai16z/eliza";
import { bridgeAction } from "./actions/bridge";
import { swapAction } from "./actions/swap";
import { transferAction } from "./actions/transfer";
import { evmWalletProvider } from "./providers/wallet";
import { deployTokenAction } from "./actions/deploytoken";

export const evmPlugin: Plugin = {
    name: "evm",
    description: "EVM blockchain integration plugin",
    providers: [evmWalletProvider],
    evaluators: [],
    services: [],
    actions: [transferAction, bridgeAction, swapAction, deployTokenAction],
};

export default evmPlugin;
