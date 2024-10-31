import Pact from "pact-lang-api";
import { GAS, KADENA_TX_CONFIG } from "../constants/kadenaHelper";
import {
  ChainId,
  ChainwebNetworkId,
  CHAIN_INFO,
  KADENA_CHAIN_ID,
  KADENA_NETWORK_ID,
} from "../constants/chainInfo";

export function shortenKAddress(address: string, chars = 4): string {
  return `${address.substring(0, chars + 2)}...${address.substring(66 - chars)}`;
}
export function shortenHash(address: string, chars = 2): string {
  return `${address.substring(0, chars + 3)}...${address.substring(43 - chars)}`;
}
export const getRandomId = () => {
  const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return randomLetter + Date.now();
};

export type PickOnly<T, K extends keyof T> = Pick<T, K> & {
  [P in Exclude<keyof T, K>]?: never;
};

export function extractDecimal(input: any): number {
  try {
    if (input.int) return Number(input.int);
    if (input.decimal) return Number(input.decimal);
    return Number(input);
  } catch (error) {
    return 0;
  }
}

export interface PactCapability {
  role: string;
  description: string;
  cap: {
    name: string;
    args: any[];
  };
}

export interface PactEnvData {
  [key: string]: any;
}

export interface PactCommandToSign {
  code: string;
  caps: Array<PactCapability>;
  sender: string;
  gasLimit: number;
  gasPrice: number;
  chainId: ChainId;
  ttl: number;
  envData: PactEnvData | undefined;
  nonce: string | undefined;
  signingPubKey: string;
  networkId: ChainwebNetworkId;
}

export interface PactSignedTx {
  status: string;
  errors: string | null;
  signedCmd: {
    cmd: string;
    hash: string;
    sigs: [{ sig: string }];
  } | null;
}

export interface IGas {
  PRICE: number;
  LIMIT: number;
}

export const mkReq = function (cmd: {}) {
  return {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(cmd),
  };
};

export const checkVerifiedAccount = async (
  accountName: string,
): Promise<{
  status: string;
  message: string;
  data:
    | {
        account: string;
        balance: number;
        guard: { pred: string; keys: string[] };
      }
    | undefined;
}> => {
  const { ACC_DETAIL } = GAS;

  try {
    const { result } = await Pact.fetch.local(
      {
        pactCode: `(coin.details ${JSON.stringify(accountName)})`,
        meta: Pact.lang.mkMeta(
          "",
          KADENA_CHAIN_ID,
          ACC_DETAIL.PRICE,
          ACC_DETAIL.LIMIT,
          KADENA_TX_CONFIG.TTL,
          600,
        ),
      },
      CHAIN_INFO[KADENA_NETWORK_ID].nodeUrl,
    );
    if (result.status === "success") {
      return {
        status: "success",
        message: "Account Connected Successfully",
        data: { ...result.data, balance: extractDecimal(result.data.balance) },
      };
    } else {
      return {
        status: "failure",
        message: "Account not found in the preferred chain",
        data: undefined,
      };
    }
  } catch (e: any) {
    return {
      status: "failure",
      message: e.message,
      data: undefined,
    };
  }
};

export const createSignCmd = (
  pactCode: string,
  networkId: ChainwebNetworkId,
  envData: PactEnvData | undefined,
  caps: Array<PactCapability>,
  account: { account: string; guard: { keys: Array<string> } },
  nonce: string | undefined,
  gas?: IGas,
  sender?: string | undefined,
): PactCommandToSign => {
  const signCmd = {
    code: pactCode,
    caps,
    sender: sender ? sender : account.account,
    gasLimit: gas ? gas.LIMIT : KADENA_TX_CONFIG.GAS_LIMIT,
    gasPrice: gas ? gas.PRICE : KADENA_TX_CONFIG.GAS_PRICE,
    chainId: KADENA_CHAIN_ID,
    ttl: 28800,
    envData,
    signingPubKey: account.guard.keys[0],
    networkId,
    nonce: nonce ?? new Date().toUTCString(),
  };
  return signCmd;
};

//HACK: Why is this function not using the envData or caps arguments?
export const createLocalCmd = (
  pactCode: string,
  envData: { [key: string]: object },
  caps: Array<string>,
  account: { account: string; guard: { keys: Array<string> } },
) => {
  const meta = Pact.lang.mkMeta(
    `k:${account}`,
    KADENA_CHAIN_ID,
    KADENA_TX_CONFIG.GAS_PRICE,
    KADENA_TX_CONFIG.GAS_LIMIT,
    new Date().getTime(),
    KADENA_TX_CONFIG.TTL,
  );
  return {
    pactCode,
    meta,
    signingPubKey: account.account,
    netWorkId: KADENA_NETWORK_ID,
  };
};

export const localTxn = async (cmd: {}): Promise<
  | {
      status: string;
      message: string;
      reqKey?: string;
      result?: { status: string; data: string; error: string; message: string };
    }
  | undefined
> => {
  const nodeUrl = CHAIN_INFO[KADENA_NETWORK_ID].nodeUrl;
  try {
    const localRes = await fetch(`${nodeUrl}/api/v1/local`, mkReq(cmd));
    const parsedLocalRes = await parseRes(localRes);
    if (parsedLocalRes?.result?.status === "success") {
      return { ...parsedLocalRes };
    } else {
      return parsedLocalRes?.result?.error;
    }
  } catch (e) {
    console.log(e);
    throw Error(e as any);
  }
};

export const parseRes = async function (raw: any) {
  const rawRes = await raw;
  const res = await rawRes;
  if (res.ok) {
    const resJSON = await rawRes.json();
    return resJSON;
  } else {
    const resTEXT = await rawRes.text();
    return resTEXT;
  }
};

export const wait = async (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};
export const listen = async (reqKey: string) => {
  let time = 500;
  let pollRes;
  while (time > 0) {
    await wait(5000);
    pollRes = await Pact.fetch.poll(
      { requestKeys: [reqKey] },
      CHAIN_INFO[KADENA_NETWORK_ID].nodeUrl,
    );
    if (Object.keys(pollRes).length === 0) {
      time = time - 5;
    } else {
      time = 0;
    }
  }
  if (pollRes && pollRes[reqKey]) {
    return pollRes[reqKey];
  }
  return null;
};

export const listenQuick = async (reqKey: string) => {
  let time = 500;
  let pollRes;
  while (time > 0) {
    await wait(100);
    pollRes = await Pact.fetch.poll(
      { requestKeys: [reqKey] },
      CHAIN_INFO[KADENA_NETWORK_ID].nodeUrl,
    );
    if (Object.keys(pollRes).length === 0) {
      time = time - 5;
    } else {
      time = 0;
    }
  }
  if (pollRes && pollRes[reqKey]) {
    return pollRes[reqKey];
  }
  return null;
};
