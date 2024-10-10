import { BaseChainInfo, CHAIN_INFO } from '../../constants/chainInfo';
import { RequestArguments } from '../types';

interface ChainweaverKadenaProvider {
  isKadena?: boolean;
  request(args: RequestArguments): Promise<unknown>;
  chainInfo: BaseChainInfo;
}

export default detectKadenaProvider;

function detectKadenaProvider<T = ChainweaverKadenaProvider>({ silent = false, timeout = 3000 } = {}): Promise<T | null> {
  _validateInputs();

  const provider: ChainweaverKadenaProvider = {
    isKadena: true,
    request: async () => undefined,
    chainInfo: process.env.NEXT_PUBLIC_KADENA_NETWORK_ID ? CHAIN_INFO[process.env.NEXT_PUBLIC_KADENA_NETWORK_ID] : CHAIN_INFO['development'],
  };

  return new Promise((resolve) => {
    resolve(provider as unknown as T);
  });

  function _validateInputs() {
    if (typeof silent !== 'boolean') {
      throw new Error(`@chainweaver/provider: Expected option 'silent' to be a boolean.`);
    }
    if (typeof timeout !== 'number') {
      throw new Error(`@chainweaver/provider: Expected option 'timeout' to be a number.`);
    }
  }
}
