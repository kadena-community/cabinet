import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./../../app/store";
import {
  getBond,
  getAllBondSales,
  isCoreAccount,
  isBonderAccount,
  canAccountBond,
  getLockupDensity,
  getLockupSummary,
  getLockups,
  getLockup,
} from "./bondAPI";
import { Bond, BondState, LockupDensityDTO, LockupSummaryDTO } from "./types";
import { IBondEvent, Lockup } from "../lockup/types";
import camelcaseKeys from "camelcase-keys";

const initialState: BondState = {
  bondDetails: null,
  allBonds: [],
  loading: false,
  error: null,
  isCoreMember: false,
  isBonderAccount: false,
  activeBondId: "",
  activeBond: null,
  canBond: true,
  lockupSummary: {
    lockupsOverTime: [],
    lockupDistributions: [],
  },
  lockupDensity: [],
  bondLockups: [],
  bondLockupCurrentPage: 1,
  bondLockupPageCount: 0,
  bondLockupTotalItems: 0,
  displayAmount: true,
  lockupDetails: null,
};

export const getLockupsAsync = createAsyncThunk(
  "bond/getLockups",
  async (
    {
      bondId,
      page = 1,
      pageSize = 10,
      search = null,
      status = null,
      orderBy = null,
      ignoreCache = false,
    }: {
      bondId: string;
      page?: number;
      pageSize?: number;
      search?: string | null;
      status?: string | null;
      orderBy?: string | null;
      ignoreCache?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await getLockups(
        bondId,
        page,
        pageSize,
        search,
        status,
        orderBy,
        ignoreCache,
      );
      return response;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const getLockupDensityAsync = createAsyncThunk<
  LockupDensityDTO[],
  string
>("bond/getLockupDensity", async (bondId, { rejectWithValue }) => {
  try {
    const response = await getLockupDensity(bondId);
    return response as LockupDensityDTO[];
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

export const getLockupSummaryAsync = createAsyncThunk<LockupSummaryDTO, string>(
  "bond/getLockupSummary",
  async (bondId, { rejectWithValue }) => {
    try {
      const response = await getLockupSummary(bondId);
      return response as LockupSummaryDTO;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const checkIsCoreAccountAsync = createAsyncThunk(
  "bond/isCoreAccount",
  async (account: string) => {
    const response = await isCoreAccount(account);

    const { jsonString, hasErrors } = response;

    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);

      if (typeof data === "boolean") {
        return data; // Directly return the boolean if it's already a boolean
      }

      if (typeof data === "string") {
        return data.toLowerCase() === "true";
      }

      throw new Error(
        "Data is not in expected format (boolean or 'true'/'false' string)",
      );
    }

    throw new Error("Failed to fetch bonds or encountered errors");
  },
);

export const checkIsBonderAccountAsync = createAsyncThunk(
  "bond/isBonderAccount",
  async (account: string) => {
    const response = await isBonderAccount(account);
    const { jsonString, hasErrors } = response;

    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      return data as boolean;
    }
    throw new Error("Failed to retrieve bonder status or encountered errors");
  },
);

export const checkCanAccountBondAsync = createAsyncThunk<
  boolean,
  { account: string; bondId: string }
>("bond/isAccountBonded", async ({ account, bondId }) => {
  const response = await canAccountBond(account, bondId);
  const { jsonString, hasErrors } = response;

  if (jsonString && !hasErrors) {
    const data = JSON.parse(jsonString);
    return data as boolean;
  }
  throw new Error("Failed to fetch bonding status or encountered errors");
});

export const getBondDetailsAsync = createAsyncThunk(
  "bond/getBond",
  async (bondId: string) => {
    const response = await getBond(bondId);
    const { jsonString, hasErrors } = response.data;

    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      const camelCasedData = camelcaseKeys(data, { deep: true });
      return camelCasedData as Bond;
    }
    throw new Error("Failed to fetch bonds or encountered errors");
  },
);

export const getLockupDetailsAsync = createAsyncThunk(
  "bond/getLockup",
  async (lockupId: string) => {
    const response = await getLockup(lockupId);
    const { jsonString, hasErrors } = response.data;

    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      const camelCasedData = camelcaseKeys(data, { deep: true });
      return camelCasedData as Lockup;
    }
    throw new Error("Failed to fetch bonds or encountered errors");
  },
);

export const getAllBondsAsync = createAsyncThunk(
  "bond/getAllBonds",
  async () => {
    const response = await getAllBondSales();

    const { jsonString, hasErrors } = response.data;

    if (jsonString && !hasErrors) {
      const data = JSON.parse(jsonString);
      const camelCasedData = camelcaseKeys(data, { deep: true });
      return camelCasedData as Bond[];
    }
    throw new Error("Failed to fetch bonds or encountered errors");
  },
);

const bondSlice = createSlice({
  name: "bond",
  initialState,
  reducers: {
    // Define synchronous reducers if needed
    toggleDisplayAmount: (state) => {
      state.displayAmount = !state.displayAmount;
    },
    setActiveBond(state, action: PayloadAction<Bond | null>) {
      state.activeBond = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBondDetailsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getBondDetailsAsync.fulfilled,
        (state, action: PayloadAction<Bond>) => {
          state.loading = false;
          state.bondDetails = action.payload;
        },
      )
      .addCase(
        getLockupDetailsAsync.fulfilled,
        (state, action: PayloadAction<Lockup>) => {
          state.lockupDetails = action.payload;
        },
      )
      .addCase(getBondDetailsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch bond details";
      })
      .addCase(getAllBondsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getAllBondsAsync.fulfilled,
        (state, action: PayloadAction<Bond[]>) => {
          state.loading = false;
          state.allBonds = action.payload;
        },
      )
      .addCase(checkIsCoreAccountAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isCoreMember = action.payload;
      })
      .addCase(getAllBondsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch all bonds";
      })
      .addCase(checkCanAccountBondAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkCanAccountBondAsync.fulfilled, (state, action) => {
        state.canBond = action.payload;
        state.loading = false;
      })
      .addCase(checkCanAccountBondAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(getLockupsAsync.pending, (state) => {})
      .addCase(
        getLockupsAsync.fulfilled,
        (
          state,
          action: PayloadAction<{
            results: IBondEvent[];
            currentPage: number;
            pageCount: number;
            totalItems: number;
          }>,
        ) => {
          state.loading = false;
          state.bondLockups = action.payload.results;
          state.bondLockupCurrentPage = action.payload.currentPage;
          state.bondLockupPageCount = action.payload.pageCount;
          state.bondLockupTotalItems = action.payload.totalItems;
        },
      )
      .addCase(getLockupsAsync.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch lockups";
      })
      .addCase(getLockupDensityAsync.pending, (state) => {})
      .addCase(
        getLockupDensityAsync.fulfilled,
        (state, action: PayloadAction<LockupDensityDTO[]>) => {
          state.lockupDensity = action.payload;
        },
      )
      .addCase(getLockupDensityAsync.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to fetch lockup density";
      })
      .addCase(getLockupSummaryAsync.pending, (state) => {})
      .addCase(
        getLockupSummaryAsync.fulfilled,
        (state, action: PayloadAction<LockupSummaryDTO>) => {
          state.lockupSummary = action.payload;
        },
      )
      .addCase(getLockupSummaryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch lockup summary";
      });
  },
});

