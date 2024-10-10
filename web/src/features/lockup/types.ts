import { IGas } from "@/utils/kadenaHelper";
export interface INewLockup {
  bondId: string;
  length: number;
  amount: number;
  account: string;
  gasStationEnabled: boolean;
  gasConfig: IGas;
}

export interface IClaimLockup {
  bondId: string;
  account: string;
  gasStationEnabled: boolean;
  gasConfig: IGas;
}

export interface LockupOption {
  optionName: string;
  optionLength: number;
  timeMultiplier: number;
  pollerMaxBoost: number;
  pollingPowerMultiplier: number;
}

export interface IBondEvent {
  bondId: string;
  account: string;
  amount: number;
  rewards: number;
  timestamp: Date;
  requestKey: string;
  type: string;
}

export interface Lockup {
  lockupId: string;
  status: string;
  bondId: string;
  lockupOption: LockupOption;
  interactions: number;
  account: string;
  lockupEndTime: string;
  lockupStartTime: string;
  maxKdaRewards: number;
  kdaLocked: number;
  claimedKdaRewards: number;
  pollsAtLock: number;
  pollingPower: number;
}

export interface AccountStats {
  Account: string;
  OngoingLockups: number;
  ClaimedLockups: number;
  Interactions: number;
  NextClaimTime: string;
  LastClaimTime: string;
  TotalClaimedRewards: number;
  MeanBaseReturns: number;
  CurrentLockedAmount: number;
  RewardsToEarn: number;
  TotalInteractions: number;
}

export interface LockupState {
  lockups: Lockup[];
  loading: boolean;
  error: string | null;
}

export interface PactTxResponse {
  reqKey?: string;
  error?: string;
}

export interface PactLockupOption {
  "option-name": string;
  "option-length": number;
  "time-multiplier": number;
  "poller-max-boost": number;
  "polling-power-multiplier": number;
}

export interface LockupDensityData {
  Amount: number;
  Density: number;
}
