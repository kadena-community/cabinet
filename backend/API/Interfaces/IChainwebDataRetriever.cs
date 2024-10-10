using Dab.API.Models.Events;

namespace Dab.API.Interfaces;

public interface IChainwebDataRetriever
{
    Task<List<LockEvent>> RetrieveLockData();
    Task<List<ClaimEvent>> RetrieveClaimData();
}
