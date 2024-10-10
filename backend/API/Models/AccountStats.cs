public class AccountStats
{
    public string Account { get; set; } = "";
    public int OngoingLockups {get; set;}
    public int ClaimedLockups {get; set;}
    public string NextClaimDate { get; set; } = "";
    public string LastClaimDate { get; set; } = "";
    public decimal TotalClaimedRewards { get; set; }
    public decimal MeanBaseReturns { get; set; }
    public decimal CurrentLockedAmount { get; set; }
    public decimal RewardsToEarn { get; set; }
    public decimal TotalInteractions { get; set; }
}
