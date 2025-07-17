import { KADENA_NETWORK_ID } from "../../constants/chainInfo";
import {
  checkVerifiedAccount,
  PactCommandToSign,
  PactSignedTx,
} from "../../utils/kadenaHelper";
import type {IQuicksignResponse, IQuicksignResponseOutcomes} from "@kadena/client"
import { Actions, Connector, Provider } from "../types";
import detectSnapProvider, { SnapProvider } from "./provider";

export class NoSnapError extends Error {
  public constructor() {
    super("MetaMask Snap not installed");
    this.name = NoSnapError.name;
    Object.setPrototypeOf(this, NoSnapError.prototype);
  }
}

export interface SnakConstructorArgs {
  actions: Actions;
  onError?: (error: Error) => void;
}

const defaultSnapOrigin = 'local:http://localhost:8080'// 'npm:@mindsend/kadena-snap';

// Type guard to check if response has responses array (success case)
function hasResponses(resp: any): resp is { responses: any[] } {
  return resp && typeof resp === 'object' && 'responses' in resp && Array.isArray(resp.responses);
}

export class Snak extends Connector {
  public provider?: SnapProvider;
  
  private eagerConnection?: Promise<void>;

  constructor({ actions, onError }: SnakConstructorArgs) {
    super(actions, onError);
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return;

    return (this.eagerConnection = import("./provider").then(async (m) => {
      const provider = await m.default();
      if (provider) {
        this.provider = provider as SnapProvider;
      }
    }));
  }

