import React from 'react';
import { Connector } from '../../../kadena/types';
import styles from '../../../styles/main.module.css';
import Loader from '../Loader';

export default function PendingView({
  connector,
  error = false,
  tryKadenaActivation,
  openOptions,
}: {
  connector: Connector;
  error?: boolean;
  tryKadenaActivation: (connector: Connector) => void;
  openOptions: () => void;
}) {
  return (
    <div className={styles.pendingSection}>
      <div className={styles.loadingMessage}>
        <div className={styles.loadingWrapper}>
          {error ? (
            <div className={styles.errorGroup}>
              <h4 className={styles.cardTitle} style={{ marginBottom: '12px' }}>
                Error connecting
              </h4>
              <p className={styles.note} style={{ marginBottom: '36px', textAlign: 'center' }}>
                The connection attempt failed. Please click try again and follow the steps to connect in your wallet.
              </p>
              <button
                className={styles.button}
                style={{ borderRadius: '12px', padding: '12px' }}
                onClick={() => {
                  tryKadenaActivation(connector as Connector);
                }}
              >
                Try Again
              </button>
              <button
                className={`${styles.button} ${styles.buttonEmpty}`}
                style={{ marginTop: '20px' }}
                onClick={openOptions}
              >
                Back to wallet selection
              </button>
            </div>
          ) : (
            <>
              <h2 className={styles.title} style={{ margin: '16px 0' }}>
                <div className={styles.loaderContainer}>
                  <Loader stroke="currentColor" size="32px" /> {/* Ensure Loader component exists or replace */}
                </div>
                Connecting...
              </h2>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
