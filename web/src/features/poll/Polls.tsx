import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchAllPolls,
  selectAllPolls,
  selectPollLoading,
  selectPollError,
  selectAccountVoteStatus,
  fetchCanAccountVoteMultiple,
} from "./pollSlice";
import { PollDTO, PollVoteDTO, PollVoted } from "./types";
import PollModal from "./pollModal";
import PollDetailsModal from "../votes/pollVotes";
import { useKadenaReact } from "@/kadena/core";
import { useAddPopup } from "../main/hooks";
import styles from "../../styles/main.module.css";
import {
  fetchUserVotes,
  fetchVoteStatsAsync,
  selectUserVotes,
  getPollVotesSummaryAsync,
} from "../votes/votesSlice";
import Info, { InfoTopics } from "@/features/info";
import { AppLoader } from "@/features/components/Loader";
import Error from "@/features/components/Error";
import { useVoteOnPoll } from "@/hooks/useVoteOnPoll";
import VoteDistributionBarChart from "./VoteDistributionBarChart";
import QuorumProgressBar from "./QuorumProgressBarChart";
import { Dropdown } from "@/features/components/Dropdown";
import { getAllBondsAsync, selectAllBonds } from "../bond/bondSlice";
import { Bond } from "../bond/types";
import { OptionType } from "../components/Dropdown/types";

