import { useAppDispatch } from "@/app/hooks";
import {
  useAddPopup,
  useAddTransaction,
  useUpdateTransaction,
} from "@/features/main/hooks";
import { listen, getRandomId, localTxn } from "@/utils/kadenaHelper";
import createBond from "@/features/createBond/createBond";
import { useKadenaReact } from "@/kadena/core";
import Pact from "pact-lang-api";
import { CHAIN_INFO, KADENA_NETWORK_ID } from "@/constants/chainInfo";
import { getAllBondsAsync } from "@/features/bond/bondSlice";
import { NewBond } from "@/features/bond/types";

export function useCreateBond() {
  const dispatch = useAppDispatch();
  const addPopup = useAddPopup();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const { connector } = useKadenaReact();

  async function handleSubmit(newBond: NewBond) {
    const signCmd = await createBond(newBond);
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
                msg: `Bond creation pending, do not refresh the page. \n ${reqKey}`,
                status: "PENDING",
              },
              getRandomId(),
            );
            addTransaction({
              eventId: reqKey,
              status: "loading",
              tx: reqKey,
            });

            const pollRes = await listen(reqKey);
            if (pollRes) {
              addPopup(
                {
                  reqKey: reqKey,
                  msg: `Bond created successfully.`,
                  status: "SUCCESS",
                },
                getRandomId(),
              );
              updateTransaction({
                eventId: reqKey,
                status: "succeeded",
                tx: reqKey,
              });
              dispatch(getAllBondsAsync());
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

  return handleSubmit;
}
