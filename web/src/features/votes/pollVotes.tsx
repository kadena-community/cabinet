import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  toggleDisplayPollingPower,
  selectDisplayPollingPower,
} from "./votesSlice";
import { PollDTO } from "../poll/types";
import styles from "../../styles/main.module.css";
import VotesOverTimeBarChart from "./votesOverTimeChart";
import VoteDistributionPieChart from "./totalVotesChart";
import PollVotesComponent from "./PollVotesComponent";
import { XCircle } from "react-feather";

interface PollDetailsModalProps {
  poll: PollDTO;
  isOpen: boolean;
  onClose: () => void;
}

const PollDetailsModal: React.FC<PollDetailsModalProps> = ({
  poll,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const displayPollingPower = useAppSelector(selectDisplayPollingPower);

  const modalRef = useRef<HTMLDivElement>(null);
  const [timeRemaining, setTimeRemaining] = useState(remainingTime());

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
    const interval = setInterval(() => {
      setTimeRemaining(remainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [poll]);

  if (!isOpen) {
    return null;
  }

  const handleToggle = () => {
    dispatch(toggleDisplayPollingPower());
  };

  function remainingTime() {
    const now = new Date().getTime();
    let diff;

    if (now < new Date(poll.electionStart).getTime()) {
      const start = new Date(poll.electionStart).getTime();
      diff = start - now;
    } else {
      const end = new Date(poll.electionEnd).getTime();
      diff = end - now;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let timeString = "";
    if (days > 0) timeString += `${days}d `;
    if (hours > 0 || days > 0) timeString += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
    timeString += `${seconds}s`;

    return timeString.trim();
  }

  const hasVotes = poll.numberVotes > 0; // Check if there are any votes

  return (
    <div
      className={`${styles.modalOverlay} ${!isOpen && "hidden"} font-kadena`}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="votingModal">
        <div
          ref={modalRef}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-black dark:border-gray-200 pb-3 mb-4">
            <h2 className="text-2xl font-semibold">{poll.pollId} Details</h2>
            <div className="flex items-center md:mt-0 md:ml-auto">
              <span
                className={`px-2 py-1 rounded ${
                  poll.status === 1
                    ? "bg-k-Green-default"
                    : poll.status === 0
                      ? "bg-k-Orange-default"
                      : poll.status === 2
                        ? "bg-k-Pink-default"
                        : "bg-gray-400"
                }`}
              >
                {poll.status === 2
                  ? `Poll opens in ${timeRemaining}`
                  : poll.status === 0
                    ? `Vote closes in ${timeRemaining}`
                    : poll.status === 1
                      ? "Poll closed"
                      : "Unknown status"}
              </span>
              <XCircle
                className="ml-4 w-6 h-6 cursor-pointer"
                onClick={onClose}
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold">{poll.title}</h2>
          <p className="text-lg text-justify">{poll.description}</p>
          <div className="flex mt-4 justify">
            <div className="grid grid-cols-1  gap-x-24 md:grid-cols-3">
              <div className={`${styles.cardItem} mb-3`}>
                <h3 className="text-lg">Creation Time</h3>
                <p className="text-xl">
                  {new Date(poll.creationTime).toLocaleString()}
                </p>
              </div>
              <div className={`${styles.cardItem} mb-3`}>
                <h3 className="text-lg">Start Date</h3>
                <p className="text-xl">
                  {new Date(poll.electionStart).toLocaleString()}
                </p>
              </div>
              <div className={`${styles.cardItem} mb-3`}>
                <h3 className="text-lg">End Date</h3>
                <p className="text-xl">
                  {new Date(poll.electionEnd).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          {hasVotes ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span></span>
                <button className={styles.button} onClick={handleToggle}>
                  {displayPollingPower
                    ? "Display Votes"
                    : "Display Voting Power"}
                </button>
              </div>
              <div className="flex flex-col md:flex-row space-y-4 md:space-x-4 md:space-y-0">
                <div className="flex-1 h-300">
                  <VotesOverTimeBarChart />
                </div>
                <div className="flex-1 h-300">
                  <VoteDistributionPieChart />
                </div>
              </div>
              <div className="h-full">
                <PollVotesComponent poll={poll} />
              </div>
            </>
          ) : (
            <p>No votes have been cast yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollDetailsModal;
