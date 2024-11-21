namespace Dab.API.Models.Cache
{
    public class CacheKeys
    {

        public static string EventSearch(string evt) => $"event-search-{evt}";

        public static string TokenBalance(string tokenContract, string account, string chain) => $"token-balance-{tokenContract}-{account}-{chain}";

        public static string AllBonds() => $"all-bonds";

        public static string AllBondsIds() => $"all-bonds-ids";

        public static string ActiveBonds() => $"active-bonds";

        public static string ActivePolls() => $"active-polls";

        public static string AllLockups() => $"all-lockups";

        public static string AllLockupEvents() => $"all-lockups-events";

        public static string AllClaimEvents() => $"all-claim-events";

        public static string AccountBondsIds(string account) => $"all-bonds-ids-{account}";

        public static string BondRead(string bondId) => $"bond-{bondId}";

        public static string BondLockupOptions(string bondId) => $"lockup-options-{bondId}";

        public static string BondingStatus(string account) => $"bond-status-{account}";

        public static string CoreMemberStatus(string account) => $"core-status-{account}";

        public static string AccountLockups(string account) => $"lockups-{account}";

        public static string LockupRead(string lockupId) => $"lockup-{lockupId}";

        public static string AllLockups(string bondId) => $"alllockups-{bondId}";

        public static string LockupMaxRewards(decimal amount, decimal length, string bondId) => $"max-rewards-{amount}-{length}-{bondId}";

        public static string LockupMinRewards(decimal amount, decimal length, string bondId) => $"min-rewards-{amount}-{length}-{bondId}";

        public static string AccountVoted(string account, string pollId) => $"account-voted_{account}_{pollId}";

        public static string AllPolls() => $"allpolls";

        public static string AllAccounts(string bondId) => $"allaccounts-{bondId}";

        public static string PollCache(string pollId) => $"poll-{pollId}";

        public static string PollVote(string account, string pollId) => $"poll-vote_{pollId}_{account}";

        public static string PollVotes(string pollId) => $"poll-votes_{pollId}";

        public static string TokenPrice(string tokenAlias) => $"{tokenAlias}-price-usd";

        public static string AccountPolls(string account) => $"created-polls-{account}";

        public static string PollingPower(string account, string pollId) => $"polling-power-{account}-{pollId}";

        public static string MaxPollingPower(string account) => $"max-polling-power-{account}";

        public static string PollApproved(string pollId) => $"poll-approved-{pollId}";

        public static string AccountStats(string account) => $"account-stats-{account}";

        public static string AccountVoteStats(string account) => $"account-vote-stats-{account}";

        public static string AccountVotes(string account) => $"account-votes-{account}";

        public static string CanAccountVote(string account, string pollId) => $"can-account-vote-{account}-{pollId}";

        public static string AlreadyVoted(string account, string pollId) => $"already-voted-{pollId}-{account}";

        public static string CanBond(string account, string bondId) => $"can-bond_{account}_{bondId}";

        public static string AllVotes() => $"all-votes";

                public static string AllVoteEvents() => $"all-vote-events";

        public static string ApiAnalytics() => $"api-dashboard";
    }
}
