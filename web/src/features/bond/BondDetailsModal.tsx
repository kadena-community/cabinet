import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { toggleDisplayAmount, selectDisplayAmount } from "./bondSlice";
import { Bond } from "../bond/types";
import { bondAvailableRewards } from "../manageRewards/manageRewardsComponent";
import LockupsOverTimeBarChart from "./LockupsOverTimeBarChart";
import OptionNamePieChart from "./OptionNamePieChart";
import AllBondLockupsComponent from "./AllBondLockups";
import { XCircle } from "react-feather";
import styles from "../../styles/main.module.css";
import LockupDensityChart from "./LockupDensityChart";
import CopyButton from "../votes/CopyButton";
import BondRewardsRadialBarChart from "./BondRewardsRadialBarChart";
import { shortenKAddress } from "@/utils/kadenaHelper";
import LockupOptionsDisplay from "./lockupOptionsDisplay";

interface BondDetailsModalProps {
  bond: Bond;
  isOpen: boolean;
  onClose: () => void;
}

const BondDetailsModal: React.FC<BondDetailsModalProps> = ({
  bond,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const displayAmount = useAppSelector(selectDisplayAmount);

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

  const handleToggle = () => {
    dispatch(toggleDisplayAmount());
  };

  const formatNumber = (number: number | undefined) =>
    number != null ? `${number.toLocaleString()} KDA` : "N/A";

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
        <div ref={modalRef}>
          <div className="flex justify-between items-center border-b border-black dark:border-gray-200 pb-3 mb-4">
            <h2 className="text-2xl font-semibold">
              {formatLockupId(bond.bondId)} Details
            </h2>
            <XCircle
              className="cursor-pointer w-8 h-8 mb-3"
              onClick={onClose}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8 mb-8 w-full">
            <div className={`${styles.cardItem}`}>
              <h3 className="text-lg">Min Amount</h3>
              <p className="text-xl">{formatNumber(bond.minAmount)}</p>
            </div>
            <div className={`${styles.cardItem}`}>
              <h3 className="text-lg">Max Amount</h3>
              <p className="text-xl">{formatNumber(bond.maxAmount)}</p>
            </div>
            <div className={`${styles.cardItem}`}>
              <h3 className="text-lg">Creator</h3>
              <div className="flex items-center">
                <p className="ml-2">{shortenKAddress(bond.creator)}</p>
                <CopyButton toCopy={bond.creator} iconSize={4} />
              </div>
            </div>

            <div className={`${styles.cardItem}`}>
              <h3 className="text-lg">Active Cabinet Members</h3>
              <p className="text-xl">{bond.activeBonders}</p>
            </div>
            <div className={`${styles.cardItem}`}>
              <h3 className="text-lg">Total Polls</h3>
              <p className="text-xl">{bond.totalPolls}</p>
            </div>
            <div className={`${styles.cardItem}`}>
              <h3 className="text-lg">Total Rewards</h3>
              <p className="text-xl">{formatNumber(bond.totalRewards)}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="dashboardTitle">Lockup Options</p>
            <LockupOptionsDisplay bond={bond} />
          </div>
          <div className="flex flex-col grid grid-cols-1 md:grid-cols-2 mt-8 mb-24 gap-x-24">
            <LockupDensityChart />
            <BondRewardsRadialBarChart bond={bond} />
            <span></span>
          </div>
          <div className="flex justify-end mt-4 mb-4">
            <button className={styles.button} onClick={handleToggle}>
              {displayAmount ? "Display Lockup Count" : "Display Amount"}
            </button>
          </div>
          <div className="flex flex-col grid grid-cols-1 md:grid-cols-2 gap-x-24 md:flex-row md:gap-x-4">
            <LockupsOverTimeBarChart />
            <OptionNamePieChart />
          </div>
          <AllBondLockupsComponent bondId={bond.bondId} />
        </div>
      </div>
    </div>
  );
};

export default BondDetailsModal;
