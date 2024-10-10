import { createSlice } from "@reduxjs/toolkit";
import { WalletEnum } from "../../connectors";

export interface WalletState {
  errorByWallet: Record<WalletEnum, string | undefined>;
}

export const initialState: WalletState = {
  errorByWallet: {
    [WalletEnum.ECKO_WALLET]: undefined,
    [WalletEnum.ZELCORE]: undefined,
    [WalletEnum.CHAINWEAVER]: undefined,
    [WalletEnum.WALLET_CONNECT]: undefined,
  },
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    updateWalletError(
      state,
      {
        payload: { wallet, error },
      }: {
        payload: {
          wallet: WalletEnum;
          error: string | undefined;
        };
      },
    ) {
      state.errorByWallet[wallet] = error;
    },
  },
});

export const { updateWalletError } = walletSlice.actions;
export default walletSlice.reducer;
