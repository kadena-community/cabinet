import { useMemo } from "react";
import { initializeConnector, KadenaReactHooks } from "../kadena/core";
import { Connector } from "../kadena/types";
import { EckoWallet } from "../kadena/ecko-wallet";
import { Zelcore } from "../kadena/zelcore";
import { Chainweaver } from "../kadena/chainweaver";
import { WalletConnect } from "../kadena/walletconnect"; // Import WalletConnect

export enum WalletEnum {
  ECKO_WALLET = "ECKO_WALLET",
  ZELCORE = "ZELCORE",
  CHAINWEAVER = "CHAINWEAVER",
  WALLET_CONNECT = "WALLET_CONNECT", // Add WalletConnect enum
}

export const BACKFILLABLE_KADENA_WALLETS = [
  WalletEnum.ECKO_WALLET,
  WalletEnum.ZELCORE,
  WalletEnum.CHAINWEAVER,
  WalletEnum.WALLET_CONNECT,
];
export const SELECTABLE_KADENA_WALLETS = [...BACKFILLABLE_KADENA_WALLETS];

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`);
}

export const [eckoWallet, eckoWalletHooks] = initializeConnector<EckoWallet>(
  (actions) => new EckoWallet({ actions, onError }),
);
export const [zelcore, zelcoreHooks] = initializeConnector<Zelcore>(
  (actions) => new Zelcore({ actions, onError }),
);
export const [chainweaver, chainweaverHooks] = initializeConnector<Chainweaver>(
  (actions) => new Chainweaver({ actions, onError }),
);
export const [walletConnect, walletConnectHooks] =
  initializeConnector<WalletConnect>(
    (actions) =>
      new WalletConnect({
        actions,
        onError,
      }),
  ); // Initialize WalletConnect

export function getKadenaWalletForConnector(connector: Connector) {
  switch (connector) {
    case eckoWallet:
      return WalletEnum.ECKO_WALLET;
    case zelcore:
      return WalletEnum.ZELCORE;
    case chainweaver:
      return WalletEnum.CHAINWEAVER;
    case walletConnect:
      return WalletEnum.WALLET_CONNECT;
    default:
      throw Error("unsupported connector");
  }
}

export function getConnectorForKadenaWallet(wallet: WalletEnum) {
  switch (wallet) {
    case WalletEnum.ECKO_WALLET:
      return eckoWallet;
    case WalletEnum.ZELCORE:
      return zelcore;
    case WalletEnum.CHAINWEAVER:
      return chainweaver;
    case WalletEnum.WALLET_CONNECT:
      return walletConnect;
    default:
      throw Error("unsupported connector");
  }
}

function getHooksForKadenaWallet(wallet: WalletEnum) {
  switch (wallet) {
    case WalletEnum.ECKO_WALLET:
      return eckoWalletHooks;
    case WalletEnum.ZELCORE:
      return zelcoreHooks;
    case WalletEnum.CHAINWEAVER:
      return chainweaverHooks;
    case WalletEnum.WALLET_CONNECT:
      return walletConnectHooks;
  }
}

interface KdaConnectorListItem {
  connector: Connector;
  hooks: KadenaReactHooks;
}

function getKdaConnectorListItemForKadenaWallet(wallet: WalletEnum) {
  return {
    connector: getConnectorForKadenaWallet(wallet),
    hooks: getHooksForKadenaWallet(wallet),
  };
}

export function useKadenaConnectors(selectedWallet: WalletEnum | undefined) {
  return useMemo(() => {
    const connectors: KdaConnectorListItem[] = [];
    if (selectedWallet) {
      connectors.push(getKdaConnectorListItemForKadenaWallet(selectedWallet));
    }
    connectors.push(
      ...SELECTABLE_KADENA_WALLETS.filter(
        (wallet) => wallet !== selectedWallet,
      ).map(getKdaConnectorListItemForKadenaWallet),
    );
    const kadenaReactConnectors: [Connector, KadenaReactHooks][] =
      connectors.map(({ connector, hooks }) => [connector, hooks]);
    return kadenaReactConnectors;
  }, [selectedWallet]);
}
