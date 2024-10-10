import React, { useState } from "react";
import { AccountStats } from "./types";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectLockupStats, selectLockupLoading } from "./lockupSlice";
import styles from "../../styles/main.module.css";
import Lockups from "./Lockups";
import { AppLoader } from "@/features/components/Loader";
import HoverButton from "@/features/components/HoverButton";

interface StatsCardProps {
  account: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ account }) => {
  const stats = useAppSelector(selectLockupStats);
  const [isExpanded, setIsExpanded] = useState(true);
  const loading = useAppSelector(selectLockupLoading);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!stats) return null; // Guard clause if stats are not provided

  return (
    <div className="container mx-auto">
      <div className="card">
        <h1 className="text-xl font-semibold">Your Lockup Details</h1>
        {loading && (
          <div>
            <AppLoader true size="48px" stroke="#E27B38" />
          </div>
        )}
        {!loading && (
          <div className="flex mx-auto justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8 mb-8 w-full">
              <div className={`${styles.cardItem} mb-3`}>
                <h3 className="text-lg">Total Amount Locked</h3>
                <p className="text-2xl">
                  {stats.CurrentLockedAmount?.toLocaleString("en-US", {
                    style: "decimal",
                    maximumFractionDigits: 2,
                  })}{" "}
                  KDA
                </p>
              </div>
              <div className={`${styles.cardItem} mb-3`}>
                <h3
                  className="text-lg"
                  title="This is the average maximum returns based on all your lockups, calculated as the weighted average of the base APRs adjusted by time multipliers and maximum boosts for each lockup."
                >
                  Avg Max Rewards
                </h3>
                <p className="text-2xl">
                  {(stats.MeanBaseReturns * 100).toFixed(2)}%
                </p>
              </div>
              <div className={`${styles.cardItem} mb-3`}>
                <h3 className="text-lg">Total Rewards</h3>
                <p className="text-2xl">
                  {stats.TotalClaimedRewards?.toLocaleString("en-US", {
                    style: "decimal",
                    maximumFractionDigits: 2,
                  })}{" "}
                  KDA
                </p>
              </div>
              <div className={`${styles.cardItem} mb-3`}>
                <h3 className="text-lg">Rewards to earn</h3>
                <p className="text-2xl">
                  {stats.RewardsToEarn?.toLocaleString("en-US", {
                    style: "decimal",
                    maximumFractionDigits: 2,
                  })}{" "}
                  KDA
                </p>
              </div>
            {stats.NextClaimTime && (
              <div className={`${styles.cardItem} mb-3`}>
                <h3 className="text-lg">Next Unlock Date</h3>
                <p className="text-2xl">
                  {new Date(stats.NextClaimTime).toLocaleDateString()}
                </p>
              </div>
            )}
            {stats.LastClaimTime &&
             stats.LastClaimTime !== stats.NextClaimTime && (
               <div className={`${styles.cardItem} mb-3`}>
                 <h3 className="text-lg">Last Unlock Date</h3>
                 <p className="text-2xl">
                   {new Date(stats.LastClaimTime).toLocaleDateString()}
                 </p>
               </div>
            )}
            </div>
          </div>
        )}
        <div className="mb-2">
          <HoverButton onClick={handleToggleExpand} isExpanded={isExpanded} />
        </div>
        {isExpanded && account && (
          <div className="w-full mt-4">
            <Lockups />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
