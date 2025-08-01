import {
    CHAIN_INFO,
    KADENA_NETWORK_ID,
    KADENA_CHAIN_ID,
} from "@/constants/chainInfo";
import {
    checkVerifiedAccount,
    PactCommandToSign,
    PactSignedTx,
} from "../../utils/kadenaHelper";
import { Actions, Connector, Provider, KadenaAccount } from "../types";
import { WalletConnectModal } from "@walletconnect/modal";
import Client from "@walletconnect/sign-client";
import { SessionTypes } from "@walletconnect/types";
import { getSdkError } from "@walletconnect/utils";

type WalletConnectProvider = Provider & {
    connected: boolean;
    accounts: string[];
    sendCustomRequest: (args: { method: string; params?: any }) => Promise<any>;
    session?: SessionTypes.Struct;
};

export class NoWalletConnectError extends Error {
    public constructor() {
        super("WalletConnect not initialized");
        this.name = NoWalletConnectError.name;
        Object.setPrototypeOf(this, NoWalletConnectError.prototype);
    }
}

export interface WalletConnectConstructorArgs {
    actions: Actions;
    options?: { silent?: boolean; timeout?: number };
    onError?: (error: Error) => void;
}

export class WalletConnect extends Connector {
    public provider?: WalletConnectProvider;
    private readonly options: { silent?: boolean; timeout?: number };
    private modal: WalletConnectModal;
    private client?: Client;
    private eagerConnection?: Promise<void>;
    private parsedAccounts?: { kadena: string; network: string; account: string; publicKey: string; }[];

    constructor({
        actions,
        options = {},
        onError,
    }: WalletConnectConstructorArgs) {
        super(actions, onError);
        this.options = options;
        this.modal = new WalletConnectModal({
            themeVariables: {
                "--wcm-z-index": "999",
            },
            projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "",
            chains: [
                "kadena:mainnet01",
                "kadena:testnet04",
                "kadena:development",
            ],
        });
    }

    private async isomorphicInitialize(): Promise<void> {
        if (this.eagerConnection) return;

        return (this.eagerConnection = Client.init({
            relayUrl: process.env.NEXT_PUBLIC_RELAY_URL,
            projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
        }).then(async (client) => {
            this.client = client;
            this.subscribeToEvents();
            await this.checkPersistedState();
        }));
    }

    private async getNetworkInfo(): Promise<{
        explorer: string;
        networkId: string;
        name: string;
        url: string;
    }> {
        const info = CHAIN_INFO[KADENA_NETWORK_ID];
        return {
            explorer: info.explorer,
            networkId: KADENA_NETWORK_ID,
            name: info.label,
            url: info.nodeUrl,
        };
    }

    private parseAccountData(stringData: string) {
        const splitData = stringData.split(":");

        return {
            kadena: splitData[0],
            network: splitData[1],
            account: `k:${splitData[2]}`,
            publicKey: splitData[2],
        };
    }

    private async getDataFromSession(session: SessionTypes.Struct): Promise<{
        kadena: string;
        network: string;
        account: string;
        publicKey: string;
    }[]> {
        const rawAccounts = session.namespaces.kadena.accounts;
        const parsedAccounts = rawAccounts.map((raw) =>
            this.parseAccountData(raw),
        );
        
        // Filter accounts to only include those matching the current network
        const currentNetwork = KADENA_NETWORK_ID;
        const filteredAccounts = parsedAccounts.filter(acc => acc.network === currentNetwork);
        
        if (filteredAccounts.length === 0) {
            console.warn("WalletConnect: No accounts match the current network");
        }
        
        return filteredAccounts;
    }

