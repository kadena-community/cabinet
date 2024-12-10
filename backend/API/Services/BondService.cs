using System.Text.Json;
using Dab.API.Interfaces;
using Dab.API.Models.Events;
using Dab.API.Models.Bonder;
using Dab.API.Models.Cache;
using Dab.API.AppSettings;
using System.Globalization;

namespace Dab.API.Services;

public class BondService : IBondService
{
    private readonly ILogger<BondService> _logger;
    private readonly ICacheService _cacheService;
    private readonly IPactService _pactService;
    private readonly ChainwebGraphQLRetriever _graphRetriever;
    private readonly DabContractConfig _dabConfig;
    private readonly string chain;
    private readonly string ns;
    private readonly int expirySeconds = 20;

    public BondService(ILogger<BondService> logger, ICacheService cacheService, IPactService pactService, IConfiguration configuration, ChainwebGraphQLRetriever graphRetriever)
    {
        _logger = logger;
        _cacheService = cacheService;
        _pactService = pactService;
        _graphRetriever = graphRetriever;

        _dabConfig = (configuration.GetSection("DabContractConfig").Get<DabContractConfig>() ??
                                           throw new Exception("Dab config not defined"));
        chain = _dabConfig.ContractChain;
        ns = _dabConfig.Namespace;
    }

    public async Task<List<LockEvent>> GetAllLockupEvents(bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.AllLockupEvents();

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<List<LockEvent>>(cached) ?? new();
        }

        var lockEvents = (await _graphRetriever.RetrieveLockData())
            .GroupBy(e => e.RequestKey)
            .Select(g => g.First())
            .ToList();

        var ret = Utils.JsonPrettify(lockEvents);

