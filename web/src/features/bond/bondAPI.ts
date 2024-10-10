import axios from "axios";
import { BACKEND_API_BASE_URL } from "../../constants/misc";
import { LockupSummaryDTO, ServiceResult } from "./types";
import { IBondEvent, Lockup } from "../lockup/types";

const API_BOND_ENDPOINT = "Bond";
const API_ANALYTICS_ENDPOINT = "Analytics";

//const API_POLL_ENDPOINT = 'Poller';
/**
 * API used for retrieve member details by k:account when a user connect a wallet and select a space
 */
export async function getAllBondSales() {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const req = await axios.get(
      `${BACKEND_API_BASE_URL}/${API_BOND_ENDPOINT}/GetAllBondSales`,
      config,
    );
    return req;
  } catch (error: any) {
    console.log("GetAllBondSales error", error);
    throw new Error(error.message);
  }
}

export async function getBond(bondId: string) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const req = await axios.get(
      `${BACKEND_API_BASE_URL}/${API_BOND_ENDPOINT}/GetBond/${bondId}`,
      config,
    );
    return req;
  } catch (error: any) {
    console.log("getBond error", error);
    throw new Error(error.message);
  }
}

export async function getLockup(lockupId: string) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const req = await axios.get(
      `${BACKEND_API_BASE_URL}/${API_BOND_ENDPOINT}/GetLockup/${lockupId}`,
      config,
    );
    return req;
  } catch (error: any) {
    console.log("getLockup error", error);
    throw new Error(error.message);
  }
}

export async function maximumLockupReturns(
  amount: number,
  length: number,
  bondId: string,
) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const req = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_BOND_ENDPOINT}/GetMaxLockupReturns?amount=${amount}&length=${length}&bondId=${bondId}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.log("maximumLockupReturns error", error);
    throw new Error(error.message);
  }
}

export async function getAccountStats(account: string, ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const req = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_BOND_ENDPOINT}/GetAccountStats/${account}?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.log("error", error);
    throw new Error(error.message);
  }
}

export async function isCoreAccount(account: string, ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const req = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_BOND_ENDPOINT}/IsCoreAccount/${account}?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.log("isCoreAccount error", error);
    throw new Error(error.message);
  }
}

export async function canAccountBond(
  account: string,
  bondId: string,
  ignoreCache = false,
) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const req = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_BOND_ENDPOINT}/CanAccountBond/${account}/${bondId}?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.log("isAccountBonded error", error);
    throw new Error(error.message);
  }
}

export async function isBonderAccount(account: string, ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const req = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_BOND_ENDPOINT}/IsBonderAccount/${account}?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.log("isBonderAccount error", error);
    throw new Error(error.message);
  }
}

export async function getAccountLockups(account: string, ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Make sure the account string is properly URL-encoded
  const encodedAccount = encodeURIComponent(account);

  try {
    const req = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_BOND_ENDPOINT}/GetAccountLockups/${encodedAccount}?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.log("getAccountLockups error", error);
    throw new Error(error.message);
  }
}
export async function getLockupDensity(bondId: string, ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const encodedBondId = encodeURIComponent(bondId);

  try {
    const req = await axios.get(
      `${BACKEND_API_BASE_URL}/${API_ANALYTICS_ENDPOINT}/GetLockupDensity/${encodedBondId}?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.log("getLockupDensity error", error);
    throw new Error(error.message);
  }
}

export async function getLockupSummary(
  bondId: string,
  ignoreCache = false,
): Promise<LockupSummaryDTO> {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const encodedBondId = encodeURIComponent(bondId);

  try {
    const req = await axios.get(
      `${BACKEND_API_BASE_URL}/${API_ANALYTICS_ENDPOINT}/GetLockupSummary/${encodedBondId}?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data as LockupSummaryDTO;
  } catch (error: any) {
    console.log("getLockupSummary error", error);
    throw new Error(error.message);
  }
}
export async function getLockups(
  bondId: string,
  page = 1,
  pageSize = 10,
  search: string | null = null,
  status: string | null = null,
  orderBy: string | null = null,
  ignoreCache = false,
) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const req = await axios.get<{
      results: IBondEvent[];
      currentPage: number;
      pageCount: number;
      totalItems: number;
    }>(
      `${BACKEND_API_BASE_URL}/${API_BOND_ENDPOINT}/GetAllLockupsFromBond/${bondId}?page=${page}&pageSize=${pageSize}&search=${search}&status=${status}&orderBy=${orderBy}&ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.error("GetLockups error", error);
    throw new Error(error.message);
  }
}
