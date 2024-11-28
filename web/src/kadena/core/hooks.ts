import { useMemo } from 'react';
import type { UseBoundStore } from 'zustand';
import { create } from 'zustand';
import { createKadenaReactStoreAndActions } from '../store';
import { Actions, Connector, KadenaAccount, KadenaReactState, KadenaReactStore, Networkish, Provider } from '../types';

export type KadenaReactHooks = ReturnType<typeof getStateHooks> & ReturnType<typeof getDerivedHooks> & ReturnType<typeof getAugmentedHooks>;

export type KadenaReactSelectedHooks = ReturnType<typeof getSelectedConnector>;

export type KadenaReactPriorityHooks = ReturnType<typeof getPriorityConnector>;

export function initializeConnector<T extends Connector>(f: (actions: Actions) => T): [T, KadenaReactHooks, KadenaReactStore] {
  const [store, actions] = createKadenaReactStoreAndActions();

  const connector = f(actions);
  const useConnector = create(store);

  const stateHooks = getStateHooks(useConnector);
  const derivedHooks = getDerivedHooks(stateHooks);
  const augmentedHooks = getAugmentedHooks<T>(connector, stateHooks, derivedHooks);

  return [connector, { ...stateHooks, ...derivedHooks, ...augmentedHooks }, store];
}

function computeIsActive({ networkId, account, activating }: KadenaReactState) {
  return Boolean(networkId && account && !activating);
}

export function getSelectedConnector(...initializedConnectors: [Connector, KadenaReactHooks][] | [Connector, KadenaReactHooks, KadenaReactStore][]) {
  function getIndex(connector: Connector) {
    const index = initializedConnectors.findIndex(([initializedConnector]) => connector === initializedConnector);
    if (index === -1) throw new Error('Connector not found');
    return index;
  }

  function useSelectedStore(connector: Connector) {
    const store = initializedConnectors[getIndex(connector)][2];
    if (!store) throw new Error('Stores not passed');
    return store;
  }

  // the following code calls hooks in a map a lot, which violates the eslint rule.
  // this is ok, though, because initializedConnectors never changes, so the same hooks are called each time
  function useSelectedNetworkId(connector: Connector) {
    const values = initializedConnectors.map(([, { useNetworkId }]) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useNetworkId()
    );
    return values[getIndex(connector)];
  }

  function useSelectedIsActivating(connector: Connector) {
    const values = initializedConnectors.map(([, { useIsActivating }]) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useIsActivating()
    );
    return values[getIndex(connector)];
  }

  function useSelectedAccount(connector: Connector): KadenaAccount | undefined {
    const values = initializedConnectors.map(([, { useAccount }]) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useAccount()
    );
    return values[getIndex(connector)];
  }

  function useSelectedSharedAccounts(connector: Connector): string[] | undefined {
    const values = initializedConnectors.map(([, { useSharedAccounts }]) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSharedAccounts()
    );
    return values[getIndex(connector)];
  }

  function useSelectedIsActive(connector: Connector) {
    const values = initializedConnectors.map(([, { useIsActive }]) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useIsActive()
    );
    return values[getIndex(connector)];
  }

  /**
   * @typeParam T - A type argument must only be provided if one or more of the connectors passed to
   * getSelectedConnector is using `connector.customProvider`, in which case it must match every possible type of this
   * property, over all connectors.
   */
  function useSelectedProvider<T extends Provider>(connector: Connector, network?: Networkish): T | undefined {
    const index = getIndex(connector);
    const values = initializedConnectors.map(([, { useProvider }], i) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useProvider<T>(network, i === index)
    );
    return values[index];
  }

  return {
    useSelectedStore,
    useSelectedNetworkId,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedSharedAccounts,
    useSelectedIsActive,
    useSelectedProvider,
  };
}

