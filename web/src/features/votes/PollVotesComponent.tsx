"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchPollVotes,
  selectPollVotes,
  selectPollVotesTotalItems,
} from "../poll/pollSlice";
import { shortenKAddress } from "../../utils/kadenaHelper";
import styles from "../../styles/main.module.css";
import CopyButton from "./CopyButton";
import { Dropdown } from "@/features/components/Dropdown";
import { OptionType } from "@/features/components/Dropdown/types";
import { PollDTO } from "@/features/poll/types";

const PollVotesComponent: React.FC<{ poll: PollDTO }> = ({ poll }) => {
  const dispatch = useAppDispatch();
  const pollVotes = useAppSelector(selectPollVotes);
  const pollVotesTotalItems = useAppSelector(selectPollVotesTotalItems);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortByPollingPower, setSortByPollingPower] = useState(false);
  const [actionFilter, setActionFilter] = useState<OptionType>({
    name: "All",
    value: -1,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to map poll options to OptionType
  const getPollOptionType = (option: any): OptionType => {
    return { value: option.optionIndex, name: option["option-name"] as string };
  };

  // Map the poll options dynamically for the dropdown
  const pollDropdownOptions = [
    { name: "All", value: -1 },
    ...poll.pollOptions?.map((option) => getPollOptionType(option)),
  ];

  // Fetch poll votes based on the current state
  const fetchVotes = () => {
    dispatch(
      fetchPollVotes({
        pollId: poll.pollId,
        page,
        pageSize,
        sortByPollingPower,
        ignoreCache: false,
        actionFilter:
          (actionFilter.value as number) < 0 ? "" : actionFilter.name,
        search: searchTerm,
      }),
    );
  };

  useEffect(() => {
    fetchVotes();
  }, [
    dispatch,
    poll,
    page,
    pageSize,
    sortByPollingPower,
    actionFilter,
    searchTerm,
  ]);

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleSortToggle = () => {
    setSortByPollingPower(!sortByPollingPower);
    setPage(1);
  };

  const handleShowMore = () => {
    setPageSize(pageSize + 10);
  };

  return (
    <div className="container mx-auto font-kadena">
      <div className="flex justify-between items-center pb-5">
        <input
          id="searchVotes"
          type="text"
          placeholder="Search account"
          value={searchTerm}
          onChange={handleSearchChange}
          className={`${styles.input} mb-4 w-full sm:w-40 font-kadena`}
        />
      </div>
      <div className="flex flex-wrap justify-between items-center pb-5 space-y-2 sm:space-y-0">
        <div className="flex flex-wrap space-x-2 space-y-2 sm:space-y-0 items-center">
          <span className="mr-2 font-kadena">
            Total Votes: {pollVotesTotalItems}
          </span>
          <Dropdown
            options={pollDropdownOptions}
            currentOption={actionFilter}
            setCurrentOption={setActionFilter}
          />
        </div>
        <button className={styles.buttonApprove} onClick={handleSortToggle}>
          Sort by {sortByPollingPower ? "Date" : "Voting Power"}
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between mb-2 px-2">
          <span className="flex-1 w-full sm:w-auto">Account</span>
          <span className="flex-1 w-full sm:w-auto">Action</span>
          <span className="flex-1 w-full sm:w-auto">Voting Power</span>
          <span className="flex-1 w-full sm:w-auto">Date</span>
        </div>
        {pollVotes.length === 0 ? (
          <div className="text-center">No results found</div>
        ) : (
          pollVotes.map((vote, index) => (
            <div
              key={index}
              className="innerCard flex flex-wrap sm:flex-row items-start sm:items-center justify-between"
            >
              <div className="flex-1 w-full sm:w-auto px-2 flex items-center">
                <p className={styles.cardComment}>
                  {shortenKAddress(vote.account)}
                </p>
                <CopyButton toCopy={vote.account} iconSize={16} />
              </div>
              <div className="flex-1 w-full sm:w-auto px-2">
                <p className={styles.cardItem}>{vote.action}</p>
              </div>
              <div className="flex-1 w-full sm:w-auto px-2">
                <p className={styles.cardItem}>
                  {vote.pollingPower.toLocaleString()}
                </p>
              </div>
              <div className="flex-1 w-full sm:w-auto px-2">
                <p className={styles.cardItem}>
                  {new Date(vote.date).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      {pollVotesTotalItems > pageSize && (
        <div className="flex justify-center mt-4">
          <button className={styles.button} onClick={handleShowMore}>
            Show more
          </button>
        </div>
      )}
    </div>
  );
};

export default PollVotesComponent;
