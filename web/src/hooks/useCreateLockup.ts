import { useAppDispatch } from "@/app/hooks";
import {
  useAddPopup,
  useAddTransaction,
  useUpdateTransaction,
} from "@/features/main/hooks";
import { listen, getRandomId, localTxn, sendTxn } from "@/utils/kadenaHelper";
import {
  getLockupDetailsAsync,
  getLockupStatsAsync,
} from "@/features/lockup/lockupSlice";
import createLockup from "@/features/lockup/createLockup";
import { INewLockup } from "@/features/lockup/types";
import { useKadenaReact } from "@/kadena/core";

export function useCreateLockup() {
  const dispatch = useAppDispatch();
  const addPopup = useAddPopup();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const { connector } = useKadenaReact();

  async function handleNewLockup(params: INewLockup) {
    const { bondId, account } = params;
    if (!account || !bondId) return;

    const signCmd = await createLockup(params);

    const response = await connector.signTx(signCmd);

    console.log("Signed response:", response);
    if (response.status === "success" && response.signedCmd?.hash) {
      const localRes = await localTxn(response.signedCmd);
      console.log("Local response:", JSON.stringify(localRes));

      if (localRes?.result?.status === "success") {
        try {
          const poll = await sendTxn(response.signedCmd);
          console.log("Send Response:", poll);

          const reqKey = poll?.reqKey ? poll.reqKey : undefined;

          if (reqKey) {
            addPopup(
              {
                reqKey: reqKey,
                msg: `Lockup request pending, do not refresh the page. \n ${reqKey}`,
                status: "PENDING",
              },
              getRandomId(),
            );
            addTransaction({
              eventId: bondId,
              status: "loading",
              tx: reqKey,
            });

            const pollRes = await listen(reqKey);
            if (pollRes) {
              addPopup(
                {
                  reqKey: reqKey,
                  msg: `Lockup created successfully. Make sure to participate in polls in order to earn participation rewards.`,
                  status: "SUCCESS",
                },
                getRandomId(),
              );
              updateTransaction({
                eventId: bondId,
                status: "succeeded",
                tx: reqKey,
              });
              dispatch(
                getLockupDetailsAsync({ account: account, ignoreCache: true }),
              );
              dispatch(
                getLockupStatsAsync({ account: account, ignoreCache: true }),
              );
            }
          } else {
            addPopup({ msg: poll?.message, status: "ERROR" }, getRandomId());
          }
        } catch (error) {
          addPopup(
            {
              msg: `Failed to send transaction: ${error}`,
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

  return handleNewLockup;
}
