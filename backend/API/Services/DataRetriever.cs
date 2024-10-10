using Npgsql;
using Dab.API.Interfaces;
using Dab.API.Models.Events;
using System.Text.Json;
using Dab.API.Models.Cache;
using Dab.API.Models.Dashboard;

namespace Dab.API.Services
{
    public class ChainwebDataRetriever : IChainwebDataRetriever
    {
        private readonly ILogger<ChainwebDataRetriever> _logger;
        private readonly ICacheService _cacheService;
        private readonly string _connectionString;
        private readonly string _namespace;
        private NpgsqlDataSource? dataSource;
        private readonly string ns;
        private readonly string chainwebDataUrl;
        private readonly int expirySeconds = 120;

        public ChainwebDataRetriever(IConfiguration configuration, ILogger<ChainwebDataRetriever> logger, ICacheService cacheService)
        {
            _logger = logger;
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _namespace = configuration.GetSection("DabContractConfig").GetValue<string>("Namespace") ?? throw new Exception("Namespace not defined in configuration.");
            _cacheService = cacheService;
            chainwebDataUrl = configuration.GetSection("DabContractConfig").GetValue<string>("ChainwebDataUrl") ?? throw new Exception("Chainweb Data URL not defined in configuration.");
            ns = _namespace;
        }

        private void OpenSqlConnection()
        {
            if (!string.IsNullOrEmpty(_connectionString))
            {
                dataSource = NpgsqlDataSource.Create(_connectionString);
            }
        }

        public async Task<List<LockEvent>> RetrieveLockData()
        {
            if (!string.IsNullOrEmpty(_connectionString))
            {
                try
                {
                    _logger.LogInformation($"Retrieving LOCK event data from SQL via \n {_connectionString}");

                    OpenSqlConnection();
                    var sql = $@"SELECT params ->> 0                                                              as ""BondId"",
                                        params ->> 1                                                              as ""Account"",
                                        coalesce(params -> 2 ->> 'decimal', params ->> 2)                         as ""Amount"",
                                        coalesce(params -> 3 ->> 'decimal', params ->> 3)                         as ""Rewards"",
                                        coalesce(params -> 4 ->> 'int', params ->> 4)                             as ""LockupLength"",
                                        replace(translate(to_char(creationtime, 'YYYY-MM-DD HH:MI:SS.MSOF'), ' ', 'T'), '+00', 'Z') as ""Timestamp"",
                                        requestkey                                                                as ""RequestKey""
                                 FROM events as a
                                 JOIN blocks as b
                                 on a.block = b.hash
                                 WHERE a.qualname = '{_namespace}.bonder.LOCK'
                                 ORDER BY creationtime ASC;";

                    await using var cmd = dataSource.CreateCommand(sql);
                    await using var rdr = await cmd.ExecuteReaderAsync();

                    var list = new List<LockEvent>();

                    while (await rdr.ReadAsync())
                    {
                        var lockEvent = new LockEvent
                        {
                            BondId = rdr.GetString(0),
                            Account = rdr.GetString(1),
                            Amount = decimal.Parse(rdr.GetString(2)),
                            Rewards = decimal.Parse(rdr.GetString(3)),
                            LockupLength = decimal.Parse(rdr.GetString(4)),
                            Timestamp = DateTime.Parse(rdr.GetString(5)),
                            RequestKey = rdr.GetString(6)
                        };

                        list.Add(lockEvent);
                    }

                    return list;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "SQL retrieval failed, falling back to ChainwebData API");
                }
            }

            // Fallback to ChainwebData API
            return new(); // await GetAllLocks();
        }

        public async Task<List<ClaimEvent>> RetrieveClaimData()
        {
            if (!string.IsNullOrEmpty(_connectionString))
            {
                try
                {
                    _logger.LogInformation("Retrieving CLAIM event data from SQL");

                    OpenSqlConnection();
                    var sql = $@"SELECT params ->> 0                                                              as ""BondId"",
                                        params ->> 1                                                              as ""Account"",
                                        coalesce(params -> 2 ->> 'decimal', params ->> 2)                         as ""OriginalAmount"",
                                        coalesce(params -> 3 ->> 'decimal', params ->> 3)                         as ""TotalAmount"",
                                        replace(translate(to_char(creationtime, 'YYYY-MM-DD HH:MI:SS.MSOF'), ' ', 'T'), '+00', 'Z') as ""Timestamp"",
                                        requestkey                                                                as ""RequestKey""
                                 FROM events as a
                                 JOIN blocks as b
                                 on a.block = b.hash
                                 WHERE a.qualname = '{_namespace}.bonder.CLAIM'
                                 ORDER BY creationtime ASC;";

                    await using var cmd = dataSource.CreateCommand(sql);
                    await using var rdr = await cmd.ExecuteReaderAsync();

                    var list = new List<ClaimEvent>();

                    while (await rdr.ReadAsync())
                    {
                        _logger.LogInformation(rdr.ToString());
                        var claimEvent = new ClaimEvent
                        {
                            BondId = rdr.GetString(0),
                            Account = rdr.GetString(1),
                            OriginalAmount = decimal.Parse(rdr.GetString(2)),
                            TotalAmount = decimal.Parse(rdr.GetString(3)),
                            Timestamp = DateTime.Parse(rdr.GetString(4)),
                            RequestKey = rdr.GetString(5)
                        };

                        list.Add(claimEvent);
                    }

                    return list;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "SQL retrieval failed, falling back to ChainwebData API");
                }
            }