  private async installSnap(): Promise<boolean> {
    if (!this.provider) return false;

    try {
      await this.provider.request({
        method: 'wallet_requestSnaps',
        params: {
          [defaultSnapOrigin]: {},
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to install snap:', error);
      return false;
    }
  }

  private async isSnapInstalled(): Promise<boolean> {
    if (!this.provider) return false;

    try {
      const snaps = await this.provider.request({
        method: 'wallet_getSnaps',
      });
      return Boolean(snaps[defaultSnapOrigin]);
    } catch (error) {
      console.error('Error checking snap installation:', error);
      return false;
    }
  }

  private async checkConnection(): Promise<boolean> {
    if (!this.provider) return false;

    try {
      const isConnected = await this.provider.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: defaultSnapOrigin,
          request: { method: 'kda_checkConnection' },
        },
      });
      return isConnected !== undefined && isConnected !== null;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  }

  private async getAccount(): Promise<{
    account: string;
    publicKey: string;
    chainId: string;
  } | null> {
    if (!this.provider) return null;

    try {
      const accounts = await this.provider.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: 'kda_getAccounts',
          },
        },
      }) as Array<{
        id: string;
        address: string;
        publicKey: string;
        name: string;
        index: number;
      }>;

      if (!accounts || accounts.length === 0) {
        return null;
      }

      const account = accounts[0];
      const response = {
        account: account.address,
        publicKey: account.publicKey,
        chainId: '1' // Default chain ID
      };

      return response;
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }

  public async signTx(command: PactCommandToSign): Promise<PactSignedTx> {
    if (!this.provider) {
      return {
        status: "failure",
        signedCmd: null,
        errors: "Provider not available",
      };
    }

     const clist = (command.caps || []).map(item =>
    item.cap ? { name: item.cap.name, args: item.cap.args } : item
  );
  // Build the properly formatted Pact command payload.

  const properCmdPayload = {
    networkId: command.networkId,
    payload: {
      exec: {
        code: command.code,
        data: command.envData ?? null,

      },
    },
    signers: [
      {
        pubKey: command.signingPubKey,
        clist,
      },
    ],
    meta: {
      creationTime: Math.floor(Date.now() / 1000),
      ttl: command.ttl,
      gasLimit: command.gasLimit,
      chainId: command.chainId,
      gasPrice: command.gasPrice,
      sender: command.sender,
    },
    nonce: command.nonce ?? "cabinet-snak-tx",
  };
  console.log("Snap command payload:", JSON.stringify(properCmdPayload, null, 2));
  const payload = {
    cmdSigDatas: [
      {
        cmd: JSON.stringify(properCmdPayload),
        sigs: [{ pubKey: command.signingPubKey, sig: null }],
      },

        ],
      };

      try {
      const accounts = await this.provider.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: 'kda_getAccounts',
          },
        },
      }) as Array<{
        id: string;
        address: string;
        publicKey: string;
        name: string;
        index: number;
      }>;
      console.log("Available Snap accounts:", accounts);
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available');
      }

      const account = accounts[0];
      const response = await this.provider.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: 'kda_signTransaction',
            params: {
              id: account.id,
              transaction: payload.cmdSigDatas[0].cmd,
            },
          },
        },
      });

      console.log("Snap sign response:", JSON.stringify(response, null, 2));

      // Parse response if it's a string
      let parsedResponse: any;
      try {
        if (typeof response === 'string') {
          parsedResponse = JSON.parse(response);
        } else {
          parsedResponse = response;
        }
      } catch (error) {
        return {
          status: "failure",
          signedCmd: null,
          errors: "Failed to parse response from Kadena Snap",
        };
      }

      // Validate response structure
      if (!parsedResponse || !hasResponses(parsedResponse)) {
        return {
          status: "failure",
          signedCmd: null,
          errors: "Invalid response structure from Kadena Snap",
        };
      }

      if (parsedResponse.responses.length === 0) {
        return {
          status: "failure",
          signedCmd: null,
          errors: "No responses received from Kadena Snap",
        };
      }

      const firstResponse = parsedResponse.responses[0];
      
      // Validate response has required properties
      if (!firstResponse.outcome) {
        return {
          status: "failure",
          signedCmd: firstResponse.commandSigData || null,
          errors: "No outcome provided in the response",
        };
      }

      const outcome = firstResponse.outcome;
      console.log("Sign outcome:", JSON.stringify(outcome, null, 2));

      // Handle different outcome results following WalletConnect pattern
      switch (outcome.result) {
        case "success":
          if (!firstResponse.commandSigData) {
            return {
              status: "failure",
              signedCmd: null,
              errors: "Missing command signature data in successful response",
            };
          }
          
          return {
            status: "success",
            signedCmd: {
              cmd: firstResponse.commandSigData.cmd,
              hash: outcome.hash || "",
              sigs: firstResponse.commandSigData.sigs || [{ sig: "" }],
            },
            errors: null,
          };

        case "failure":
          return {
            status: "failure",
            signedCmd: firstResponse.commandSigData || null,
            errors: outcome.msg || "Transaction signing failed",
          };

        case "noSig":
          return {
            status: "failure",
            signedCmd: firstResponse.commandSigData || null,
            errors: "No signature was provided by the user",
          };

        default:
          return {
            status: "failure",
            signedCmd: firstResponse.commandSigData || null,
            errors: `Unknown outcome result: ${outcome.result}`,
          };
      }
    } catch (error) {
      console.error("Error signing transaction:", error);
      return {
        status: "failure",
        signedCmd: null,
        errors: error instanceof Error ? error.message : "Unknown error occurred during signing",
      };
    }

    }

    public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation();
    try {
      await this.isomorphicInitialize();
      if (!this.provider) return cancelActivation();

      const isInstalled = await this.isSnapInstalled();
      if (!isInstalled) return cancelActivation();

      const isConnected = await this.checkConnection();
      if (!isConnected) return cancelActivation();

      const account = await this.getAccount();
      if (!account) return cancelActivation();

      const { data } = await checkVerifiedAccount(account.account);
      const balance = data ? data.balance : 0;

      this.actions.update({
        networkId: KADENA_NETWORK_ID,
        account: {
          account: account.account,
          publicKey: account.publicKey,
          balance: balance,
          chainId: account.chainId,
        },
      });
    } catch (error) {
      console.debug("Snap: Could not connect eagerly", error);
      this.actions.resetState();
      cancelActivation();
    }
  }

  public async activate(): Promise<void> {
    let cancelActivation: () => void = () => {};
    cancelActivation = this.actions.startActivation();

    try {
      await this.isomorphicInitialize();
      if (!this.provider) {
        throw new NoSnapError();
      }

      const isInstalled = await this.isSnapInstalled();
      if (!isInstalled) {
        const installed = await this.installSnap();
        if (!installed) {
          throw new Error("Failed to install snap");
        }
      }

      const isConnected = await this.checkConnection();
      if (!isConnected) {
        throw new Error("Snap not connected");
      }

      const account = await this.getAccount();
      if (!account) {
        throw new Error("Failed to get account");
      }

      const { data } = await checkVerifiedAccount(account.account);
      const balance = data ? data.balance : 0;

      this.actions.update({
        networkId: KADENA_NETWORK_ID,
        account: {
          account: account.account,
          publicKey: account.publicKey,
          balance: balance,
          chainId: account.chainId,
        },
      });
    } catch (err) {
      cancelActivation?.();
      throw err;
    }
  }

  public async deactivate(): Promise<void> {
    try {
      this.actions.resetState();
    } catch (err) {
      throw err;
    }
  }
}
