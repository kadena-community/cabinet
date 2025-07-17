import { Provider } from "../types";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export type SnapProvider = Provider & {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
};

const defaultSnapOrigin = 'npm:@mindsend/kadena-snap';

export default async function detectSnapProvider(): Promise<SnapProvider | null> {
  if (typeof window === 'undefined' || !window.ethereum?.isMetaMask) {
    return null;
  }

  try {
    // Check if the snap is already installed
    const snaps = await window.ethereum.request({
      method: 'wallet_getSnaps',
    });

    if (snaps[defaultSnapOrigin]) {
      return window.ethereum as SnapProvider;
    }

    // If snap is not installed, we'll handle installation in the connector
    return window.ethereum as SnapProvider;
  } catch (error) {
    console.error('Error detecting snap provider:', error);
    return null;
  }
}