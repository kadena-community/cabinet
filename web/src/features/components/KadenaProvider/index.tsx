import { ReactNode, useCallback, useEffect } from "react";
import { KadenaReactProvider } from "../../../kadena/core";
import { useAppSelector } from "../../../app/hooks";
import {
  eckoWallet,
  getConnectorForKadenaWallet,
  useKadenaConnectors,
} from "../../../connectors";
import { Connector } from "../../../kadena/types";

const connect = async (connector: Connector | any) => {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly();
    } else {
      await connector.activate();
    }
  } catch (error) {
    if (connector.isKadena) {
      console.debug(`kadena-react eager connection error: ${error}`);
    } else {
      console.debug(`web3-react eager connection error: ${error}`);
    }
  }
};

export default function KadenaProvider({ children }: { children: ReactNode }) {
  const selectedKdaWallet = useAppSelector(
    (state) => state.user.selectedWallet,
  );
  const connectors = useKadenaConnectors(selectedKdaWallet);

  const initialize = useCallback(() => {
    const isEckoWallet = !!window.kadena?.isKadena;
    // if (isEckoWallet) {
    //   connect(eckoWallet);
    // } else
    if (selectedKdaWallet) {
      connect(getConnectorForKadenaWallet(selectedKdaWallet));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("load", initialize);
  }, [initialize]);

  return (
    <KadenaReactProvider connectors={connectors}>
      {children}
    </KadenaReactProvider>
  );
}
