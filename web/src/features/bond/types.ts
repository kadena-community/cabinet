import {
  IBondEvent,
  Lockup,
  LockupOption,
  PactLockupOption,
} from "../lockup/types";

export interface ServiceResult {
  jsonString: string;
  hasErrors: boolean;
}

export interface Bond {
  creator: string;
  bondId: string;
  startTime: string;
  lockupOptions: LockupOption[];
  whitelistedAccounts: string[];
  baseApr: number;
  maxAmount: number;
  minAmount: number;
  totalRewards: number;
  lockedRewards: number;
  givenRewards: number;
  freeRewards: number;
  totalPolls: number;
  activeBonders: number;
  claimedCount: number;
  lockedCount: number;
}

export interface BondState {
  bondDetails: Bond | null;
  allBonds: Bond[];
  loading: boolean;
  error: string | null;
  isCoreMember: boolean;
  isBonderAccount: boolean;
  activeBondId: string | null;
  activeBond: Bond | null;
  canBond: boolean;
  lockupDetails: Lockup | null;
  lockupSummary: LockupSummaryDTO;
  lockupDensity: LockupDensityDTO[];
  bondLockups: IBondEvent[];
  bondLockupCurrentPage: number;
  bondLockupPageCount: number;
  bondLockupTotalItems: number;
  displayAmount: boolean;
}

export interface LockupDensityDTO {
  amount: number;
  density: number;
}

export interface LockupSummaryDTO {
  lockupsOverTime: LockupDailyAmount[];
  lockupDistributions: LockupOptionDistribution[];
}

export interface LockupDailyAmount {
  date: string;
  amount: number;
  lockupCount: number;
}

export interface LockupOptionDistribution {
  optionName: string;
  lockupCount: number;
  optionLength: number;
  amount: number;
}

export interface NewBond {
  creator: string;
  startTime: string;
  lockupOptions: PactLockupOption[];
  whitelistedAccounts: string[];
  baseApr: number;
  maxAmount: number;
  minAmount: number;
  totalRewards: number;
}
