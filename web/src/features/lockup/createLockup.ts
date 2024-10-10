import Pact from "pact-lang-api";
import { PactCommandToSign, createSignCmd } from "./../../utils/kadenaHelper";
import { GAS } from "../../constants/kadenaHelper";
import { checkVerifiedAccount } from "../../utils/kadenaHelper";
import {
  KADENA_NETWORK_ID,
  BONDER_CONTRACT,
  BONDER_BANK,
  gasStation,
} from "../../constants/chainInfo";
import { INewLockup } from "./types";

export default async function createLockup({
  bondId,
  length,
  amount,
  account,
  gasStationEnabled,
  gasConfig,
}: INewLockup): Promise<PactCommandToSign> {
  try {
    const pactCode = `(${BONDER_CONTRACT}.lock ${bondId} (read-integer 'len) (read-decimal 'amt) (read-msg 'acc) )`;

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
        "Transfer lockup to bonder bank",
        "Transfer KDA",
        "coin.TRANSFER",
        [`${account}`, BONDER_BANK, amount],
      ),
    ];

    const sender = gasStationEnabled ? gasStation.user : undefined;
    const gas = gasStationEnabled ? GAS.VOTE : gasConfig;

    const { data } = await checkVerifiedAccount(account);

    if (data && data.guard && data.guard.keys.length > 0) {
      const envData = {
        guard: data.guard,
        bond: bondId,
        acc: account,
        amt: amount,
        len: length,
      };

      const signCmd = createSignCmd(
        pactCode,
        KADENA_NETWORK_ID,
        envData,
        caps,
        {
          account: account,
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
