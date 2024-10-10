import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { RequestArguments } from "../types";

interface WalletConnectKadenaProvider {
  connected: boolean;
  accounts: string[];
  sendCustomRequest(args: { method: string; params?: any }): Promise<any>;
  on(eventName: string | symbol, listener: (...args: any[]) => void): this;
}

export default detectWalletConnectProvider;

function detectWalletConnectProvider<T = WalletConnectKadenaProvider>({
  silent = false,
  timeout = 3000,
}: {
  silent?: boolean;
  timeout?: number;
}): Promise<T | null> {
  _validateInputs();

  const connector = new WalletConnect({
    bridge: "https://bridge.walletconnect.org",
    qrcodeModal: QRCodeModal,
  });

  let handled = false;

  return new Promise((resolve) => {
    if (connector.connected) {
      handleWalletConnect();
    } else {
      connector.createSession();

      connector.on("connect", () => {
        handleWalletConnect();
      });

      setTimeout(() => {
        handleWalletConnect();
      }, timeout);
    }

    function handleWalletConnect() {
      if (handled) {
        return;
      }
      handled = true;

      if (connector.connected) {
        resolve({
          connected: connector.connected,
          accounts: connector.accounts,
          sendCustomRequest: (args: { method: string; params?: any }) =>
            connector.sendCustomRequest(args),
          on: connector.on.bind(connector),
        } as unknown as T);
      } else {
        const message = "Unable to connect to WalletConnect.";

        !silent && console.error("@walletconnect/provider:", message);
        resolve(null);
      }
    }
  });

  function _validateInputs() {
    if (typeof silent !== "boolean") {
      throw new Error(
        `@walletconnect/provider: Expected option 'silent' to be a boolean.`,
      );
    }
    if (typeof timeout !== "number") {
      throw new Error(
        `@walletconnect/provider: Expected option 'timeout' to be a number.`,
      );
    }
  }
}
