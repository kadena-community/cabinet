import Pact from "pact-lang-api";
import { PactCommandToSign, createSignCmd } from "./../../utils/kadenaHelper";
import { GAS } from "../../constants/kadenaHelper";
import { checkVerifiedAccount } from "../../utils/kadenaHelper";
import { KADENA_NETWORK_ID, BONDER_BANK, BONDER_CONTRACT } from "../../constants/chainInfo";
import IManageRewards from "./types";

export default async function addBondRewards(
  params: IManageRewards,
): Promise<PactCommandToSign> {
  try {
    const pactCode = `(${BONDER_CONTRACT}.add-bond-rewards (read-msg 'account) (read-msg 'bond) (read-decimal 'amount))`;
    const caps = [
      Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
      Pact.lang.mkCap(
        "Transfer lockup to bonder bank",
        "Transfer KDA",
        "coin.TRANSFER",
        [`${params.account}`, BONDER_BANK, params.amount],
      ),
      Pact.lang.mkCap(
        "Manage bond rewards",
        "Transfer KDA",
        `${BONDER_CONTRACT}.MANAGE_BOND_REWARDS`,
        [`${params.bondId}`, `${params.account}`, params.amount],
      ),
    ];

    const { data, message } = await checkVerifiedAccount(params.account);

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
          account: data.account,
          guard: data.guard,
        },
        "",
        GAS.VOTE,
      );

      return signCmd;
    } else {
      console.error("Failed to retrieve or verify account details", {
        data,
        message,
      });
      throw new Error("Failed to create transaction");
    }
  } catch (e) {
    console.error("Error in addBondRewards:", e);
    if (e instanceof Error) {
      throw new Error(e.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}
