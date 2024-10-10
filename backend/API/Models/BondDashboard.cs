namespace Dab.API.Models.Dashboard;

public class LockDTO
{
    public DateTime LockTime { get; set; }
    public string BondId { get; set; } = "";
    public string Account { get; set; } = "";
    public decimal LockedAmount { get; set; }
    public decimal MaxRewards { get; set; }
    public string RequestKey { get; set; } = "";
    public LockDTO(EventDTO evt)
    {
        BondId = evt.Params[0]?.ToString();
        Account = evt.Params[1]?.ToString();
        LockedAmount = decimal.TryParse(evt.Params[2]?.ToString(), out var amt) ? amt : 0;
        MaxRewards = decimal.TryParse(evt.Params[3]?.ToString(), out var rewards) ? rewards : 0;
        RequestKey = evt.RequestKey;
        LockTime = DateTime.TryParse(evt.BlockTime, out var lockTime) ? lockTime : default;
    }
}

public class ClaimDTO
{
    public DateTime ClaimTime { get; set; }
    public string BondId { get; set; } = "";
    public string Account { get; set; } = "";
    public decimal Amount { get; set; }
    public decimal TotalAmount { get; set; }
    public string RequestKey { get; set; } = "";
    public ClaimDTO(EventDTO evt)
    {
        BondId = evt.Params[0]?.ToString();
        Account = evt.Params[1]?.ToString();
        Amount = decimal.TryParse(evt.Params[2]?.ToString(), out var amt) ? amt : 0;
        TotalAmount = decimal.TryParse(evt.Params[3]?.ToString(), out var rewards) ? rewards : 0;
        RequestKey = evt.RequestKey;
        ClaimTime = DateTime.TryParse(evt.BlockTime, out var lockTime) ? lockTime : default;
    }
}

public class PollVoteEventDTO
{
    public DateTime VoteTime { get; set; }
    public string PollId { get; set; } = "";
    public string Account { get; set; } = "";
    public string Action { get; set; } = "";
    public string RequestKey { get; set; } = "";
    public PollVoteEventDTO(EventDTO evt)
    {
        PollId = evt.Params[0]?.ToString();
        Account = evt.Params[1]?.ToString();
        Action = evt.Params[2]?.ToString();
        RequestKey = evt.RequestKey;
        VoteTime = DateTime.TryParse(evt.BlockTime, out var lockTime) ? lockTime : default;
    }
}


public class EventDTO
{
    public string BlockHash { get; set; } = "";
    public string BlockTime { get; set; } = "";
    public int Chain { get; set; }
    public int Height { get; set; }
    public int Idx { get; set; }
    public string ModuleHash { get; set; } = "";
    public string Name { get; set; }
    public List<object> Params { get; set; } = new List<object>();
    public string RequestKey { get; set; } = "";
}


public class BondDashboard
{
    public decimal AmountLocked { get; set; }
    public int ActivePolls { get; set; }
    public int TotalLockers { get; set; }
    public decimal DistributedRewards { get; set; }
    public decimal AvailableRewards { get; set; }
    public decimal MaxReturnRate { get; set; }
    public decimal TotalLockedAmount { get; set; }
    public string AverageLockup { get; set; } = "";
    public string MostVotedPoll { get; set; } = "";
    public List<LockDTO> LatestLocks { get; set; } = new();
    public List<ClaimDTO> LatestClaims { get; set; } = new();
    public List<PollVoteEventDTO> LatestVotes { get; set; } = new();
}

public class VoteDistributionDTO
{
    public string Type { get; set; } = "";
    public int VoteCount { get; set; }
    public decimal PollingPower { get; set; }
}

public class VoteOverTimeDTO
{
    public DateTime Date { get; set; }
    public int VoteCount { get; set; }
    public decimal PollingPower { get; set; }
    public string Action { get; set; } = "";
}

public class LockupDistributionDTO
{
    public string OptionName { get; set; } = "";
    public decimal OptionLength { get; set; }
    public int LockupCount { get; set; }
    public decimal Amount { get; set; }
}


public class LockupsOverTimeDTO
{
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public int LockupCount { get; set; }
}

public class LockupDensityDTO
{
    public string Amount { get; set; } = "";
    public int Density { get; set; }
}