    private async connectWallet(pairing?: { topic: string }): Promise<void> {
        if (!this.client) {
            throw new NoWalletConnectError();
        }

        const { uri, approval } = await this.client.connect({
            pairingTopic: pairing?.topic,
            requiredNamespaces: {
                kadena: {
                    methods: ["kadena_getAccounts_v1", "kadena_quicksign_v1"],
                    chains: [
                        `kadena:${process.env.NEXT_PUBLIC_KADENA_NETWORK_ID}`,
                    ],
                    events: [],
                },
            },
        });

        if (uri) {
            this.modal.openModal({ uri });
        }

        const session = await approval();
        await this.onSessionConnected(session);
        
        this.modal.closeModal();
    }

    private async disconnect(): Promise<void> {
        if (!this.client || !this.provider || !this.provider.session) {
            throw new NoWalletConnectError();
        }

        if (this.provider.connected) {
            await this.client.disconnect({
                topic: this.provider.session.topic,
                reason: getSdkError("USER_DISCONNECTED"),
            });
            this.actions.resetState();
        }
    }

    private async checkStatus(): Promise<{
        status: string;
        message: string;
        account: { chainId: string; account: string; publicKey: string };
    }> {
        const accounts = await this.provider?.sendCustomRequest({
            method: "kadena_getAccounts_v1",
        });

        console.log("Accounts:", accounts);
        if (accounts && accounts.length > 0) {
            return {
                status: "success",
                message: "Connected",
                account: accounts[0],
            };
        } else {
            return {
                status: "error",
                message: "Not connected",
                account: { chainId: "", account: "", publicKey: "" },
            };
        }
    }

    private async getAccountDetails(): Promise<{
        status: string;
        message: string;
        wallet: KadenaAccount;
    }> {
        const accounts = await this.provider?.sendCustomRequest({
            method: "kadena_getAccounts_v1",
        });
        console.log("Account details", accounts);
        if (accounts && accounts.length > 0) {
            const account = accounts[0];
            return {
                status: "success",
                message: "Account details fetched",
                wallet: {
                    chainId: account.chainId,
                    account: account.account,
                    publicKey: account.publicKey,
                    balance: 0,
                },
            };
        } else {
            return {
                status: "error",
                message: "Failed to fetch account details",
                wallet: {
                    chainId: KADENA_CHAIN_ID,
                    account: "",
                    publicKey: "",
                    balance: 0,
                },
            };
        }
    }

