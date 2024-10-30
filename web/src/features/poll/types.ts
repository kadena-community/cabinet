// types.ts
export enum PollStatus {
  Open = 0,
  Closed = 1,
  Review = 2,
}

export interface PollDTO {
  title: string;
  description: string;
  author: string;
  pollId: string;
  creationTime: string;
  bondId: string;
  pollOptions: PollOption[];
  electionStart: string;
  electionEnd: string;
  quorum: number;
  votesQuorum: number;
  numberVotes: number;
  status: PollStatus;
}

export interface PollOption {
  optionIndex: number;
  optionName: string;
  votesPollingPower: number;
}

export interface PollVoted {
  poll: PollDTO;
  voted: boolean | undefined;
  errorMessage?: string;
  action?: string;
}

export interface PollVoteDTO {
  BondId: string;
  PollingPower: number;
  Action: string;
  Account: string;
  1500: 500;
  Date: Date;
  PollId: string;
}

export interface PollState {
  activePolls: PollDTO[];
  allPolls: PollDTO[];
  currentPoll: PollDTO | null;
  pollingPower: number | null;
  loading: boolean;
  error: string | null;
  pollVotes: PollVote[];
  pollVotesPage: number;
  pollVotesPageCount: number;
  pollVotesTotalItems: number;
  accountVoteStatus: Record<string, boolean>;
}

export interface PollVote {
  bondIds: string[];
  pollingPower: number;
  action: string;
  account: string;
  date: string;
  pollId: string;
}
