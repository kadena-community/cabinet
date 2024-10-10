import React from 'react';
import Image from 'next/image';
import { useKadenaReact } from '../../../kadena/core/provider';
import { shortenKAddress } from '../../../utils/kadenaHelper';
import { useWalletModalToggle } from '../../wallet/hooks';
import WalletModal from '../WalletModal';
import { KADENA_SUPPORTED_WALLETS } from '../../../constants/wallets';
import styles from '../../../styles/main.module.css';
import { Connector } from '../../../kadena/types';

interface WrappedStatusIconProps {
  connector: Connector;
}

const WrappedStatusIcon: React.FC<WrappedStatusIconProps> = ({ connector }) => {
  const wallet = Object.keys(KADENA_SUPPORTED_WALLETS)
    .filter((key) => KADENA_SUPPORTED_WALLETS[key].connector === connector)
    .map((key) => KADENA_SUPPORTED_WALLETS[key])[0];

  return <Image width={24} height={24} src={wallet.iconURL} alt={wallet.name} className={styles.sidebarIcon} />;
};

const Web3StatusInner: React.FC = () => {
  const { account, connector } = useKadenaReact();
  const toggleWalletModal = useWalletModalToggle();

  return (
    <div onClick={toggleWalletModal} className={account ? styles.web3StatusConnected : styles.button}>
      {account ? (
        <div className="flex items-center">
          {connector && <WrappedStatusIcon connector={connector} />}
          <span className="ml-2">{shortenKAddress(account.account)}</span>
        </div>
      ) : (
        'Connect Wallet'
      )}
    </div>
  );
};

const Web3Status: React.FC = () => {
  const toggleWalletModal = useWalletModalToggle();
  return (
    <>
      <Web3StatusInner />
      <WalletModal onClose={toggleWalletModal} />
    </>
  );
};

export default Web3Status;
