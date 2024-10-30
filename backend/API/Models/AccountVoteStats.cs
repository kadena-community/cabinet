public class AccountVoteStats
{
    public string Account { get; set; } = "";
    public int TotalVotes { get; set; }
    public int OngoingVotes {get; set;}
    public int VotesWon {get; set;}
    public int VotesLost {get; set;}
    // public int EndedPolls {get; set;}
    // public int ApprovedPolls {get; set;}
    // public int RejectedPolls {get; set;}
}
