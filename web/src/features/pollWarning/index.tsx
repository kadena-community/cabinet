import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectAllActivePolls,
  fetchCanAccountVoteMultiple,
  selectAccountVoteStatus,
  fetchActivePolls,
} from "@/features/poll/pollSlice";
import { useKadenaReact } from "@/kadena/core";
import { useAddPopup } from "../main/hooks";
import { getRandomId } from "@/utils/kadenaHelper";

const VoteWarning: React.FC = () => {
  const dispatch = useAppDispatch();
  const kda = useKadenaReact();
  const activePolls = useAppSelector(selectAllActivePolls);
  const account = kda.account?.account;
  const addPopup = useAddPopup();
  const voteStatus = useAppSelector(selectAccountVoteStatus);

  // // logic to prompt user to vote
  // useEffect(() => {
  //   if (!account && activePolls) {
  //     addPopup(
  //       {
  //         reqKey: undefined,
  //         msg: `Active Poll Available - Go vote today`,
  //         status: "INFO",
  //       },
  //       getRandomId(),
  //     );
  //   }
  // }, [dispatch, account]);

  useEffect(() => {
    dispatch(fetchActivePolls(false));
    const fetchVoteStatus = async () => {
      if (account && activePolls) {
        console.log(JSON.stringify(activePolls));
        const pollIds = activePolls.map((poll) => poll.pollId);
        try {
          dispatch(
            fetchCanAccountVoteMultiple({
              account,
              pollIds,
              ignoreCache: true,
            }),
          );

          const hasTrue = Object.values(voteStatus).some(
            (value) => value === true,
          );
          if (hasTrue) {
            addPopup(
              {
                reqKey: undefined,
                msg: `There are active polls for you. Go vote today!`,
                status: "INFO",
              },
              getRandomId(),
            );
          }
        } catch (error) {
          console.error("Error fetching vote status:", error);
        }
      }
    };

    fetchVoteStatus();
  }, [account, dispatch]);

  return null;
};

export default VoteWarning;
