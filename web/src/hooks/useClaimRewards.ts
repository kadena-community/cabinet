import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  getLockupDetailsAsync,
  getLockupStatsAsync,
} from "@/features/lockup/lockupSlice";
import { listen, getRandomId, localTxn } from "@/utils/kadenaHelper";
import {
  useAddPopup,
  useAddTransaction,
  useUpdateTransaction,
} from "@/features/main/hooks";
import claimLockup from "@/features/claim/claimLockup";
import {
  selectGasStationEnabled,
  selectGasConfig,
} from "@/features/gasStation/gasSlice";
import { Lockup } from "@/features/lockup/types";
import { useKadenaReact } from "@/kadena/core";
import { CHAIN_INFO, KADENA_NETWORK_ID } from "@/constants/chainInfo";
import Pact from "pact-lang-api";
import { Bond } from "@/features/bond/types";

export function useClaimRewards() {
  const dispatch = useAppDispatch();
  const addPopup = useAddPopup();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const isGasStationEnabled = useAppSelector(selectGasStationEnabled);
  const userGasConfig = useAppSelector(selectGasConfig);
  const { account, connector } = useKadenaReact();

  async function handleClaimRewards(lockup: Lockup, currentRewards: number) {
    if (!lockup.account || !lockup.bondId) {
      return;
    }

    const now = new Date().getTime();
    const lockupEndTime = Date.parse(lockup.lockupEndTime);
    if (now <= lockupEndTime) {
      return;
    }

    const totalAmount = lockup.kdaLocked + currentRewards;
    console.log(totalAmount);
    const signCmd = await claimLockup({
      bondId: lockup.bondId,
      account: lockup.account,
      originalAmount: lockup.kdaLocked,
      totalAmount: totalAmount,
      gasStationEnabled: isGasStationEnabled,
      gasConfig: userGasConfig,
    });
    const nodeUrl = CHAIN_INFO[KADENA_NETWORK_ID].nodeUrl;

    const response = await connector.signTx(signCmd);

    console.log("resp:", response);
    if (response.status === "success" && response.signedCmd?.hash) {
      const localRes = await localTxn(response.signedCmd);
      console.log("Local:", JSON.stringify(localRes));

      if (localRes?.result?.status === "success") {
        try {
          const poll = await Pact.wallet.sendSigned(
            response.signedCmd,
            nodeUrl,
          );
          console.log("send tx:", poll);

          const reqKey = poll.requestKeys ? poll.requestKeys[0] : undefined;

          if (reqKey) {
            addPopup(
              {
                reqKey: reqKey,
                msg: `Claim request pending, do not refresh the page. \n ${reqKey}`,
                status: "PENDING",
              },
              getRandomId(),
            );
            addTransaction({
              eventId: lockup.bondId,
              status: "loading",
              tx: reqKey,
            });

            const pollRes = await listen(reqKey);
            if (pollRes) {
              addPopup(
                {
                  reqKey: reqKey,
                  msg: `Claim successful`,
                  status: "SUCCESS",
                },
                getRandomId(),
              );
              updateTransaction({
                eventId: lockup.bondId,
                status: "succeeded",
                tx: reqKey,
              });
              dispatch(
                getLockupDetailsAsync({
                  account: lockup.account,
                  ignoreCache: true,
                }),
              );
              dispatch(
                getLockupStatsAsync({
                  account: lockup.account,
                  ignoreCache: true,
                }),
              );
            }
          } else {
            addPopup(
              { msg: `Failed to retrieve request key`, status: "ERROR" },
              getRandomId(),
            );
          }
        } catch (error) {
          addPopup(
            {
              msg: `Failed to send transaction: ${(error as Error).message}`,
              status: "ERROR",
            },
            getRandomId(),
          );
        }
      } else {
        addPopup(
          { msg: `${localRes?.message}`, status: "ERROR" },
          response.signedCmd.hash,
        );
      }
    } else {
      addPopup({ msg: `${response.errors}`, status: "ERROR" }, getRandomId());
    }
  }

  return handleClaimRewards;
}
