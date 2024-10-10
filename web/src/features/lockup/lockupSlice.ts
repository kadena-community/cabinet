import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./../../app/store";
import { getAccountLockups, getAccountStats } from "../bond/bondAPI";
import { Lockup, AccountStats } from "./types";
import camelcaseKeys from "camelcase-keys";

interface LockupState {
  lockups: Lockup[];
  stats: AccountStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: LockupState = {
  lockups: [],
  stats: null,
  loading: false,
  error: null,
};

export const getLockupDetailsAsync = createAsyncThunk(
  "lockup/getDetails",
  async ({
    account,
    ignoreCache = false,
  }: {
    account: string;
    ignoreCache: boolean;
  }) => {
    const response = await getAccountLockups(account, ignoreCache);
    const { jsonString, hasErrors } = response;

    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      const camelCasedData = camelcaseKeys(data, { deep: true });
      return camelCasedData as Lockup[];
    }
    throw new Error("Failed to fetch lockup details or encountered errors");
  },
);

export const getLockupStatsAsync = createAsyncThunk(
  "lockup/getStats",
  async ({
    account,
    ignoreCache = false,
  }: {
    account: string;
    ignoreCache: boolean;
  }) => {
    const response = await getAccountStats(account, ignoreCache);
    const { jsonString, hasErrors } = response;

    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      return data as AccountStats;
    }
    throw new Error("Failed to fetch account stats or encountered errors");
  },
);

const lockupSlice = createSlice({
  name: "lockup",
  initialState,
  reducers: {
    // Define synchronous reducers if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLockupDetailsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getLockupDetailsAsync.fulfilled,
        (state, action: PayloadAction<Lockup[]>) => {
          state.loading = false;
          state.lockups = action.payload;
        },
      )
      .addCase(getLockupDetailsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch lockup details";
      })
      .addCase(getLockupStatsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getLockupStatsAsync.fulfilled,
        (state, action: PayloadAction<AccountStats>) => {
          state.loading = false;
          state.stats = action.payload;
        },
      )
      .addCase(getLockupStatsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch account stats";
      });
  },
});

export default lockupSlice.reducer;

// Selector functions
export const selectLockupStats = (state: RootState) => state.lockup.stats;
export const selectLockupDetails = (state: RootState) => state.lockup.lockups;
export const selectLockupLoading = (state: RootState) => state.lockup.loading;
export const selectLockupError = (state: RootState) => state.lockup.error;