const Polls: React.FC = () => {
  const dispatch = useAppDispatch();
  const allPolls = useAppSelector(selectAllPolls);
  const loading = useAppSelector(selectPollLoading);
  const error = useAppSelector(selectPollError);
  const userVotes = useAppSelector(selectUserVotes);
  const allBonds = useAppSelector(selectAllBonds);
  const kda = useKadenaReact();
  const addPopup = useAddPopup();
  const handleVote = useVoteOnPoll();
  const accountVoteStatus = useAppSelector(selectAccountVoteStatus);

  const [activePoll, setActivePoll] = useState<PollDTO | null>(null);
  const [isVoteModalOpen, setVoteModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [pollsVoted, setPollsVoted] = useState<PollVoted[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OptionType>({
    name: "All",
    value: 0,
  });
  const [bondFilter, setBondFilter] = useState<OptionType>({
    name: "All",
    value: "All",
  });
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>(
    {},
  );

  const account = kda.account?.account;

  useEffect(() => {
    console.log(bondDropdownOptions);
    dispatch(
      fetchAllPolls({
        page,
        pageSize,
        search: searchTerm,
        status: statusFilter.value == 0 ? "" : (statusFilter.value as number),
        bond: bondFilter.value === "All" ? "" : (bondFilter.value as string),
        ignoreCache: false,
      }),
    );
    dispatch(getAllBondsAsync());
  }, [dispatch, page, pageSize, searchTerm, bondFilter, statusFilter]);

  useEffect(() => {
    if (activePoll)
      dispatch(
        getPollVotesSummaryAsync({
          pollId: activePoll.pollId,
          ignoreCache: false,
        }),
      );
  }, [dispatch, activePoll]);

  useEffect(() => {
    if (account) {
      dispatch(fetchUserVotes({ account, ignoreCache: false }));
      dispatch(fetchVoteStatsAsync({ account, ignoreCache: false }));
    }
  }, [dispatch, kda.account]);

  useEffect(() => {
    if (account && allPolls.length > 0) {
      const pollIds = allPolls.map((poll) => poll.pollId);
      dispatch(
        fetchCanAccountVoteMultiple({ account, pollIds, ignoreCache: false }),
      );
    }
  }, [dispatch, kda.account, allPolls]);

  useEffect(() => {
    if (account && Object.keys(accountVoteStatus).length > 0) {
      const votedPollsSet = new Set(
        userVotes.map((vote: PollVoteDTO) => vote.PollId),
      );

      const pollStatuses = allPolls.map((poll) => {
        const voted = votedPollsSet.has(poll.pollId);
        let errorMessage;
        let action;

        if (voted) {
          const userVote = userVotes.find(
            (vote: PollVoteDTO) => vote.PollId === poll.pollId,
          );
          action = userVote?.Action;
        }

        if (poll.status === 0) {
          if (voted) {
            errorMessage = undefined; // Clear error message if voted
          } else if (!accountVoteStatus[poll.pollId]) {
            errorMessage = "Outside your lockup";
          }
        } else {
          if (!voted) {
            errorMessage = "Poll closed";
          }
        }

        return {
          poll,
          voted,
          errorMessage,
          action,
        };
      });

      pollStatuses.sort((a, b) => Number(a.voted) - Number(b.voted));
      setPollsVoted(pollStatuses);
    } else {
      const initialVotes = allPolls.map((poll) => ({
        poll,
        voted: false,
        errorMessage:
          poll.status === 0 ? "Connect wallet to vote" : "Poll closed",
      }));
      setPollsVoted(initialVotes);
    }
  }, [userVotes, allPolls, kda, accountVoteStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newTimeRemaining: { [key: string]: string } = {};

      allPolls.forEach((poll) => {
        let diff;
        let statusMessage = "";
        if (now < new Date(poll.electionStart).getTime()) {
          const start = new Date(poll.electionStart).getTime();
          diff = start - now;
          statusMessage = "Poll opens in";
        } else if (now < new Date(poll.electionEnd).getTime()) {
          const end = new Date(poll.electionEnd).getTime();
          diff = end - now;
          statusMessage = "Poll closes in";
        } else {
          // Poll is closed if current time is past electionEnd
          diff = 0;
          statusMessage = "Poll closed";
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let timeString = "";
        if (diff > 0) {
          if (days > 0) timeString += `${days}d `;
          if (hours > 0 || days > 0) timeString += `${hours}h `;
          if (minutes > 0 || hours > 0 || days > 0)
            timeString += `${minutes}m `;
          timeString += `${seconds}s`;
        }

        newTimeRemaining[poll.pollId] =
          diff > 0 ? `${statusMessage} ${timeString}` : statusMessage;
      });

      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [allPolls]);

  const getButtonColor = (
    errorMessage: string | undefined,
    action: string | undefined,
  ) => {
    if (
      errorMessage === "Poll closed" ||
      errorMessage === "Connect wallet to vote" ||
      errorMessage === "Outside your lockup"
    ) {
      return "bg-gray-400";
    } else if (action === "approved") {
      return "bg-k-Green-default";
    } else if (action === "abstention") {
      return "bg-k-Orange-default";
    } else if (action === "refused") {
      return "bg-k-Pink-default";
    } else {
      return "bg-k-Green-default"; // Default button color for "Vote in poll"
    }
  };

  const handleOpenVoteModal = (poll: PollDTO, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevents the details modal from opening when voting
    setActivePoll(poll);
    setVoteModalOpen(true);
  };

  const handleCloseVoteModal = () => {
    setVoteModalOpen(false);
    setActivePoll(null);
  };

  const handleOpenDetailsModal = (poll: PollDTO) => {
    setActivePoll(poll);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setActivePoll(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleShowMore = () => {
    setPageSize(pageSize + 10);
  };

  const statusDropdownOptions = [
    { name: "All", value: "" },
    { name: "Open", value: 0 },
    { name: "Approved", value: 1 },
    { name: "Refused", value: 2 },
  ];

  function formatLockupId(id: string) {
    const regex = /^LOCKUP_SALE-(\d+)$/;
    const match = id.match(regex);

    if (match) {
      const number = match[1];
      return `Lockup ${number}`;
    }

    // Return the original id if it doesn't match the pattern
    return id;
  }

  const getBondOption = (bond: Bond) => {
    return {
      name: formatLockupId(bond.bondId),
      value: formatLockupId(bond.bondId),
    } as OptionType;
  };

  const bondDropdownOptions = [
    { name: "All", value: "All" },
    ...allBonds.map((bond) => getBondOption(bond)),
  ];

  return (
    <div className="container mx-auto">
      <div className="flex justify mt-6 items-center pb-5 relative">
        <h1 className="text-3xl font-semibold">Polls</h1>
        <div className="ml-2 mb-2">
          <Info topic={InfoTopics.POLLS} />
        </div>
      </div>

      <div className="flex flex-row justify-between items-center pb-8 w-full space-x-4">
        <div className="flex relative flex-grow max-md:hidden  min-w-0">
          <input
            id="searchPolls"
            type="text"
            placeholder="Search polls"
            value={searchTerm}
            onChange={handleSearchChange}
            className={`${styles.input}  font-kadena mr-5`}
          />
        </div>
        <div className="flex flex-row space-x-4 items-center ml-4 flex-shrink">
          <Dropdown
            options={statusDropdownOptions}
            title="Status"
            currentOption={statusFilter}
            setCurrentOption={setStatusFilter}
          />
          <Dropdown
            options={bondDropdownOptions}
            title="Lockup"
            currentOption={bondFilter}
            setCurrentOption={setBondFilter}
          />
        </div>
      </div>

      {loading && (
        <div>
          <AppLoader true size="96px" stroke="#E27B38" />
        </div>
      )}
      {error && <Error message={error} />}
      {!loading && (
        <div className="space-y-4">
          {allPolls.length === 0 ? (
            <div className="text-center text-xl">No polls available</div>
          ) : (
            pollsVoted.map((p) => (
              <div
                key={p?.poll.pollId}
                className={`card flex flex-col cursor-pointer relative`}
                onClick={() => handleOpenDetailsModal(p.poll)}
              >
                <div className="flex flex-row justify-between">
                  <p className={` ${styles.cardComment} whitespace-nowrap`}>
                    #{p.poll.pollId}
                  </p>
                  <span
                    className={`text-l top-1 right-5 mt-2 ml-2 px-2  rounded text-white ${
                      p.poll.status === 1
                        ? "bg-k-Green-default"
                        : p.poll.status === 0
                          ? "bg-k-Orange-default"
                          : p.poll.status === 2
                            ? "bg-k-Pink-default"
                            : "bg-gray-400"
                    }`}
                  >
                    {p.poll.status === 3
                      ? timeRemaining[p.poll.pollId]
                      : p.poll.status === 0
                        ? timeRemaining[p.poll.pollId]
                        : p.poll.status === 1
                          ? "Approved by CAB"
                          : "Rejected by CAB"}
                  </span>
                </div>
                <div>
                  <h2
                    className={`${styles.cardTitle} ${styles.limitedWidthPoll} text-xl mb-4 font-semibold`}
                  >
                    {p.poll.title}
                  </h2>
                  <p
                    className={`${styles.cardItem} ${styles.limitedWidthPoll} text-justify`}
                  >
                    {p.poll.description}
                  </p>
                </div>
                <div className="mt-auto flex justify-between space-x-2">
                  <button
                    className={`${getButtonColor(p.errorMessage, p.action)} text-white font-bold py-2 px-4 rounded w-40 focus:outline-none focus:shadow-outline`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (p.errorMessage) {
                        addPopup({ msg: p.errorMessage, status: "ERROR" });
                      } else {
                        handleOpenVoteModal(p.poll, e);
                      }
                    }}
                    disabled={
                      new Date().getTime() <
                        new Date(p.poll.electionStart).getTime() || // Voting not yet open
                      new Date().getTime() >
                        new Date(p.poll.electionEnd).getTime() || // Voting period ended
                      !kda.account || // Wallet not connected
                      p.action !== undefined // Already voted
                    }
                  >
                    {new Date().getTime() <
                    new Date(p.poll.electionStart).getTime()
                      ? timeRemaining[p.poll.pollId] || "Poll opens in 0s"
                      : new Date().getTime() >
                          new Date(p.poll.electionEnd).getTime()
                        ? "Poll closed"
                        : !kda.account
                          ? "Connect wallet to vote"
                          : p.action
                            ? p.action.charAt(0).toUpperCase() +
                              p.action.slice(1)
                            : "Vote in poll"}
                  </button>

                  <div className="w-full">
                    <QuorumProgressBar poll={p.poll} />
                    <VoteDistributionBarChart poll={p.poll} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {pollsVoted.length > pageSize && (
        <div className="flex justify-center mt-4">
          <button className={styles.button} onClick={handleShowMore}>
            Show more
          </button>
        </div>
      )}
      {isVoteModalOpen && activePoll && (
        <PollModal
          poll={activePoll}
          isOpen={isVoteModalOpen}
          onClose={handleCloseVoteModal}
          onVoteSubmit={(
            pollId: string,
            vote: "approved" | "refused" | "abstain",
          ) => {
            handleVote(pollId, vote); // Ensure the vote is one of the expected string literals
            handleCloseVoteModal();
          }}
        />
      )}
      {isDetailsModalOpen && activePoll && (
        <PollDetailsModal
          poll={activePoll}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
        />
      )}
    </div>
  );
};

export default Polls;
