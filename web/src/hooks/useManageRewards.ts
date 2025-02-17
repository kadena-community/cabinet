import { useAppDispatch } from "@/app/hooks";
import {
  useAddPopup,
  useAddTransaction,
  useUpdateTransaction,
} from "@/features/main/hooks";
import { listen, getRandomId, localTxn, sendTxn } from "@/utils/kadenaHelper";
import { getAllBondsAsync } from "@/features/bond/bondSlice";
import { useKadenaReact } from "@/kadena/core";
import addBondRewards from "@/features/manageRewards/addRewardsTx";
import claimBackRewards from "@/features/manageRewards/claimBackRewardsTx";
import IManageRewards from "@/features/manageRewards/types";

export function useManageRewards() {
  const dispatch = useAppDispatch();
  const addPopup = useAddPopup();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const { connector } = useKadenaReact();

  async function handleAddRewards(
    params: IManageRewards,
    onSuccess: () => void,
  ) {
    const { bondId, account } = params;
    if (!account || !bondId) return;

    const signCmd = await addBondRewards(params);

    const response = await connector.signTx(signCmd);

    console.log("resp:", response);
    if (response.status === "success" && response.signedCmd?.hash) {
      const localRes = await localTxn(response.signedCmd);
      console.log("Local:", JSON.stringify(localRes));

      if (localRes?.result?.status === "success") {
        try {
          const poll = await sendTxn(response.signedCmd);
          console.log("Send Response:", poll);

          const reqKey = poll?.reqKey ? poll.reqKey : undefined;

          if (reqKey) {
            addPopup(
              {
                reqKey: reqKey,
                msg: `Add bond rewards pending - Tx: ${reqKey}`,
                status: "PENDING",
              },
              getRandomId(),
            );
            addTransaction({
              eventId: bondId,
              status: "loading",
              tx: reqKey,
            });

            onSuccess(); // Close the modal

            const pollRes = await listen(reqKey);
            if (pollRes) {
              addPopup(
                {
                  reqKey: reqKey,
                  msg: `Bond rewards added successfully.`,
                  status: "SUCCESS",
                },
                getRandomId(),
              );
              updateTransaction({
                eventId: bondId,
                status: "succeeded",
                tx: reqKey,
              });
              dispatch(getAllBondsAsync());
            }
          } else {
            addPopup({ msg: poll?.message, status: "ERROR" }, getRandomId());
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

  async function handleClaimBackRewards(
    params: IManageRewards,
    onSuccess: () => void,
  ) {
    const { bondId, account } = params;
    if (!account || !bondId) return;

    const signCmd = await claimBackRewards(params);

    const response = await connector.signTx(signCmd);

    console.log("resp:", response);
    if (response.status === "success" && response.signedCmd?.hash) {
      const localRes = await localTxn(response.signedCmd);
      console.log("Local:", JSON.stringify(localRes));

      if (localRes?.result?.status === "success") {
        try {
          const poll = await sendTxn(response.signedCmd);
          console.log("Send Response:", poll);

          const reqKey = poll?.reqKey ? poll.reqKey : undefined;

          if (reqKey) {
            addPopup(
              {
                reqKey: reqKey,
                msg: `Claim back rewards pending - Tx: ${reqKey}`,
                status: "PENDING",
              },
              getRandomId(),
            );
            addTransaction({
              eventId: bondId,
              status: "loading",
              tx: reqKey,
            });

            onSuccess(); // Close the modal

            const pollRes = await listen(reqKey);
            if (pollRes) {
              addPopup(
                {
                  reqKey: reqKey,
                  msg: `Claim back rewards successful.`,
                  status: "SUCCESS",
                },
                getRandomId(),
              );
              updateTransaction({
                eventId: bondId,
                status: "succeeded",
                tx: reqKey,
              });
              dispatch(getAllBondsAsync());
            }
          } else {
            addPopup({ msg: poll?.message, status: "ERROR" }, getRandomId());
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

  return {
    handleAddRewards,
    handleClaimBackRewards,
  };
}
