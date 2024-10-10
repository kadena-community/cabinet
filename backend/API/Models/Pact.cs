using System.Text.Json.Serialization;

namespace Dab.API.Models.Pact;

public class PactDateTimeP
{
    [JsonPropertyName("timep")]
    public DateTime? TimeP { get; set; }

    [JsonPropertyName("time")]
    public DateTime? Time { get; set; }

    public DateTime Date => TimeP ?? Time ?? default(DateTime);
}
