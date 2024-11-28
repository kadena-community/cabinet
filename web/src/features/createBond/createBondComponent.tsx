import { useCreateBond } from "@/hooks/useCreateBond";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { useKadenaReact } from "../../kadena/core";
import styles from "../../styles/main.module.css";
import { checkIsCoreAccountAsync, selectIsCoreMember } from "../bond/bondSlice";
import { NewBond } from "../bond/types";
import { PactLockupOption } from "../lockup/types";

const CreateBondComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { account } = useKadenaReact();

  const isCoreMember = useAppSelector((state: RootState) =>
    selectIsCoreMember(state),
  );

  useEffect(() => {
    if (account?.account) {
      dispatch(checkIsCoreAccountAsync(account.account));
    }
  }, [dispatch, account]);

  const handleSubmit = useCreateBond();
  const safeAccount = account ? account.account : "";
  const [lockupOptions, setLockupOptions] = useState<PactLockupOption[]>([]);
  const [newBond, setNewBond] = useState<NewBond>({
    startTime: "",
    lockupOptions: lockupOptions,
    whitelistedAccounts: [],
    baseApr: 1.05,
    maxAmount: 100000.0,
    minAmount: 1000.0,
    totalRewards: 10000.0,
    creator: safeAccount,
  });

  const handleLockupOptionChange = (
    index: number,
    field: keyof PactLockupOption,
    value: any,
  ) => {
    setLockupOptions((prevOptions) => {
      const updatedOptions = prevOptions.map((option, i) =>
        i === index ? { ...option, [field]: value } : option,
      );
      setNewBond((prevBond) => ({
        ...prevBond,
        lockupOptions: updatedOptions,
      }));
      return updatedOptions;
    });
  };

  const validateForm = () => {
    return (
      newBond.startTime &&
      newBond.baseApr >= 1 &&
      newBond.minAmount > 0 &&
      newBond.maxAmount > newBond.minAmount &&
      newBond.totalRewards > 0
    );
  };

  const handleNewBondChange = <T extends keyof NewBond>(
    field: T,
    value: NewBond[T],
  ) => {
    setNewBond({ ...newBond, [field]: value });
  };

  const handleAddLockupOption = () => {
    setLockupOptions((prevOptions) => {
      const newOption: PactLockupOption = {
        "option-name": "10 minutes",
        "option-length": { int: 600 }, // Initialize as an object with "int"
        "time-multiplier": 1.1,
        "poller-max-boost": 1.0,
        "polling-power-multiplier": 1.0,
      };
      const updatedOptions = [...prevOptions, newOption];
      setNewBond((prevBond) => ({
        ...prevBond,
        lockupOptions: updatedOptions,
      }));
      return updatedOptions;
    });
  };

  const onSubmit = async () => {
    if (validateForm()) {
      await handleSubmit(newBond);
    } else {
      alert(
        "Please check the bond parameters. Make sure all conditions are met.",
      );
    }
  };

  if (!account) return;

  if (!isCoreMember) {
    return (
      <p className={styles.note}>
        You must be a core member to create a lockup.
      </p>
    );
  }

  return (
    <div className="card container mx-auto">
      <h4 className="text-2xl text-kadena">Create New Lockup</h4>

      <div className={styles.field}>
        <label htmlFor="start-time" className={`${styles.cardItem}`}>
          Start Time:
        </label>
        <input
          type="datetime-local"
          id="start-time"
          value={newBond.startTime}
          onChange={(e) => handleNewBondChange("startTime", e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="base-apr" className={`${styles.cardItem}`}>
          Base APR (%):
        </label>
        <input
          type="number"
          id="base-apr"
          value={newBond.baseApr}
          onChange={(e) =>
            handleNewBondChange(
              "baseApr",
              Math.max(1, parseFloat(e.target.value)),
            )
          }
          className={styles.input}
          min="1"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="min-amount" className={`${styles.cardItem}`}>
          Minimum Amount:
        </label>
        <input
          type="number"
          id="min-amount"
          value={newBond.minAmount}
          onChange={(e) =>
            handleNewBondChange(
              "minAmount",
              Math.max(0, parseFloat(e.target.value)),
            )
          }
          className={styles.input}
          min="0"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="max-amount" className={`${styles.cardItem}`}>
          Maximum Amount:
        </label>
        <input
          type="number"
          id="max-amount"
          value={newBond.maxAmount}
          onChange={(e) =>
            handleNewBondChange("maxAmount", parseFloat(e.target.value))
          }
          className={styles.input}
          min={newBond.minAmount}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="total-rewards" className={`${styles.cardItem}`}>
          Total Rewards:
        </label>
        <input
          type="number"
          id="total-rewards"
          value={newBond.totalRewards}
          onChange={(e) =>
            handleNewBondChange(
              "totalRewards",
              Math.max(0, parseFloat(e.target.value)),
            )
          }
          className={styles.input}
          min="0"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="whitelisted-accounts" className={`${styles.cardItem}`}>
          Whitelisted Accounts:
        </label>
        <textarea
          id="whitelisted-accounts"
          value={newBond.whitelistedAccounts.join(", ")}
          onChange={(e) =>
            handleNewBondChange(
              "whitelistedAccounts",
              e.target.value.split(",").map((s) => s.trim()),
            )
          }
          className={styles.input}
        />
      </div>

      {lockupOptions.map((option, index) => (
        <div key={index} className={styles.fieldset}>
          <label
            htmlFor={`OptionName-${index}`}
            className={`${styles.cardItem}`}
          >
            Option Name:
          </label>
          <input
            type="text"
            id={`optionName-${index}`}
            value={option["option-name"]}
            onChange={(e) =>
              handleLockupOptionChange(index, "option-name", e.target.value)
            }
            placeholder="Option name (e.g., '3 months')"
            className={styles.input}
          />

          <label htmlFor={`Length-${index}`} className={`${styles.cardItem}`}>
            Length (seconds):
          </label>
          <input
            type="number"
            id={`Length-${index}`}
            value={option["option-length"]?.int || ""}
            onChange={(e) =>
              handleLockupOptionChange(index, "option-length", {
                int: parseInt(e.target.value) || 0,
              })
            }
            placeholder="Length in seconds (e.g., 600)"
            className={styles.input}
          />

          <label
            htmlFor={`TimeMultiplier-${index}`}
            className={`${styles.cardItem}`}
          >
            Time Multiplier:
          </label>
          <input
            type="number"
            id={`TimeMultiplier-${index}`}
            value={option["time-multiplier"]}
            onChange={(e) =>
              handleLockupOptionChange(
                index,
                "time-multiplier",
                Number(e.target.value),
              )
            }
            placeholder="Time Multiplier"
            className={styles.input}
          />

          <label
            htmlFor={`PollerMaxBoost-${index}`}
            className={`${styles.cardItem}`}
          >
            Poller Max Boost:
          </label>
          <input
            type="number"
            id={`PollerMaxBoost-${index}`}
            value={option["poller-max-boost"]}
            onChange={(e) =>
              handleLockupOptionChange(
                index,
                "poller-max-boost",
                Number(e.target.value),
              )
            }
            placeholder="Poller Max Boost"
            className={styles.input}
          />

          <label
            htmlFor={`PollingPowerMultiplier-${index}`}
            className={`${styles.cardItem}`}
          >
            Voting Power:
          </label>
          <input
            type="number"
            id={`PollingPowerMultiplier-${index}`}
            value={option["polling-power-multiplier"]}
            onChange={(e) =>
              handleLockupOptionChange(
                index,
                "polling-power-multiplier",
                Number(e.target.value),
              )
            }
            placeholder="Voting Power"
            className={styles.input}
          />
        </div>
      ))}
      <button onClick={handleAddLockupOption} className={styles.button}>
        Add Lockup Option
      </button>

      <button
        onClick={onSubmit}
        disabled={!validateForm()}
        className={styles.button}
      >
        Create Bond
      </button>
    </div>
  );
};

export default CreateBondComponent;
