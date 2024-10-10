import type { Connector, KadenaReactStore, Networkish, Provider } from '../types';
import type { Context, ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import type { KadenaReactHooks, KadenaReactPriorityHooks } from './hooks';
import { getPriorityConnector } from './hooks';

/**
 * @typeParam T - A type argument must only be provided if one or more of the connectors passed to Web3ReactProvider
 * is using `connector.customProvider`, in which case it must match every possible type of this
 * property, over all connectors.
 */
export type KadenaContextType = {
  connector: Connector;
  networkId: ReturnType<KadenaReactPriorityHooks['useSelectedNetworkId']>;
  isActivating: ReturnType<KadenaReactPriorityHooks['useSelectedIsActivating']>;
  account: ReturnType<KadenaReactPriorityHooks['useSelectedAccount']>;
  sharedAccounts: ReturnType<KadenaReactPriorityHooks['useSelectedSharedAccounts']>;
  isActive: ReturnType<KadenaReactPriorityHooks['useSelectedIsActive']>;
  provider: Provider | undefined;
  hooks: ReturnType<typeof getPriorityConnector>;
};

const KadenaContext = createContext<KadenaContextType | undefined>(undefined);

/**
 * @param children - A React subtree that needs access to the context.
 * @param connectors - Two or more [connector, hooks(, store)] arrays, as returned from initializeConnector.
 * If modified in place without re-rendering the parent component, will result in an error.
 * @param connectorOverride - A connector whose state will be reflected in useKadenaReact if set, overriding the
 * priority selection.
 * @param network - An optional argument passed along to `useSelectedProvider`.
 */
export interface KadenaReactProviderProps {
  children: ReactNode;
  connectors: [Connector, KadenaReactHooks][] | [Connector, KadenaReactHooks, KadenaReactStore][];
  connectorOverride?: Connector;
  network?: Networkish;
}

export function KadenaReactProvider({ children, connectors, connectorOverride, network }: KadenaReactProviderProps) {
  const hooks = getPriorityConnector(...connectors);
  const {
    usePriorityConnector,
    useSelectedNetworkId,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedSharedAccounts,
    useSelectedIsActive,
    useSelectedProvider,
  } = hooks;

  const priorityConnector = usePriorityConnector();
  const connector = connectorOverride ?? priorityConnector;

  const networkId = useSelectedNetworkId(connector);
  const isActivating = useSelectedIsActivating(connector);
  const account = useSelectedAccount(connector);
  const sharedAccounts = useSelectedSharedAccounts(connector);
  const isActive = useSelectedIsActive(connector);
  // note that we've omitted a <T extends BaseProvider = Web3Provider> generic type
  // in KadenaReactProvider, and thus can't pass T through to useSelectedProvider below.
  // this is because if we did so, the type of provider would include T, but that would
  // conflict because KadenaContext can't take a generic. however, this isn't particularly
  // important, because useKadenaReact (below) is manually typed
  const provider = useSelectedProvider(connector, network);

  return (
    <KadenaContext.Provider
      value={{
        connector,
        networkId,
        isActivating,
        account,
        sharedAccounts,
        isActive,
        provider,
        hooks,
      }}
    >
      {children}
    </KadenaContext.Provider>
  );
}

export function useKadenaReact(): KadenaContextType {
  const context = useContext(KadenaContext as Context<KadenaContextType | undefined>);
  if (!context) throw Error('useKadenaReact can only be used within the KadenaReactProvider component');
  return context;
}
