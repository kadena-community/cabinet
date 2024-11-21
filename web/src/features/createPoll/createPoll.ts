import Pact from "pact-lang-api";
import { PactCommandToSign, createSignCmd } from "./../../utils/kadenaHelper";
import { GAS } from "../../constants/kadenaHelper";
import { checkVerifiedAccount } from "../../utils/kadenaHelper";
import { KADENA_NETWORK_ID, POLLER_CONTRACT } from "../../constants/chainInfo";
import { NewPoll } from "./types";

export default async function createPoll(
  poll: NewPoll,
): Promise<PactCommandToSign> {
  try {
    const pactCode = `(${POLLER_CONTRACT}.create-poll (read-msg 'acc) (read-msg 'title) (read-msg 'bond) (read-msg 'description) (read-msg 'options) )`;
    const caps = [
      Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
      Pact.lang.mkCap(
        "Core member capability",
        "Manages actions restricted to Core Members",
        `${POLLER_CONTRACT}.ACCOUNT_GUARD`,
        [`${poll.creator}`],
      ),
    ];

    const { data } = await checkVerifiedAccount(poll.creator);

    if (data && data.guard && data.guard.keys.length > 0) {
      const envData = {
        acc: poll.creator,
        title: poll.title,
        description: poll.description,
        bond: poll.bondId,
        options: poll.options,
      };

      const signCmd = createSignCmd(
        pactCode,
        KADENA_NETWORK_ID,
        envData,
        caps,
        {
          account: poll.creator,
          guard: data.guard,
        },
        "",
        GAS.VOTE,
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
