import Pact from "pact-lang-api";
import { PactCommandToSign, createSignCmd } from "./../../utils/kadenaHelper";
import { checkVerifiedAccount } from "../../utils/kadenaHelper";
import { KADENA_NETWORK_ID, BONDER_CONTRACT } from "../../constants/chainInfo";
import IManageRewards from "./types";

export default async function claimBackRewards(
  params: IManageRewards,
): Promise<PactCommandToSign> {
  try {
    const pactCode = `(${BONDER_CONTRACT}.claim-back-rewards (read-msg 'bond) (read-msg 'account) (read-decimal 'amount))`; // (read-decimal 'amount))`;
    const caps = [
      Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
      Pact.lang.mkCap(
        "Manage bond rewards",
        "Transfer KDA",
        `${BONDER_CONTRACT}.MANAGE_BOND_REWARDS`,
        [`${params.bondId}`, `${params.account}`, params.amount],
      ),
    ];

    const { data } = await checkVerifiedAccount(params.account);

    if (data && data.guard && data.guard.keys.length > 0) {
      const envData = {
        bond: params.bondId,
        account: params.account,
        amount: params.amount,
      };

      const signCmd = createSignCmd(
        pactCode,
        KADENA_NETWORK_ID,
        envData,
        caps,
        {
          account: params.account,
          guard: data.guard,
        },
        "",
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
