import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  useAddPopup,
  useAddTransaction,
  useUpdateTransaction,
} from "@/features/main/hooks";
import { listen, getRandomId, localTxn } from "@/utils/kadenaHelper";
import { useKadenaReact } from "@/kadena/core";
import { CHAIN_INFO, KADENA_NETWORK_ID } from "@/constants/chainInfo";
import {
  fetchUserVotes,
  fetchVoteStatsAsync,
  getPollVotesSummaryAsync,
} from "@/features/votes/votesSlice";
import voteOnPoll from "@/features/poll/voteCallback";
import {
  selectGasStationEnabled,
  selectGasConfig,
} from "@/features/gasStation/gasSlice";
import Pact from "pact-lang-api";
import { fetchAllPolls } from "@/features/poll/pollSlice";

export function useVoteOnPoll() {
  const dispatch = useAppDispatch();
  const addPopup = useAddPopup();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const isGasStationEnabled = useAppSelector(selectGasStationEnabled);
  const userGasConfig = useAppSelector(selectGasConfig);
  const { account, connector } = useKadenaReact();

  async function handleVote(
    pollId: string,
    vote: number,
  ) {
    if (!account?.account) {
      addPopup({
        msg: "You must connect your wallet to vote.",
        status: "ERROR",
      });
      return;
    }

    const signCmd = await voteOnPoll(
      pollId,
      vote,
      account.account,
      isGasStationEnabled,
      userGasConfig,
    );
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
                msg: `Vote request pending, do not refresh the page. \n ${reqKey}`,
                status: "PENDING",
              },
              getRandomId(),
            );

            addTransaction({ eventId: pollId, status: "loading", tx: reqKey });

            const pollRes = await listen(reqKey);
            if (pollRes) {
              addPopup(
                {
                  reqKey: reqKey,
                  msg: `Vote successfully recorded for poll. Make sure to interact with polls in order to earn rewards.`,
                  status: "SUCCESS",
                },
                getRandomId(),
              );
              updateTransaction({
                eventId: pollId,
                status: "succeeded",
                tx: reqKey,
              });

              dispatch(
                fetchVoteStatsAsync({
                  account: account.account,
                  ignoreCache: true,
                }),
              );
              dispatch(fetchAllPolls({ ignoreCache: true }));
              dispatch(
                fetchUserVotes({ account: account.account, ignoreCache: true }),
              );
              dispatch(getPollVotesSummaryAsync({ pollId, ignoreCache: true }));
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

  return handleVote;
}
