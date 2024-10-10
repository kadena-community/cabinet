public class AccountVoteStats
{
    public string Account { get; set; } = "";
    public int TotalVotes { get; set; }
    public int VotesYes { get; set; }
    public int VotesNo { get; set; }
    public int Abstentions { get; set; }
    public decimal CurrentPollingPower {get; set;}
    // public int EndedPolls {get; set;}
    // public int ApprovedPolls {get; set;}
    // public int RejectedPolls {get; set;}
}
