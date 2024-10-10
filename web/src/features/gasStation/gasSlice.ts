import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./../../app/store";
import { IGas } from "@/utils/kadenaHelper";

interface GasStationState {
  enabled: boolean;
  gasConfig: IGas;
}

const initialState: GasStationState = {
  enabled: true,
  gasConfig: { LIMIT: 5000, PRICE: 0.0000001 },
};

// Slice
const GasStationSlice = createSlice({
  name: "gasStation",
  initialState,
  reducers: {
    setGasLimit: (state, action: PayloadAction<number>) => {
      if (state.gasConfig) {
        state.gasConfig.LIMIT = action.payload;
      }
    },
    setGasPrice: (state, action: PayloadAction<number>) => {
      if (state.gasConfig) {
        state.gasConfig.PRICE = action.payload;
      }
    },
    toggleGasStation: (state) => {
      state.enabled = !state.enabled;
    },
  },
});

export const { setGasLimit, setGasPrice, toggleGasStation } =
  GasStationSlice.actions;

export default GasStationSlice.reducer;

export const selectGasStationEnabled = (state: RootState) =>
  state.gasStation.enabled;
export const selectGasConfig = (state: RootState) => state.gasStation.gasConfig;
