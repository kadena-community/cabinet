import React, { useRef, useEffect, useState } from "react";
import styles from "@/styles/main.module.css";
import InfoIcon from "@/assets/images/shared/info-icon.svg";
import { XCircle } from "react-feather";
interface InfoModalProps {
  topic: string;
  isOpen: boolean;
  onClose: () => void;
}

interface InfoProps {
  topic: string;
}

type InfoMap = {
  readonly [topic: string]: JSX.Element;
};

export enum InfoTopics {
  POLLING_POWER = "Voting Power",
  GENERAL_REWARDS = "Rewards",
  POLLS = "Polls",
}

export const INFO: InfoMap = {
  [InfoTopics.GENERAL_REWARDS]: (
    <div className="shadow-md rounded-lg p-6">
      <ul className="list-disc list-inside space-y-2">
        <li>
          Rewards are based on three factors: participation, time locked, and
          amount locked.
        </li>
        <li>
          When you lock KDA in a tier, all relevant information will be
          displayed.
        </li>
        <li>
          Your final rewards are calculated proportionally to your participation
          rate during the lockup period.
        </li>
        <li>
          Users can't participate multiple times simultaneously in a given
          lockup but can reenter after claiming.
        </li>
        <li>
          Participation rates, rewards, and voting power are independent between
          locks.
        </li>
        <li>
          Make sure to vote on all polls before claiming your rewards.
          Otherwise, you will still be able to vote but will not earn any
          rewards.
        </li>
      </ul>
    </div>
  ),
  [InfoTopics.POLLING_POWER]: (
    <div className="shadow-md rounded-lg p-6">
      <ul className="list-disc list-inside space-y-2">
        <li>
          Your polling power for a lockup is the product of your KDA amount and
          the multiplier of your lockup tier.
        </li>
        <li>
          Voting power is cumulative: if you have multiple ongoing lockups, the
          total voting power from all your lockups at the time of poll creation
          will be considered.
        </li>
      </ul>
    </div>
  ),
  [InfoTopics.POLLS]: (
    <div className="shadow-md rounded-lg p-6">
      <ul className="list-disc list-inside space-y-2">
        <li>
          When a poll is created, it is associated to all locks with at least
          one active user, and quorum is computed.
        </li>
        <li>
          After poll creation, there's a review period during which the poll can
          be edited.
        </li>
        <li>Voting is allowed only after the review period ends.</li>
        <li>
          Only users with an ongoing lockup at the time of poll creation can
          vote.
        </li>
      </ul>
    </div>
  ),
};

const InfoModal: React.FC<InfoModalProps> = ({ topic, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`${styles.modalOverlay} ${!isOpen && "hidden"}`}>
      <div className={styles.modalContainer}>
        <div ref={modalRef} className="modal">
          <div className="flex text-justify justify-between items-center border-black dark:border-gray-200 border-b">
            <h2 className={styles.modalHeader}>{topic} Info</h2>
            <XCircle className="mb-3 h-4 w-4" onClick={onClose} />
          </div>
          <div className={styles.modalBody}>{INFO[topic]}</div>
        </div>
      </div>
    </div>
  );
};

const Info: React.FC<InfoProps> = ({ topic }) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const handleOpenModal = (event: React.MouseEvent) => {
    event.stopPropagation();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div onClick={(e) => handleOpenModal(e)}>
        <InfoIcon />
      </div>
      {isModalOpen && (
        <InfoModal
          topic={topic}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default Info;
