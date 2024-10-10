import React, { useEffect, useState } from "react";
import { useKadenaReact } from "../../../kadena/core";
import { ButtonPrimary } from "../Button";
import { Dropdown } from "../Dropdown";
import { OptionType } from "../Dropdown/types";
import { shortenKAddress } from "../../../utils/kadenaHelper";
import { KADENA_SUPPORTED_WALLETS } from "@/constants/wallets";
import { useWalletModalToggle } from "../../wallet/hooks";
import styles from '@/styles/main.module.css';

interface AccountSelectprops {
  openOptions: () => void;
  onConnectSelectedAccount: (account: string) => void;
}

export default function AccountSelect({
  openOptions,
  onConnectSelectedAccount,
}: AccountSelectprops) {
  const toggleWalletModal = useWalletModalToggle();
  const { sharedAccounts, connector } = useKadenaReact();
  const [selectedOption, setSelectedOption] = useState<OptionType>({
    name: "",
    value: "",
  });

  useEffect(() => {
    if (sharedAccounts && sharedAccounts.length > 0) {
      setSelectedOption({
        name: shortenKAddress(sharedAccounts[0]),
        value: sharedAccounts[0],
      });
    }
  }, [sharedAccounts]);

  function formatConnectorName() {
    const name = Object.keys(KADENA_SUPPORTED_WALLETS)
      .filter((k) => KADENA_SUPPORTED_WALLETS[k].connector === connector)
      .map((k) => KADENA_SUPPORTED_WALLETS[k].name)[0];
    return (
      <div className="initial text-sm font-medium text-gray-600">
        Connected with {name}
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="absolute right-4 top-3 cursor-pointer opacity-100 hover:opacity-60"
        onClick={toggleWalletModal}
      ></div>
        <div>
            <div className="flex flex-row items-center justify-between font-medium text-gray-700">
              {formatConnectorName()}
            </div>
            <div className={`${styles.modalBody}`}>
              <div className="flex flex-col">
                {sharedAccounts && (
                  <Dropdown
                    options={sharedAccounts.map(
                      (item) =>
                        ({
                          name: shortenKAddress(item, 4),
                          value: item,
                        }) as OptionType,
                    )}
                    title=""
                    currentOption={selectedOption}
                    setCurrentOption={setSelectedOption}
                  />
                )}
            </div>
            </div>
            <div className={styles.modalActions}>
            <div>
              <ButtonPrimary
                onClick={() => {
                  onConnectSelectedAccount(selectedOption.value as string);
                }}
              >
                Connect
              </ButtonPrimary>
            </div>
            </div>
      </div>
    </div>
  );
}
