import { IAgentRuntime, Client } from '@ai16z/eliza';
import { EventEmitter } from 'events';

declare class SlackClient extends EventEmitter {
    private client;
    private runtime;
    private server;
    private messageManager;
    private botUserId;
    private character;
    private signingSecret;
    constructor(runtime: IAgentRuntime);
    private handleEvent;
    private verifyPermissions;
    start(): Promise<void>;
    stop(): Promise<void>;
}
declare const SlackClientInterface: Client;

export { SlackClient, SlackClientInterface, SlackClientInterface as default };