export function getPriorityConnector(...initializedConnectors: [Connector, KadenaReactHooks][] | [Connector, KadenaReactHooks, KadenaReactStore][]) {
  const {
    useSelectedStore,
    useSelectedNetworkId,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedSharedAccounts,
    useSelectedIsActive,
    useSelectedProvider,
  } = getSelectedConnector(...initializedConnectors);

  function usePriorityConnector() {
    const values = initializedConnectors.map(([, { useIsActive }]) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useIsActive()
    );
    const index = values.findIndex((isActive) => isActive);
    return initializedConnectors[index === -1 ? 0 : index][0];
  }

  function usePriorityStore() {
    return useSelectedStore(usePriorityConnector());
  }

  function usePriorityChainId() {
    return useSelectedNetworkId(usePriorityConnector());
  }

  function usePriorityIsActivating() {
    return useSelectedIsActivating(usePriorityConnector());
  }

  function usePriorityAccount() {
    return useSelectedAccount(usePriorityConnector());
  }

  function usePrioritySharedAccounts() {
    return useSelectedSharedAccounts(usePriorityConnector());
  }

  function usePriorityIsActive() {
    return useSelectedIsActive(usePriorityConnector());
  }

  /**
   * @typeParam T - A type argument must only be provided if one or more of the connectors passed to
   * getPriorityConnector is using `connector.customProvider`, in which case it must match every possible type of this
   * property, over all connectors.
   */
  function usePriorityProvider<T extends Provider>(network?: Networkish) {
    return useSelectedProvider<T>(usePriorityConnector(), network);
  }

  return {
    useSelectedStore,
    useSelectedNetworkId,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedSharedAccounts,
    useSelectedIsActive,
    useSelectedProvider,
    usePriorityConnector,
    usePriorityStore,
    usePriorityChainId,
    usePriorityIsActivating,
    usePriorityAccount,
    usePrioritySharedAccounts,
    usePriorityIsActive,
    usePriorityProvider,
  };
}

const CHAIN_ID = ({ networkId }: KadenaReactState) => networkId;
const ACCOUNT = ({ account }: KadenaReactState) => account;
const ACTIVATING = ({ activating }: KadenaReactState) => activating;
const SHARED_ACCOUNTS = ({ sharedAccounts }: KadenaReactState) => sharedAccounts;

function getStateHooks(useConnector: UseBoundStore<KadenaReactStore>) {
  function useNetworkId(): KadenaReactState['networkId'] {
    return useConnector(CHAIN_ID);
  }

  function useAccount(): KadenaReactState['account'] {
    return useConnector(ACCOUNT);
  }

  function useIsActivating(): KadenaReactState['activating'] {
    return useConnector(ACTIVATING);
  }

  function useSharedAccounts(): KadenaReactState['sharedAccounts'] {
    return useConnector(SHARED_ACCOUNTS);
  }

  return { useNetworkId, useAccount, useIsActivating, useSharedAccounts };
}

function getDerivedHooks({ useNetworkId, useAccount, useIsActivating, useSharedAccounts }: ReturnType<typeof getStateHooks>) {
  function useIsActive(): boolean {
    const networkId = useNetworkId();
    const account = useAccount();
    const activating = useIsActivating();
    const sharedAccounts = useSharedAccounts();

    return computeIsActive({
      networkId,
      account,
      activating,
      sharedAccounts,
    });
  }

  return { useIsActive };
}

function getAugmentedHooks<T extends Connector>(
  connector: T,
  { useAccount, useNetworkId }: ReturnType<typeof getStateHooks>,
  { useIsActive }: ReturnType<typeof getDerivedHooks>
) {
  /**
   * Avoid type erasure by returning the most qualified type if not otherwise set.
   * Note that this function's return type is `T | undefined`, but there is a code path
   * that returns a Web3Provider, which could conflict with a user-provided T. So,
   * it's important that users only provide an override for T if they know that
   * `connector.customProvider` is going to be defined and of type T.
   *
   * @typeParam T - A type argument must only be provided if using `connector.customProvider`, in which case it
   * must match the type of this property.
   */
  function useProvider<T extends Provider>(network?: Networkish, enabled = true): T | undefined {
    const isActive = useIsActive();
    const networkId = useNetworkId();

    return useMemo(() => {
      // to ensure connectors remain fresh, we condition re-renders on loaded, isActive and chainId
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      //void isActive && networkId;
      if (enabled) {
        if (connector.customProvider) return connector.customProvider as T;
        // see tsdoc note above for return type explanation.
        else if (connector.provider) return connector.provider as Provider as T;
      }
    }, [enabled, isActive, networkId, network]);
  }

  return { useProvider };
}
