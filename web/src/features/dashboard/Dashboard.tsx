import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  getAmountDistributionAsync,
  getApiAnalyticsAsync,
  getDailyLockupsAsync,
  getLockTimeDistributionAsync,
  getDailyTvlAsync,
  selectApiDashboard,
  getCumulativeLockupsAsync,
  selectLoadingState,
} from "./dashboardSlice";
import { BLOCK_EXPLORER } from "@/constants/chainInfo";
import styles from "../../styles/main.module.css";
import {
  getRandomId,
  shortenHash,
  shortenKAddress,
} from "../../utils/kadenaHelper";
import LockTimeDistributionChart from "./lockTimeChart";
import AmountDistributionChart from "./amountChart";
import DailyLockupsChart from "./dailyLockupsChart";
import DailyTvlChart from "./dailyTvlChart";
import CumulativeLockupChart from "./cumulativeLockups";
import { AppLoader } from "../components/Loader";
import { useAddPopup } from "../main/hooks";
import { fetchActivePolls } from "../poll/pollSlice";

const formatNumber = (num: number) => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + "B";
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + "M";
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + "K";
  } else {
    return num.toFixed(2);
  }
};

const DashboardComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const dashboardDetails = useAppSelector(selectApiDashboard);
  const loading = useAppSelector(selectLoadingState);
  const addPopup = useAddPopup();

  useEffect(() => {
    dispatch(getApiAnalyticsAsync());
  }, [dispatch]);
  useEffect(() => {
    dispatch(getLockTimeDistributionAsync());
  }, [dispatch]);
  useEffect(() => {
    dispatch(getAmountDistributionAsync(false));
  }, [dispatch]);
  useEffect(() => {
    dispatch(getDailyTvlAsync(false));
  }, [dispatch]);
  useEffect(() => {
    dispatch(getDailyLockupsAsync(false));
  }, [dispatch]);
  useEffect(() => {
    dispatch(getCumulativeLockupsAsync(false));
  }, [dispatch]);

  if (
    loading.apiAnalytics ||
    loading.amountDistribution ||
    loading.dailyTvl ||
    loading.lockTimeDistribution ||
    loading.dailyLockups ||
    loading.cumulativeLockups
  )
    return (
      <div className="card">
        <h1 className="dashboardTitle">Cabinet Overview</h1>

        <AppLoader size="48px" stroke="#E27B38" />
      </div>
    );

  return (
    <div className="card break-words flex-grow justify-center">
      <h1 className="dashboardTitle">Cabinet Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <div className="mb-3 flex flex-col h-full text-bold text-gray-900 font-kadena dark:text-white">
          <h2 className="text-lg text-bold">Total KDA in Cabinet</h2>
          <p className="text-2xl">
            {dashboardDetails?.AmountLocked?.toLocaleString("en-US", {
              style: "decimal",
              maximumFractionDigits: 2,
            })}{" "}
            KDA
          </p>
        </div>
        {/*<div className={`${styles.cardItem} mb-3 flex flex-col h-full`}>
          <h2 className="text-lg">Overall Total Locked</h2>
          <p className="text-2xl">
            {formatNumber(dashboardDetails?.TotalLockedAmount || 0)} KDA
          </p>
        </div>
        <div className={`${styles.cardItem} mb-3 flex flex-col h-full`}>
          <h2 className="text-lg">Given Rewards</h2>
          <p className="text-2xl">
            {dashboardDetails?.DistributedRewards?.toLocaleString("en-US", {
              style: "decimal",
              maximumFractionDigits: 2,
            })}{" "}
            KDA
          </p>
        </div>*/}

        <div className={`${styles.cardItem} mb-3 flex flex-col h-full`}>
          <h2 className="text-lg">Rewards up to</h2>
          <p className="text-2xl">
            {dashboardDetails?.MaxReturnRate?.toLocaleString("en-US", {
              style: "percent",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        {/*<div className={`${styles.cardItem} mb-3 flex flex-col h-full`}>
          <h2 className="text-lg">Active Polls</h2>
          <p className="text-2xl">{dashboardDetails?.ActivePolls}</p>
        </div>*/}
        <div className={`${styles.cardItem} mb-3 flex flex-col h-full`}>
          <h2 className="text-lg">Available Rewards</h2>
          <p className="text-2xl">
            {dashboardDetails?.AvailableRewards?.toLocaleString("en-US", {
              style: "decimal",
              maximumFractionDigits: 2,
            })}{" "}
            KDA
          </p>
        </div>
        <div className={`${styles.cardItem} mb-3 flex flex-col h-full`}>
          <h2 className="text-lg">Total Lockups</h2>
          <p className="text-2xl">{dashboardDetails?.TotalLockers}</p>
        </div>
        <div className={`${styles.cardItem} mb-3 flex flex-col h-full`}>
          <h2 className="text-lg">Average Lockup Period</h2>
          <p className="text-2xl">{dashboardDetails?.AverageLockup}</p>
        </div>
        <div className={`${styles.cardItem} mb-8 flex flex-col h-full`}>
          <h2 className="text-lg">Most Voted Poll</h2>
          <p className="text-2xl">{dashboardDetails?.MostVotedPoll}</p>
        </div>
      </div>

      <div className="w-full">
        <h1 className="dashboardTitle">Analytics</h1>
        <div className="flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-2 break-words">
            Cumulative KDA Lockup Amount
          </h2>
          <div className="mb-8">
            <CumulativeLockupChart />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-2 break-words">
              Lockup Period Distribution
            </h2>
            <LockTimeDistributionChart />
          </div>
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-2 break-words">
              Amount Distribution
            </h2>
            <AmountDistributionChart />
          </div>
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-2 break-words">
              Daily Lockups
            </h2>
            <DailyLockupsChart />
          </div>
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-semibold mb-2 break-words">
              Predicted TVL
            </h2>
            <DailyTvlChart />
          </div>
        </div>
      </div>
      {dashboardDetails?.LatestLocks &&
        (dashboardDetails?.LatestClaims?.length > 0 ||
          dashboardDetails?.LatestVotes?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 w-full">
            <div>
              <h2 className="text-xl font-semibold mt-6">Last Locks</h2>
              <ul>
                {dashboardDetails?.LatestLocks.map((lock, index) => (
                  <li
                    key={index}
                    className={`${styles.listItem} rounded-lg p-3`}
                  >
                    <a
                      href={BLOCK_EXPLORER(lock.RequestKey)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p>
                        {lock.LockedAmount?.toLocaleString("en-US", {
                          style: "decimal",
                          maximumFractionDigits: 2,
                        })}{" "}
                        KDA +{" "}
                        {lock.MaxRewards?.toLocaleString("en-US", {
                          style: "decimal",
                          maximumFractionDigits: 2,
                        })}{" "}
                        KDA rewards
                      </p>
                      <p>
                        Locked at {new Date(lock.LockTime).toLocaleString()}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {dashboardDetails?.LatestClaims?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mt-6">Last Claims</h2>
                <ul>
                  {dashboardDetails?.LatestClaims.map((claim, index) => (
                    <li
                      key={index}
                      className={`${styles.listItem} rounded-lg p-3`}
                    >
                      <a
                        href={BLOCK_EXPLORER(claim.RequestKey)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <p>
                          {claim.Amount?.toLocaleString("en-US", {
                            style: "decimal",
                            maximumFractionDigits: 2,
                          })}{" "}
                          KDA +{" "}
                          {(claim.TotalAmount - claim.Amount)?.toLocaleString(
                            "en-US",
                            {
                              style: "decimal",
                              maximumFractionDigits: 2,
                            },
                          )}{" "}
                          KDA rewards
                        </p>
                        <p>
                          Claimed at{" "}
                          {new Date(claim.ClaimTime).toLocaleString()}
                        </p>{" "}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {dashboardDetails?.LatestVotes?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mt-6">Last Votes</h2>
                <ul>
                  {dashboardDetails?.LatestVotes.map((vote, index) => (
                    <li
                      key={index}
                      className={`${styles.listItem} rounded-lg p-3`}
                    >
                      <a
                        href={BLOCK_EXPLORER(vote.RequestKey)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <p>
                          {vote.PollId}: {vote.Action} by{" "}
                          {shortenKAddress(vote.Account)}
                        </p>
                        <p>
                          Voted at {new Date(vote.VoteTime).toLocaleString()}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default DashboardComponent;
