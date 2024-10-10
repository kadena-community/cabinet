import React from 'react';
import styles from "@/styles/main.module.css";

interface AmountInputProps {
  minAmount: number;
  maxAmount: number;
  localAmount: number;
  onAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxClick: () => void;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  minAmount,
  maxAmount,
  localAmount,
  onAmountChange,
  onMaxClick,
}) => {
  return (
    <fieldset className={styles.fieldset}>
      <label htmlFor="amount" className={styles.fieldLabel}>
        Select Amount
      </label>
      <input
        type="range"
        id="amount"
        min={minAmount}
        max={maxAmount}
        value={localAmount}
        onChange={onAmountChange}
        className={styles.input}
      />
      <div className="flex items-center gap-2 w-full">
      <input
        type="number"
        id="amount"
        min={minAmount}
        max={maxAmount}
        value={localAmount}
        onChange={onAmountChange}
        className={styles.input}
      />
      <div
        className={styles.button}
        onClick={onMaxClick}
      >
        Max
      </div>
      </div>
    </fieldset>
  );
};
