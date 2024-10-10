import { useKadenaReact } from "../../kadena/core";
import Polls from "../../features/poll/Polls";
import { useAppDispatch } from "@/app/hooks";
import { useEffect } from "react";
import {
    fetchUserVotes,
    fetchVoteStatsAsync,
} from "@/features/votes/votesSlice";
import VoteStatsCard from "@/features/votes/accountVoteStatsCard";

const Vote: React.FC = (): JSX.Element => {
  const { account } = useKadenaReact();
  const dispatch = useAppDispatch();


      useEffect(() => {
        if (account?.account) {
      dispatch(
        fetchUserVotes({ account: account.account, ignoreCache: false }),
      );
      dispatch(
        fetchVoteStatsAsync({ account: account.account, ignoreCache: false }),
      );
    }
      }, [dispatch, account?.account]);


  return (
    <main className="contentWrapper">
      {account?.account && <VoteStatsCard account={account.account}/>}
      <Polls />
    </main>
  );
};

export default Vote;
