import React from 'react';
import { XCircle } from 'react-feather';
import styles from './ModalWrapper.module.css'; // Adjust the path to where your CSS module is located

interface Props {
  children: React.ReactNode;
  onCloseModal: () => void;
  title: string;
}

const ModalWrapper = ({ children, onCloseModal, title }: Props) => {
  return (
    <div className={styles.upperSection}>
      <XCircle className={styles.closeIcon} onClick={onCloseModal} />
      <div className={styles.headerRow}>{title}</div>
      <div className={styles.contentWrapper}>{children}</div>
    </div>
  );
};

export default ModalWrapper;
