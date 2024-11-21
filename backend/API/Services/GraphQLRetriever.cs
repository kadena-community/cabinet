using System.Text;
using System.Text.Json;
using Dab.API.Interfaces;
using Dab.API.Models.Events;

namespace Dab.API.Services
{
    public class ChainwebGraphQLRetriever 
    {
        private readonly ILogger<ChainwebGraphQLRetriever> _logger;
        private readonly ICacheService _cacheService;
        private readonly string _namespace;
        private readonly string _graphQLEndpoint;
        private readonly int _expirySeconds = 120;

        public ChainwebGraphQLRetriever(IConfiguration configuration, ILogger<ChainwebGraphQLRetriever> logger, ICacheService cacheService)
        {
            _logger = logger;
            _cacheService = cacheService;
            _namespace = configuration.GetSection("DabContractConfig").GetValue<string>("Namespace") ?? throw new Exception("Namespace not defined in configuration.");
            _graphQLEndpoint = configuration.GetSection("DabContractConfig").GetValue<string>("GraphQLEndpoint") ?? "https://graph.kadena.network/graphql";
        }

        public async Task<List<T>> RetrieveEventDataAsync<T>(string qualifiedEventName, Func<JsonElement, T> parseFunction)
        {
            var allEvents = new List<T>();
            string endCursor = null;
            bool hasNextPage = true;

            while (hasNextPage)
            {
                try
                {
                    _logger.LogInformation($"Retrieving {qualifiedEventName} event data via GraphQL");

                    var query = $@"
                        query EventSearch($after: String) {{
                          events(
                            qualifiedEventName: ""{qualifiedEventName}""
                            first: 1000
                            after: $after
                          ) {{
                            edges {{
                              cursor
                              node {{
                                parameters
                                requestKey
                                block {{
                                  creationTime
                                }}
                              }}
                            }}
                            pageInfo {{
                              hasNextPage
                              endCursor
                            }}
                          }}
                        }}";

                    var variables = new { after = endCursor };

                    var graphQLResponse = await ExecuteGraphQLQueryAsync(query, "EventSearch", variables);

                    // Parse events using the provided parse function
                    if (graphQLResponse.TryGetProperty("data", out var dataElement) &&
                        dataElement.TryGetProperty("events", out var eventsElement) &&
                        eventsElement.TryGetProperty("edges", out var edgesElement))
                    {
                        foreach (var edge in edgesElement.EnumerateArray())
                        {
                            if (edge.TryGetProperty("node", out var nodeElement))
                            {
                                var parsedEvent = parseFunction(nodeElement);
                                allEvents.Add(parsedEvent);
                            }
                        }

                        if (eventsElement.TryGetProperty("pageInfo", out var pageInfoElement))
                        {
                            hasNextPage = pageInfoElement.GetProperty("hasNextPage").GetBoolean();
                            endCursor = pageInfoElement.GetProperty("endCursor").GetString();
                        }
                    }
                    else
                    {
                        hasNextPage = false;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "GraphQL retrieval failed");
                    break;
                }
            }

            return allEvents;
        }

        public async Task<List<LockEvent>> RetrieveLockData() =>
            await RetrieveEventDataAsync($"{_namespace}.bonder.LOCK", ParseLockEvent);

        public async Task<List<ClaimEvent>> RetrieveClaimData() =>
            await RetrieveEventDataAsync($"{_namespace}.bonder.CLAIM", ParseClaimEvent);

        public async Task<List<VoteEvent>> RetrieveVoteData() =>
            await RetrieveEventDataAsync($"{_namespace}.poller.VOTE", ParseVoteEvent);

        private async Task<JsonElement> ExecuteGraphQLQueryAsync(string query, string operationName, object variables)
        {
            using var client = new HttpClient();
            var requestBody = new
            {
                query,
                operationName,
                variables,
                extensions = new { }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            _logger.LogDebug($"Executing GraphQL query: {query}");

            var response = await client.PostAsync(_graphQLEndpoint, content);
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();

            _logger.LogDebug($"Received from GraphQL query: {responseString}");

            using var jsonDocument = JsonDocument.Parse(responseString);

            return jsonDocument.RootElement.Clone();
        }

        private LockEvent ParseLockEvent(JsonElement nodeElement) =>
            ParseEvent(nodeElement, parameters => new LockEvent
            {
                BondId = parameters.Length > 0 ? parameters[0].GetString() : "",
                Account = parameters.Length > 1 ? parameters[1].GetString() : "",
                Amount = parameters.Length > 2 ? decimal.Parse(parameters[2].GetRawText()) : 0,
                Rewards = parameters.Length > 3 ? decimal.Parse(parameters[3].GetRawText()) : 0,
                LockupLength = parameters.Length > 4 ? ParseLockupLength(parameters[4]) : 0,
                Timestamp = DateTime.Parse(nodeElement.GetProperty("block").GetProperty("creationTime").GetString()),
                RequestKey = nodeElement.GetProperty("requestKey").GetString() ?? ""
            });

        private ClaimEvent ParseClaimEvent(JsonElement nodeElement) =>
            ParseEvent(nodeElement, parameters => new ClaimEvent
            {
                BondId = parameters.Length > 0 ? parameters[0].GetString() : "",
                Account = parameters.Length > 1 ? parameters[1].GetString() : "",
                OriginalAmount = parameters.Length > 2 ? decimal.Parse(parameters[2].GetRawText()) : 0,
                TotalAmount = parameters.Length > 3 ? decimal.Parse(parameters[3].GetRawText()) : 0,
                Timestamp = DateTime.Parse(nodeElement.GetProperty("block").GetProperty("creationTime").GetString()),
                RequestKey = nodeElement.GetProperty("requestKey").GetString() ?? ""
            });

        private VoteEvent ParseVoteEvent(JsonElement nodeElement) =>
            ParseEvent(nodeElement, parameters => new VoteEvent
            {
                Account = parameters.Length > 0 ? parameters[0].GetString() : "",
                PollId = parameters.Length > 1 ? parameters[1].GetString() : "",
                Action = parameters.Length > 2 ? parameters[2].GetString() : "",
                Timestamp = DateTime.Parse(nodeElement.GetProperty("block").GetProperty("creationTime").GetString()),
                RequestKey = nodeElement.GetProperty("requestKey").GetString() ?? ""
            });

        private T ParseEvent<T>(JsonElement nodeElement, Func<JsonElement[], T> createEvent)
        {
            var parametersString = nodeElement.GetProperty("parameters").GetString();
            var parameters = JsonSerializer.Deserialize<JsonElement[]>(parametersString);
            return createEvent(parameters);
        }

        private int ParseLockupLength(JsonElement lockupLengthParam)
        {
            if (lockupLengthParam.ValueKind == JsonValueKind.Object && lockupLengthParam.TryGetProperty("int", out var intElement))
            {
                return intElement.GetInt32();
            }
            else if (lockupLengthParam.ValueKind == JsonValueKind.Number)
            {
                return lockupLengthParam.GetInt32();
            }
            else if (lockupLengthParam.ValueKind == JsonValueKind.String)
            {
                return int.TryParse(lockupLengthParam.GetString(), out var result) ? result : 0;
            }
            else
            {
                return 0;
            }
        }
    }
}
