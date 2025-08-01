import { BaseChainInfo, KADENA_CHAIN_ID } from "../../constants/chainInfo";
import {
  checkVerifiedAccount,
  PactCommandToSign,
  PactSignedTx,
} from "../../utils/kadenaHelper";
import { Actions, Connector, Provider } from "../types";
import detectKadenaProvider from "./provider";

type ChainweaverProvider = Provider & {
  isKadena?: boolean;
  isConnected?: () => boolean;
  chainInfo: BaseChainInfo;
  providers?: ChainweaverProvider[];
};

export class NoChainweaverError extends Error {
  public constructor() {
    super("Chainweaver not installed");
    this.name = NoChainweaverError.name;
    Object.setPrototypeOf(this, NoChainweaverError.prototype);
  }
}

/**
 * @param options - Options to pass to `@Chainweaver/detect-provider`
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface ChainweaverConstructorArgs {
  actions: Actions;
  options?: Parameters<typeof detectKadenaProvider>[0];
  onError?: (error: Error) => void;
}

export class Chainweaver extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: ChainweaverProvider;

  private readonly options?: Parameters<typeof detectKadenaProvider>[0];
  private eagerConnection?: Promise<void>;

  constructor({ actions, options, onError }: ChainweaverConstructorArgs) {
    super(actions, onError);
    this.options = options;
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return;

    return (this.eagerConnection = import("./provider").then(async (m) => {
      const provider = await m.default(this.options);
      if (provider) {
        this.provider = provider as ChainweaverProvider;

        if (this.provider.providers?.length) {
          this.provider =
            this.provider.providers.find((p) => p.isKadena) ??
            this.provider.providers[0];
        }
      }
    }));
  }

  public async signTx(command: PactCommandToSign): Promise<PactSignedTx> {
  // Map capabilities into the form the quicksign endpoint expects
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
    nonce: command.nonce ?? "cabinet-chainweaver-quicksign",
  };

  const payload = {
    cmdSigDatas: [
      {
        cmd: JSON.stringify(properCmdPayload),
        sigs: [{ pubKey: command.signingPubKey, sig: null }],
      },
    ],
  };

  try {
    const response = await fetch("http://127.0.0.1:9467/v1/quicksign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Attempt to parse JSON—even on error statuses, some endpoints return JSON errors
    let body: any;
    try {
      body = await response.json();
    } catch (jsonErr) {
      console.error(JSON.stringify(jsonErr))
      throw new Error(
      "Could not sign with chainweaver"
      );
    }

    if (!response.ok) {
      // The endpoint returned a non-2xx code
      const serverError =
        body.error || body.message || JSON.stringify(body, null, 2);
      return {
        status: "failure",
        signedCmd: null,
        errors: `Quicksign failed: ${serverError}`,
      };
    }

    // Validate shape of successful response
    if (
      !Array.isArray(body.responses) ||
      body.responses.length === 0 ||
      !body.responses[0].outcome ||
      !body.responses[0].commandSigData
    ) {
      throw new Error("Unexpected response format from quicksign endpoint");
    }

    const first = body.responses[0];
    return {
      status: "success",
      errors: null,
      signedCmd: {
        cmd: first.commandSigData.cmd,
        hash: first.outcome.hash,
        sigs: first.commandSigData.sigs,
      },
    };
  } catch (err: any) {
    // Network failure, timeout, or thrown above
    const msg =
      err instanceof Error ? err.message : String(err) || "Unknown error";
    return {
      status: "failure",
      signedCmd: null,
      errors: `Error signing transaction: ${msg}`,
    };
  }
  }


  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation();
    try {
      await this.isomorphicInitialize();
      if (!this.provider) return cancelActivation();
      this.actions.update({
        networkId: this.provider.chainInfo.id,
      });
    } catch (error) {
      console.debug("Chainweaver: Could not connect eagerly", error);
      this.actions.resetState();
      cancelActivation();
    }
  }

  /**
   * Initiates a connection.
   *
   * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
   * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
   * to the chain, if one of two conditions is met: either they already have it added in their extension, or the
   * argument is of type AddEthereumChainParameter, in which case the user will be prompted to add the chain with the
   * specified parameters first, before being prompted to switch.
   */
  public async activate(): Promise<void> {
    let cancelActivation: () => void = () => {};
    if (!this.provider?.isConnected?.())
      cancelActivation = this.actions.startActivation();
    try {
      await this.isomorphicInitialize();
      this.actions.update({
        networkId: this.provider?.chainInfo.id!,
      });
    } catch (err) {
      cancelActivation?.();
      throw err;
    }
  }

  public async onSelectAccount(account: string): Promise<void> {
    try {
      const { status, message, data } = await checkVerifiedAccount(account);

      if (status === "success" && data) {
        this.actions.update({
          account: {
            account: data.account,
            balance: data.balance,
            chainId: KADENA_CHAIN_ID,
            publicKey: data.guard.keys[0],
          },
        });
      } else {
        this.actions.update({
          account: {
            account: account,
            balance: 0,
            chainId: KADENA_CHAIN_ID,
          },
        });
      }
    } catch (error) {
      console.debug("Chainweaver: Could not connect", error);
      this.actions.resetState();
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
