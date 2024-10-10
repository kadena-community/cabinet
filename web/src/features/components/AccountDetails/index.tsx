import React from "react";
import { KADENA_SUPPORTED_WALLETS } from "../../../constants/wallets";
import { shortenKAddress } from "../../../utils/kadenaHelper";
import { useKadenaReact } from "../../../kadena/core";
import styles from "../../../styles/main.module.css";
import { useAppDispatch } from "@/app/hooks";
import { updateUserWalletAuth } from "@/features/user/userSlice";
import CopyButton from "@/features/votes/CopyButton";
import { CHAIN_ID } from "@/utils/consts";

interface AccountDetailsProps {
  openOptions: () => void;
}

const AccountDetails = ({ openOptions }: AccountDetailsProps) => {
  const { account, connector } = useKadenaReact();
  const dispatch = useAppDispatch();

  function formatConnectorInfo() {
    const wallet = Object.keys(KADENA_SUPPORTED_WALLETS)
      .filter((k) => KADENA_SUPPORTED_WALLETS[k].connector === connector)
      .map((k) => KADENA_SUPPORTED_WALLETS[k])[0];

    return (
      <div
        className={`flex items-center justify-start rounded-lg cursor-pointer ${styles.accountGroupingRow}`}
      >
        <span className="text-lg font-medium">{wallet.name}</span>
        <img
          src={wallet.iconURL}
          alt={wallet.name}
          className={`h-8 w-8 ml-4 mr-4 ${styles.icon}`}
        />
      </div>
    );
  }

  const handleLogout = () => {
    if (connector.deactivate) {
      connector.deactivate();
    } else {
      connector.resetState();
    }

    dispatch(
      updateUserWalletAuth({
        walletAuth: { isAuthenticated: false, status: "idle" },
      }),
    );
  };

  return (
    <div className={`shadow-md`}>
      {connector && formatConnectorInfo()}

      {account && (
        <div className={`p-4 mt-4 shadow ${styles.accountDataRow}`}>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between">
              <p>
                {account.balance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                KDA (Chain {CHAIN_ID})
              </p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">
                {shortenKAddress(account.account)}
              </span>
              <div className="flex items-center">
                <CopyButton toCopy={account.account} />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`${styles.modalActions}`}>
        <button className={styles.button} onClick={handleLogout}>
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default AccountDetails;