    public async signTx(command: PactCommandToSign): Promise<PactSignedTx> {
        if (!this.client) {
            throw new Error("WalletConnect client is not initialized");
        }
        if (!this.provider?.session) {
            throw new Error("WalletConnect session is not initialized");
        }

        // Transform the caps into the expected Pact capability format.
        // If an item has a "cap" property, extract its inner object.
        const clist = (command.caps || []).map((item) =>
            item.cap ? { name: item.cap.name, args: item.cap.args } : item,
        );

        // Build the properly formatted Pact command payload.
        const properCmdPayload = {
            networkId: command.networkId,
            payload: {
                exec: {
                    code: command.code,
                    data: command.envData || null,
                },
            },
            signers: [
                {
                    pubKey: command.signingPubKey,
                    clist, // use the mapped capabilities
                },
            ],
            meta: {
                creationTime: Math.floor(Date.now() / 1000), // required field
                ttl: command.ttl,
                gasLimit: command.gasLimit,
                chainId: command.chainId,
                gasPrice: command.gasPrice,
                sender: command.sender,
            },
            nonce: command.nonce || "cabinet-wc-quicksign",
        };

        // Log the constructed command payload.
        console.log(
            "Proper command payload:",
            JSON.stringify(properCmdPayload, null, 2),
        );

        console.log("Account data:", command.signingPubKey);

        // Build the quicksign request payload (including full JSON-RPC structure).
        const request = {
            id: 1,
            jsonrpc: "2.0",
            method: "kadena_quicksign_v1",
            params: {
                commandSigDatas: [
                    {
                        cmd: JSON.stringify(properCmdPayload),
                        sigs: [{ pubKey: command.signingPubKey, sig: null }],
                    },
                ],
            },
        };

        // Log the full request, chainId, and topic for further inspection.
        console.log("Full request:", JSON.stringify(request, null, 2));
        console.log("ChainId:", `kadena:${KADENA_NETWORK_ID}`);
        console.log("Topic:", this.provider.session.topic);

        try {
            console.log("Sending request to WalletConnect client...");
            const signed = (await this.client.request({
                topic: this.provider.session.topic,
                chainId: `kadena:${KADENA_NETWORK_ID}`,
                request,
            })) as any;

            console.log("Raw response:", JSON.stringify(signed, null, 2));

            // Try to extract an array of responses from either "results" or "responses"
            let responses: any[] | undefined;
            if (signed && typeof signed === "object") {
                if (Array.isArray(signed.results)) {
                    responses = signed.results;
                } else if (Array.isArray(signed.responses)) {
                    responses = signed.responses;
                }
            }

            if (responses && responses.length > 0) {
                const firstResponse = responses[0];
                if (!firstResponse.outcome) {
                    return {
                        status: "error",
                        signedCmd: firstResponse.commandSigData,
                        errors: "No outcome provided in the response.",
                    };
                }
                const outcome = firstResponse.outcome;
                console.log("Outcome:", JSON.stringify(outcome, null, 2));

                // Process the different outcomes
                switch (outcome.result) {
                    case "success":
                        return {
                            status: "success",
                            signedCmd: {
                                cmd: firstResponse.commandSigData.cmd,
                                hash: outcome.hash,
                                sigs: firstResponse.commandSigData.sigs,
                            },
                            errors: null,
                        };
                    case "failure":
                        return {
                            status: "error",
                            signedCmd: firstResponse.commandSigData,
                            errors: outcome.msg || "Failure during signing",
                        };
                    case "noSig":
                        return {
                            status: "error",
                            signedCmd: firstResponse.commandSigData,
                            errors: "No signature was added",
                        };
                    default:
                        return {
                            status: "error",
                            signedCmd: firstResponse.commandSigData,
                            errors: `Unknown outcome: ${outcome.result}`,
                        };
                }
            }

            return {
                status: "error",
                signedCmd: null,
                errors: "Invalid response from WalletConnect.",
            };
        } catch (error) {
            console.error("Error signing transaction:", error);
            return {
                status: "error",
                signedCmd: null,
                errors: (error as Error).message,
            };
        }
    }

    public async connectEagerly(): Promise<void> {
        const cancelActivation = this.actions.startActivation();
        try {
            await this.isomorphicInitialize();
            if (!this.provider) return cancelActivation();

            await this.connectWallet();
            const { status } = await this.checkStatus();
            if (status === "success") {
                // Connection successful - sharedAccounts are set by onSessionConnected
                if (!this.parsedAccounts || this.parsedAccounts.length === 0) {
                    throw new Error("No accounts available");
                }
            } else throw Error("Not Connected");
        } catch (error) {
            console.debug("WalletConnect: Could not connect eagerly", error);
            this.actions.resetState();
            cancelActivation();
        }
    }

    public async activate(): Promise<void> {
        let cancelActivation: () => void = () => {};
        if (!this.provider?.connected)
            cancelActivation = this.actions.startActivation();
        try {
            await this.isomorphicInitialize();

            await this.connectWallet();
            // Connection successful - sharedAccounts are set by onSessionConnected
        } catch (err) {
            cancelActivation?.();
            throw err;
        }
    }

    public async deactivate(): Promise<void> {
        try {
            await this.disconnect();
            this.actions.resetState();
        } catch (err) {
            throw err;
        }
    }

