// PollSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./../../app/store";
import {
  getPoll,
  getMaxPollingPower,
  isPollApproved,
  getAccountCreatedPolls,
  accountAlreadyVoted,
  getPollVotes,
  getAllPolls,
  getActivePolls,
  canAccountVoteMultiple,
} from "./pollAPI";
import { PollDTO, PollState } from "./types";
import camelcaseKeys from "camelcase-keys";

const initialState: PollState = {
  activePolls: [],
  allPolls: [],
  currentPoll: null,
  pollingPower: null,
  loading: false,
  error: null,
  pollVotes: [],
  pollVotesPage: 1,
  pollVotesPageCount: 1,
  pollVotesTotalItems: 0,
  accountVoteStatus: {},
};

// Async Thunks

interface FetchAllPollsArgs {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: number | "";
  bond?: string;
  ignoreCache?: boolean;
}

export const fetchAllPolls = createAsyncThunk(
  "poll/getAllPolls",
  async ({
    page = 1,
    pageSize = 10,
    search = "",
    status = "",
    bond = "",
    ignoreCache = false,
  }: FetchAllPollsArgs) => {
    const response = await getAllPolls(
      page,
      pageSize,
      search,
      status,
      bond,
      ignoreCache,
    );
    return response;
  },
);

export const fetchPollVotes = createAsyncThunk(
  "poll/getPollVotes",
  async ({
    pollId,
    page,
    pageSize,
    sortByPollingPower,
    ignoreCache,
    actionFilter,
    search,
  }: {
    pollId: string;
    page: number;
    pageSize: number;
    sortByPollingPower: boolean;
    ignoreCache: boolean;
    actionFilter: number | string;
    search: string | null;
  }) => {
    const response = await getPollVotes(
      pollId,
      page,
      pageSize,
      sortByPollingPower,
      ignoreCache,
      actionFilter,
      search,
    );
    return response;
  },
);

export const fetchActivePolls = createAsyncThunk(
  "poll/getActivePolls",
  async (ignoreCache: boolean) => {
    const response = await getActivePolls(ignoreCache);
    const { jsonString, hasErrors } = response;
    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      const camelCasedData = camelcaseKeys(data, { deep: true });
      return camelCasedData as PollDTO[];
    }
    throw new Error("Failed to fetch active polls or encountered errors");
  },
);

export const fetchPollDetails = createAsyncThunk(
  "poll/getPoll",
  async ({ pollId, ignoreCache }: { pollId: string; ignoreCache: boolean }) => {
    const response = await getPoll(pollId, ignoreCache);
    const { jsonString, hasErrors } = response;
    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      const camelCasedData = camelcaseKeys(data, { deep: true });
      return camelCasedData as PollDTO;
    }
    throw new Error(
      `Failed to fetch poll details for ID ${pollId} or encountered errors`,
    );
  },
);

export const fetchPollingPower = createAsyncThunk(
  "poll/getPollingPower",
  async ({
    account,
    ignoreCache,
  }: {
    account: string;
    ignoreCache: boolean;
  }) => {
    const response = await getMaxPollingPower(account, ignoreCache);
    const { jsonString, hasErrors } = response;
    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      return data as number;
    }
    throw new Error(
      `Failed to fetch polling power for account ${account} or encountered errors`,
    );
  },
);

export const checkPollApproval = createAsyncThunk(
  "poll/isPollApproved",
  async ({ pollId, ignoreCache }: { pollId: string; ignoreCache: boolean }) => {
    const response = await isPollApproved(pollId, ignoreCache);
    const { jsonString, hasErrors } = response;
    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      return data as boolean;
    }
    throw new Error(
      `Failed to check poll approval for ID ${pollId} or encountered errors`,
    );
  },
);

export const fetchAccountCreatedPolls = createAsyncThunk(
  "poll/getAccountCreatedPolls",
  async ({
    account,
    ignoreCache,
  }: {
    account: string;
    ignoreCache: boolean;
  }) => {
    const response = await getAccountCreatedPolls(account, ignoreCache);
    const { jsonString, hasErrors } = response;
    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      return data as PollDTO[];
    }
    throw new Error(
      `Failed to fetch polls created by account ${account} or encountered errors`,
    );
  },
);

