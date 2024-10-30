import Pact from "pact-lang-api";
import { PactCommandToSign, createSignCmd } from "./../../utils/kadenaHelper";
import { GAS } from "../../constants/kadenaHelper";
import { checkVerifiedAccount } from "../../utils/kadenaHelper";
import {
  CHAIN_INFO,
  KADENA_NETWORK_ID,
  POLLER_CONTRACT,
  gasStation,
} from "../../constants/chainInfo";
import { IGas } from "@/utils/kadenaHelper";

export default async function voteOnPoll(
  pollId: string,
  vote: number,
  account: string,
  gasStationEnabled: boolean,
  gasConfig: IGas,
): Promise<PactCommandToSign> {
  try {
    const { data } = await checkVerifiedAccount(account);

    if (data && data.guard && data.guard.keys.length > 0) {
      const envData = {
        guard: data.guard,
        account: data.account,
        pollid: pollId,
        vote: vote
      };

      const pactCode = `(${POLLER_CONTRACT}.vote (read-msg 'account) (read-msg 'pollid) (read-integer 'vote))`;

      const caps = [
        gasStationEnabled
          ? Pact.lang.mkCap(
              "Gas capability",
              "Pay gas",
              `${gasStation.contract}.GAS_PAYER`,
              [gasStation.user, { int: 1 }, 1.0],
            )
          : Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
        Pact.lang.mkCap(
          "Confirm your identity",
          "Account Guard",
          `${POLLER_CONTRACT}.ACCOUNT_GUARD`,
          [`${account}`],
        ),
      ];

      const sender = gasStationEnabled ? gasStation.user : undefined;
      const gas = gasStationEnabled ? GAS.VOTE : gasConfig;

      const signCmd = createSignCmd(
        pactCode,
        KADENA_NETWORK_ID,
        envData,
        caps,
        {
          account: data.account,
          guard: data.guard,
        },
        "",
        gas,
        sender,
      );

      return signCmd;
    } else {
      throw new Error("Failed to create transaction");
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}
