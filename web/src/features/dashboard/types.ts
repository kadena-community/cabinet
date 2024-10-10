export interface DashboardState {
  dashboardDetails: Dashboard | null;
  lockTimeDistribution: { [key: string]: number } | null;
  amountDistribution: { [key: string]: number } | null;
  dailyLockupsDistribution: { [key: string]: number } | null;
  dailyTvlDistribution: { [key: string]: number } | null;
  cumulativeLockupsDistribution: { [key: string]: number } | null;
  error: string | null;
  loading: {
    apiAnalytics: boolean;
    amountDistribution: boolean;
    dailyTvl: boolean;
    lockTimeDistribution: boolean;
    dailyLockups: boolean;
    cumulativeLockups: boolean;
  };
}

export interface Dashboard {
  AmountLocked: number;
  ActivePolls: number;
  DistributedRewards: number;
  AvailableRewards: number;
  TotalLockers: number;
  TotalLockedAmount: number;
  MaxReturnRate: number;
  AverageLockup: string;
  MostVotedPoll: string;
  LatestLocks: LatestLock[];
  LatestClaims: LatestClaim[];
  LatestVotes: VoteEvent[];
}

export interface LatestLock {
  LockTime: string;
  BondId: string;
  Account: string;
  LockedAmount: number;
  MaxRewards: number;
  RequestKey: string;
}

export interface LatestClaim {
  ClaimTime: string;
  BondId: string;
  Account: string;
  Amount: number;
  TotalAmount: number;
  RequestKey: string;
}

export interface VoteEvent {
  VoteTime: string;
  PollId: string;
  Account: string;
  Action: string;
  RequestKey: string;
}
