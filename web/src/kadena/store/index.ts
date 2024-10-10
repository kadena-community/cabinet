import { createStore } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Actions,
  KadenaReactState,
  KadenaReactStateUpdate,
  KadenaReactStore,
} from "../types";

export const MAX_SAFE_CHAIN_ID = 12;

// function validateNetworkId(networkId: string): void {
//   if (parseInt(networkId) <= 0 || parseInt(networkId) > MAX_SAFE_CHAIN_ID) {
//     throw new Error(`Invalid networkId ${networkId}`);
//   }
// }

const DEFAULT_STATE: KadenaReactState = {
  networkId: undefined,
  account: undefined,
  activating: false,
  sharedAccounts: undefined,
};

export function createKadenaReactStoreAndActions(): [
  KadenaReactStore,
  Actions
] {
  const store = createStore<KadenaReactState>()(
    devtools((set) => DEFAULT_STATE)
  );

  // flag for tracking updates so we don't clobber data when cancelling activation
  let nullifier = 0;

  /**
   * Sets activating to true, indicating that an update is in progress.
   *
   * @returns cancelActivation - A function that cancels the activation by setting activating to false,
   * as long as there haven't been any intervening updates.
   */
  function startActivation(): () => void {
    const nullifierCached = ++nullifier;

    store.setState({ ...DEFAULT_STATE, activating: true });

    // return a function that cancels the activation iff nothing else has happened
    return () => {
      if (nullifier === nullifierCached) store.setState({ activating: false });
    };
  }

  /**
   * Used to report a `stateUpdate` which is merged with existing state. The first `stateUpdate` that results in networkId
   * and account being set will also set activating to false, indicating a successful connection.
   *
   * @param stateUpdate - The state update to report.
   */
  function update(stateUpdate: KadenaReactStateUpdate): void {
    //validate networkId statically, independent of existing state
    // if (stateUpdate.networkId !== undefined) {
    //   validateNetworkId(stateUpdate.networkId);
    // }

    nullifier++;

    store.setState(
      (existingState): KadenaReactState => {
        // determine the next networkId and account
        const networkId = stateUpdate.networkId ?? existingState.networkId;
        const account = stateUpdate.account ?? existingState.account;
        const sharedAccounts =
          stateUpdate.sharedAccounts ?? existingState.sharedAccounts;

        // ensure that the activating flag is cleared when appropriate
        let activating = existingState.activating;
        if (activating && networkId && account) {
          activating = false;
        }

        return { networkId, account, activating, sharedAccounts };
      }
    );
  }

  /**
   * Resets connector state back to the default state.
   */
  function resetState(): void {
    nullifier++;
    store.setState(DEFAULT_STATE);
  }

  return [store, { startActivation, update, resetState }];
}
