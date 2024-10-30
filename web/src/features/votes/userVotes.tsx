import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchUserVotes,
  selectUserVotes,
  fetchVoteStatsAsync,
  selectVotesLoading,
  selectVotesError,
  getPollVotesSummaryAsync,
} from "./votesSlice";
import styles from "../../styles/main.module.css";
import PollDetailsModal from "./pollVotes";
import CopyButton from "./CopyButton";
import { fetchPollDetails, selectCurrentPoll } from "../poll/pollSlice";
import { AppLoader } from "@/features/components/Loader";
import Error from "@/features/components/Error";

interface UserVotesProps {
  account: string | null;
}

const UserVotes: React.FC<UserVotesProps> = ({ account }) => {
  const dispatch = useAppDispatch();
  const userVotes = useAppSelector(selectUserVotes);
  const loading = useAppSelector(selectVotesLoading);
  const error = useAppSelector(selectVotesError);
  const currentPoll = useAppSelector(selectCurrentPoll);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activePollId, setActivePollId] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      dispatch(fetchUserVotes({ account, ignoreCache: false }));
      dispatch(fetchVoteStatsAsync({ account: account, ignoreCache: false }));
    }
  }, [dispatch, account]);

  useEffect(() => {
    if (activePollId) {
      dispatch(fetchPollDetails({ pollId: activePollId, ignoreCache: false }));
      dispatch(
        getPollVotesSummaryAsync({
          pollId: activePollId,
          ignoreCache: false,
        }),
      );
    }
  }, [dispatch, activePollId]);

  useEffect(() => {
    if (currentPoll) {
      setActivePollId(currentPoll.pollId);
    }
  }, [currentPoll]);

  const handleOpenDetailsModal = (pollId: string) => {
    setActivePollId(pollId);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setActivePollId(null);
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
    <div className="container mx-auto">
      {loading && (
        <div>
          <AppLoader true size="16px" stroke="#E27B38" />
        </div>
      )}
      {error && <Error message={error} />}
      {!loading && userVotes.length > 0 && account != null && (
        <>
          <h1 className="text-xl font-semibold mt-2 mb-4">Your Votes</h1>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header layout */}
              <div className="grid grid-cols-4 mb-4 px-2">
                <span className="flex-1">Poll ID</span>
                <span className="flex-1 ml-5">Action</span>
                <span className="flex-1">Voting Power</span>
                <span className="flex-1">Date</span>
              </div>

              {/* Card layout */}
              <div className="space-y-4">
                {userVotes.map((vote, index) => (
                  <div
                    key={index}
                    className={`innerCard grid grid-cols-4 gap-4 p-4 mt-2 mb-2 items-center`}
                    onClick={() => handleOpenDetailsModal(vote.PollId)}
                  >
                    <div className="flex-1 flex items-center">
                      <p className={`${styles.cardComment}`}>{vote.PollId}</p>
                      {/* <CopyButton toCopy={vote.PollId} iconSize={16} /> */}
                    </div>
                    <div className="flex-1">
                      <p className={`${styles.cardItem}`}>{vote.Action}</p>
                    </div>
                    <div className="flex-1">
                      <p className={`${styles.cardItem}`}>
                        {vote.PollingPower.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className={`${styles.cardItem}`}>
                        {new Date(vote.Date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      {isDetailsModalOpen && currentPoll && (
        <PollDetailsModal
          poll={currentPoll}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
        />
      )}
    </div>
  );
};

export default UserVotes;
