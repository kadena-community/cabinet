import type { EventEmitter } from 'node:events';
import type { StoreApi } from 'zustand';
import { PactCommandToSign, PactSignedTx } from '../../utils/kadenaHelper';

export type Network = {
  name: string;
  chainId: number;
  _defaultProvider?: (providers: any, options?: any) => any;
};

export type Networkish = Network | string | number;

export type AccountDetails = {
  account: string;
  balance: number;
  guard: {
    keys: string[];
    pred: string;
  };
};

export type KadenaAccount = {
  account: string;
  publicKey?: string | undefined;
  balance: number;
  chainId: string;
};

export interface KadenaReactState {
  networkId: string | undefined;
  account: KadenaAccount | undefined;
  activating: boolean;
  sharedAccounts: string[] | undefined;
}

export type KadenaReactStore = StoreApi<KadenaReactState>;

export type KadenaReactStateUpdate =
  | {
      networkId: string;
      account: KadenaAccount;
      sharedAccounts?: never;
    }
  | {
      networkId: string;
      account?: never;
      sharedAccounts: string[];
    }
  | {
      networkId?: never;
      account: KadenaAccount;
      sharedAccounts?: never;
    }
  | {
      networkId: string;
      account?: never;
      sharedAccounts?: never;
    };

export interface Actions {
  startActivation: () => () => void;
  update: (stateUpdate: KadenaReactStateUpdate) => void;
  resetState: () => void;
}

// per EIP-1193
export interface RequestArguments {
  readonly method: string;
  readonly [params: string]: unknown | object;
}

// per EIP-1193
export interface Provider extends EventEmitter {
  request(args: RequestArguments): Promise<unknown>;
}

// per EIP-1193
export interface ProviderConnectInfo {
  readonly networkId: string;
}

// per EIP-1193
export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export abstract class Connector {
  /**
   * This property must be defined while the connector is active, unless a customProvider is provided.
   */
  public provider?: Provider;

  /**
   * An optional property meant to allow ethers providers to be used directly rather than via the experimental
   * 1193 bridge. If desired, this property must be defined while the connector is active, in which case it will
   * be preferred over provider.
   */
  public customProvider?: unknown;

  protected readonly actions: Actions;

  /**
   * An optional handler which will report errors thrown from event listeners. Any errors caused from
   * user-defined behavior will be thrown inline through a Promise.
   */
  protected onError?: (error: Error) => void;

  /**
   * @param actions - Methods bound to a zustand store that tracks the state of the connector.
   * @param onError - An optional handler which will report errors thrown from event listeners.
   * Actions are used by the connector to report changes in connection status.
   */
  constructor(actions: Actions, onError?: (error: Error) => void) {
    this.actions = actions;
    this.onError = onError;
  }

  /**
   * Reset the state of the connector without otherwise interacting with the connection.
   */
  public resetState(): Promise<void> | void {
    this.actions.resetState();
  }

  /**
   * Initiate a connection.
   */
  public abstract activate(...args: unknown[]): Promise<void> | void;

  /**
   * Attempt to initiate a connection, failing silently
   */
  public connectEagerly?(...args: unknown[]): Promise<void> | void;

  /**
   * Un-initiate a connection. Only needs to be defined if a connection requires specific logic on disconnect.
   */
  public deactivate?(...args: unknown[]): Promise<void> | void;

  public onSelectAccount?(account: string): Promise<void> | void;

  public abstract signTx(command: PactCommandToSign): Promise<PactSignedTx>;
}
