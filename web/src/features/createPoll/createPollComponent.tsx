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

  const validateForm = () => {
    const titleValid = newPoll.title.length >= 5 && newPoll.title.length <= 150;
    const descriptionValid =
      newPoll.description.length >= 10 && newPoll.description.length <= 500;
    return titleValid && descriptionValid && account && newPoll.bondId;
  };

  const onSubmit = async () => {
    if (validateForm()) {
      await handleSubmit(newPoll);
    }
  };

  if (!account) {
    return <p>Please log in to create a poll.</p>;
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
      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
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
        <label htmlFor="description" className={styles.label}>
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
        <label htmlFor="bond" className={styles.label}>
          Select Bond:
        </label>
        <select
          id="bond"
          value={newPoll.bondId}
          onChange={(e) => handleBondSelection(e.target.value)}
          className={styles.input}
        >
          <option value="" disabled>
            Select a bond
          </option>
          {filteredBonds.map((bond) => (
            <option key={bond.bondId} value={bond.bondId}>
              {bond.bondId}
            </option>
          ))}
        </select>
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
