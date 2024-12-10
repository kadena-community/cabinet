namespace Dab.API.Models.Events;

 public interface IBondEvent
    {
        string BondId { get; set; }
        string Account { get; set; }
        decimal Amount { get; }
        decimal Rewards { get; }
        DateTime Timestamp { get; set; }
        string RequestKey { get; set; }
        string Type {get; set;}
 }

public class LockEvent : IBondEvent
{
    public string BondId { get; set; } = "";
    public string Account { get; set; } = "";
    public decimal Amount { get; set; }
    public decimal Rewards { get; set; }
    public decimal LockupLength { get; set; }
    public DateTime Timestamp { get; set; }
    public string RequestKey { get; set; } = "";
    public string Type {get; set;} = "Lock";
}


public class ClaimEvent : IBondEvent
{
    public string BondId { get; set; } = "";
    public string Account { get; set; } = "";
    public decimal OriginalAmount { get; set; }
    public decimal Rewards {get {return TotalAmount - OriginalAmount;}}
    public decimal TotalAmount { get; set; }
    public DateTime Timestamp { get; set; }
    public string RequestKey { get; set; } = "";
    public string Type {get; set;} = "Claim";

    public decimal Amount => OriginalAmount;
}

public class VoteEvent
{
    public string Account { get; set; } = "";
    public string PollId { get; set; } = "";
    public string Action { get; set; } = "";
    public DateTime Timestamp { get; set; }
    public string RequestKey { get; set; } = "";
}
