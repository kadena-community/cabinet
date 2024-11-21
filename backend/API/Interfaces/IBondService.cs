using Dab.API.Models.Bonder;
using Dab.API.Models.Events;
namespace Dab.API.Interfaces;

public interface IBondService
{
    Task<BondSale> GetBond(string bondId, bool ignoreCache = false);
    Task<List<BondSale>> GetAllBonds(bool ignoreCache = false);
    Task<List<Lockup>> GetAllLockups(bool ignoreCache = false);
    Task<List<LockEvent>> GetAllLockupEvents(bool ignoreCache = false);
    Task<List<ClaimEvent>> GetAllClaimEvents(bool ignoreCache = false);
    Task<List<VoteEvent>> GetAllVoteEvents(bool ignoreCache = false);
    Task<Lockup> GetLockup(string lockupId, bool ignoreCache = false);
    Task<List<Lockup>> GetAccountLockups(string account, bool ignoreCache = false);
    Task<List<IBondEvent>> GetAllLockupsFromBond(string bondId, bool ignoreCache = false);
    Task<decimal> GetMaxLockupReturns(decimal amount, decimal length, string bondId, bool ignoreCache = false);
    Task<decimal> GetMinLockupReturns(decimal amount, decimal length, string bondId, bool ignoreCache = false);
    Task<List<string>> GetAllBondIds(bool ignoreCache = false);
    Task<AccountStats> GetAccountStats(string account, bool ignoreCache = false);
    Task<bool> IsBonderAccount(string account, bool ignoreCache = false);
    Task<bool> IsCoreAccount(string account, bool ignoreCache = false);
    Task<List<LockupOption>> GetBondLockupOptions(string bondId, bool ignoreCache = false);
    Task<bool> CanAccountBond(string account, string bondId, bool ignoreCache = false);
    Task<Dictionary<string, decimal>> GetLockedCounts(string bondId, bool ignoreCache = false);

}
