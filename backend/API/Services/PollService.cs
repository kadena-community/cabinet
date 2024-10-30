using System.Text.Json;
using Dab.API.Interfaces;
using Dab.API.Models.Poller;
using Dab.API.Models.Cache;
using Dab.API.AppSettings;
using AutoMapper;

namespace Dab.API.Services;

public class PollService : IPollService
{
    private readonly ILogger<PollService> _logger;
    private readonly ICacheService _cacheService;
    private readonly IPactService _pactService;
    private readonly DabContractConfig _dabConfig;
    private readonly string chain;
    private readonly string ns;
    private readonly IMapper _mapper;
    private readonly int expirySeconds = 20;

    public PollService(ILogger<PollService> logger, ICacheService cacheService, IMapper mapper, IPactService pactService, IConfiguration configuration)
    {
        _mapper = mapper;
        _logger = logger;
        _cacheService = cacheService;
        _pactService = pactService;
        _dabConfig = (configuration.GetSection("DabContractConfig").Get<DabContractConfig>() ??
                                           throw new Exception("Dab config not defined"));
        chain = _dabConfig.ContractChain;
        ns = _dabConfig.Namespace;
    }


    public async Task<Poll> GetPoll(string pollId, bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.PollCache(pollId);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);
                return JsonSerializer.Deserialize<Poll>(cached) ?? new();//new ServiceResult{HasErrors = false, JsonString = cached };
            }

            var code = $"({ns}.poller.read-poll \"{pollId}\")";
            var resp = await _pactService.RunLocalCommand(chain, code);
            var ret = Utils.JsonPrettify(resp);

            await _cacheService.SetItem(cacheKey, ret, expirySeconds);
            return JsonSerializer.Deserialize<Poll>(resp) ?? new();//new ServiceResult{HasErrors = false, JsonString = ret };
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return new(); //ServiceResult{HasErrors = true, JsonString = e.Message };
        }
    }

        private async Task<List<Poll>> GetAccountVotedPolls(string account, bool ignoreCache = false)
        {
        try
        {
            var code = $"(map ({ns}.poller.read-poll) (map (at 'poll-id) ({ns}.poller.read-all-account-votes \"{account}\")))";

            var resp = await _pactService.RunLocalCommand(chain, code);
            var ret = Utils.JsonPrettify(resp);



            return JsonSerializer.Deserialize<List<Poll>>(resp) ?? new();//new ServiceResult{HasErrors = false, JsonString = ret };
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return new();
        }
        }

    public async Task<List<Poll>> GetAllPolls(bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.AllPolls();

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);
                return JsonSerializer.Deserialize<List<Poll>>(cached) ?? new();
            }
            var code = $"({ns}.poller.read-all-polls)";
            var resp = await _pactService.RunLocalCommand(chain, code);

            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(resp), expirySeconds);
            var ret = JsonSerializer.Deserialize<List<Poll>>(resp) ?? new();
            return ret.OrderByDescending(x => x.CreationTime.Date).ToList();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return new();
        }

    }

    public async Task<List<PollVote>> GetAllVotes(bool ignoreCache = false)
    {
                try
        {
            var cacheKey = CacheKeys.AllVotes();

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);
                return JsonSerializer.Deserialize<List<PollVote>>(cached) ?? new();
            }
            var code = $"(select {ns}.poller.polls (constantly true))";
            var resp = await _pactService.RunLocalCommand(chain, code);

            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(resp), expirySeconds);
            var ret = JsonSerializer.Deserialize<List<PollVote>>(resp) ?? new();
            return ret.OrderByDescending(x => x.Date.Date).ToList();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return new();
        }

    }



    public async Task<List<Poll>> GetActivePolls(bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.ActivePolls();

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);
                return JsonSerializer.Deserialize<List<Poll>>(cached) ?? new();
            }

            var code = $"({ns}.poller.read-active-polls)";
            var resp = await _pactService.RunLocalCommand(chain, code);

            var ret = JsonSerializer.Deserialize<List<Poll>>(resp) ?? new();
            ret = ret.OrderByDescending(x => x.CreationTime.Date).ToList();
            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(ret), expirySeconds);
            return ret;
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return new();
        }

    }
    public async Task<List<PollVote>> GetAllAccountVotes(string account, bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.AccountVotes(account);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);
                return JsonSerializer.Deserialize<List<PollVote>>(cached) ?? new();
            }

            var code = $"({ns}.poller.read-all-account-votes \"{account}\")";
            var resp = await _pactService.RunLocalCommand(chain, code);

            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(resp), expirySeconds);
            return JsonSerializer.Deserialize<List<PollVote>>(resp) ?? new();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return new();
        }

    }

    public async Task<bool> CanAccountVote(string account, string pollId, bool ignoreCache = false)
        {
            try
        {
            var cacheKey = CacheKeys.CanAccountVote(account, pollId);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);
                return JsonSerializer.Deserialize<bool>(cached);
            }

            var code = $"({ns}.poller.can-account-vote \"{account}\" \"{pollId}\")";
            var resp = await _pactService.RunLocalCommand(chain, code);

            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(resp), expirySeconds);
            return JsonSerializer.Deserialize<bool>(resp);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return new();
        }

    }

    public async Task<Dictionary<string, bool>> CanAccountVoteMultiple(string account, List<string> pollIds, bool ignoreCache = false)
    {
        try
        {
            var results = new Dictionary<string, bool>();
            var pollsToQuery = new List<string>();

            foreach (var pollId in pollIds)
            {
                var cacheKey = CacheKeys.CanAccountVote(account, pollId);

                if (!ignoreCache && await _cacheService.HasItem(cacheKey))
                {
                    var cached = await _cacheService.GetItem<string>(cacheKey);
                    results[pollId] = JsonSerializer.Deserialize<bool>(cached);
                }
                else
                {
                    pollsToQuery.Add(pollId);
                }
            }

            if (pollsToQuery.Count > 0)
            {
                var pollListString = string.Join(" ", pollsToQuery.Select(pollId => $"\"{pollId}\""));
                var code = $"(map (lambda (x) ({ns}.poller.can-account-vote \"{account}\" x)) [{pollListString}])";
                var resp = await _pactService.RunLocalCommand(chain, code);
                var boolList = JsonSerializer.Deserialize<List<bool>>(resp) ?? throw new Exception("Failed to query voting data");

                for (int i = 0; i < pollsToQuery.Count; i++)
                {
                    var pollId = pollsToQuery[i];
                    var canVote = boolList[i];
                    var cacheKey = CacheKeys.CanAccountVote(account, pollId);
                    await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(canVote), expirySeconds);
                    results[pollId] = canVote;
                }
            }

            return results;
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return new Dictionary<string, bool>();
        }
    }


    public async Task<AccountVoteStats> GetAccountVoteStats(string account, bool ignoreCache = false)
    {
         try
        {
            var cacheKey = CacheKeys.AccountVoteStats(account);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);
                return JsonSerializer.Deserialize<AccountVoteStats>(cached) ?? new();
            }

            var votes = await GetAllAccountVotes(account, ignoreCache);
            var polls = await GetAccountVotedPolls(account, ignoreCache);
            var pollsDto = _mapper.Map<List<PollDTO>>(polls);
            var results = new List<bool?>();
            foreach(var v in votes)
            {

                results.Add(Utils.GetElectionResultForVote(v, pollsDto));

            }

            var stats = new AccountVoteStats
            {
                Account = account,
                TotalVotes = votes.Count(),
                OngoingVotes = results.Where(e => e == null).Count(),
                VotesWon = results.Where(e => e == true).Count(),
                VotesLost = results.Where(e => e == false).Count()
            };
            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(stats), expirySeconds);
            return stats;

        }
         catch (Exception e)
         {

             _logger.LogError(e, e.Message);
             return new();
         }

    }

    public async Task<decimal> GetMaxPollingPower(string account, bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.MaxPollingPower(account);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<decimal>(cacheKey);
                return cached;
            }

            var code = $"(at 0 (reverse (sort (map (lambda (x) (at 'polling-power x)) ({ns}.bonder-utils.get-account-active-bonds \"{account}\")))))";
            var resp = await _pactService.RunLocalCommand(chain, code);

            var ret = Utils.GetDecimal(resp);
            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(ret), expirySeconds);
            return ret;
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return 0.0m;
        }
    }




    public async Task<decimal> GetPollingPower(string account, string pollId, bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.PollingPower(account, pollId);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<decimal>(cacheKey);
                return cached;
            }

            var code = $"({ns}.poller.get-polling-power \"{account}\" \"{pollId}\")";
            var resp = await _pactService.RunLocalCommand(chain, code);

            var ret = Utils.GetDecimal(resp);
            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(ret), expirySeconds);
            return ret;
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return 0.0m;
        }
    }

    public async Task<bool> IsPollApproved(string pollId, bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.PollApproved(pollId);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);

                var ret = bool.TryParse(cached, out var res);
                return ret ? res : false;
            }

            var code = $"({ns}.poller.is-poll-approved \"{pollId}\")";
            var resp = await _pactService.RunLocalCommand(chain, code);

            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(resp), expirySeconds);
            return JsonSerializer.Deserialize<bool>(resp);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return false;
        }
    }

    public async Task<List<Poll>> GetAccountCreatedPolls(string account, bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.AccountPolls(account);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);
                return JsonSerializer.Deserialize<List<Poll>>(cached) ?? new();
            }

            var code = $"({ns}.poller.read-account-created-polls \"{account}\")";
            var resp = await _pactService.RunLocalCommand(chain, code);

            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(resp), expirySeconds);
            return JsonSerializer.Deserialize<List<Poll>>(resp) ?? new();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return new();
        }

    }

    public async Task<bool> AccountAlreadyVoted(string account, string pollId, bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.AlreadyVoted(account, pollId);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);

                var ret = bool.TryParse(cached, out var res);
                return ret ? res : false;
            }

            var code = $"({ns}.poller.account-already-voted \"{account}\" \"{pollId}\")";
            var resp = await _pactService.RunLocalCommand(chain, code);

            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(resp), expirySeconds);
            return JsonSerializer.Deserialize<bool>(resp);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return false;
        }
    }

    public async Task<List<PollVote>> GetPollVotes(string pollId, bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.PollVotes(pollId);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);
                return JsonSerializer.Deserialize<List<PollVote>>(cached) ?? new();
            }

            var code = $"({ns}.poller.read-poll-votes \"{pollId}\")";
            var resp = await _pactService.RunLocalCommand(chain, code);

            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(resp), expirySeconds);
            return JsonSerializer.Deserialize<List<PollVote>>(resp) ?? new();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return new();
        }

    }




    public async Task<PollVote> GetAccountPollVote(string account, string pollId, bool ignoreCache = false)
    {
        try
        {
            var cacheKey = CacheKeys.PollVote(account, pollId);

            if (!ignoreCache && await _cacheService.HasItem(cacheKey))
            {
                var cached = await _cacheService.GetItem<string>(cacheKey);
                return JsonSerializer.Deserialize<PollVote>(cached) ?? new();
            }

            var code = $"({ns}.poller.read-poll-vote \"{account}\" \"{pollId}\")";
            var resp = await _pactService.RunLocalCommand(chain, code);

            await _cacheService.SetItem(cacheKey, Utils.JsonPrettify(resp), expirySeconds);
            return JsonSerializer.Deserialize<PollVote>(resp) ?? new();
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return new();
        }

    }
}
