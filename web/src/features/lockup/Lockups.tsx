import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  getLockupDetailsAsync,
  getLockupStatsAsync,
  selectLockupDetails,
  selectLockupStats,
  selectLockupLoading,
  selectLockupError,
} from "./lockupSlice";
import { getAllBondsAsync, selectAllBonds } from "../bond/bondSlice";
import { Lockup } from "./types";
import { useKadenaReact } from "../../kadena/core";
import { AppLoader } from "@/features/components/Loader";
import Error from "@/features/components/Error";
import styles from "../../styles/main.module.css";
import { useClaimRewards } from "@/hooks/useClaimRewards";

const Lockups: React.FC = () => {
  const dispatch = useAppDispatch();
  const lockups = useAppSelector(selectLockupDetails);
  const bonds = useAppSelector(selectAllBonds);
  const loading = useAppSelector(selectLockupLoading);
  const error = useAppSelector(selectLockupError);
  const kda = useKadenaReact();
  const handleClaimRewards = useClaimRewards();
  const [countdown, setCountdown] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (kda?.account) {
      dispatch(
        getLockupDetailsAsync({
          account: kda.account.account,
          ignoreCache: false,
        }),
      );
      dispatch(
        getLockupStatsAsync({
          account: kda.account.account,
          ignoreCache: false,
        }),
      );
      dispatch(getAllBondsAsync());
    }
  }, [dispatch, kda]);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedCountdown: { [key: string]: string } = {};
      lockups.forEach((lockup) => {
        updatedCountdown[lockup.lockupId] = getCountdown(lockup.lockupEndTime);
      });
      setCountdown(updatedCountdown);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockups]);

  const calculateCurrentRewards = (lockup: Lockup): number => {
    if (lockup.status === "locked") {
      const bond = bonds.find((e) => e.bondId === lockup.bondId);
      if (!bond) return 0.0;

      const baseApr = bond.baseApr;
      const timeMultiplier = lockup.lockupOption.timeMultiplier;
      const kdaLocked = lockup.kdaLocked;
      const maxKdaRewards = lockup.maxKdaRewards;

      const minRewards = timeMultiplier * kdaLocked * baseApr - kdaLocked;
      const participationRate = parseFloat(calculateParticipationRate(lockup));

      const rewards =
        minRewards +
        (isNaN(participationRate)
          ? 0
          : (participationRate / 100) * (maxKdaRewards - minRewards));

      return parseFloat(rewards.toFixed(3));
    } else if (lockup.status === "claimed") {
      return parseFloat(lockup.claimedKdaRewards.toFixed(3));
    }
    return 0.0;
  };

  const calculateParticipationRate = (lockup: Lockup): string => {
    if (lockup.status === "locked") {
      const bond = bonds.find((e) => e.bondId === lockup.bondId);
      if (!bond) return "0.0";
      if (bond.totalPolls == 0) return "0.0";
      return (
        (lockup.interactions / (bond.totalPolls - lockup.pollsAtLock)) *
        100
      ).toLocaleString("en-US", {
        style: "decimal",
        maximumFractionDigits: 2,
      });
    } else if (lockup.status === "claimed") {
      return (lockup.claimedKdaRewards / lockup.maxKdaRewards).toString();
    }
    return "0";
  };

  const getParticipationRateColor = (rate: number) => {
    if (rate < 33) {
      return "text-k-Pink-default";
    } else if (rate > 80) {
      return "text-k-Green-default";
    } else {
      return "text-k-Orange-default";
    }
  };

  const getCountdown = (lockupEndTime: string) => {
    const endTime = Date.parse(lockupEndTime);
    const now = new Date().getTime();
    const timeRemaining = endTime - now;

    if (timeRemaining <= 0) return "Claimable";

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
    );
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const isClaimable = (lockup: Lockup) => {
    const endTime = new Date(lockup.lockupEndTime).getTime();
    const now = new Date().getTime();
    return now >= endTime && lockup.status === "locked";
  };

  return (
    <div className="container mx-auto">
      {loading && (
        <div>
          <AppLoader size="96px" stroke="#E27B38" />
        </div>
      )}
      {error && <Error message={error} />}

      {!loading && !error && lockups.length > 0 && bonds.length > 0 && (
        <>
          <h1 className="text-xl font-semibold mb-4 mt-4">
            Your Active Lockups
          </h1>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Grid layout with a minimum width to prevent shrinking */}
              <div className="grid grid-cols-6 mb-2 px-2">
                <span className="col-span-1 flex-shrink-0">Date</span>
                <span className="col-span-1 flex-shrink-0">KDA Locked</span>
                <span className="col-span-1 flex-shrink-0">Max Rewards</span>
                <span className="col-span-1 flex-shrink-0">
                  Current Rewards
                </span>
                <span className="col-span-1 flex-shrink-0">
                  Participation Rate
                </span>
                <span className="col-span-1 flex-shrink-0">Action</span>
              </div>

              {/* Cards with no shrinking and horizontal overflow handling */}
              <div className="space-y-4">
                {lockups.map((lockup: Lockup) => (
                  <div
                    key={lockup.lockupStartTime}
                    className={`innerCard grid grid-cols-6 gap-4 p-4 mt-2 mb-2 items-center`}
                  >
                    <div className="col-span-1 flex-shrink-0">
                      <p className={`${styles.cardComment}`}>
                        {new Date(lockup.lockupStartTime).toLocaleDateString()}
                        <br />
                        {new Date(lockup.lockupStartTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="col-span-1 flex-shrink-0">
                      <p className={`${styles.cardItem}`}>
                        {lockup.kdaLocked?.toLocaleString("en-US", {
                          style: "decimal",
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="col-span-1 flex-shrink-0">
                      <p className={`${styles.cardItem}`}>
                        {lockup.maxKdaRewards.toLocaleString("en-US", {
                          style: "decimal",
                          maximumFractionDigits: 2,
                        })}{" "}
                        KDA
                      </p>
                    </div>
                    <div className="col-span-1 flex-shrink-0">
                      <p className={`${styles.cardItem}`}>
                        {calculateCurrentRewards(lockup)} KDA
                      </p>
                    </div>
                    <div className="col-span-1 flex-shrink-0">
                      <p
                        className={`${styles.cardItem} ${getParticipationRateColor(
                          parseFloat(calculateParticipationRate(lockup)),
                        )}`}
                      >
                        {calculateParticipationRate(lockup) == "NaN"
                          ? "0"
                          : calculateParticipationRate(lockup)}
                        %
                      </p>
                    </div>
                    <div className="col-span-1 flex-shrink-0 flex justify-end">
                      <button
                        className={`${styles.button} ${
                          isClaimable(lockup) ? "" : styles.buttonDisabled
                        } w-full sm:w-auto`}
                        onClick={() => {
                          handleClaimRewards(
                            lockup,
                            calculateCurrentRewards(lockup),
                          );
                        }}
                        disabled={!isClaimable(lockup)}
                      >
                        {lockup.status === "claimed"
                          ? "Rewards Claimed"
                          : countdown[lockup.lockupId] === "Claimable"
                            ? "Claim"
                            : `Claimable in ${countdown[lockup.lockupId]}`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Lockups;
