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

const PollVotesComponent: React.FC<{ pollId: string }> = ({ pollId }) => {
  const dispatch = useAppDispatch();
  const pollVotes = useAppSelector(selectPollVotes);
  const pollVotesTotalItems = useAppSelector(selectPollVotesTotalItems);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortByPollingPower, setSortByPollingPower] = useState(false);
  const [actionFilter, setActionFilter] = useState<number | string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVotes = () => {
    dispatch(
      fetchPollVotes({
        pollId,
        page,
        pageSize,
        sortByPollingPower,
        ignoreCache: false,
        actionFilter: actionFilter === null ? "" : actionFilter,
        search: searchTerm,
      }),
    );
  };

  useEffect(() => {
    fetchVotes();
  }, [
    dispatch,
    pollId,
    page,
    pageSize,
    sortByPollingPower,
    actionFilter,
    searchTerm,
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleSortToggle = () => {
    setSortByPollingPower(!sortByPollingPower);
    setPage(1);
  };

  const handleFilterChange = (filter: number | string) => {
    setActionFilter(filter);
    setPage(1);
  };

  const handleShowMore = () => {
    setPageSize(pageSize + 10);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "approved":
        return "text-k-Green-default";
      case "refused":
        return "text-k-Pink-default";
      case "abstention":
        return "text-k-Orange-default";
      default:
        return "";
    }
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
          <button
            className={`${styles.buttonAll} border border-white text-k-Cream-default bg-k-Blue-default hover:bg-k-Blue-400`}
            onClick={() => handleFilterChange("")}
          >
            All
          </button>
          <button
            className={`${styles.buttonApprove}`}
            onClick={() => handleFilterChange(0)}
          >
            Approved
          </button>
          <button
            className={`${styles.buttonReject} bg-k-Pink-default hover:bg-k-Pink-400`}
            onClick={() => handleFilterChange(1)}
          >
            Refused
          </button>
          <button
            className={`${styles.buttonAbstain}`}
            onClick={() => handleFilterChange(2)}
          >
            Abstention
          </button>
        </div>
        <button className={styles.buttonApprove} onClick={handleSortToggle}>
          Sort by {sortByPollingPower ? "Date" : "Polling Power"}
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between mb-2 px-2">
          <span className="flex-1 w-full sm:w-auto">Account</span>
          <span className="flex-1 w-full sm:w-auto">Action</span>
          <span className="flex-1 w-full sm:w-auto">Polling Power</span>
          <span className="flex-1 w-full sm:w-auto">Date</span>
        </div>
        {pollVotes.length === 0 ? (
          <div className="text-center">No results found</div>
        ) : (
          pollVotes.map((vote, index) => (
            <div
              key={index}
              className={`innerCard flex flex-wrap sm:flex-row items-start sm:items-center justify-between`}
            >
              <div className="flex-1 w-full sm:w-auto px-2 flex items-center">
                <p className={`${styles.cardComment}`}>
                  {shortenKAddress(vote.account)}
                </p>
                <CopyButton toCopy={vote.account} iconSize={16} />
              </div>
              <div className="flex-1 w-full sm:w-auto px-2">
                <p
                  className={`${styles.cardItem} ${getActionColor(vote.action)}`}
                >
                  {vote.action}
                </p>
              </div>
              <div className="flex-1 w-full sm:w-auto  px-2">
                <p className={`${styles.cardItem}`}>
                  {vote.pollingPower.toLocaleString()}
                </p>
              </div>
              <div className="flex-1 w-full sm:w-auto px-2">
                <p className={`${styles.cardItem}`}>
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
