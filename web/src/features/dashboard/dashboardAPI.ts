import axios from "axios";
import { BACKEND_API_BASE_URL } from "../../constants/misc";
import { ServiceResult } from "../bond/types";

export async function getApiAnalytics(ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const req = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/Analytics/GetApiAnalytics?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.log("GetApiAnalytics error", error);
    throw new Error(error.message);
  }
}

export async function getLockTimeDistribution(ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const req = await axios.get<{ [key: string]: number }>(
      `${BACKEND_API_BASE_URL}/Analytics/GetLockTimeDistribution?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.log("GetLockTimeDistribution error", error);
    throw new Error(error.message);
  }
}
export async function getAmountDistribution(ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const req = await axios.get<{ [key: string]: number }>(
      `${BACKEND_API_BASE_URL}/Analytics/GetAmountDistribution?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.error("GetAmountDistribution error", error);
    throw new Error(error.message);
  }
}

export async function getDailyTvl(ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const req = await axios.get<{ [key: string]: number }>(
      `${BACKEND_API_BASE_URL}/Analytics/GetDailyTvl?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.error("GetDailyTvl error", error);
    throw new Error(error.message);
  }
}

export async function getDailyLockups(ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const req = await axios.get<{ [key: string]: number }>(
      `${BACKEND_API_BASE_URL}/Analytics/GetDailyLockups?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.error("GetDailyLockups error", error);
    throw new Error(error.message);
  }
}

export async function getCumulativeLockups(ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const req = await axios.get<{ [key: string]: number }>(
      `${BACKEND_API_BASE_URL}/Analytics/GetCumulativeLockups?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.error("GetDailyLockups error", error);
    throw new Error(error.message);
  }
}

export async function getPollVotesSummary(pollId: string, ignoreCache = false) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const req = await axios.get<{
      numberOfVotes: Array<{
        type: string;
        voteCount: number;
        pollingPower: number;
      }>;
      votesOverTime: Array<{
        date: string;
        voteCount: number;
        pollingPower: number;
        action: string;
      }>;
    }>(
      `${BACKEND_API_BASE_URL}/Analytics/GetPollVotesSummary/${pollId}?ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.error("GetPollVotesSummary error", error);
    throw new Error(error.message);
  }
}