export const checkAccountVoted = createAsyncThunk(
  "poll/accountAlreadyVoted",
  async ({
    account,
    pollId,
    ignoreCache,
  }: {
    account: string;
    pollId: string;
    ignoreCache: boolean;
  }) => {
    const response = await accountAlreadyVoted(account, pollId, ignoreCache);
    const { jsonString, hasErrors } = response;
    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      return data as boolean;
    }
    throw new Error(
      `Failed to check if account ${account} has voted in poll ID ${pollId} or encountered errors`,
    );
  },
);

export const fetchCanAccountVoteMultiple = createAsyncThunk(
  "poll/fetchCanAccountVoteMultiple",
  async ({
    account,
    pollIds,
    ignoreCache,
  }: {
    account: string;
    pollIds: string[];
    ignoreCache: boolean;
  }) => {
    const response = await canAccountVoteMultiple(
      account,
      pollIds,
      ignoreCache,
    );
    const { jsonString, hasErrors } = response;
    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      return data;
    }
    throw new Error("Failed to check account vote status for multiple polls");
  },
);

const pollSlice = createSlice({
  name: "poll",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPolls.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPolls.fulfilled, (state, action) => {
        state.allPolls = action.payload.results as PollDTO[];
        state.pollVotesPage = action.payload.currentPage;
        state.pollVotesPageCount = action.payload.pageCount;
        state.pollVotesTotalItems = action.payload.totalItems;
        state.loading = false;
      })
      .addCase(fetchAllPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch all polls";
      })
      .addCase(fetchActivePolls.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActivePolls.fulfilled, (state, action) => {
        state.activePolls = action.payload;
        state.loading = false;
      })
      .addCase(fetchActivePolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPollDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPollDetails.fulfilled, (state, action) => {
        state.currentPoll = action.payload;
        state.loading = false;
      })
      .addCase(fetchPollDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPollingPower.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPollingPower.fulfilled, (state, action) => {
        state.pollingPower = action.payload;
        state.loading = false;
      })
      .addCase(fetchPollingPower.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(checkPollApproval.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkPollApproval.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkPollApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAccountCreatedPolls.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccountCreatedPolls.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchAccountCreatedPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(checkAccountVoted.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAccountVoted.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkAccountVoted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPollVotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPollVotes.fulfilled, (state, action) => {
        state.pollVotes = action.payload.results;
        state.pollVotesPage = action.payload.currentPage;
        state.pollVotesPageCount = action.payload.pageCount;
        state.pollVotesTotalItems = action.payload.totalItems;
        state.loading = false;
      })
      .addCase(fetchPollVotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch poll votes";
      })
      .addCase(fetchCanAccountVoteMultiple.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCanAccountVoteMultiple.fulfilled, (state, action) => {
        state.accountVoteStatus = action.payload;
        state.loading = false;
      })
      .addCase(fetchCanAccountVoteMultiple.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ||
          "Failed to check account vote status for multiple polls";
      });
  },
});

export default pollSlice.reducer;

// Selector functions
export const selectAllPolls = (state: RootState) => state.poll.allPolls;
export const selectAllActivePolls = (state: RootState) =>
  state.poll.activePolls;
export const selectCurrentPoll = (state: RootState) => state.poll.currentPoll;
export const selectPollingPower = (state: RootState) => state.poll.pollingPower;
export const selectPollLoading = (state: RootState) => state.poll.loading;
export const selectPollError = (state: RootState) => state.poll.error;
export const selectPollVotes = (state: RootState) => state.poll.pollVotes;
export const selectPollVotesPage = (state: RootState) =>
  state.poll.pollVotesPage;
export const selectPollVotesPageCount = (state: RootState) =>
  state.poll.pollVotesPageCount;
export const selectPollVotesTotalItems = (state: RootState) =>
  state.poll.pollVotesTotalItems;
export const selectAccountVoteStatus = (state: RootState) =>
  state.poll.accountVoteStatus;