    private subscribeToEvents() {
        if (!this.client) {
            throw new NoWalletConnectError();
        }

        this.client.on("session_ping", (args) => {
            console.log("EVENT", "session_ping", args);
        });

        this.client.on("session_event", (args) => {
            console.log("EVENT", "session_event", args);
        });

        this.client.on("session_update", ({ topic, params }) => {
            console.log("EVENT", "session_update", { topic, params });
            const { namespaces } = params;
            const _session = this.client!.session.get(topic);
            const updatedSession = { ..._session, namespaces };
            this.onSessionConnected(updatedSession);
        });

        this.client.on("session_delete", () => {
            console.log("EVENT", "session_delete");
            this.actions.resetState();
        });
    }

    private async checkPersistedState() {
        if (!this.client) {
            throw new NoWalletConnectError();
        }

        const sessions = this.client.session.getAll();
        // Clear existing sessions
        for (const session of sessions) {
            // await this.client.disconnect({
            //     topic: session.topic,
            //     reason: getSdkError("USER_DISCONNECTED"),
            // });

            // this would persist them
            if (sessions.length) {
                const session = sessions[sessions.length - 1];
                await this.onSessionConnected(session);
            }
        }
    }

    private async onSessionConnected(session: SessionTypes.Struct) {
        // Parse accounts and filter by network
        this.parsedAccounts = await this.getDataFromSession(session);

        // Ensure the provider has the required properties
        const updatedProvider: any = {
            ...this.provider,
            connected: true,
            accounts: this.parsedAccounts.map(acc => acc.account),
            session: session,
            sendCustomRequest:
                this.provider?.sendCustomRequest ??
                (() => {
                    throw new Error("sendCustomRequest is not initialized");
                }),
            request:
                this.provider?.request ??
                (() => {
                    throw new Error("request is not initialized");
                }),
            addListener:
                this.provider?.addListener ??
                (() => {
                    throw new Error("addListener is not initialized");
                }),
            removeListener:
                this.provider?.removeListener ??
                (() => {
                    throw new Error("removeListener is not initialized");
                }),
        };

        this.provider = updatedProvider;

        // Set sharedAccounts to trigger account selection UI
        const sharedAccounts = this.parsedAccounts.map(acc => acc.account);
        
        // Handle edge case where no accounts match current network
        if (sharedAccounts.length === 0) {
            this.actions.update({
                networkId: KADENA_NETWORK_ID,
                sharedAccounts: [],
            });
            return;
        }
        
        // If only one account, auto-connect; otherwise set sharedAccounts for selection UI
        if (sharedAccounts.length === 1) {
            await this.onSelectAccount(sharedAccounts[0]);
        } else {
            this.actions.update({
                networkId: KADENA_NETWORK_ID,
                sharedAccounts: sharedAccounts,
            });
        }
    }

    public async onSelectAccount(account: string): Promise<void> {
        try {
            const { data } = await checkVerifiedAccount(account);
            
            // Create account object - set balance to 0 if verification fails (like EckoWallet does)
            const kadenaAccount: KadenaAccount = {
                account: account,
                balance: data ? data.balance : 0,
                chainId: KADENA_CHAIN_ID,
                publicKey: this.parsedAccounts?.find(acc => acc.account === account)?.publicKey || "",
            };
            
            this.actions.update({
                networkId: KADENA_NETWORK_ID,
                account: kadenaAccount,
                sharedAccounts: undefined, // Clear shared accounts after selection
            });

            // Close the WalletConnect modal since account selection is complete
            this.modal.closeModal();
        } catch (error) {
            console.error("WalletConnect: Error selecting account:", error);
            
            // Still try to connect with 0 balance if there's an error
            const kadenaAccount: KadenaAccount = {
                account: account,
                balance: 0,
                chainId: KADENA_CHAIN_ID,
                publicKey: this.parsedAccounts?.find(acc => acc.account === account)?.publicKey || "",
            };
            
            this.actions.update({
                networkId: KADENA_NETWORK_ID,
                account: kadenaAccount,
                sharedAccounts: undefined,
            });
            
            this.modal.closeModal();
        }
    }
}
