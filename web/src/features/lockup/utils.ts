export function floorToTwoDecimalPlaces(num: number): number {
  return Math.floor(num * 100) / 100;
}

export function calculateMaximumRewards(
  amount: number,
  baseApr: number | undefined,
  timeMultiplier: number | undefined,
  pollerMaxBoost: number | undefined,
) {
  // Ensure all values are numeric and greater than zero
  amount = Number(amount);
  baseApr = Number(baseApr);
  timeMultiplier = Number(timeMultiplier);
  pollerMaxBoost = Number(pollerMaxBoost);

  if (
    isNaN(amount) ||
    isNaN(baseApr) ||
    isNaN(timeMultiplier) ||
    isNaN(pollerMaxBoost)
  ) {
    return 0; // or handle this case as needed
  }
  const maximumRewards =
    amount * baseApr * timeMultiplier * pollerMaxBoost - amount;
  return floorToTwoDecimalPlaces(maximumRewards);
}

export function previewVotingPower(
  amount: number,
  vpMultiplier: number | undefined,
) {
  vpMultiplier = Number(vpMultiplier);
  if (isNaN(vpMultiplier)) {
    return 0;
  }
  return floorToTwoDecimalPlaces(amount * vpMultiplier);
}

export function calculateLockupAmountForReward(
  reward: number,
  baseApr: number,
  timeMultiplier: number,
  pollerMaxBoost: number,
) {
  return floorToTwoDecimalPlaces(
    reward / (baseApr * timeMultiplier * pollerMaxBoost - 1),
  );
}
