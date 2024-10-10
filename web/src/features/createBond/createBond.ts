import Pact from "pact-lang-api";
import { PactCommandToSign, createSignCmd } from "./../../utils/kadenaHelper";
import { GAS } from "../../constants/kadenaHelper";
import { checkVerifiedAccount } from "../../utils/kadenaHelper";
import { KADENA_NETWORK_ID, BONDER_BANK, BONDER_CONTRACT } from "../../constants/chainInfo";
import { NewBond } from "../bond/types";

export default async function createBond(
  bond: NewBond,
): Promise<PactCommandToSign> {
  try {
    const startDate = new Date(bond.startTime).toISOString().slice(0, 19) + "Z";

    const pactCode = `(${BONDER_CONTRACT}.create-bond (time (read-msg 'start)) (read-msg 'options) (read-msg 'whitelist) (read-decimal 'min) (read-decimal 'max) (read-decimal 'apr)  (read-msg 'acc) (read-decimal 'rewards)  )`;
    const caps = [
      Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
      Pact.lang.mkCap(
        "Transfer lockup to bonder bank",
        "Transfer KDA",
        "coin.TRANSFER",
        [`${bond.creator}`, BONDER_BANK, bond.totalRewards],
      ),
    ];

    console.log(...bond.lockupOptions);
    const { data } = await checkVerifiedAccount(bond.creator);

    if (data && data.guard && data.guard.keys.length > 0) {
      const envData = {
        guard: data.guard,
        start: startDate,
        options: bond.lockupOptions,
        whitelist: bond.whitelistedAccounts,
        min: bond.minAmount,
        max: bond.maxAmount,
        apr: bond.baseApr,
        acc: bond.creator,
        rewards: bond.totalRewards,
      };

      const signCmd = createSignCmd(
        pactCode,
        KADENA_NETWORK_ID,
        envData,
        caps,
        {
          account: bond.creator,
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
