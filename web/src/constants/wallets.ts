// @ts-nocheck
import ECKO_WALLET_ICON_URL from "../assets/images/wallets/ecko-wallet.svg?url";
import ZELCORE_ICON_URL from "../assets/images/wallets/zelcore.svg?url";
import CHAINWEAVER_ICON_URL from "../assets/images/kadena-logo.svg?url";
// import CHAINWEAVER_ICON_URL from '../assets/images/wallets/chainweaver.svg';
import WALLETCONNECT_ICON_URL from "../assets/images/wallets/walletconnect.svg?url";
import {
  chainweaver,
  eckoWallet,
  WalletEnum,
  zelcore,
  walletConnect,
} from "../connectors";
import { Connector } from "../kadena/types";

export interface WalletInfo {
  connector?: Connector;
  name: string;
  iconURL: string;
  description: string;
  href: string | null;
  color: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
}

export const KADENA_SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  [WalletEnum.ECKO_WALLET]: {
    connector: eckoWallet,
    name: "eckoWALLET",
    iconURL: ECKO_WALLET_ICON_URL.src,
    description: "ecko-wallet",
    href: null,
    color: "#1F1524",
  },
  [WalletEnum.ZELCORE]: {
    connector: zelcore,
    name: "Zelcore",
    iconURL: ZELCORE_ICON_URL.src,
    description: "Zelcore",
    href: null,
    color: "#E8831D",
  },
  [WalletEnum.CHAINWEAVER]: {
    connector: chainweaver,
    name: "Chainweaver Desktop",
    iconURL: CHAINWEAVER_ICON_URL.src,
    description: "Chainweaver",
    href: null,
    color: "#E8831D",
  },
  [WalletEnum.WALLET_CONNECT]: {
    connector: walletConnect,
    name: "WalletConnect",
    iconURL: WALLETCONNECT_ICON_URL.src,
    description: "WalletConnect",
    href: null,
    color: "#3B99FC",
  },
};
