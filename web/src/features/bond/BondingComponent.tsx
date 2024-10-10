import { useAppDispatch, useAppSelector } from "@/app/hooks";
import React, { useEffect } from "react";
import {
  getLockupStatsAsync,
  selectLockupError,
  selectLockupLoading,
  selectLockupStats,
} from "../lockup/lockupSlice";
import { useKadenaReact } from "@/kadena/core";
import { useAddTransaction, useUpdateTransaction } from "../main/hooks";

const BondingComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectLockupStats);
  const loading = useAppSelector(selectLockupLoading);
  const error = useAppSelector(selectLockupError);
  const kda = useKadenaReact();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();

  useEffect(() => {
    if (kda?.account) {
      dispatch(getLockupStatsAsync({account: kda.account.account, ignoreCache: false}));
    }
  }, [dispatch, kda]);

  const stakingDetails = stats;
  return (
    <div className="bg-k-Blue-default rounded-lg p-4 text-white max-w-xl mx-auto my-4">
      <div className="text-lg font-bold mb-2">My Account</div>
      <div className="mb-4">
        <div>You are bonding</div>
        <div className="text-3xl font-semibold">
          {stakingDetails?.CurrentLockedAmount} KDA
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div>Mean return rate:</div>
          <div className="font-semibold">
            {stakingDetails?.MeanBaseReturns}%
          </div>
        </div>
        <div>
          <div>Rewards to Earn</div>
          <div className="font-semibold">
            {stakingDetails?.RewardsToEarn} KDA
          </div>
        </div>
        <div>
          <div>Total Claimed</div>
          <div className="font-semibold">
            {stakingDetails?.TotalClaimedRewards}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BondingComponent;