export default bondSlice.reducer;

// Selector functions
export const selectAllBonds = (state: RootState) => state.bond.allBonds;
export const selectBondDetails = (state: RootState) => state.bond.bondDetails;
export const selectLockupDetails = (state: RootState) =>
  state.bond.lockupDetails;
export const selectBondLoading = (state: RootState) => state.bond.loading;
export const selectBondError = (state: RootState) => state.bond.error;
export const selectIsCoreMember = (state: RootState) => state.bond.isCoreMember;
export const selectActiveBondId = (state: RootState) =>
  state.bond.activeBond?.bondId || "";
export const { setActiveBond } = bondSlice.actions;
export const selectActiveBond = (state: RootState) => state.bond.activeBond;
export const selectCanBond = (state: RootState) => state.bond.canBond;

export const selectLockupSummary = (state: RootState) =>
  state.bond.lockupSummary;
export const selectLockupSummaryBar = (state: RootState) =>
  state.bond.lockupSummary.lockupsOverTime;
export const selectLockupSummaryPie = (state: RootState) =>
  state.bond.lockupSummary.lockupDistributions;

export const { toggleDisplayAmount } = bondSlice.actions;

export const selectLockupDensity = (state: RootState) =>
  state.bond.lockupDensity;
export const selectBondLockups = (state: RootState) => state.bond.bondLockups;
export const selectBondLockupCurrentPage = (state: RootState) =>
  state.bond.bondLockupCurrentPage;
export const selectBondLockupPageCount = (state: RootState) =>
  state.bond.bondLockupPageCount;
export const selectBondLockupTotalItems = (state: RootState) =>
  state.bond.bondLockupTotalItems;
export const selectDisplayAmount = (state: RootState) =>
  state.bond.displayAmount;
