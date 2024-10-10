import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./../../app/store";
import {
  getAllAccountVotes,
  getAllPollVotes,
  getAccountVoteStats,
} from "../poll/pollAPI";
import { PollVoteDTO } from "../poll/types";
import { AccountVoteStats } from "./types";
import { getPollVotesSummary } from "../dashboard/dashboardAPI";

interface PollVotesState {
  userVotes: PollVoteDTO[];
  userStats: AccountVoteStats | null;
  pollVotes: PollVoteDTO[];
  loading: boolean;
  error: string | null;
  numberOfVotes: VoteDistributionDTO[];
  votesOverTime: VoteOverTimeDTO[];
  status: "idle" | "loading" | "failed";
  displayPollingPower: boolean;
}

const initialState: PollVotesState = {
  userVotes: [],
  pollVotes: [],
  userStats: null,
  loading: false,
  error: null,
  numberOfVotes: [],
  votesOverTime: [],
  status: "idle",
  displayPollingPower: true,
};

interface VoteDistributionDTO {
  type: string;
  voteCount: number;
  pollingPower: number;
}

interface VoteOverTimeDTO {
  date: string;
  voteCount: number;
  pollingPower: number;
  action: string;
}

// Async Thunks
export const getPollVotesSummaryAsync = createAsyncThunk(
  "analytics/getPollVotesSummary",
  async ({ pollId, ignoreCache }: { pollId: string; ignoreCache: boolean }) => {
    const response = await getPollVotesSummary(pollId, ignoreCache);
    return response;
  },
);

export const fetchUserVotes = createAsyncThunk(
  "votes/getUserVotes",
  async ({
    account,
    ignoreCache,
  }: {
    account: string;
    ignoreCache: boolean;
  }) => {
    const response = await getAllAccountVotes(account, ignoreCache);
    const { jsonString, hasErrors } = response;
    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      return data as PollVoteDTO[];
    }
    throw new Error(
      `Failed to fetch votes for account ${account} or encountered errors`,
    );
  },
);

export const fetchVoteStatsAsync = createAsyncThunk(
  "lockup/getStats",
  async ({
    account,
    ignoreCache,
  }: {
    account: string;
    ignoreCache: boolean;
  }) => {
    const response = await getAccountVoteStats(account, ignoreCache);
    const { jsonString, hasErrors } = response;
    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      return data as AccountVoteStats;
    }
    throw new Error("Failed to fetch account stats or encountered errors");
  },
);

export const fetchAllPollVotes = createAsyncThunk(
  "poll/getPollVotes",
  async ({ pollId, ignoreCache }: { pollId: string; ignoreCache: boolean }) => {
    const response = await getAllPollVotes(pollId, ignoreCache);
    const { jsonString, hasErrors } = response;
    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      return data as PollVoteDTO[];
    }
    throw new Error(
      `Failed to fetch votes for poll ID ${pollId} or encountered errors`,
    );
  },
);

// Slice
const votesSlice = createSlice({
  name: "votes",
  initialState,
  reducers: {
    toggleDisplayPollingPower: (state) => {
      state.displayPollingPower = !state.displayPollingPower;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserVotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchUserVotes.fulfilled,
        (state, action: PayloadAction<PollVoteDTO[]>) => {
          state.loading = false;
          state.userVotes = action.payload;
        },
      )
      .addCase(fetchUserVotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch user votes";
      })
      .addCase(fetchAllPollVotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchAllPollVotes.fulfilled,
        (state, action: PayloadAction<PollVoteDTO[]>) => {
          state.loading = false;
          state.pollVotes = action.payload;
        },
      )
      .addCase(fetchAllPollVotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch poll votes";
      })
      .addCase(fetchVoteStatsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchVoteStatsAsync.fulfilled,
        (state, action: PayloadAction<AccountVoteStats>) => {
          state.loading = false;
          state.userStats = action.payload;
        },
      )
      .addCase(fetchVoteStatsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch account vote stats";
      })
      .addCase(getPollVotesSummaryAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        getPollVotesSummaryAsync.fulfilled,
        (
          state,
          action: PayloadAction<{
            numberOfVotes: VoteDistributionDTO[];
            votesOverTime: VoteOverTimeDTO[];
          }>,
        ) => {
          state.status = "idle";
          state.numberOfVotes = action.payload.numberOfVotes;
          state.votesOverTime = action.payload.votesOverTime;
        },
      )
      .addCase(getPollVotesSummaryAsync.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { toggleDisplayPollingPower } = votesSlice.actions;

export default votesSlice.reducer;

export const selectPollVotes = (state: RootState) => state.votes.pollVotes;
export const selectUserVotes = (state: RootState) => state.votes.userVotes;
export const selectUserVoteStats = (state: RootState) => state.votes.userStats;
export const selectVotesLoading = (state: RootState) => state.votes.loading;
export const selectVotesError = (state: RootState) => state.votes.error;
export const selectNumberOfVotes = (state: RootState) =>
  state.votes.numberOfVotes;
export const selectVotesOverTime = (state: RootState) =>
  state.votes.votesOverTime;
export const selectPollVotesSummaryStatus = (state: RootState) =>
  state.votes.status;
export const selectDisplayPollingPower = (state: RootState) =>
  state.votes.displayPollingPower;
