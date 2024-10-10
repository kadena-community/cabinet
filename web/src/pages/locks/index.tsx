import {useEffect} from 'react';
import Bonds from "../../features/bond/Bonds";
import StatsCard from '@/features/lockup/AccountStatsCard';
import { useKadenaReact } from "../../kadena/core";
import {
    getLockupDetailsAsync,
    getLockupStatsAsync
} from "@/features/lockup/lockupSlice";
import { useAppDispatch } from "@/app/hooks";

const Bond: React.FC = (): JSX.Element => {

    const { account } = useKadenaReact();
    const dispatch = useAppDispatch();

  useEffect(() => {
    if (account?.account) {
      dispatch(
        getLockupDetailsAsync({ account: account.account, ignoreCache: false }),
      );
      dispatch(
        getLockupStatsAsync({ account: account.account, ignoreCache: false }),
      );
    }
  }, [dispatch, account?.account]);



    return (
      <main className="contentWrapper">
  {account?.account && (
    <div className="mb-4">
      <StatsCard account={account?.account} />
    </div>
  )}
  <Bonds />
</main>

    );
};

export default Bond;
