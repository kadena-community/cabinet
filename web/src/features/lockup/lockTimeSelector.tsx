import React from "react";
import { Bond } from "../bond/types";

interface LockTimeSelectorProps {
  bond: Bond;
  localLockTime: number;
  onClick: (lockTime: number) => void; // Handler to update the selected lock time
}

const LockTimeSelector: React.FC<LockTimeSelectorProps> = ({
  bond,
  localLockTime,
  onClick,
}) => {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {" "}
      {bond.lockupOptions.map((option, index) => {
        const baseRewards =
          (bond.baseApr * option.timeMultiplier * option.pollerMaxBoost - 1) *
          100;
        return (
          <button
            key={index}
            onClick={() => onClick(option.optionLength)}
            className={`px-4 py-2 flex justify-between rounded-lg items-center
                        ${localLockTime === option.optionLength ? "ring-2 ring-gray-400" : ""}`}
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
          </button>
        );
      })}
    </div>
  );
};

export default LockTimeSelector;
