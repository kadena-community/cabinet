import React, { useRef, useEffect, useState } from "react";
import { PollDTO } from "./types";
import { XCircle } from "react-feather";
import { useKadenaReact } from "@/kadena/core";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { getLockupDetailsAsync, selectLockupDetails } from "../bond/bondSlice";
import { getBondDetailsAsync, selectBondDetails } from "../bond/bondSlice";
import ProjectedQuorumProgressBar from "./ProjectedQuorum";
import VoteImpactBarChart from "./ProjectedVotes";
import styles from "@/styles/main.module.css";
import { Dropdown } from "@/features/components/Dropdown";
import { OptionType } from "@/features/components/Dropdown/types";

interface PollVoteModalProps {
  poll: PollDTO;
  isOpen: boolean;
  onClose: () => void;
  onVoteSubmit: (pollId: string, vote: number) => void;
}

const PollVoteModal: React.FC<PollVoteModalProps> = ({
  poll,
  isOpen,
  onClose,
  onVoteSubmit,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedVote, setSelectedVote] = useState<OptionType>({
    name: "Select Option",
    value: -1,
  });

  const kda = useKadenaReact();
  const dispatch = useAppDispatch();
  const lockup = useAppSelector(selectLockupDetails);
  const bondDetails = useAppSelector(selectBondDetails);

  const getPollOptionType = (option: any) => {
    return {
      value: option.optionIndex,
      name: option.optionName,
    } as OptionType;
  };

  const pollDropdownOptions =
    poll.pollOptions?.map((option) => getPollOptionType(option)) || [];

  useEffect(() => {
    if (kda.account) {
      dispatch(
        getLockupDetailsAsync(`${poll.bondId}:::${kda.account.account}`),
      );
      dispatch(getBondDetailsAsync(poll.bondId));
    }
  }, [kda.account, dispatch, poll.bondId]);

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

  const handleVoteSelection = (option: OptionType) => {
    setSelectedVote(option);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const handleSubmit = () => {
    if (selectedVote && isChecked) {
      onVoteSubmit(poll.pollId, selectedVote.value as number);
    }
  };

  const calculateCurrentRewards = () => {
    if (lockup && bondDetails) {
      const { baseApr } = bondDetails;
      const { timeMultiplier } = lockup.lockupOption;
      const { kdaLocked, maxKdaRewards } = lockup;
      const minRewards = timeMultiplier * kdaLocked * baseApr - kdaLocked;
      const participationRate = parseFloat(
        (
          (lockup.interactions /
            (bondDetails.totalPolls - lockup.pollsAtLock)) *
          100
        ).toFixed(2),
      );

      const rewards =
        minRewards +
        (isNaN(participationRate)
          ? 0
          : (participationRate / 100) * (maxKdaRewards - minRewards));

      return parseFloat(rewards.toFixed(3));
    }
    return 0.0;
  };

  const calculateProjectedRewards = () => {
    if (lockup && bondDetails) {
      const { baseApr } = bondDetails;
      const { timeMultiplier } = lockup.lockupOption;
      const { kdaLocked, maxKdaRewards } = lockup;

      const minRewards = timeMultiplier * kdaLocked * baseApr - kdaLocked;
      const participationRate = parseFloat(
        (
          ((lockup.interactions + 1) /
            (bondDetails.totalPolls - lockup.pollsAtLock)) *
          100
        ).toFixed(2),
      );

      const rewards =
        minRewards +
        (isNaN(participationRate)
          ? 0
          : (participationRate / 100) * (maxKdaRewards - minRewards));

      return parseFloat(rewards.toFixed(3));
    }
    return 0.0;
  };

  if (!isOpen || !lockup || !bondDetails) return null;

  return (
    <div className={styles.modalOverlay}>
      <div
        ref={modalRef}
        className="modal mt-4 w-[70vw] max-w-[90vw] max-h-[100vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-xl font-kadena">{poll.title}</h2>
          <XCircle
            className="mt-3 mb-3 h-6 w-6 cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="mb-4 text-lg">{poll.description}</div>
        <div className="flex mx-auto justify-between">
          <div className={`${styles.cardItem} mb-3`}>
            <h3 className="text-lg">Voting Power</h3>
            <p className="text-xl">
              {lockup.pollingPower.toLocaleString("en-US", {
                style: "decimal",
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className={`${styles.cardItem} mb-3`}>
            <h3 className="text-lg">Projected Rewards</h3>
            <p className="text-xl">
              {calculateProjectedRewards().toLocaleString("en-US", {
                style: "decimal",
                maximumFractionDigits: 3,
              }) + " "}
              (+{" "}
              {(
                calculateProjectedRewards() - calculateCurrentRewards()
              ).toLocaleString("en-US", {
                style: "decimal",
                maximumFractionDigits: 3,
              })}{" "}
              KDA)
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xl">Quorum impact</h3>
            <ProjectedQuorumProgressBar
              poll={poll}
              pollingPower={lockup.pollingPower}
            />
          </div>
          <div>
            <h3 className="text-xl">Vote impact</h3>
            <VoteImpactBarChart
              poll={poll}
              selectedVote={selectedVote.name}
              pollingPower={lockup.pollingPower}
            />
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-center">
            <Dropdown
              options={pollDropdownOptions}
              currentOption={selectedVote}
              setCurrentOption={setSelectedVote}
            />
          </div>
          <hr className="border-t border-gray-200" />
          <p className="text-sm font-kadena">
            Note: Once voted, you cannot retract your vote.
          </p>
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
              I understand that voting is irreversible.
            </label>
          </div>
          <button
            className={styles.button}
            onClick={handleSubmit}
            disabled={!isChecked || (selectedVote.value as number) < 0}
          >
            {(selectedVote.value as number) < 0
              ? "Choose an option to vote"
              : !isChecked
                ? "Check the box above to vote"
                : `Vote ${selectedVote.name.toUpperCase()} in the ${poll.pollId} Poll`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollVoteModal;
