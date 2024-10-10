import React from "react";
import { Bond } from "../bond/types";

interface LockupOptionsDisplayProps {
  bond: Bond;
}

const LockupOptionsDisplay: React.FC<LockupOptionsDisplayProps> = ({
  bond,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {bond.lockupOptions.map((option, index) => {
        const baseRewards =
          (bond.baseApr * option.timeMultiplier * option.pollerMaxBoost - 1) *
          100;
        return (
          <div
            key={index}
            className="px-4 py-2 flex justify-between rounded-lg items-center border border-black dark:border-white"
          >
            <div className="text-center">
              <div className="text-sm">
                Voting Power Boost: {option.pollingPowerMultiplier}x
              </div>
              <div className="font-bold">{option.optionName}</div>
              <div className="text-sm">
                Rewards: up to {baseRewards.toFixed(2)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LockupOptionsDisplay;
