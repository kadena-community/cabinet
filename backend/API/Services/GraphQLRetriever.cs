using System.Text;
using System.Text.Json;
using Dab.API.Interfaces;
using Dab.API.Models.Events;

namespace Dab.API.Services
{
    public class ChainwebGraphQLRetriever : IChainwebDataRetriever
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

        public async Task<List<LockEvent>> RetrieveLockData()
        {
            var allLockEvents = new List<LockEvent>();
            string endCursor = null;
            bool hasNextPage = true;

            while (hasNextPage)
            {
                try
                {
                    _logger.LogInformation("Retrieving LOCK event data via GraphQL");

                    var query = $@"
                        query LockEventSearch($after: String) {{
                          events(
                            qualifiedEventName: ""{_namespace}.bonder.LOCK""
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

                    var graphQLResponse = await ExecuteGraphQLQueryAsync(query, "LockEventSearch", variables);

                    var lockEvents = ParseLockEvents(graphQLResponse);

                    allLockEvents.AddRange(lockEvents);

                    // Update pagination info
                    if (graphQLResponse.TryGetProperty("data", out var dataElement) &&
                        dataElement.TryGetProperty("events", out var eventsElement) &&
                        eventsElement.TryGetProperty("pageInfo", out var pageInfoElement))
                    {
                        hasNextPage = pageInfoElement.GetProperty("hasNextPage").GetBoolean();
                        endCursor = pageInfoElement.GetProperty("endCursor").GetString();
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

            return allLockEvents;
        }

        public async Task<List<ClaimEvent>> RetrieveClaimData()
        {
            var allClaimEvents = new List<ClaimEvent>();
            string endCursor = null;
            bool hasNextPage = true;

            while (hasNextPage)
            {
                try
                {
                    _logger.LogInformation("Retrieving CLAIM event data via GraphQL");

                    var query = $@"
                        query ClaimEventSearch($after: String) {{
                          events(
                            qualifiedEventName: ""{_namespace}.bonder.CLAIM""
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

                    var graphQLResponse = await ExecuteGraphQLQueryAsync(query, "ClaimEventSearch", variables);

                    var claimEvents = ParseClaimEvents(graphQLResponse);

                    allClaimEvents.AddRange(claimEvents);

                    // Update pagination info
                    if (graphQLResponse.TryGetProperty("data", out var dataElement) &&
                        dataElement.TryGetProperty("events", out var eventsElement) &&
                        eventsElement.TryGetProperty("pageInfo", out var pageInfoElement))
                    {
                        hasNextPage = pageInfoElement.GetProperty("hasNextPage").GetBoolean();
                        endCursor = pageInfoElement.GetProperty("endCursor").GetString();
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

            return allClaimEvents;
        }

        private async Task<JsonElement> ExecuteGraphQLQueryAsync(string query, string operationName, object variables)
        {
            using var client = new HttpClient();
            var requestBody = new
            {
                query = query,
                operationName = operationName,
                variables = variables,
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

            return jsonDocument.RootElement.Clone(); // Clone to prevent disposal issues
        }

        private List<LockEvent> ParseLockEvents(JsonElement root)
        {
            var lockEvents = new List<LockEvent>();

            if (root.TryGetProperty("data", out var dataElement) &&
                dataElement.TryGetProperty("events", out var eventsElement) &&
                eventsElement.TryGetProperty("edges", out var edgesElement))
            {
                foreach (var edge in edgesElement.EnumerateArray())
                {
                    if (edge.TryGetProperty("node", out var nodeElement))
                    {
                        var parametersString = nodeElement.GetProperty("parameters").GetString();
                        var parametersJson = JsonSerializer.Deserialize<JsonElement[]>(parametersString);

                        var lockEvent = new LockEvent
                        {
                            BondId = parametersJson.Length > 0 ? parametersJson[0].GetString() : "",
                            Account = parametersJson.Length > 1 ? parametersJson[1].GetString() : "",
                            Amount = parametersJson.Length > 2 ? decimal.Parse(parametersJson[2].GetRawText()) : 0,
                            Rewards = parametersJson.Length > 3 ? decimal.Parse(parametersJson[3].GetRawText()) : 0,
                            LockupLength = parametersJson.Length > 4 ? ParseLockupLength(parametersJson[4]) : 0,
                            Timestamp = DateTime.Parse(nodeElement.GetProperty("block").GetProperty("creationTime").GetString()),
                            RequestKey = nodeElement.GetProperty("requestKey").GetString() ?? ""
                        };

                        lockEvents.Add(lockEvent);
                    }
                }
            }
            else
            {
                _logger.LogError("Unexpected JSON structure in ParseLockEvents.");
            }

            return lockEvents;
        }

        private List<ClaimEvent> ParseClaimEvents(JsonElement root)
        {
            var claimEvents = new List<ClaimEvent>();

            if (root.TryGetProperty("data", out var dataElement) &&
                dataElement.TryGetProperty("events", out var eventsElement) &&
                eventsElement.TryGetProperty("edges", out var edgesElement))
            {
                foreach (var edge in edgesElement.EnumerateArray())
                {
                    if (edge.TryGetProperty("node", out var nodeElement))
                    {
                        var parametersString = nodeElement.GetProperty("parameters").GetString();
                        var parametersJson = JsonSerializer.Deserialize<JsonElement[]>(parametersString);

                        var claimEvent = new ClaimEvent
                        {
                            BondId = parametersJson.Length > 0 ? parametersJson[0].GetString() : "",
                            Account = parametersJson.Length > 1 ? parametersJson[1].GetString() : "",
                            OriginalAmount = parametersJson.Length > 2 ? decimal.Parse(parametersJson[2].GetRawText()) : 0,
                            TotalAmount = parametersJson.Length > 3 ? decimal.Parse(parametersJson[3].GetRawText()) : 0,
                            Timestamp = DateTime.Parse(nodeElement.GetProperty("block").GetProperty("creationTime").GetString()),
                            RequestKey = nodeElement.GetProperty("requestKey").GetString() ?? ""
                        };

                        claimEvents.Add(claimEvent);
                    }
                }
            }
            else
            {
                _logger.LogError("Unexpected JSON structure in ParseClaimEvents.");
            }

            return claimEvents;
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

        // Implement other methods from IChainwebDataRetriever as needed
    }
}
