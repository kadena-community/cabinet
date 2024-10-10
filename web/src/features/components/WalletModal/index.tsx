import React, { useCallback, useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { KADENA_SUPPORTED_WALLETS } from "../../../constants/wallets";
import { useModalOpen } from "../../wallet/hooks";
import { HeadModal } from "../../main/mainSlice";
import { useWalletModalToggle } from "../../wallet/hooks";
// import Option from './Option'; TODO: Remove file or refactor with new component + tailwind class
import Modal from "../Modal";
import { getKadenaWalletForConnector, WalletEnum } from "../../../connectors";
import { updateSelectedWallet } from "../../user/userSlice";
import { setConnectedAccount } from '@/features/main/mainSlice';
import { Connector } from "../../../kadena/types";
import { useKadenaReact } from "../../../kadena/core";
import AccountDetails from "../AccountDetails";
import { updateWalletError } from "../../wallet/walletSlice";
import PendingView from "./PendingView";
import AccountSelect from "../AccountSelect";
import AccountInsert from "../AccountInsert";
import styles from "../../../styles/main.module.css";
import BackIcon from "@/assets/images/back-icon.svg";
import { XCircle } from "react-feather";

const WALLET_VIEWS = {
  OPTIONS: "options",
  ACCOUNT: "account",
  PENDING: "pending",
  SELECT_ACCOUNT: "select_account",
  INSERT_ACCOUNT: "insert_account",
};

interface OptionProps {
  option: {
    iconURL: string;
    name: string;
  };
  onClick: () => void;
}

const Option: React.FC<OptionProps> = ({ option, onClick }) => (
  <div
    className="flex items-center justify-between p-4 hover:bg-k-Blue-400 rounded-lg cursor-pointer"
    onClick={onClick}
  >
    <img src={option.iconURL} alt={option.name} className="h-8 w-8 mr-4" />
    <span className="font-medium">{option.name}</span>
  </div>
);

interface WalletModalProps {
  onClose: () => void;
}

export default function WalletModal({ onClose }: WalletModalProps) {
  const dispatch = useAppDispatch();
  const { connector, account, sharedAccounts } = useKadenaReact();
  const walletModalOpen = useModalOpen(HeadModal.WALLET);
  const toggleWalletModal = useWalletModalToggle();
  const [walletView, setWalletView] = useState(WALLET_VIEWS.OPTIONS);
  const [pendingConnector, setPendingConnector] = useState<
    Connector | undefined
  >();
  const modalRef = useRef<HTMLDivElement>(null);

  const pendingError = useAppSelector((state) =>
    pendingConnector
      ? state.wallet.errorByWallet[
          getKadenaWalletForConnector(pendingConnector)
        ]
      : undefined,
  );

  const openOptions = useCallback(() => {
    setWalletView(WALLET_VIEWS.OPTIONS);
  }, [setWalletView]);

  const onConnectSelectedAccount = useCallback(
    (account: string) => {
      const wallet = getKadenaWalletForConnector(connector);
      try {
        setPendingConnector(connector);
        setWalletView(WALLET_VIEWS.PENDING);
        dispatch(updateWalletError({ wallet, error: undefined }));
        connector.onSelectAccount?.(account);
        dispatch(updateSelectedWallet({ wallet }));
        dispatch
      } catch (error: any) {
        dispatch(updateWalletError({ wallet, error: error.message }));
      }
    },
    [dispatch, connector],
  );

  const tryActivationForKadena = useCallback(
    async (kadenaConnector: Connector) => {
      try {
        setPendingConnector(kadenaConnector);
        setWalletView(WALLET_VIEWS.PENDING);
        await kadenaConnector.activate();
        dispatch(
          updateSelectedWallet({
            wallet: getKadenaWalletForConnector(kadenaConnector),
          }),
        );
      } catch (error: any) {
        dispatch(
          updateWalletError({
            wallet: getKadenaWalletForConnector(kadenaConnector),
            error: error.message,
          }),
        );
        setWalletView(WALLET_VIEWS.OPTIONS); // Reset to options on failure
      }
    },
    [dispatch],
  );

  useEffect(
    () => {
      if(account?.account) dispatch(setConnectedAccount(account.account));},
    [dispatch, account]
  );


  useEffect(() => {
    if (walletModalOpen) {
      const wallet = getKadenaWalletForConnector(connector);
      if (wallet === WalletEnum.ZELCORE && sharedAccounts && !account) {
        setWalletView(WALLET_VIEWS.SELECT_ACCOUNT);
      } else if (wallet === WalletEnum.CHAINWEAVER && !account) {
        setWalletView(WALLET_VIEWS.INSERT_ACCOUNT);
      } else if (account) {
        setWalletView(WALLET_VIEWS.ACCOUNT);
      } else {
        setWalletView(WALLET_VIEWS.OPTIONS);
      }
    }
  }, [walletModalOpen, account, connector, sharedAccounts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        toggleWalletModal();
      }
    };

    if (walletModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [walletModalOpen, toggleWalletModal]);

  const getOptions = () => {
    return Object.keys(KADENA_SUPPORTED_WALLETS).map((key) => {
      const option = KADENA_SUPPORTED_WALLETS[key];
      const isActive = option.connector === connector;
      if (!option.connector) return null;
      return (
        <Option
          key={key}
          option={option}
          //@ts-ignore
          onClick={() => tryActivationForKadena(option.connector)}
        />
      );
    });
  };

  const getModalContent = () => {
    switch (walletView) {
      case WALLET_VIEWS.ACCOUNT:
        return [
          "Account Details",
          <AccountDetails openOptions={openOptions} />,
        ];
      case WALLET_VIEWS.SELECT_ACCOUNT:
        return [
          "Select Account",
          <AccountSelect
            openOptions={openOptions}
            onConnectSelectedAccount={onConnectSelectedAccount}
          />,
        ];
      case WALLET_VIEWS.INSERT_ACCOUNT:
        return [
          "Insert Account",
          <AccountInsert
            //@ts-ignore
            openOptions={openOptions}
            onConnectSelectedAccount={onConnectSelectedAccount}
          />,
        ];
      case WALLET_VIEWS.OPTIONS:
      default:
        return [
          "Select Wallet",
          <div className="flex flex-col space-y-2">{getOptions()}</div>,
        ];
    }
  };

  const [title, content] = getModalContent();

  return (
    <div
      className={`${styles.modalOverlay} ${!walletModalOpen && "hidden"} font-kadena`}
    >
      <div className={styles.modalContainer}>
        <div className="modal" ref={modalRef}>
          <div className="flex text-justify justify-between items-center border-black dark:border-gray-200 border-b">
            {(title === "Insert Account" || title === "Select Account") && (
              <div
                className={`sidebarIcon h-4 w-4 mb-6`}
                onClick={() => setWalletView(WALLET_VIEWS.OPTIONS)}
              >
                <BackIcon />
              </div>
            )}
            <h2 className={styles.modalHeader}>{title}</h2>
            <XCircle className="mb-3 h-6 w-6" onClick={onClose} />
          </div>
          <div>{content}</div>
        </div>
      </div>
    </div>
  );
}