        await _cacheService.SetItem(cacheKey, ret, 30 * expirySeconds);
        return lockEvents;
    }

    public async Task<List<VoteEvent>> GetAllVoteEvents(bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.AllVoteEvents();

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<List<VoteEvent>>(cached) ?? new();
        }

        var voteEvents = (await _graphRetriever.RetrieveVoteData())
            .GroupBy(e => e.RequestKey)
            .Select(g => g.First())
            .ToList();


        var ret = Utils.JsonPrettify(voteEvents);

        await _cacheService.SetItem(cacheKey, ret, 30 * expirySeconds);
        return voteEvents;
    }




    public async Task<List<ClaimEvent>> GetAllClaimEvents(bool ignoreCache = false)
    {

        var cacheKey = CacheKeys.AllClaimEvents();

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<List<ClaimEvent>>(cached) ?? new();
        }

        var claimEvents = (await _graphRetriever.RetrieveClaimData())
            .GroupBy(e => e.RequestKey)
            .Select(g => g.First())
            .ToList();


        var ret = Utils.JsonPrettify(claimEvents);

        await _cacheService.SetItem(cacheKey, ret, 30 * expirySeconds);
        return claimEvents.ToList();
    }


    public async Task<List<Lockup>> GetAllLockups(bool ignoreCache = false)
    {

        var cacheKey = CacheKeys.AllLockups();

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<List<Lockup>>(cached) ?? new();
        }

        var code = $"({ns}.bonder-utils.read-all-lockups)";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<List<Lockup>>(resp) ?? new();
    }



    public async Task<BondSale> GetBond(string bondId, bool ignoreCache = false)
    {

        var cacheKey = CacheKeys.BondRead(bondId);

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<BondSale>(cached) ?? new();
        }

        var code = $"({ns}.bonder.read-bond \"{bondId}\")";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<BondSale>(resp) ?? new();
    }

    public async Task<List<BondSale>> GetAllBonds(bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.AllBonds();

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<List<BondSale>>(cached) ?? new();
        }
        var code = $"({ns}.bonder-utils.read-all-bonds)";
        var resp = await _pactService.RunLocalCommand(chain, code);

        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<List<BondSale>>(resp) ?? new();
    }

    public async Task<Lockup> GetLockup(string lockupId, bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.LockupRead(lockupId);

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<Lockup>(cached) ?? new();
        }
        var code = $"({ns}.bonder.read-lockup \"{lockupId}\")";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<Lockup>(resp) ?? new();
    }


    public async Task<List<Lockup>> GetAccountLockups(string account, bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.AccountLockups(account);

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<List<Lockup>>(cached) ?? new();
        }

        var code = $"({ns}.bonder-utils.get-account-bonds \"{account}\")";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<List<Lockup>>(resp) ?? new();
    }


    public async Task<AccountStats> GetAccountStats(string account, bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.AccountStats(account);

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<AccountStats>(cached) ?? new();
        }

        var bonds = await GetAllBonds(ignoreCache);
        var userLockups = await GetAccountLockups(account, ignoreCache);

        int ongoingLockups = userLockups.Count(l => l.Status == "locked");
        int claimedLockups = userLockups.Count(l => l.Status == "claimed");
        decimal totalClaimedRewards = userLockups.Where(l => l.Status == "claimed").Sum(l => l.MaxKdaRewards);
        decimal currentLockedAmount = userLockups.Where(l => l.Status == "locked").Sum(l => l.KdaLocked);
        decimal totalInteractions = userLockups.Sum(l => l.Interactions);
        decimal meanBaseReturns = userLockups.Any() ? (userLockups.Sum(l => l.KdaLocked * bonds.Single(b => b.BondId == l.BondId).BaseApr * l.LockupOption.TimeMultiplier * l.LockupOption.PollerMaxBoost) / userLockups.Sum(l => l.KdaLocked)) - 1.0m : 0.0m;
        decimal rewardsToEarn = userLockups.Where(l => l.Status == "locked").Sum(l => l.MaxKdaRewards - ((l.KdaLocked * bonds.Single(b => b.BondId == l.BondId).BaseApr * l.LockupOption.TimeMultiplier) - l.KdaLocked));

        var nextClaimDate = userLockups
            .Where(l => l.Status == "locked")
            .OrderBy(l => l.LockupEndTime.Date)
            .FirstOrDefault()?.LockupEndTime;

        var lastClaimDate = userLockups
            .Where(l => l.Status == "locked")
            .OrderByDescending(l => l.LockupEndTime.Date)
            .FirstOrDefault()?.LockupEndTime;

        var stats = new AccountStats
        {
            Account = account,
            OngoingLockups = ongoingLockups,
            ClaimedLockups = claimedLockups,
            NextClaimDate = nextClaimDate?.Date.ToString("o", CultureInfo.InvariantCulture) ?? "",
            LastClaimDate = lastClaimDate?.Date.ToString("o", CultureInfo.InvariantCulture) ?? "",
            TotalClaimedRewards = totalClaimedRewards,
            MeanBaseReturns = meanBaseReturns,
            CurrentLockedAmount = currentLockedAmount,
            RewardsToEarn = rewardsToEarn,
            TotalInteractions = totalInteractions

        };
        await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(stats), expirySeconds);
        return stats;
    }

    public async Task<List<IBondEvent>> GetAllLockupsFromBond(string bondId, bool ignoreCache = false)
    {
        var allLocks = await GetAllLockupEvents(ignoreCache);
        var allClaims = await GetAllClaimEvents(ignoreCache);

        var combinedEvents = allLocks
        .Where(l => l.BondId == bondId)
        .Cast<IBondEvent>()
        .ToList();

        combinedEvents.AddRange(
            allClaims.Where(c => c.BondId == bondId)
                     .Cast<IBondEvent>()
        );

        return combinedEvents;

    }

    public async Task<decimal> GetMaxLockupReturns(decimal amount, decimal length, string bondId, bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.LockupMaxRewards(amount, length, bondId);

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<decimal>(cached);
        }

        var code = $"({ns}.bonder.calculate-max-rewards {amount} {length} \"{bondId}\")";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<decimal>(resp);
    }

    public async Task<decimal> GetMinLockupReturns(decimal amount, decimal length, string bondId, bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.LockupMinRewards(amount, length, bondId);

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<decimal>(cached);
        }

        var code = $"({ns}.bonder.calculate-min-rewards {amount} {length} \"{bondId}\")";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<decimal>(resp);

    }


    public async Task<List<string>> GetAllBondIds(bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.AllBondsIds();

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<List<string>>(cached) ?? new();

        }

        var code = $"({ns}.bonder.get-bond-keys)";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<List<string>>(resp) ?? new();

    }



    public async Task<bool> IsBonderAccount(string account, bool ignoreCache = false)
    {

        var cacheKey = CacheKeys.BondingStatus(account);

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<bool>(cached);
        }

        var code = $"({ns}.bonder.is-bonder-account \"{account}\")";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<bool>(resp);
    }

    public async Task<bool> IsCoreAccount(string account, bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.CoreMemberStatus(account);

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<bool>(cached);
        }

        var code = $"({ns}.bonder.is-core-account \"{account}\")";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<bool>(resp);
    }

    public async Task<bool> CanAccountBond(string account, string bondId, bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.CanBond(account, bondId);

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<bool>(cached);
        }

        var code = $"({ns}.bonder.can-account-bond \"{bondId}\" \"{account}\")";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<bool>(resp);
    }

    public async Task<bool> IsAccountBonded(string account, string bondId, bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.CanBond(account, bondId);

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<bool>(cached);
        }

        var code = $"({ns}.bonder.is-account-bonded \"{bondId}\" \"{account}\")";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<bool>(resp);
    }

    public async Task<List<LockupOption>> GetBondLockupOptions(string bondId, bool ignoreCache = false)
    {
        var cacheKey = CacheKeys.BondLockupOptions(bondId);

        if (!ignoreCache && await _cacheService.HasItem(cacheKey))
        {
            var cached = await _cacheService.GetItem<string>(cacheKey);
            return JsonSerializer.Deserialize<List<LockupOption>>(cached) ?? new();
        }

        var code = $"({ns}.bonder.get-bond-lockup-options \"{bondId}\")";
        var resp = await _pactService.RunLocalCommand(chain, code);
        var ret = Utils.JsonPrettify(resp);

        await _cacheService.SetItem(cacheKey, ret, expirySeconds);
        return JsonSerializer.Deserialize<List<LockupOption>>(resp) ?? new();
    }

    public async Task<Dictionary<string, decimal>> GetLockedCounts(string bondId, bool ignoreCache = false)
    {
        var allLockups = await GetAllLockupsFromBond(bondId, ignoreCache);

        var lockedCount = allLockups
            .Where(l => l.Type == "Lock")
            .Sum(l => l.Amount + l.Rewards);
        var claimedCount = allLockups
            .Where(l => l.Type == "Claim")
            .Sum(l => l.Amount + l.Rewards);

        return new Dictionary<string, decimal>
        {
            { "locked", lockedCount },
            { "claimed", claimedCount }
        };
    }

}
