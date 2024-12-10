import React, { useRef, useEffect, useState } from "react";
import styles from "@/styles/main.module.css";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectGasConfig,
  selectGasStationEnabled,
  setGasLimit,
  setGasPrice,
  toggleGasStation,
} from "./gasSlice";
import { XCircle } from "react-feather";

interface GasStationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GasStationModal: React.FC<GasStationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const gasStationEnabled = useAppSelector(selectGasStationEnabled);
  const gasConfig = useAppSelector(selectGasConfig);

  const [localGasLimit, setLocalGasLimit] = useState(gasConfig?.LIMIT ?? 10000);
  const [localGasPrice, setLocalGasPrice] = useState(
    gasConfig?.PRICE ?? 0.00000001,
  );
  const [localGasStationEnabled, setLocalGasStationEnabled] =
    useState(gasStationEnabled);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setLocalGasLimit(gasConfig?.LIMIT ?? 10000);
      setLocalGasPrice(gasConfig?.PRICE ?? 0.00000001);
      setLocalGasStationEnabled(gasStationEnabled);
    }
  }, [isOpen, gasConfig, gasStationEnabled]);

  if (!isOpen) {
    return null;
  }

  const handleGasLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalGasLimit(Number(e.target.value));
  };

  const handleGasPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalGasPrice(Number(e.target.value));
  };

  const handleSpeedClick = (multiplier: number) => {
    setLocalGasPrice(0.00000001 * multiplier);
  };

  const handleToggleChange = () => {
    setLocalGasStationEnabled(!localGasStationEnabled);
  };

  const handleSetClick = () => {
    dispatch(setGasLimit(localGasLimit));
    dispatch(setGasPrice(localGasPrice));
    if (localGasStationEnabled !== gasStationEnabled) {
      dispatch(toggleGasStation());
    }
    onClose();
  };

  return (
    <div className={`${styles.modalOverlay} ${!isOpen && "hidden"}`}>
      <div className={styles.modalContainer}>
        <div ref={modalRef} className="modal">
          <div className="flex text-justify justify-between items-center border-gray-200 border-b">
            <h2 className={styles.modalHeader}>Gas Configuration</h2>
            <XCircle className="ml-6 mb-3 w-6 h-6" onClick={onClose} />
          </div>
          <div className={styles.modalBody}>
            <div className="flex items-center justify-between mb-4">
              <h3>Gas Station</h3>
              <label className={`${styles.switch} ml-4`}>
                <input
                  type="checkbox"
                  checked={localGasStationEnabled}
                  onChange={handleToggleChange}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            {!localGasStationEnabled && (
              <>
                <label>
                  <span>Gas Limit</span>
                  <input
                    type="number"
                    value={localGasLimit}
                    onChange={handleGasLimitChange}
                    className="mt-1 block w-full"
                  />
                </label>
                <label className="mt-4">
                  <span>Gas Price</span>
                  <input
                    type="number"
                    step="0.00000001"
                    value={localGasPrice}
                    onChange={handleGasPriceChange}
                    className="mt-1 block w-full"
                  />
                </label>
                <div className="flex space-x-2 mt-4">
                  <button
                    className={styles.button}
                    onClick={() => handleSpeedClick(1)}
                  >
                    LOW
                  </button>
                  <button
                    className={styles.button}
                    onClick={() => handleSpeedClick(100)}
                  >
                    NORMAL
                  </button>
                  <button
                    className={styles.button}
                    onClick={() => handleSpeedClick(10000)}
                  >
                    FAST
                  </button>
                </div>
                <p className="mt-4">
                  Potential gas cost for transaction failure:{" "}
                  <strong>{localGasPrice * localGasLimit} KDA</strong>
                </p>
              </>
            )}
          </div>
          <div
            className={`${styles.modalActions} flex justify-end mt-6 space-x-2`}
          >
            <button className={styles.button} onClick={handleSetClick}>
              Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasStationModal;
