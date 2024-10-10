using System.Text.Json.Serialization;
using System.Text.Json;
using Dab.API.Models.Pact;

namespace Dab.API.Models.Bonder;

//FIXME these types require more testing (not handled {decimal:})

public class LockupOption
{
    [JsonPropertyName("option-name")]
    public string _optionName { get; set; } = "";
    public string OptionName { get { return _optionName; }}

    [JsonPropertyName("option-length")]
    public JsonElement _optionLength { get; set; }
    public decimal OptionLength { get { return Utils.GetInteger(_optionLength); }}

    [JsonPropertyName("time-multiplier")]
    public JsonElement _timeMultiplier { get; set; }
    public decimal TimeMultiplier { get { return Utils.GetDecimal(_timeMultiplier); }}

    [JsonPropertyName("poller-max-boost")]
    public JsonElement _pollerMaxBoost { get; set; }
    public decimal PollerMaxBoost { get { return Utils.GetDecimal(_pollerMaxBoost); }}

    [JsonPropertyName("polling-power-multiplier")]
    public JsonElement _pollingPowerMultiplier { get; set; }
    public decimal PollingPowerMultiplier { get { return Utils.GetDecimal(_pollingPowerMultiplier); }}

}

public class LockupOptionDTO
{
    public string OptionName { get; set; } = "";
    public decimal Length { get; set; }
    public decimal PollingPowerMultiplier { get; set; }
    public decimal TimeMultiplier { get; set; }
    public decimal PollerMaxBoost { get; set; }
}


public class BondSale
{
    [JsonPropertyName("creator")]
    public string Creator { get; set; }  = "";

    [JsonPropertyName("start-time")]
    public PactDateTimeP StartTime { get; set; } = new();

    [JsonPropertyName("lockup-options")]
    public List<LockupOption> LockupOptions { get; set; } = new();

    [JsonPropertyName("bond-id")]
    public string BondId { get; set; } = "";

    [JsonPropertyName("whitelisted-accounts")]
    public List<string> WhitelistedAccounts { get; set; } = new();

    [JsonPropertyName("base-apr")]
    public JsonElement _baseApr { get; set; }
    public decimal BaseApr { get  { return Utils.GetDecimal(_baseApr); }}

    [JsonPropertyName("max-amount")]
    public JsonElement _maxAmount { get; set; }
    public decimal MaxAmount { get  { return Utils.GetDecimal(_maxAmount); }}

    [JsonPropertyName("min-amount")]
    public JsonElement _minAmount { get; set; }
    public decimal MinAmount { get  { return Utils.GetDecimal(_minAmount); }}

    [JsonPropertyName("total-rewards")]
    public JsonElement _totalRewards { get; set; }
    public decimal TotalRewards { get  { return Utils.GetDecimal(_totalRewards); }}

    [JsonPropertyName("locked-rewards")]
    public JsonElement _lockedRewards { get; set; }
    public decimal LockedRewards { get  { return Utils.GetDecimal(_lockedRewards); }}

    [JsonPropertyName("given-rewards")]
    public JsonElement _givenRewards { get; set; }
    public decimal GivenRewards { get  { return Utils.GetDecimal(_givenRewards); }}

    [JsonPropertyName("total-polls")]
    public JsonElement _totalPolls { get; set; }
    public decimal TotalPolls { get  { return Utils.GetInteger(_totalPolls); }}

    [JsonPropertyName("active-bonders")]
    public JsonElement _activeBonders { get; set; }
    public decimal ActiveBonders { get  { return Utils.GetInteger(_activeBonders); }}

    [JsonPropertyName("total-vp")]
    public JsonElement _totalVp { get; set; }
    public decimal TotalVp { get  { return Utils.GetDecimal(_totalVp); }}

}

public class BondSaleDTO
{
    public string Creator { get; set; } = "";
    public string BondId {get; set;} = "";
    public string StartTime { get; set; } = "";
    public List<LockupOption> LockupOptions { get; set; } = new();
    public decimal BaseApr { get; set; }
    public decimal MaxAmount { get; set; }
    public decimal MinAmount { get; set; }
    public decimal TotalRewards { get; set; }
    public decimal GivenRewards { get; set; }
    public decimal LockedRewards { get; set; }
    public decimal TotalPolls { get; set; }
    public decimal ActiveBonders { get; set; }
    public decimal LockedCount { get; set; }
    public decimal ClaimedCount { get; set; }
    public decimal AvailableRewards {get {return TotalRewards - (GivenRewards + LockedRewards);}}
    public decimal TotalVp { get; set; }

}



public class LockupDTO
{
    public string LockupId { get; set; } = "";
    public string BondId { get; set; } = "";
    public string Account { get; set; } = "";
    public LockupOption LockupOption { get; set; } = new();
    public string LockupStartTime { get; set; } = "";
    public string LockupEndTime { get; set; } = "";
    public decimal PollingPower { get; set; }
    public decimal KdaLocked { get; set; }
    public decimal MaxKdaRewards { get; set; }
    public decimal ClaimedKdaRewards { get; set; }
    public string Status { get; set; } = "";
    public decimal Interactions { get; set; }
    public decimal PollsAtLock { get; set; }
}


public class Lockup
{
    [JsonPropertyName("lockup-id")]
    public string LockupId { get; set; } = "";

    [JsonPropertyName("bond-id")]
    public string BondId { get; set; } = "";

    [JsonPropertyName("account")]
    public string Account { get; set; }  = "";

    [JsonPropertyName("lockup-option")]
    public LockupOption LockupOption { get; set; } = new();

    [JsonPropertyName("lockup-start-time")]
    public PactDateTimeP LockupStartTime { get; set; } = new();

    [JsonPropertyName("polling-power")]
    public JsonElement _pollingPower { get; set; }
    public decimal PollingPower { get { return Utils.GetDecimal(_pollingPower); }}

    [JsonPropertyName("lockup-end-time")]
    public PactDateTimeP LockupEndTime { get; set; } = new();

    [JsonPropertyName("kda-locked")]
    public JsonElement _kdaLocked { get; set; }
    public decimal KdaLocked { get { return Utils.GetDecimal(_kdaLocked); }}

    [JsonPropertyName("max-kda-rewards")]
    public JsonElement _maxKdaRewards { get; set; }
    public decimal MaxKdaRewards { get { return Utils.GetDecimal(_maxKdaRewards); }}

    [JsonPropertyName("claimed-rewards")]
    public JsonElement _claimedKdaRewards { get; set; }
    public decimal ClaimedKdaRewards { get { return Utils.GetDecimal(_claimedKdaRewards); }}

    [JsonPropertyName("has-claimed")]
    public bool HasClaimed { get; set; }

    public string Status => HasClaimed ? "claimed" : "locked";

    [JsonPropertyName("interactions")]
    public JsonElement _interactions { get; set; }
    public decimal Interactions { get  { return Utils.GetInteger(_interactions); }}

    [JsonPropertyName("polls-at-lock")]
    public JsonElement _pollsAtLock { get; set; }
    public decimal PollsAtLock { get  { return Utils.GetInteger(_pollsAtLock); }}

}
