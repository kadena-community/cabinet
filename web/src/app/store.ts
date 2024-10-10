import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import walletReducer from '../features/wallet/walletSlice';
import userReducer from '../features/user/userSlice';
import mainReducer from '../features/main/mainSlice';
import bondReducer from '../features/bond/bondSlice';
import votesReducer from '../features/votes/votesSlice';
import lockupReducer from '../features/lockup/lockupSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import pollReducer from '../features/poll/pollSlice';
import gasStationReducer from '@/features/gasStation/gasSlice';
export const store = configureStore({
  reducer: {
    main: mainReducer,
    wallet: walletReducer,
    user: userReducer,
    bond: bondReducer,
    lockup: lockupReducer,
    votes: votesReducer,
    dashboard: dashboardReducer,
    poll: pollReducer,
    gasStation: gasStationReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
