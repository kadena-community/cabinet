import { useCallback, useMemo } from 'react';
import { shallowEqual } from 'react-redux';
//import { Buffer } from 'buffer';
import { LoginResponse, MessageToSign } from '.';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { ChainwebNetworkId } from '../../constants/chainInfo';
import { useKadenaReact } from '../../kadena/core';
import { createSignCmd, PactSignedTx } from '../../utils/kadenaHelper';
import { updateUserDarkMode, updateUserWalletAuth } from './userSlice';

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useAppSelector(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual
  );

  return userDarkMode === null ? matchesDarkMode : userDarkMode;
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch();
  const darkMode = useIsDarkMode();

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }));
  }, [darkMode, dispatch]);

  return [darkMode, toggleSetDarkMode];
}

export function useWalletAuthenticationCallback() {
  const { account, networkId, connector } = useKadenaReact();

  // Directly return the data obtained from useKadenaReact
  return { account, networkId, connector };
}