            // Fallback to ChainwebData API
            return await GetAllClaims();
        }


        private int ParseLockupLength(object lockupLengthParam)
        {
            if (lockupLengthParam is JsonElement jsonElement && jsonElement.ValueKind == JsonValueKind.Object)
            {
                // Assuming the "int" field is present in the JSON object
                if (jsonElement.TryGetProperty("int", out var intElement))
                {
                    return intElement.GetInt32();
                }
            }

            // Fallback for direct int values or if the object is not in expected format
            return int.TryParse(lockupLengthParam?.ToString(), out var result) ? result : 0;
        }

        public async Task<List<LockEvent>> GetAllLocks(bool ignoreCache = false)
        {
            var evt = $"{ns}.bonder.LOCK";
            var query = await CacheEventSearchAll(evt, ignoreCache);

            return query
                .Select(e => new LockEvent
                {
                    BondId = e.Params[0]?.ToString() ?? "",
                    Account = e.Params[1]?.ToString() ?? "",
                    Amount = decimal.Parse(e.Params[2]?.ToString() ?? "0"),
                    Rewards = decimal.Parse(e.Params[3]?.ToString() ?? "0"),
                    LockupLength = ParseLockupLength(e.Params[4]),
                    Timestamp = DateTime.Parse(e.BlockTime),
                    RequestKey = e.RequestKey
                })
                .OrderByDescending(le => le.Timestamp)
                .ToList();
        }

        public async Task<List<ClaimEvent>> GetAllClaims(bool ignoreCache = false)
        {
            var evt = $"{ns}.bonder.CLAIM";
            var query = await CacheEventSearchAll(evt, ignoreCache);

            return query
                .Select(e => new ClaimEvent
                {
                    BondId = e.Params[0]?.ToString() ?? "",
                    Account = e.Params[1]?.ToString() ?? "",
                    OriginalAmount = decimal.Parse(e.Params[2]?.ToString() ?? "0"),
                    TotalAmount = decimal.Parse(e.Params[3]?.ToString() ?? "0"),
                    Timestamp = DateTime.Parse(e.BlockTime),
                    RequestKey = e.RequestKey
                })
                .OrderByDescending(ce => ce.Timestamp)
                .ToList();
        }

        private async Task<List<EventDTO>> EventSearchAll(string evt)
        {
            List<EventDTO> allResults = new();
            string nextToken = null;

            do
            {
                var result = await EventSearchWithToken(evt, nextToken);

                // Add the items to the allResults list if there are any
                if (result.Items != null && result.Items.Count > 0)
                {
                    allResults.AddRange(result.Items);
                }

                if (!result.Items.Any()) break;
                
                // Update nextToken to determine if the loop should continue
                nextToken = result.NextToken ?? String.Empty;

            } while (!string.IsNullOrEmpty(nextToken)); // Continue if nextToken is not null or empty

            return allResults;
        }

        private async Task<(List<EventDTO> Items, string? NextToken)> EventSearchWithToken(string evt, string nextToken = null)
        {
            var queryUri = $"{chainwebDataUrl}/txs/events?search={evt}";
            if (!string.IsNullOrEmpty(nextToken))
            {
                queryUri += $"&next={nextToken}";
            }

            _logger.LogDebug($"Querying {queryUri} for {evt}");
            using (HttpClient client = new())
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, queryUri);
                using var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var events = await response.Content.ReadFromJsonAsync<List<EventDTO>>();
                var next = response.Headers.Contains("Chainweb-Next")
                            ? response.Headers.GetValues("Chainweb-Next").FirstOrDefault()
                            : null;

                return (events ?? new List<EventDTO>(), next);
            }
        }

        private async Task<List<EventDTO>> CacheEventSearchAll(string evt, bool ignoreCache = false)
        {
            var cacheKey = CacheKeys.EventSearch(evt);
            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);
                return JsonSerializer.Deserialize<List<EventDTO>>(cached) ?? new();
            }

            var evs = await EventSearchAll(evt);
            var ret = Utils.JsonPrettify(evs);

            _logger.LogDebug($"Event Search: {ret}");

            await _cacheService.SetItem(cacheKey, ret, expirySeconds);
            return evs;
        }
    }
}
