using Dab.API.Models.Poller;

namespace Dab.API.Interfaces;

public interface IPollService
{
    Task<Poll> GetPoll(string pollId, bool ignoreCache = false);
    Task<List<Poll>> GetAllPolls(bool ignoreCache = false);
    Task<List<Poll>> GetActivePolls(bool ignoreCache = false);
    Task<decimal> GetPollingPower(string account, string PollId, bool ignoreCache = false);
    Task<decimal> GetMaxPollingPower(string account, bool ignoreCache = false);
    Task<bool> IsPollApproved(string pollId, bool ignoreCache = false);
    Task<List<Poll>> GetAccountCreatedPolls(string account, bool ignoreCache = false);
    Task<bool> AccountAlreadyVoted(string account, string pollId, bool ignoreCache = false);
    Task<bool> CanAccountVote(string account, string pollId, bool ignoreCache = false);
    Task<PollVote> GetAccountPollVote(string account, string pollId, bool ignoreCache = false);
    Task<List<PollVote>> GetPollVotes(string pollId, bool ignoreCache = false);
    Task<List<PollVote>> GetAllAccountVotes(string account, bool ignoreCache = false);
    Task<AccountVoteStats> GetAccountVoteStats(string account, bool ignoreCache = false);
    Task<List<PollVote>> GetAllVotes(bool ignoreCache = false);
    Task<Dictionary<string, bool>> CanAccountVoteMultiple(string account, List<string> pollIds, bool ignoreCache = false);
}
