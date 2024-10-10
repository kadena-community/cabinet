import { WalletInfo } from './../../constants/wallets';
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface Transaction {
  eventId: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  tx: string;
}

export type PopupStatus = 'SUCCESS' | 'ERROR' | 'WARNING' | 'PENDING' | 'INFO';

export type PopupContent =
  | {
      txn: {
        hash: string;
        reqKey?: string;
      };
    }
  | {
      status: PopupStatus;
      msg?: string;
      wallet?: WalletInfo;
      reqKey?: string;
    };


export enum HeadModal {
  WALLET,
  MENU,
  SETTINGS,
  LOGIN,
}

export enum HeadRightModal {
  NOTIFICATION,
  MENU_HEADER,
  EDIT_PROFILE,
}

export type RightModalType = HeadRightModal | string | undefined;

type PopupList = Array<{
  key: string;
  show: boolean;
  content: PopupContent;
  removeAfterMs: number | null;
}>;

export interface MainState {
  readonly connectedAccount: string | null;
  readonly openModal: HeadModal | null;
  readonly openRightModal: RightModalType | null;
  readonly popupList: PopupList;
  readonly transactionList: Transaction[];
}

const loadPopupListFromLocalStorage = (account: string | null): PopupList => {
  if (!account) return [];
  const savedPopupList = localStorage.getItem(`popupList-${account}`);
  return savedPopupList ? JSON.parse(savedPopupList) : [];
};

const loadTransactionListFromLocalStorage = (account: string | null): Transaction[] => {
  if (!account) return [];
  const savedTransactionList = localStorage.getItem(`transactionList-${account}`);
  return savedTransactionList ? JSON.parse(savedTransactionList) : [];
};

const savePopupListToLocalStorage = (account: string | null, newPopups: PopupList) => {
  if (account) {
    const existingPopupList = loadPopupListFromLocalStorage(account);
    const updatedPopupList = [...existingPopupList];
    newPopups.forEach(newPopup => {
      const existingIndex = updatedPopupList.findIndex(popup => popup.key === newPopup.key);
      if (existingIndex === -1) {
        updatedPopupList.push(newPopup);
      } else {
        updatedPopupList[existingIndex] = newPopup;
      }
    });
    localStorage.setItem(`popupList-${account}`, JSON.stringify(updatedPopupList));
  }
};

const saveTransactionListToLocalStorage = (account: string | null, newTransactions: Transaction[]) => {
  if (account) {
    const existingTransactionList = loadTransactionListFromLocalStorage(account);
    const updatedTransactionList = [...existingTransactionList];
    newTransactions.forEach(newTransaction => {
      const existingIndex = updatedTransactionList.findIndex(transaction => transaction.tx === newTransaction.tx);
      if (existingIndex === -1) {
        updatedTransactionList.push(newTransaction);
      } else {
        updatedTransactionList[existingIndex] = newTransaction;
      }
    });
    localStorage.setItem(`transactionList-${account}`, JSON.stringify(updatedTransactionList));
  }
};

const initialState: MainState = {
  connectedAccount: null,
  openModal: null,
  openRightModal: null,
  popupList: [],
  transactionList: [],
};

export const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    addTransaction(state, action: PayloadAction<{ content: Transaction }>) {
      const { content } = action.payload;
      const existingIndex = state.transactionList.findIndex(tr => tr.tx === content.tx);
      if (existingIndex === -1) {
        state.transactionList.push(content);
      } else {
        state.transactionList[existingIndex] = content;
      }
      saveTransactionListToLocalStorage(state.connectedAccount, [content]);
    },
    updateTransaction(state, action: PayloadAction<{ content: { tx: string, status: string } }>) {
      const { content } = action.payload;
      state.transactionList.forEach(p => {
        if (p.tx === content.tx) {
          p.status = content.status as 'idle' | 'loading' | 'succeeded' | 'failed';
        }
      });
      saveTransactionListToLocalStorage(state.connectedAccount, state.transactionList);
    },
    setOpenModal(state, action: PayloadAction<HeadModal | null>) {
      state.openModal = action.payload;
    },
    setOpenRightModal(state, action: PayloadAction<RightModalType | null>) {
      state.openRightModal = action.payload;
    },
    addPopup(state, action: PayloadAction<{ content: PopupContent, key?: string, removeAfterMs?: number }>) {
      const { content, key, removeAfterMs = 25000 } = action.payload;
      const popupKey = key || nanoid();
      const existingIndex = state.popupList.findIndex(popup => popup.key === popupKey);
      const newPopup = {
        key: popupKey,
        show: true,
        content,
        removeAfterMs,
      };
      if (existingIndex === -1) {
        state.popupList.push(newPopup);
      } else {
        state.popupList[existingIndex] = newPopup;
      }
      savePopupListToLocalStorage(state.connectedAccount, [newPopup]);
    },
    removePopup(state, action: PayloadAction<{ key: string }>) {
      const { key } = action.payload;
      const index = state.popupList.findIndex(popup => popup.key === key);
      if (index !== -1) {
        state.popupList[index].show = false;
      }
      savePopupListToLocalStorage(state.connectedAccount, state.popupList as PopupList);
    },
    setConnectedAccount(state, action: PayloadAction<string | null>) {
      state.connectedAccount = action.payload;
      state.popupList = loadPopupListFromLocalStorage(state.connectedAccount);
      state.transactionList = loadTransactionListFromLocalStorage(state.connectedAccount);
    },
    clearPopups(state) {
      if (state.connectedAccount) {
        localStorage.removeItem(`popupList-${state.connectedAccount}`);
      }
      state.popupList = [];
    },
    clearTransactions(state) {
      if (state.connectedAccount) {
        localStorage.removeItem(`transactionList-${state.connectedAccount}`);
      }
      state.transactionList = [];
    },
  },
});

export const {
  addPopup,
  removePopup,
  setOpenModal,
  setOpenRightModal,
  addTransaction,
  updateTransaction,
  setConnectedAccount,
  clearPopups,
  clearTransactions,
} = mainSlice.actions;

export const selectMain = (state: RootState) => state.main;
export default mainSlice.reducer;
