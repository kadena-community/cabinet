import axios from "axios";
import { BACKEND_API_BASE_URL } from "../../constants/misc";
import { ServiceResult } from "../bond/types";
import { PollDTO } from "./types";

const API_POLL_ENDPOINT = "Poll";

/**
 * Retrieves a list of active polls.
 */
export async function getActivePolls(ignoreCache = false) {
  try {
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/GetActivePolls?ignoreCache=${ignoreCache}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("GetActivePolls error", error);
    throw new Error(error.message);
  }
}

/**
 * Retrieves a specific poll by ID.
 */
export async function getPoll(pollId: string, ignoreCache = false) {
  try {
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/GetPoll/${pollId}?ignoreCache=${ignoreCache}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("GetPoll error", error);
    throw new Error(error.message);
  }
}

export async function getMaxPollingPower(account: string, ignoreCache = false) {
  try {
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/GetPollingPower/${account}?ignoreCache=${ignoreCache}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("GetPollingPower error", error);
    throw new Error(error.message);
  }
}

/**
 * Retrieves the polling power of an account.
 */
export async function getPollingPower(
  account: string,
  pollId: string,
  ignoreCache = false,
) {
  try {
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/GetPollingPower/${account}/${pollId}?ignoreCache=${ignoreCache}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("GetPollingPower error", error);
    throw new Error(error.message);
  }
}

/**
 * Checks if a specific poll is approved.
 */
export async function isPollApproved(pollId: string, ignoreCache = false) {
  try {
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/IsPollApproved/${pollId}?ignoreCache=${ignoreCache}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("IsPollApproved error", error);
    throw new Error(error.message);
  }
}

/**
 * Retrieves all polls created by a specific account.
 */
export async function getAccountCreatedPolls(
  account: string,
  ignoreCache = false,
) {
  try {
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/GetAccountCreatedPolls/${account}?ignoreCache=${ignoreCache}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("GetAccountCreatedPolls error", error);
    throw new Error(error.message);
  }
}

export async function getAllAccountVotes(account: string, ignoreCache = false) {
  try {
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/GetAllAccountVotes/${encodeURIComponent(account)}?ignoreCache=${ignoreCache}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("GetAllAccountVotes error", error);
    throw new Error(error.message);
  }
}

export async function getAccountVoteStats(
  account: string,
  ignoreCache = false,
) {
  try {
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/GetAccountVoteStats/${encodeURIComponent(account)}?ignoreCache=${ignoreCache}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("GetAllAccountVotes error", error);
    throw new Error(error.message);
  }
}

/**
 * Checks if an account has already voted in a specific poll.
 */
export async function accountAlreadyVoted(
  account: string,
  pollId: string,
  ignoreCache = false,
) {
  try {
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/AccountAlreadyVoted/${account}/${pollId}?ignoreCache=${ignoreCache}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("AccountAlreadyVoted error", error);
    throw new Error(error.message);
  }
}

export async function canAccountVote(
  account: string,
  pollId: string,
  ignoreCache = false,
) {
  try {
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/CanAccountVote/${account}/${pollId}?ignoreCache=${ignoreCache}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("CanAccountVote error", error);
    throw new Error(error.message);
  }
}

export async function canAccountVoteMultiple(
  account: string,
  pollIds: string[],
  ignoreCache = false,
) {
  try {
    const pollIdsParam = pollIds.join(",");
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/CanAccountVoteMultiple/${account}/polls`,
      {
        params: {
          pollIds: pollIdsParam,
          ignoreCache: ignoreCache,
        },
      },
    );

    const data = JSON.parse(JSON.stringify(response.data));
    return data;
  } catch (error: any) {
    console.error("CanAccountVoteMultiple error", error);
    throw new Error(error.message);
  }
}

export async function getAllPollVotes(pollId: string, ignoreCache = false) {
  try {
    const response = await axios.get<ServiceResult>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/GetAllPollVotes/${pollId}?ignoreCache=${ignoreCache}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("GetPoll error", error);
    throw new Error(error.message);
  }
}

export async function getPollVotes(
  pollId: string,
  page = 1,
  pageSize = 10,
  sortByPollingPower = false,
  ignoreCache = false,
  actionFilter: number | string = "",
  search: string | null = null,
) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const req = await axios.get<{
      results: Array<{
        bondIds: string[];
        pollingPower: number;
        action: string;
        account: string;
        date: string;
        pollId: string;
      }>;
      currentPage: number;
      pageCount: number;
      totalItems: number;
    }>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/GetPollVotes/${pollId}?page=${page}&pageSize=${pageSize}&sortByPollingPower=${sortByPollingPower}&ignoreCache=${ignoreCache}&actionFilter=${actionFilter}&search=${search}`, // Included action filter and search parameter in URL
      config,
    );
    return req.data;
  } catch (error: any) {
    console.error("GetPollVotes error", error);
    throw new Error(error.message);
  }
}

export async function getAllPolls(
  page = 1,
  pageSize = 10,
  search: string | null = null, // Corrected type for search parameter
  status: number | "",
  bond: string,
  ignoreCache = false,
) {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const req = await axios.get<{
      results: PollDTO[];
      currentPage: number;
      pageCount: number;
      totalItems: number;
    }>(
      `${BACKEND_API_BASE_URL}/${API_POLL_ENDPOINT}/GetAllPolls?page=${page}&pageSize=${pageSize}&search=${search}&status=${status}&bond=${bond}&ignoreCache=${ignoreCache}`,
      config,
    );
    return req.data;
  } catch (error: any) {
    console.error("GetAllPolls error", error);
    throw new Error(error.message);
  }
}
