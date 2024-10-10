import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/main.module.css";
import { LockupOption } from "../lockup/types"; // Ensure these are correctly imported
import { useAppSelector } from "@/app/hooks";
import { selectBondLoading, selectCanBond } from "../bond/bondSlice";
import { useKadenaReact } from "../../kadena/core";
import { bondAvailableRewards } from "../bond/Bonds";
import {
  calculateMaximumRewards,
  calculateLockupAmountForReward,
  previewVotingPower,
} from "./utils";
import LockTimeSelector from "./lockTimeSelector";
import { useCreateLockup } from "@/hooks/useCreateLockup";
import { AmountInput } from "../components/AmountInput";
import { Bond } from "../bond/types";
import {
  selectGasStationEnabled,
  selectGasConfig,
} from "@/features/gasStation/gasSlice";
import { XCircle } from "react-feather";

interface CreateLockupComponentProps {
  bond: Bond;
  isOpen: boolean;
  onClose: () => void;
}

const CreateLockupComponent: React.FC<CreateLockupComponentProps> = ({
  bond,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const handleNewLockup = useCreateLockup();
  const kda = useKadenaReact();
  const isGasStationEnabled = useAppSelector(selectGasStationEnabled);
  const userGasConfig = useAppSelector(selectGasConfig);
  const loading = useAppSelector(selectBondLoading);
  const canBond = useAppSelector(selectCanBond);
  const [localAmount, setLocalAmount] = useState(0);
  const [localLockTime, setLocalLockTime] = useState(0);
  const [selectedOption, setSelectedOption] = useState<LockupOption | null>(
    null,
  );
  const [maximumRewards, setMaximumRewards] = useState(0);
  const [vp, setVp] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (kda.account) {
      const maxLen = Math.max(...bond.lockupOptions.map((s) => s.optionLength));
      setLocalLockTime(maxLen);
    }
  }, [kda.account, bond]);

  useEffect(() => {
    if (kda.account && selectedOption) {
      const maxAmt = Math.max(
        Math.min(
          bond.maxAmount,
          isGasStationEnabled
            ? kda?.account?.balance
            : kda?.account?.balance - userGasConfig.LIMIT * userGasConfig.PRICE,
          calculateLockupAmountForReward(
            bondAvailableRewards(bond),
            bond.baseApr,
            selectedOption.timeMultiplier,
            selectedOption.pollerMaxBoost,
          ),
        ),
        0,
      );

      if (maxAmt < localAmount || localAmount == 0) {
        setLocalAmount(maxAmt);
      }
    }
  }, [kda.account, bond, selectedOption]);

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

  // useEffect(() => {
  //   if (selectedOption) {

  //     const bal = kda.account?.balance || 0;
  //     const selectedAmount = Math.min(bond.maxAmount, bal, maxByRewards);
  //     const lastPos = bond?.lockupOptions.length - 1;
  //     //setLocalAmount(selectedAmount);
  //     //      setLocalLockTime(bond?.lockupOptions[lastPos]?.optionLength || 0);
  //   }
  // }, [selectedOption, bond, kda.account?.balance]);

  useEffect(() => {
    const option = bond.lockupOptions.find(
      (option) => option.optionLength === localLockTime,
    );
    setSelectedOption(option || null);
  }, [localLockTime, bond.lockupOptions]);

  useEffect(() => {
    const rewards = calculateMaximumRewards(
      localAmount,
      bond?.baseApr,
      selectedOption?.timeMultiplier,
      selectedOption?.pollerMaxBoost,
    );
    setMaximumRewards(rewards);
  }, [localAmount, selectedOption, bond?.baseApr]);

  useEffect(() => {
    const localVp = previewVotingPower(
      localAmount,
      selectedOption?.pollingPowerMultiplier,
    );
    setVp(localVp);
  }, [localAmount, selectedOption, bond?.baseApr]);

  useEffect(() => {
    const validateLockup = () => {
      if (!bond || !kda.account) return;
      const currTime = new Date().getTime();
      const startTime = Date.parse(bond?.startTime);

      if (!canBond) {
        setValidationError("Account already locked");
        return false;
      }

      if (maximumRewards > bondAvailableRewards(bond)) {
        setValidationError(
          "Selected amount too high. Insufficient available rewards.",
        );
        return false;
      }
      if (
        currTime < startTime ||
        bond?.whitelistedAccounts?.includes(kda.account?.account)
      ) {
        setValidationError(
          `Lockup has not started yet. Starts on: ${new Date(startTime)}`,
        );
        return false;
      }
      if (bond.minAmount > kda.account.balance) {
        setValidationError(
          `You need at least ${bond?.minAmount} KDA to participate in this lockup`,
        );
        return false;
      }
      if (localAmount > kda.account.balance) {
        setValidationError(
          `Insufficient funds. You only have ${kda.account.balance} KDA.`,
        );
        return false;
      }

      setValidationError("");
      return true;
    };

    validateLockup();
  }, [
    maximumRewards,
    localAmount,
    localLockTime,
    kda.account?.account,
    bond,
    canBond,
    kda.account,
  ]);

  if (!isOpen) {
    return null; // Don't render the modal unless it's open
  }

  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div>Loading lockup details...</div>
      </div>
    );
  }

  if (!bond) {
    return (
      <div className={styles.modalOverlay}>
        <div>No active lockup available or data fetch failed.</div>
      </div>
    );
  }

  const initiateLockup = async () => {
    if (kda.account) {
      const params = {
        bondId: '"' + bond.bondId + '"',
        length: localLockTime,
        amount: localAmount,
        account: kda.account.account,
        gasStationEnabled: isGasStationEnabled,
        gasConfig: userGasConfig,
      };
      onClose();
      await handleNewLockup(params);
      setValidationError("");
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAmount(Number(event.target.value));
  };
  const handleLockTimeChange = (length: number) => {
    setLocalLockTime(length);
  };

  const handleMaxClick = () => {
    const accountBalance = kda.account?.balance ?? 0;
    if (selectedOption)
      setLocalAmount(
        Math.min(
          Number(
            isGasStationEnabled
              ? accountBalance
              : accountBalance - userGasConfig.LIMIT * userGasConfig.PRICE,
          ),
          bond.maxAmount,
          //bondAvailableRewards(bond),
          calculateLockupAmountForReward(
            bondAvailableRewards(bond),
            bond.baseApr,
            selectedOption.timeMultiplier,
            selectedOption.pollerMaxBoost,
          ),
        ),
      );
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className="modal" ref={modalRef}>
          <div className="flex text-justify border-b border-black dark:border-white justify-between items-center">
            <h2 className={styles.modalHeader}>Create Lockup</h2>
            <XCircle className="mb-5 w-4 h-4" onClick={onClose} />
          </div>
          <div className={styles.modalBody}>
            <label htmlFor="locktime" className={styles.fieldLabel}>
              Select Lockup Period
            </label>

            <LockTimeSelector
              bond={bond}
              localLockTime={localLockTime}
              onClick={handleLockTimeChange}
            />
            <AmountInput
              minAmount={bond.minAmount}
              maxAmount={bond.maxAmount}
              localAmount={localAmount}
              onAmountChange={handleAmountChange}
              onMaxClick={handleMaxClick}
            />
            <p className={styles.note}>
              Maximum Participation Reward:{" "}
              {maximumRewards.toLocaleString("en-US", {
                style: "decimal",
                maximumFractionDigits: 2,
              })}{" "}
              KDA
            </p>
            <p className={styles.note}>
              Voting Power:{" "}
              {vp.toLocaleString("en-US", {
                style: "decimal",
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className={styles.modalActions}>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="voting-disclaimer"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
              />
              <label
                htmlFor="voting-disclaimer"
                className="ml-2 text-sm font-kadena"
              >
                I understand that the locked amount can only be withdrawn at the
                end of the lockup period and rewards are based on poll
                participation.
              </label>
            </div>

            {/*            <button className={styles.button} onClick={onClose}>
                  Close
                  </button> */}
            <button
              onClick={() => initiateLockup()}
              disabled={
                !isChecked || !kda.account?.account || !!validationError
              }
              className={styles.button}
            >
              {validationError || "Join Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLockupComponent;
