using Dab.API.Models;
using Dab.API.Models.Dashboard;

namespace Dab.API.Interfaces;

public interface IAnalyticsService
{
    Task<ServiceResult> GetApiAnalytics(bool ignoreCache = false);
    Task<Dictionary<decimal, int>> GetLockTimeDistribution(bool ignoreCache = false);
    Task<Dictionary<string, int>> GetAmountDistribution(bool ignoreCache = false);
    Task<Dictionary<DateTime, decimal>> GetDailyLockups(bool ignoreCache = false);
    Task<List<VoteDistributionDTO>> GetPollNumberofVotes(string pollId, bool ignoreCache = false);
    Task<List<VoteOverTimeDTO>> GetPollVotesAndPollingPowerOverTime(string pollId, bool ignoreCache = false);
    Task<Dictionary<DateTime, decimal>> GetDailyTvl(bool ignoreCache = false);
    Task<List<LockupsOverTimeDTO>> GetLockupsOverTime(string bondId, bool ignoreCache = false);
    Task<List<LockupDistributionDTO>> GetLockupDistributions(string bondId, bool ignoreCache = false);
    Task<List<VoteOverTimeDTO>> GetGlobalDailyVotesAndPollingPower(bool ignoreCache = false);
    Task<List<LockupDensityDTO>> GetLockupDensity(string bondId, bool ignoreCache = false);
    Task<Dictionary<DateTime, decimal>> GetCumulativeLockupAmount(bool ignoreCache = false);
}
