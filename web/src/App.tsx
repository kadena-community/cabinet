import { useEffect } from "react";
import { useAddPopup } from "./features/main/hooks";
import { useKadenaReact } from "./kadena/core";
import { KADENA_NETWORK_ID } from "./constants/chainInfo";
import Popups from "./features/components/Popups";

function App() {
  const addPopup = useAddPopup();
  const { account, networkId } = useKadenaReact();

  useEffect(() => {
    if (account && networkId !== KADENA_NETWORK_ID) {
      addPopup({ msg: "Wrong network", status: "ERROR" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, networkId, addPopup]);

  return <Popups />;
}

export default App;
