import React, { useState, useEffect } from "react";
import styles from "../../styles/main.module.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  checkIsCoreAccountAsync,
  selectIsCoreMember,
  getAllBondsAsync,
  selectAllBonds,
} from "../bond/bondSlice";
import { useKadenaReact } from "../../kadena/core";
import { useCreatePoll } from "@/hooks/useCreatePoll";
import { NewPoll } from "./types";

const CreatePollComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { account } = useKadenaReact();
  const isCoreMember = useAppSelector(selectIsCoreMember);
  const { handleSubmit } = useCreatePoll();
  const allBonds = useAppSelector(selectAllBonds);

  const [newPoll, setNewPoll] = useState<NewPoll>({
    creator: account?.account || "",
    title: "",
    description: "",
    bondId: "",
    options: [],
  });

  useEffect(() => {
    if (account?.account) {
      dispatch(checkIsCoreAccountAsync(account.account));
      setNewPoll((prev) => ({ ...prev, creator: account.account }));
    }
    dispatch(getAllBondsAsync());
  }, [dispatch, account?.account]);

  const handleChange = (field: keyof NewPoll, value: string) => {
    setNewPoll((prev) => ({ ...prev, [field]: value }));
  };

  const handleBondSelection = (bondId: string) => {
    setNewPoll((prev) => ({ ...prev, bondId }));
  };

  const handleAddOption = () => {
    if (newPoll.options.length < 10) {
      setNewPoll((prev) => ({ ...prev, options: [...prev.options, ""] }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = newPoll.options.filter((_, i) => i !== index);
    setNewPoll((prev) => ({ ...prev, options: updatedOptions }));
  };

  const validateForm = () => {
    const titleValid = newPoll.title.length >= 5 && newPoll.title.length <= 150;
    const descriptionValid =
      newPoll.description.length >= 10 && newPoll.description.length <= 500;
    const optionsValid =
      newPoll.options.length >= 2 &&
      newPoll.options.every((option) => option.trim().length > 0);
    return (
      titleValid &&
      descriptionValid &&
      optionsValid &&
      account &&
      newPoll.bondId
    );
  };

  const onSubmit = async () => {
    if (validateForm()) {
      await handleSubmit(newPoll);
    }
  };

  if (!account) {
    return;
  }

  if (!isCoreMember) {
    return <p>You must be a core member to create a poll.</p>;
  }

  const filteredBonds = allBonds.filter(
    (bond) => bond.creator === account.account,
  );

  return (
    <div className="card container mx-auto">
      <h4 className="text-2xl text-kadena">Create New Poll</h4>
      <div className={`${styles.cardItem}`}>
        <label htmlFor="title" className={`${styles.cardItem}`}>
          Title:
        </label>
        <input
          type="text"
          id="title"
          value={newPoll.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="description" className={`${styles.cardItem}`}>
          Description:
        </label>
        <textarea
          id="description"
          value={newPoll.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="bond" className={`${styles.cardItem}`}>
          Lockup:
        </label>
        <select
          id="bond"
          value={newPoll.bondId}
          onChange={(e) => handleBondSelection(e.target.value)}
          className={styles.input}
        >
          <option value="" disabled>
            Select a lockup
          </option>
          {filteredBonds.map((bond) => (
            <option key={bond.bondId} value={bond.bondId}>
              {bond.bondId}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={`${styles.cardItem}`}>Vote Options:</label>
        {newPoll.options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className={`${styles.input} flex-1`}
            />
            <button
              type="button"
              onClick={() => handleRemoveOption(index)}
              className={`${styles.button} ml-2`}
            >
              Remove
            </button>
          </div>
        ))}
        {newPoll.options.length < 10 && (
          <button
            type="button"
            onClick={handleAddOption}
            className={styles.button}
          >
            Add Option
          </button>
        )}
      </div>
      <button
        onClick={onSubmit}
        disabled={!validateForm()}
        className={styles.button}
      >
        Create Poll
      </button>
    </div>
  );
};

export default CreatePollComponent;
