using System.Text.Json;
using System.Text.Json.Serialization;
using Dab.API.Models.Pact;

namespace Dab.API.Models.Poller;

public class Poll
{
    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("description")]
    public string Description { get; set; } = "";

    [JsonPropertyName("author")]
    public string Author { get; set; } = "";

    [JsonPropertyName("poll-id")]
    public string PollId { get; set; } = "";

    [JsonPropertyName("creation-time")]
    public PactDateTimeP CreationTime { get; set; } = new();

    [JsonPropertyName("bond-id")]
    public string BondId { get; set; }  = "";

    [JsonPropertyName("options")]
    public List<PollOption> PollOptions {get;  set;} = new();

    [JsonPropertyName("election-end")]
    public PactDateTimeP ElectionEnd { get; set; } = new();

    [JsonPropertyName("election-start")]
    public PactDateTimeP ElectionStart { get; set; } = new();

    [JsonPropertyName("number-votes")]
    public JsonElement _numberVotes { get; set; }
    public decimal NumberVotes { get { return Utils.GetInteger(_numberVotes); }}

    [JsonPropertyName("votes-quorum")]
    public JsonElement _votesQuorum { get; set; }
    public decimal VotesQuorum { get { return Utils.GetInteger(_votesQuorum); }}

    [JsonPropertyName("quorum")]
    public JsonElement _quorum { get; set; }
    public decimal Quorum { get  { return Utils.GetDecimal(_quorum); }}

}

public class PollOption
{

    [JsonPropertyName("option-name")]
    public string _optionName { get; set; } = "";
    public string OptionName { get { return _optionName; }}
    [JsonPropertyName("option-index")]
    public JsonElement index {get; set;}
    public decimal OptionIndex { get { return Utils.GetInteger(index); }}
    [JsonPropertyName("votes-polling-power")]
    public JsonElement _votesPollingPower {get; set;}
    public decimal VotesPollingPower { get { return Utils.GetDecimal(_votesPollingPower); }}
}


public enum PollStatus
{
    Open = 0,
    Closed = 1,
    Review = 2
}

public class PollDTO
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Author { get; set; } = "";
    public string PollId { get; set; } = "";
    public DateTime CreationTime { get; set; }
    public string BondId { get; set; } = "";
    public List<PollOption> PollOptions { get; set; } = new();
    public DateTime ElectionStart { get; set; }
    public DateTime ElectionEnd { get; set; }
    public decimal Quorum {get; set;}
    public decimal VotesQuorum {get; set;}
    public decimal NumberVotes {get; set;}
    public PollStatus Status
    {
        get
        {
            if (DateTime.UtcNow < ElectionStart.ToUniversalTime())
            {
                return PollStatus.Review;
            }
            else if (DateTime.UtcNow < ElectionEnd.ToUniversalTime())
            {
                return PollStatus.Open;
            }

            return PollStatus.Closed;
        }
    }
}



public class PollVote
{
    [JsonPropertyName("bond-id")]
    public string BondId { get; set; } = "";

    [JsonPropertyName("polling-power")]
    public JsonElement _pollingPower { get; set; }

    [JsonPropertyName("action")]
    public string Action { get; set; } = "";

    [JsonPropertyName("account")]
    public string Account { get; set; } = "";

    [JsonPropertyName("date")]
    public PactDateTimeP Date { get; set; } = new();

    [JsonPropertyName("poll-id")]
    public string PollId { get; set; } = "";

    public decimal PollingPower
    {
        get { return Utils.GetDecimal(_pollingPower); }
    }
}

public class PollVoteDTO
{
    public string BondId { get; set; } = "";
    public decimal PollingPower { get; set; }
    public string Action { get; set; } = "";
    public string Account { get; set; } = "";
    public DateTime Date { get; set; }
    public string PollId { get; set; } = "";
}
