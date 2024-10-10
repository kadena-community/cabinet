import { RequestArguments } from "../types";

interface EckoWalletKadenaProvider {
  isKadena?: boolean;
  request(args: RequestArguments): Promise<unknown>;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this;
  //chainInfo: BaseChainInfo;
}

declare global {
  interface Window {
    kadena?: EckoWalletKadenaProvider;
  }
}

export default detectKadenaProvider;

function detectKadenaProvider<T = EckoWalletKadenaProvider>({
  silent = false,
  timeout = 3000,
} = {}): Promise<T | null> {
  _validateInputs();

  let handled = false;

  return new Promise((resolve) => {
    if ((window as Window).kadena) {
      handleKadena();
    } else {
      window.addEventListener("kadena#initialized", handleKadena, {
        once: true,
      });

      setTimeout(() => {
        handleKadena();
      }, timeout);
    }

    function handleKadena() {
      if (handled) {
        return;
      }
      handled = true;

      const { kadena } = window as Window;

      if (kadena) {
        //kadena.chainInfo = process.env.NEXT_PUBLIC_KADENA_NETWORK_ID ? CHAIN_INFO[process.env.NEXT_PUBLIC_KADENA_NETWORK_ID] : CHAIN_INFO['development'];
        resolve(kadena as unknown as T);
      } else {
        const message = kadena
          ? "Non-eckoWALLET window.kadena detected."
          : "Unable to detect window.kadena.";

        !silent && console.error("@ecko-wallet/provider:", message);
        resolve(null);
      }
    }
  });

  function _validateInputs() {
    if (typeof silent !== "boolean") {
      throw new Error(
        `@eckoWallet/provider: Expected option 'silent' to be a boolean.`,
      );
    }
    if (typeof timeout !== "number") {
      throw new Error(
        `@eckoWallet/provider: Expected option 'timeout' to be a number.`,
      );
    }
  }
}
