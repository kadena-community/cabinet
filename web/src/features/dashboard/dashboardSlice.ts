import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./../../app/store";
import {
  getAmountDistribution,
  getApiAnalytics,
  getDailyLockups,
  getLockTimeDistribution,
  getDailyTvl,
  getCumulativeLockups,
} from "./dashboardAPI";
import { Dashboard, DashboardState } from "./types";

export const getApiAnalyticsAsync = createAsyncThunk(
  "analytics/apiAnalytics",
  async () => {
    const response = await getApiAnalytics();
    const { jsonString, hasErrors } = response;

    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      return data as Dashboard;
    }
    throw new Error("Failed to fetch analytics or encountered errors");
  },
);

export const getAmountDistributionAsync = createAsyncThunk(
  "analytics/amountDistribution",
  async (ignoreCache: boolean) => {
    const response = await getAmountDistribution(ignoreCache);
    return response;
  },
);

export const getDailyTvlAsync = createAsyncThunk(
  "analytics/getDailyTvl",
  async (ignoreCache: boolean) => {
    const response = await getDailyTvl(ignoreCache);
    return response;
  },
);

// Async thunk for lock time distribution
export const getLockTimeDistributionAsync = createAsyncThunk(
  "analytics/lockTimeDistribution",
  async () => {
    const response = await getLockTimeDistribution();
    return response;
  },
);

export const getDailyLockupsAsync = createAsyncThunk(
  "lockups/fetchDailyLockups",
  async (ignoreCache: boolean) => {
    const data = await getDailyLockups(ignoreCache);
    return data;
  },
);

export const getCumulativeLockupsAsync = createAsyncThunk(
  "lockups/fetchCumulativeLockups",
  async (ignoreCache: boolean) => {
    const data = await getCumulativeLockups(ignoreCache);
    return data;
  },
);

const initialState: DashboardState = {
  dashboardDetails: null,
  lockTimeDistribution: null,
  amountDistribution: null,
  dailyLockupsDistribution: null,
  cumulativeLockupsDistribution: null,
  dailyTvlDistribution: null,
  error: null,
  loading: {
    apiAnalytics: false,
    amountDistribution: false,
    dailyTvl: false,
    lockTimeDistribution: false,
    dailyLockups: false,
    cumulativeLockups: false,
  },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Define synchronous reducers if needed
  },
  extraReducers: (builder) => {
    builder
      // Handle daily lockups
      .addCase(getDailyLockupsAsync.pending, (state) => {
        state.loading.dailyLockups = true;
        state.error = null; // Clearing previous errors
      })
      .addCase(
        getDailyLockupsAsync.fulfilled,
        (state, action: PayloadAction<{ [key: string]: number }>) => {
          state.loading.dailyLockups = false;
          state.dailyLockupsDistribution = action.payload;
        },
      )
      .addCase(getDailyLockupsAsync.rejected, (state, action) => {
        state.loading.dailyLockups = false;
        state.error = action.error.message || "Failed to fetch daily lockups";
      })

      // Handle cumulative lockups
      .addCase(getCumulativeLockupsAsync.pending, (state) => {
        state.loading.cumulativeLockups = true;
        state.error = null; // Clearing previous errors
      })
      .addCase(
        getCumulativeLockupsAsync.fulfilled,
        (state, action: PayloadAction<{ [key: string]: number }>) => {
          state.loading.cumulativeLockups = false;
          state.cumulativeLockupsDistribution = action.payload;
        },
      )
      .addCase(getCumulativeLockupsAsync.rejected, (state, action) => {
        state.loading.cumulativeLockups = false;
        state.error =
          action.error.message || "Failed to fetch cumulative lockups";
      })

      // Handle amount distribution
      .addCase(getAmountDistributionAsync.pending, (state) => {
        state.loading.amountDistribution = true;
        state.error = null; // Clearing previous errors
      })
      .addCase(
        getAmountDistributionAsync.fulfilled,
        (state, action: PayloadAction<{ [key: string]: number }>) => {
          state.loading.amountDistribution = false;
          state.amountDistribution = action.payload;
        },
      )
      .addCase(getAmountDistributionAsync.rejected, (state, action) => {
        state.loading.amountDistribution = false;
        state.error =
          action.error.message || "Failed to fetch amount distribution";
      })

      // Handle API analytics
      .addCase(getApiAnalyticsAsync.pending, (state) => {
        state.loading.apiAnalytics = true;
        state.error = null;
      })
      .addCase(
        getApiAnalyticsAsync.fulfilled,
        (state, action: PayloadAction<Dashboard>) => {
          state.loading.apiAnalytics = false;
          state.dashboardDetails = action.payload;
        },
      )
      .addCase(getApiAnalyticsAsync.rejected, (state, action) => {
        state.loading.apiAnalytics = false;
        state.error = action.error.message || "Failed to fetch API analytics";
      })

      // Handle lock time distribution
      .addCase(getLockTimeDistributionAsync.pending, (state) => {
        state.loading.lockTimeDistribution = true;
        state.error = null;
      })
      .addCase(
        getLockTimeDistributionAsync.fulfilled,
        (state, action: PayloadAction<{ [key: string]: number }>) => {
          state.loading.lockTimeDistribution = false;
          state.lockTimeDistribution = action.payload;
        },
      )
      .addCase(getLockTimeDistributionAsync.rejected, (state, action) => {
        state.loading.lockTimeDistribution = false;
        state.error =
          action.error.message || "Failed to fetch lock time distribution";
      })

      // Handle daily TVL
      .addCase(getDailyTvlAsync.pending, (state) => {
        state.loading.dailyTvl = true;
        state.error = null;
      })
      .addCase(
        getDailyTvlAsync.fulfilled,
        (state, action: PayloadAction<{ [key: string]: number }>) => {
          state.loading.dailyTvl = false;
          state.dailyTvlDistribution = action.payload;
        },
      )
      .addCase(getDailyTvlAsync.rejected, (state, action) => {
        state.loading.dailyTvl = false;
        state.error = action.error.message || "Failed to fetch daily TVL";
      });
  },
});

export default dashboardSlice.reducer;

// Selector functions
export const selectApiDashboard = (state: RootState) =>
  state.dashboard.dashboardDetails;
export const selectLockTimeDistribution = (state: RootState) =>
  state.dashboard.lockTimeDistribution;
export const selectAmountDistribution = (state: RootState) =>
  state.dashboard.amountDistribution;
export const selectDailyLockups = (state: RootState) =>
  state.dashboard.dailyLockupsDistribution;
export const selectDailyTvl = (state: RootState) =>
  state.dashboard.dailyTvlDistribution;
export const selectCumulativeLockups = (state: RootState) =>
  state.dashboard.cumulativeLockupsDistribution;
export const selectLoadingState = (state: RootState) => state.dashboard.loading;
