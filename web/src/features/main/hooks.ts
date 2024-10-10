import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import {
  addPopup,
  addTransaction,
  HeadModal,
  PopupContent,
  removePopup,
  RightModalType,
  setOpenModal,
  setOpenRightModal,
  Transaction,
  updateTransaction,
} from "./mainSlice";

export function useModalOpen(modal: HeadModal): boolean {
  const openModal = useAppSelector((state: RootState) => state.main.openModal);
  return openModal === modal;
}

export function useRightModalOpen(rightModal: RightModalType): boolean {
  const openRightModal = useAppSelector(
    (state: RootState) => state.main.openRightModal,
  );
  return openRightModal === rightModal;
}

export function useToggleModal(modal: HeadModal): () => void {
  const open = useModalOpen(modal);
  const dispatch = useAppDispatch();
  return useCallback(
    () => dispatch(setOpenModal(open ? null : modal)),
    [dispatch, modal, open],
  );
}

export function useToggleRightModal(rightModal: RightModalType): () => void {
  const open = useRightModalOpen(rightModal);
  const dispatch = useAppDispatch();
  return useCallback(
    () => dispatch(setOpenRightModal(open ? null : rightModal)),
    [dispatch, rightModal, open],
  );
}

export function useCloseRightModal(): () => void {
  const dispatch = useAppDispatch();
  return useCallback(() => dispatch(setOpenRightModal(null)), [dispatch]);
}

// returns a function that allows adding a popup
export function useAddPopup(): (
  content: PopupContent,
  key?: string,
  removeAfterMs?: number,
) => void {
  const dispatch = useAppDispatch();
  const DEFAULT_TXN_DISMISS_MS = 1.5 * 60 * 1000; //1 min 30s
  return useCallback(
    (content: PopupContent, key?: string, removeAfterMs?: number) => {
      dispatch(
        addPopup({
          content,
          key,
          removeAfterMs: removeAfterMs ?? DEFAULT_TXN_DISMISS_MS,
        }),
      );
    },
    [dispatch],
  );
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }));
    },
    [dispatch],
  );
}

export function useAddTransaction(): (content: Transaction) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (content: Transaction) => {
      dispatch(
        addTransaction({
          content,
        }),
      );
    },
    [dispatch],
  );
}

// returns a function that allows removing a popup via its key
export function useUpdateTransaction(): (content: Transaction) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (content: Transaction) => {
      dispatch(
        updateTransaction({
          content,
        }),
      );
    },
    [dispatch],
  );
}

export function useActivePopups(): RootState["main"]["popupList"] {
  const list = useAppSelector((state: RootState) => state.main.popupList);
  return useMemo(() => list.filter((item) => item.show), [list]);
}
