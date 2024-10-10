import { RootState, store } from './../../app/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { WalletEnum } from '../../connectors';

const currentTimestamp = () => new Date().getTime();

export interface UserState {
  selectedWallet?: WalletEnum | undefined;
  selectedWalletBackfilled: boolean;
  lastUpdateVersionTimestamp?: number; // the timestamp of the last updateVersion action
  matchesDarkMode: boolean; // whether the dark mode media query matches
  userDarkMode: boolean | null; // the user's choice for dark mode or light mode
  timestamp: number;
  walletAuth: {
    isAuthenticated: boolean;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
  };
}

export const initialState: UserState = {
  selectedWallet: undefined,
  selectedWalletBackfilled: false,
  matchesDarkMode: true,
  userDarkMode: true,
  timestamp: currentTimestamp(),
  walletAuth: { isAuthenticated: false, status: 'idle' },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateSelectedWallet(state, { payload: { wallet } }) {
      state.selectedWallet = wallet;
      state.selectedWalletBackfilled = true;
    },
    updateUserDarkMode(state, action) {
      state.userDarkMode = action.payload.userDarkMode;
      state.timestamp = currentTimestamp();
    },
    updateMatchesDarkMode(state, action) {
      state.matchesDarkMode = action.payload.matchesDarkMode;
      state.timestamp = currentTimestamp();
    },
    updateUserWalletAuth(state, action) {
      const { walletAuth } = action.payload;
      state.walletAuth = walletAuth;
    },
  },
});

export const {
  updateSelectedWallet,
  updateMatchesDarkMode,
  updateUserDarkMode,
  updateUserWalletAuth,
} = userSlice.actions;
export const selectUserState = (state: RootState) => state.user;

export default userSlice.reducer;
