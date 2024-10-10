import React, { useState } from "react";
import { useKadenaReact } from "../../../kadena/core";
import { KADENA_SUPPORTED_WALLETS } from "../../../constants/wallets";
import { InputWithLabel } from "../Input";
import styles from "../../../styles/main.module.css";

interface AccountInsertProps {
  onConnectSelectedAccount: (account: string) => void;
}

export default function AccountInsert({
  onConnectSelectedAccount,
}: AccountInsertProps) {
  const { connector } = useKadenaReact();
  const [account, setAccount] = useState<string | undefined>(undefined);

  function formatConnectorName() {
    const name = Object.keys(KADENA_SUPPORTED_WALLETS)
      .filter((k) => KADENA_SUPPORTED_WALLETS[k].connector === connector)
      .map((k) => KADENA_SUPPORTED_WALLETS[k].name)[0];
    return <div className={styles.walletName}>Connecting with {name}</div>;
  }

  return (
    <div className={styles.upperSection}>
      <div className={styles.accountSection}>
        <div className={styles.yourAccount}>
          <div className={styles.infoCard}>
            <div className={styles.accountGroupingRow}>
              {formatConnectorName()}
            </div>
            <div className={styles.accountGroupingRow}>
              <InputWithLabel
                id="account-input"
                placeholder="Insert Account"
                label="Account"
                value={account}
                handleChange={(e) => setAccount(e.target.value)}
              />
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.button}
                disabled={account === undefined}
                onClick={() => {
                  onConnectSelectedAccount(account as string);
                }}
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
