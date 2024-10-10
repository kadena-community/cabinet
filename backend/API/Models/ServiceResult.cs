using System.Text.Json.Serialization;


namespace Dab.API.Models
{
    public class ServiceResult
    {

        [JsonPropertyName("jsonString")]
        public string JsonString { get; set; } = "default";

        [JsonPropertyName("hasErrors")]
        public bool HasErrors { get; set; }
    }
    public class TxErrorData
    {
        public string? Message { get; set; }
        public string? Info { get; set; }
        public string? CallStack { get; set; }
        public string? Type { get; set; }
    }

}
