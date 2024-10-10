import { IGas } from "@/utils/kadenaHelper";

export interface IClaimLockup {
  bondId: string;
  account: string;
  originalAmount: number;
  totalAmount: number;
  gasStationEnabled: boolean;
  gasConfig: IGas;
}
