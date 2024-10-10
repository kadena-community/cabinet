import kadenaLogoUrl from "../assets/images/kadena-logo.png";

export const NAMESPACE = process.env.NEXT_PUBLIC_CONTRACT_NAMESPACE;

export const BONDER_CONTRACT = `${NAMESPACE}.bonder`;
export const POLLER_CONTRACT = `${NAMESPACE}.poller`;

export const BONDER_BANK = process.env.NEXT_PUBLIC_BONDER_BANK_ACCOUNT;

export type ChainId = "0" | "1" | "2";

export const KADENA_CHAIN_ID: ChainId =
  (process.env.NEXT_PUBLIC_KADENA_CHAIN_ID as ChainId) ?? ("0" as ChainId);

export enum SupportedKadenaNetworkId {
  MAINNET = "mainnet01",
  DEVNET = "development",
  TESTNET = "testnet04",
}

export const gasStation = {
  contract: `${NAMESPACE}.gas-station`,
  user: process.env.NEXT_PUBLIC_GAS_STATION_ACCOUNT,
};
export const BLOCK_EXPLORER = (reqKey: string) =>
  `${CHAIN_INFO[KADENA_NETWORK_ID].explorer}/tx/${reqKey}`;

export type ChainwebNetworkId = "mainnet01" | "development" | "testnet04";
export const KADENA_NETWORK_ID: ChainwebNetworkId =
  (process.env.NEXT_PUBLIC_KADENA_NETWORK_ID as ChainwebNetworkId) ??
  ("development" as ChainwebNetworkId);

export type BaseChainInfo = {
  readonly id: string;
  readonly explorer: string;
  readonly logoUrl: string;
  readonly label: string;
  readonly displayName: string;
  readonly helpCenterUrl?: string;
  readonly nativeCurrency: {
    name: string; // e.g. 'Goerli ETH',
    symbol: string; // e.g. 'gorETH',
    decimals: number; // e.g. 18,
  };
  readonly nodeUrl: string;
  readonly primaryColor: string;
};

export type ChainInfoMap = {
  readonly [chainId: string]: BaseChainInfo;
};

export const CHAIN_INFO: ChainInfoMap = {
  [SupportedKadenaNetworkId.TESTNET]: {
    id: SupportedKadenaNetworkId.TESTNET,
    explorer: "https://explorer.chainweb.com/testnet",
    label: "Kadena",
    displayName: "Testnet",
    logoUrl: kadenaLogoUrl.src,
    nativeCurrency: { name: "Kadena Coin", symbol: "KDA", decimals: 12 },
    nodeUrl: `${process.env.NEXT_PUBLIC_KADENA_HOST}/chainweb/0.0/${SupportedKadenaNetworkId.TESTNET}/chain/${KADENA_CHAIN_ID}/pact`,
    primaryColor: "#F01B36",
  },
  [SupportedKadenaNetworkId.DEVNET]: {
    id: SupportedKadenaNetworkId.DEVNET,
    explorer: "https://devnet.ecko.finance/explorer",
    label: "Kadena",
    displayName: "Devnet",
    logoUrl: kadenaLogoUrl.src,
    nativeCurrency: { name: "Kadena Coin", symbol: "KDA", decimals: 12 },
    nodeUrl: `${process.env.NEXT_PUBLIC_KADENA_HOST}/chainweb/0.0/${SupportedKadenaNetworkId.DEVNET}/chain/${KADENA_CHAIN_ID}/pact`,
    primaryColor: "#F01B36",
  },
  [SupportedKadenaNetworkId.MAINNET]: {
    id: SupportedKadenaNetworkId.MAINNET,
    explorer: "https://explorer.chainweb.com/mainnet",
    label: "Kadena",
    displayName: "Mainnet",
    logoUrl: kadenaLogoUrl.src,
    nativeCurrency: { name: "Kadena Coin", symbol: "KDA", decimals: 12 },
    nodeUrl: `${process.env.NEXT_PUBLIC_KADENA_HOST}/chainweb/0.0/${SupportedKadenaNetworkId.MAINNET}/chain/${KADENA_CHAIN_ID}/pact`,
    primaryColor: "#F01B36",
  },
};
