using System.Text.Json;
using Dab.API.Interfaces;
using Dab.API.Models.Cache;
using Dab.API.AppSettings;
using Dab.API.Models;
using Dab.API.Models.Dashboard;
using Dab.API;

namespace Dab.API.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly ILogger<AnalyticsService> _logger;
    private readonly ICacheService _cacheService;
    private readonly IPactService _pactService;
    private readonly IPollService _pollService;
    private readonly IBondService _bondService;
    private readonly DabContractConfig _dabConfig;
    private readonly string chain;
    private readonly string ns;
    private readonly string chainwebDataUrl;
    private readonly int expirySeconds = 120;

    public AnalyticsService(ILogger<AnalyticsService> logger, ICacheService cacheService, IPactService pactService, IConfiguration configuration, IPollService pollService, IBondService bondService)
    {
        _logger = logger;
        _cacheService = cacheService;
        _pactService = pactService;
        _pollService = pollService;
        _bondService = bondService;
        _dabConfig = (configuration.GetSection("DabContractConfig").Get<DabContractConfig>() ??
                                           throw new Exception("Dab config not defined"));
        chainwebDataUrl = _dabConfig.ChainwebDataUrl;
        chain = _dabConfig.ContractChain;
        ns = _dabConfig.Namespace;
    }

    private async Task<List<EventDTO>> EventSearch(string evt)
    {
        string Url = $"{chainwebDataUrl}/txs/events?search={evt}";

        _logger.LogDebug($"Querying {Url} for {evt}");
        Uri queryUri = new(Url);
        using (HttpClient client = new())
        {
            return await client.GetFromJsonAsync<List<EventDTO>>(queryUri) ?? new();
        }
    }

    private async Task<List<EventDTO>> CacheEventSearch(string evt, bool ignoreCache = false)
    {

        var cacheKey = CacheKeys.EventSearch(evt);
        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<List<EventDTO>>(cached) ?? new();
        }

        var evs = await EventSearch(evt);
        var ret = Utils.JsonPrettify(evs);

        _logger.LogDebug($"Event Search: {ret}");

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return evs;
    }

    public async Task<List<LockDTO>> GetLatestLocks(bool ignoreCache = false)
    {
        var lockupsInContract = await _bondService.GetAllLockups();
        if (!lockupsInContract.Any()) return new List<LockDTO>();

        var evt = $"{ns}.bonder.LOCK";
        var query = await CacheEventSearch(evt, ignoreCache);

        return query
            .Select(evt => new LockDTO(evt))
            .OrderByDescending(dto => dto.LockTime)
            .Take(3)
            .ToList();
    }

    public async Task<List<ClaimDTO>> GetLatestClaims(bool ignoreCache = false)
    {
        var lockupsInContract = await _bondService.GetAllLockups();
        if (!lockupsInContract.Any()) return new List<ClaimDTO>();

        var evt = $"{ns}.bonder.CLAIM";
        var query = await CacheEventSearch(evt, ignoreCache);

        return query
            .Select(evt => new ClaimDTO(evt))
            .OrderByDescending(dto => dto.ClaimTime)
            .Take(3)
            .ToList();
    }

    public async Task<List<PollVoteEventDTO>> GetLatestVotes(bool ignoreCache = false)
    {
        var lockupsInContract = await _bondService.GetAllLockups();
        if (!lockupsInContract.Any()) return new List<PollVoteEventDTO>();

        var evt = $"{ns}.poller.VOTE";
        var query = await CacheEventSearch(evt, ignoreCache);

        return query
            .Select(evt => new PollVoteEventDTO(evt))
            .OrderByDescending(dto => dto.VoteTime)
            .Take(3)
            .ToList();
    }


    private async Task<decimal> GetTokenBalance(string tokenModule, string account, bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.TokenBalance(tokenModule, account, chain);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<decimal>(cacheKey);
                return cached;
            }

            var code = $"(floor ({tokenModule}.get-balance \"{account}\") 3)";
            var resp = await _pactService.RunLocalCommand(chain, code);
            var balance = Utils.GetDecimal(resp);

            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(balance), 30);
            return balance;
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return 0;
        }

    }

    public async Task<decimal> GetBondTVL(bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.TokenBalance("coin", "bonder-bank-account", chain);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<decimal>(cacheKey);
                return cached;
            }

            var code = $"(floor (coin.get-balance ({ns}.bonder.BONDER_BANK) ) 3)";
            var resp = await _pactService.RunLocalCommand(chain, code);
            var balance = Utils.GetDecimal(resp);

            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(balance), 30);
            return balance;
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return 0;
        }

    }

    public async Task<string> GetMostVotedPoll(bool ignoreCache = false)
    {
        try
        {
            var allPolls = await _pollService.GetAllPolls(ignoreCache);

            var maxVotes = allPolls.OrderByDescending(p => p.VotesNo + p.VotesYes + p.VotesAbstentions).FirstOrDefault();

            if (maxVotes == null)
            {
                return "No polls available";
            }

            string formattedPollId = maxVotes.PollId.Length > 6
                ? $"{maxVotes.PollId.Substring(0, 3)}...{maxVotes.PollId.Substring(maxVotes.PollId.Length - 3)}"
                : maxVotes.PollId;

            var totalVotes = maxVotes.VotesNo + maxVotes.VotesYes + maxVotes.VotesAbstentions;
            return $"{formattedPollId} ({totalVotes:N0} VP)";
        }
        catch (Exception e)
        {
            return "No polls available";
        }
    }

    public async Task<string> GetAverageLockup(bool ignoreCache = false)
    {
        var allLockups = await _bondService.GetAllLockupEvents(ignoreCache);

        var meanLenSeconds = allLockups.Average(t => t.LockupLength);
        var meanLenDays = meanLenSeconds / (24 * 60 * 60); // Convert seconds to days

        return $"{meanLenDays:F2} days"; // Format to 2 decimal places
    }

    public async Task<decimal> GetMaxReturnRate(bool ignoreCache = false)
    {
        var allBonds = await _bondService.GetAllBonds(ignoreCache);
        var maxReturnRate = allBonds
        .SelectMany(bond => bond.LockupOptions, (bond, option) => bond.BaseApr * option.TimeMultiplier * option.PollerMaxBoost)
        .Max();

        return maxReturnRate - 1;
    }

    public async Task<ServiceResult> GetApiAnalytics(bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.ApiAnalytics();

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return new ServiceResult { HasErrors = false, JsonString = cached };
        }

        try
        {
            var ret = new BondDashboard
            {
                DistributedRewards = await SafeExecute(async () => await GetGlobalGivenRewards(ignoreCache), 0m),
                AvailableRewards = await SafeExecute(async () => await GetGlobalAvailableRewards(ignoreCache), 0m),
                LatestLocks = await SafeExecute(async () => await GetLatestLocks(ignoreCache), new List<LockDTO>()),
                LatestClaims = await SafeExecute(async () => await GetLatestClaims(ignoreCache), new List<ClaimDTO>()),
                LatestVotes = await SafeExecute(async () => await GetLatestVotes(ignoreCache), new List<PollVoteEventDTO>()),
                AmountLocked = await SafeExecute(async () => await GetBondTVL(ignoreCache), 0m),
                ActivePolls = await SafeExecute(async () => (await _pollService.GetActivePolls(ignoreCache)).Count(), 0),
                TotalLockers = await SafeExecute(async () => (await _bondService.GetAllLockupEvents(ignoreCache)).Count(), 0),
                MostVotedPoll = await SafeExecute(async () => await GetMostVotedPoll(ignoreCache), ""),
                AverageLockup = await SafeExecute(async () => await GetAverageLockup(ignoreCache), ""),
                MaxReturnRate = await SafeExecute(async () => await GetMaxReturnRate(ignoreCache), 0m),
                TotalLockedAmount = await SafeExecute(async () => (await _bondService.GetAllLockupEvents(ignoreCache)).Sum(x => x.Amount + x.Rewards), 0m)
            };

            var jsonResult = Utils.JsonPrettify(ret);
            await _cacheService.SetItem(cacheKey, jsonResult, 5 * expirySeconds);

            return new ServiceResult { HasErrors = false, JsonString = jsonResult };
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return new ServiceResult { HasErrors = true, JsonString = "Error retrieving Dashboard" };
        }
    }


    private async Task<T> SafeExecute<T>(Func<Task<T>> func, T defaultValue)
    {
        try
        {
            return await func();
        }
        catch
        {
            return defaultValue;
        }
    }


    private async Task<decimal> GetGlobalGivenRewards(bool ignoreCache = false)
    {
        try
        {
            var allBonds = await _bondService.GetAllBonds(ignoreCache);
            return Math.Round(allBonds.Sum(t => t.GivenRewards), 3);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return -1.0M;

        }
    }

    private async Task<decimal> GetGlobalAvailableRewards(bool ignoreCache = false)
    {
        try
        {
            var allBonds = await _bondService.GetAllBonds(ignoreCache);
            return Math.Round(allBonds.Sum(bond => bond.TotalRewards - (bond.LockedRewards + bond.GivenRewards)), 3);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return -1.0M;
        }
    }

    public async Task<Dictionary<DateTime, decimal>> GetDailyTvl(bool ignoreCache = false)
    {

        var allBonds = await _bondService.GetAllBonds(ignoreCache);
        var allLockups = await _bondService.GetAllLockupEvents(ignoreCache);

        var dailyLockAmount = allLockups
            .GroupBy(lockup => lockup.Timestamp.Date)
            .ToDictionary(
                group => group.Key,
                group => group.Sum(lockup => lockup.Amount + lockup.Rewards)
            );


        var dailyUnlockAmount = allLockups
            .GroupBy(lockup => lockup.Timestamp.AddSeconds((double)lockup.LockupLength))
            .ToDictionary(
                group => group.Key,
                group => group.Sum(lockup => lockup.Amount + lockup.Rewards)
            );

        Dictionary<DateTime, decimal> dailyTvl = new();

        if (dailyLockAmount.Count > 0 && dailyUnlockAmount.Count > 0)
        {
            var startDate = dailyLockAmount.Keys.Min();
            var endDate = dailyUnlockAmount.Keys.Max();

            var cumulativeLock = 0.0m;
            var cumulativeUnlock = 0.0m;

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {

                if (!dailyLockAmount.ContainsKey(date))
                {
                    dailyLockAmount[date] = 0;
                }

                if (!dailyUnlockAmount.ContainsKey(date))
                {
                    dailyUnlockAmount[date] = 0;
                }

                cumulativeLock += dailyLockAmount[date];
                cumulativeUnlock += dailyUnlockAmount[date];

                dailyTvl[date] = cumulativeLock - cumulativeUnlock;

            }
        }

        return dailyTvl;

    }

    public async Task<Dictionary<DateTime, decimal>> GetDailyLockups(bool ignoreCache = false)
    {
        try
        {
            var allLockups = await _bondService.GetAllLockupEvents(ignoreCache);
            var dailyLockups = allLockups
                .GroupBy(lockup => lockup.Timestamp.Date)
                .ToDictionary(
                    group => group.Key,
                    group => group.Sum(lockup => lockup.Amount)
                );
            if (dailyLockups.Count > 0)
            {
                var startDate = dailyLockups.Keys.Min();
                var endDate = dailyLockups.Keys.Max();

                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    if (!dailyLockups.ContainsKey(date))
                    {
                        dailyLockups[date] = 0;
                    }
                }
            }

            return dailyLockups.OrderBy(x => x.Key).ToDictionary(x => x.Key, x => x.Value);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return new Dictionary<DateTime, decimal>(); // Return an empty dictionary in case of an error
        }
    }


    public async Task<Dictionary<DateTime, decimal>> GetCumulativeLockupAmount(bool ignoreCache = false)
    {
        try
        {
            var allLockups = await _bondService.GetAllLockupEvents(ignoreCache);
            var dailyLockups = allLockups
                .GroupBy(lockup => lockup.Timestamp.Date)
                .ToDictionary(
                    group => group.Key,
                    group => group.Sum(lockup => lockup.Amount + lockup.Rewards)
                );

            if (dailyLockups.Count > 0)
            {
                var startDate = dailyLockups.Keys.Min();
                var endDate = dailyLockups.Keys.Max();

                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    if (!dailyLockups.ContainsKey(date))
                    {
                        dailyLockups[date] = 0;
                    }
                }

                // Calculate cumulative sum
                decimal cumulativeSum = 0;
                var cumulativeLockups = new Dictionary<DateTime, decimal>();
                foreach (var date in dailyLockups.OrderBy(x => x.Key))
                {
                    cumulativeSum += date.Value;
                    cumulativeLockups[date.Key] = cumulativeSum;
                }

                return cumulativeLockups;
            }

            return new Dictionary<DateTime, decimal>();
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return new Dictionary<DateTime, decimal>(); // Return an empty dictionary in case of an error
        }
    }


    public async Task<Dictionary<decimal, int>> GetLockTimeDistribution(bool ignoreCache = false)
    {
        try
        {
            var allLockups = await _bondService.GetAllLockupEvents(ignoreCache);

            var lockTimeDistribution = allLockups
                .GroupBy(lockup => lockup.LockupLength)
                .ToDictionary(
                    group => group.Key,
                    group => group.Count()
                );

            return lockTimeDistribution;
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return new Dictionary<decimal, int>(); // Return an empty dictionary in case of an error
        }
    }

    public async Task<Dictionary<string, int>> GetAmountDistribution(bool ignoreCache = false)
    {
        try
        {
            var allLockups = await _bondService.GetAllLockupEvents(ignoreCache);
            var lockupAmounts = allLockups.Select(l => l.Amount).ToList();

            if (!lockupAmounts.Any())
            {
                return new Dictionary<string, int>();
            }

            var bins = GetBins();
            var binCounts = new Dictionary<string, int>(bins.Keys.ToDictionary(key => key, key => 0));

            foreach (var amount in lockupAmounts)
            {
                foreach (var bin in bins)
                {
                    if (amount >= bin.Value.min && amount <= bin.Value.max)
                    {
                        binCounts[bin.Key]++;
                        break;
                    }
                }
            }

            return binCounts;
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return new Dictionary<string, int>();
        }
    }

    public async Task<List<VoteDistributionDTO>> GetPollNumberofVotes(string pollId, bool ignoreCache = false)
    {
        try
        {
            var allVotes = await _pollService.GetPollVotes(pollId, ignoreCache);

            var voteDistribution = allVotes
                .GroupBy(vote => vote.Action.ToLower())
                .Select(group => new VoteDistributionDTO
                {
                    Type = group.Key switch
                    {
                        "approved" => "Yes",
                        "refused" => "No",
                        "abstention" => "Abstention",
                        _ => "Unknown"
                    },
                    VoteCount = group.Count(),
                    PollingPower = group.Sum(vote => vote.PollingPower)
                })
                .ToList();

            return voteDistribution;
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return new List<VoteDistributionDTO>(); // Return an empty list in case of an error
        }
    }

    public async Task<List<VoteOverTimeDTO>> GetPollVotesAndPollingPowerOverTime(string pollId, bool ignoreCache = false)
    {
        try
        {
            var allVotes = await _pollService.GetPollVotes(pollId, ignoreCache);

            var votesAndPollingPowerOverTime = allVotes
                .GroupBy(vote => new { vote.Date.Date, vote.Action })
                .Select(group => new VoteOverTimeDTO
                {
                    Date = group.Key.Date,
                    Action = group.Key.Action,
                    VoteCount = group.Count(),
                    PollingPower = group.Sum(vote => vote.PollingPower)
                })
                .ToList();

            return votesAndPollingPowerOverTime;
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return new List<VoteOverTimeDTO>();
        }
    }


    public async Task<List<LockupsOverTimeDTO>> GetLockupsOverTime(string bondId, bool ignoreCache = false)
    {
        try
        {
            var allLockups = await _bondService.GetAllLockupEvents(ignoreCache);
            var lockupsOverTime = allLockups
                .Where(t => t.BondId == bondId)
                .GroupBy(l => l.Timestamp.Date)
                .Select(group => new LockupsOverTimeDTO
                {
                    Date = group.Key.Date,
                    LockupCount = group.Count(),
                    Amount = group.Sum(x => x.Amount)
                })
                .ToList();

            return lockupsOverTime;
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return new List<LockupsOverTimeDTO>();
        }
    }

    public async Task<List<LockupDistributionDTO>> GetLockupDistributions(string bondId, bool ignoreCache = false)
    {
        try
        {
            var allLockups = await _bondService.GetAllLockupEvents(ignoreCache);
            var bond = await _bondService.GetBond(bondId, ignoreCache);
            var lockupDistribution = allLockups
                .Where(t => t.BondId == bondId)
                .GroupBy(lockup => lockup.LockupLength)
                .Select(group => new LockupDistributionDTO
                {
                    OptionName = Utils.GetOptionName(bond,  group.Key),
                    OptionLength = group.First().LockupLength,
                    LockupCount = group.Count(),
                    Amount = group.Sum(lockup => lockup.Amount)
                })
                .ToList();

            return lockupDistribution;
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return new List<LockupDistributionDTO>();
        }
    }

    public async Task<List<VoteOverTimeDTO>> GetGlobalDailyVotesAndPollingPower(bool ignoreCache = false)
    {
        try
        {
            var allVotes = await _pollService.GetAllVotes(ignoreCache);

            var votesAndPollingPowerOverTime = allVotes
                .GroupBy(vote => new { vote.Date.Date, vote.Action })
                .Select(group => new VoteOverTimeDTO
                {
                    Date = group.Key.Date,
                    Action = group.Key.Action,
                    VoteCount = group.Count(),
                    PollingPower = group.Sum(vote => vote.PollingPower)
                })
                .ToList();

            return votesAndPollingPowerOverTime;
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return new List<VoteOverTimeDTO>();
        }
    }

    public async Task<List<LockupDensityDTO>> GetLockupDensity(string bondId, bool ignoreCache = false)
    {
        try
        {
            var allLockups = await _bondService.GetAllLockupEvents(ignoreCache);

            var lockupAmounts = allLockups
                .Where(t => t.BondId == bondId)
                .Select(l => l.Amount).ToList();

            if (!lockupAmounts.Any())
            {
                return new List<LockupDensityDTO>();
            }

            var bins = GetBins();
            var binCounts = new Dictionary<string, int>(bins.Keys.ToDictionary(key => key, key => 0));

            foreach (var amount in lockupAmounts)
            {
                foreach (var bin in bins)
                {
                    if (amount >= bin.Value.min && amount <= bin.Value.max)
                    {
                        binCounts[bin.Key]++;
                        break;
                    }
                }
            }

            var densityData = binCounts
                .Select(bin => new LockupDensityDTO
                {
                    Amount = bin.Key, // Bin range as string
                    Density = bin.Value
                })
                .ToList();

            return densityData;
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return new List<LockupDensityDTO>();
        }
    }
    private Dictionary<string, (decimal min, decimal max)> GetBins()
    {
        return new Dictionary<string, (decimal, decimal)>
    {
        { "100-500", (100, 500) },
        { "500-1000", (500, 1000) },
        { "1,000-2,000", (1000, 2000) },
        { "2,000-3,000", (2000, 3000) },
        { "3,000-4,000", (3000, 4000) },
        { "4,000+", (4000, 1000000) }
    };
    }
}
