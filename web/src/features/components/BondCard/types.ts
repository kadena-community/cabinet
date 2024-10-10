export interface BondingProgramCardProps {
  activeBond: {
    'bond-id': string;
    'min-amount': number;
    'max-amount': number;
    'lockup-options': Array<{
      length: number;
    }>;
  };
  account: string;
  amount: number;
  handleAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  lockTime: string;
  handleLockTimeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleNewLockup: (params: {
    bondId: string;
    length: number;
    amount: number;
    account: string;
  }) => void;
}
