import React from 'react';
import { WalletInfo } from '../../../constants/wallets';
import { PopupStatus } from '../../main/mainSlice';
import styles from '../../../styles/main.module.css'; // Ensure this path is correct
import { BLOCK_EXPLORER } from '@/constants/chainInfo';

export const MESSAGE_POPUP = {
    SUCCESS: {
      title: 'Success',
      className: styles.successPopup
    },
    ERROR: {
      title: 'Error',
      className: styles.errorPopup
    },
    WARNING: {
      title: 'Warning',
      className: styles.warningPopup
    },
    PENDING: {
      title: 'Pending',
      className: styles.pendingPopup
    },
    INFO: {
      title: 'Info',
      className: styles.infoPopup
    }
  };

export default function MessagePopup({ msg, status, wallet, reqKey }: { msg?: string; status: PopupStatus; wallet?: WalletInfo; reqKey?: string }) {
  const explorerUrl = reqKey ? BLOCK_EXPLORER(reqKey) : null;

  const content = (
    <div className={`rounded-lg ${styles.messagePopup} ${wallet ? wallet.color : MESSAGE_POPUP[status].className}`}>
      {wallet && (
        <div className={styles.iconWrapper}>
          <img src={wallet.iconURL} alt={'Wallet Icon'} />
        </div>
      )}
      <div className={styles.popupContent}>
        <p className={`${styles.popupTitle} ${styles.uppercase}`}>
          {wallet ? `${wallet.name} is Connected` : MESSAGE_POPUP[status].title}
        </p>
        {msg && <p className={styles.popupMessage}>{msg}</p>}
      </div>
    </div>
  );

  return explorerUrl ? (
    <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className={styles.explorerLink}>
      {content}
    </a>
  ) : content;
}
