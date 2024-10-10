namespace Dab.API.AppSettings
{
    public class KadenaSettingsConfig
    {
        public string Network { get; set; } = "Custom";
        public string NetworkId { get; set; } = "development";
        public string ApiHost { get; set; } = " http://127.0.0.1:8080/";
        public string ServerType { get; set; } = "Chainweb";
    }
}
