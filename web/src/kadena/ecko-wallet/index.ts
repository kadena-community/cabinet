import { KADENA_NETWORK_ID } from '../../constants/chainInfo';
import { checkVerifiedAccount, PactCommandToSign, PactSignedTx } from '../../utils/kadenaHelper';
import { Actions, Connector, Provider } from '../types';
import detectKadenaProvider from './provider';

type EckoWalletProvider = Provider & {
  isKadena?: boolean;
  isConnected?: () => boolean;
  providers?: EckoWalletProvider[];
};

export class NoEckoWalletError extends Error {
  public constructor() {
    super('eckoWALLET not installed');
    this.name = NoEckoWalletError.name;
    Object.setPrototypeOf(this, NoEckoWalletError.prototype);
  }
}

/**
 * @param options - Options to pass to `@eckoWallet/detect-provider`
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface EckoWalletConstructorArgs {
  actions: Actions;
  options?: Parameters<typeof detectKadenaProvider>[0];
  onError?: (error: Error) => void;
}

export class EckoWallet extends Connector {
  /** {@inheritdoc Connector.provider} */
  public provider?: EckoWalletProvider;

  private readonly options?: Parameters<typeof detectKadenaProvider>[0];
  private eagerConnection?: Promise<void>;

  constructor({ actions, options, onError }: EckoWalletConstructorArgs) {
    super(actions, onError);
    this.options = options;
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return;

    return (this.eagerConnection = import('./provider').then(async (m) => {
      const provider = await m.default(this.options);
      if (provider) {
        this.provider = provider as EckoWalletProvider;

        if (this.provider.providers?.length) {
          this.provider = this.provider.providers.find((p) => p.isKadena) ?? this.provider.providers[0];
        }

        this.provider.on('res_accountChange', ({ result: { status, message } }: { result: { status: string; message: string } }): void => {
          if (status === 'success') {
            this.actions.resetState();
            window.location.reload();
          }
        });
      }
    }));
  }

  private async getNetworkInfo(): Promise<{
    explorer: string;
    networkId: string;
    name: string;
    url: string;
  }> {
    return this.provider?.request({
      method: 'kda_getNetwork',
    }) as Promise<{
      explorer: string;
      networkId: string;
      name: string;
      url: string;
    }>;
  }

  private async connectWallet(networkId?: string): Promise<void> {
    return this.provider?.request({
      method: 'kda_connect',
      networkId: networkId ?? KADENA_NETWORK_ID,
    }) as Promise<void>;
  }

  private async disconnect(networkId?: string): Promise<void> {
    return this.provider?.request({
      method: 'kda_disconnect',
      networkId: networkId ?? KADENA_NETWORK_ID,
    }) as Promise<void>;
  }

  private async checkStatus(networkId?: string): Promise<{
    status: string;
    message: string;
    account: { chainId: string; account: string; publicKey: string };
  }> {
    return this.provider?.request({
      method: 'kda_checkStatus',
      networkId: networkId ?? KADENA_NETWORK_ID,
    }) as Promise<{
      status: string;
      message: string;
      account: { chainId: string; account: string; publicKey: string };
    }>;
  }

  private async getAccountDetails(networkId?: string): Promise<{
    status: string;
    message: string;
    wallet: {
      chainId: string;
      account: string;
      publicKey: string;
      balance: number;
    };
  }> {
    return this.provider?.request({
      method: 'kda_requestAccount',
      networkId: networkId ?? KADENA_NETWORK_ID,
    }) as Promise<{
      status: string;
      message: string;
      wallet: {
        chainId: string;
        account: string;
        publicKey: string;
        balance: number;
      };
    }>;
  }

  public async signTx(command: PactCommandToSign): Promise<PactSignedTx> {
    const signed = (await this.provider?.request({
      method: 'kda_requestSign',
      data: {
        networkId: command.networkId,
        signingCmd: { ...command, raw: false },
      },
    })) as Promise<{
      status: string;
      message: string;
      signedCmd: {
        cmd: string;
        hash: string;
        sigs: [
          {
            sig: string;
          }
        ];
      };
    }>;

    const resp = await signed;

    if (resp.status === 'success') {
      return {
        status: resp.status,
        signedCmd: resp.signedCmd,
        errors: null,
      };
    } else {
      return {
        status: resp.status,
        signedCmd: null,
        errors: resp.message,
      };
    }
  }

  /** {@inheritdoc Connector.connectEagerly} */
  public async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation();
    try {
      await this.isomorphicInitialize();
      if (!this.provider) return cancelActivation();

      const netWorkInfo = await this.getNetworkInfo();
      await this.connectWallet();
      const { status } = await this.checkStatus();
      if (status === 'success') {
        const { wallet } = await this.getAccountDetails();
        const { data } = await checkVerifiedAccount(wallet.account);

        wallet.balance = data ? data.balance : 0;

        this.actions.update({
          networkId: netWorkInfo.networkId,
          account: wallet,
        });
      } else throw Error('Not Connected');
    } catch (error) {
      console.debug('eckoWallet: Could not connect eagerly', error);
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
    if (!this.provider?.isConnected?.()) cancelActivation = this.actions.startActivation();
    try {
      await this.isomorphicInitialize();

      const netWorkInfo = await this.getNetworkInfo();

      await this.connectWallet();

      const { status } = await this.checkStatus();

      if (status === 'success') {
        const { wallet } = await this.getAccountDetails();
        const { data } = await checkVerifiedAccount(wallet.account);

        wallet.balance = data ? data.balance : 0;

        this.actions.update({
          networkId: netWorkInfo.networkId,
          account: wallet,
        });
      } else throw Error('Not Connected');
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
}
