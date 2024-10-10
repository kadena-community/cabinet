import { BaseChainInfo, CHAIN_INFO } from '../../constants/chainInfo';
import { RequestArguments } from '../types';

interface ZelcoreKadenaProvider {
  isKadena?: boolean;
  request(args: RequestArguments): Promise<unknown>;
  chainInfo: BaseChainInfo;
  //on(eventName: string | symbol, listener: (...args: any[]) => void): this;
}

export default detectKadenaProvider;

function detectKadenaProvider<T = ZelcoreKadenaProvider>({ silent = false, timeout = 3000 } = {}): Promise<T | null> {
  _validateInputs();

  const provider: ZelcoreKadenaProvider = {
    isKadena: true,
    request: async () => undefined,
    chainInfo: process.env.NEXT_PUBLIC_KADENA_NETWORK_ID ? CHAIN_INFO[process.env.NEXT_PUBLIC_KADENA_NETWORK_ID] : CHAIN_INFO['development'],
  };

  return new Promise((resolve) => {
    resolve(provider as unknown as T);
  });

  function _validateInputs() {
    if (typeof silent !== 'boolean') {
      throw new Error(`@eckoWallet/provider: Expected option 'silent' to be a boolean.`);
    }
    if (typeof timeout !== 'number') {
      throw new Error(`@eckoWallet/provider: Expected option 'timeout' to be a number.`);
    }
  }
}
