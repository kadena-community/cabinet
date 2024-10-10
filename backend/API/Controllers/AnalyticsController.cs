using Dab.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Dab.API.Controllers
{
    /// <summary>
    /// Controller for managing Analytics and their associated data
    /// </summary>
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly ILogger<AnalyticsController> _logger;
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(ILogger<AnalyticsController> logger, IAnalyticsService analyticsService)
        {
            _logger = logger;
            _analyticsService = analyticsService;
        }

        [HttpGet(Name = "GetApiAnalytics")]
        public async Task<IActionResult> GetApiAnalytics(bool ignoreCache = false)
        {
            var result = await _analyticsService.GetApiAnalytics(ignoreCache);
            return Ok(result);
        }

        /// <summary>
        /// Gets the distribution of lock times.
        /// </summary>
        /// <param name="ignoreCache">If set to true, ignores the cache.</param>
        /// <returns>A dictionary where keys are lock time options and values are the count of lockups.</returns>
        [HttpGet(Name = "GetLockTimeDistribution")]
        public async Task<IActionResult> GetLockTimeDistribution(bool ignoreCache = false)
        {
            var result = await _analyticsService.GetLockTimeDistribution(ignoreCache);
            return Ok(result);
        }

        /// <summary>
        /// Gets the distribution of lock amounts.
        /// </summary>
        /// <param name="ignoreCache">If set to true, ignores the cache.</param>
        /// <returns>A dictionary where keys are amount ranges and values are the count of lockups.</returns>
        [HttpGet(Name = "GetAmountDistribution")]
        public async Task<IActionResult> GetAmountDistribution(bool ignoreCache = false)
        {
            var result = await _analyticsService.GetAmountDistribution(ignoreCache);
            return Ok(result);
        }



        /// <summary>
        /// Gets the data for the tvl over time chart.
        /// </summary>
        /// <param name="ignoreCache">If set to true, ignores the cache.</param>
        /// <returns>A dictionary where keys are dates and values are TVL values at time.</returns>
        [HttpGet(Name = "GetDailyTvl")]
        public async Task<IActionResult> GetDailyTvl(bool ignoreCache = false)
        {
            var result = await _analyticsService.GetDailyTvl(ignoreCache);
            return Ok(result);
        }



        /// <summary>
        /// Gets the daily lockup amounts.
        /// </summary>
        /// <param name="ignoreCache">If set to true, ignores the cache.</param>
        /// <returns>A dictionary where keys are dates and values are the total amount locked on that date.</returns>
        [HttpGet(Name = "GetDailyLockups")]
        public async Task<IActionResult> GetDailyLockups(bool ignoreCache = false)
        {
            var result = await _analyticsService.GetDailyLockups(ignoreCache);
            return Ok(result);
        }

        /// <summary>
        /// Gets the cumulative lockup amounts.
        /// </summary>
        /// <param name="ignoreCache">If set to true, ignores the cache.</param>
        /// <returns>A dictionary where keys are dates and values are the cumulative amount locked up to that date.</returns>
        [HttpGet(Name = "GetCumulativeLockups")]
        public async Task<IActionResult> GetCumulativeLockups(bool ignoreCache = false)
        {
            var result = await _analyticsService.GetCumulativeLockupAmount(ignoreCache);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves the number of votes and polling power over time, as well as the total number of votes and polling power by vote type.
        /// </summary>
        /// <param name="pollId">The poll whose votes are to be retrieved.</param>
        /// <param name="ignoreCache">Whether to bypass the cache. Default is false.</param>
        /// <returns>A service result containing both sets of data or an error message.</returns>
        [HttpGet("{pollId}")]
        public async Task<IActionResult> GetPollVotesSummary(string pollId, bool ignoreCache = false)
        {
            try
            {
                var numberOfVotesTask = _analyticsService.GetPollNumberofVotes(pollId, ignoreCache);
                var votesOverTimeTask = _analyticsService.GetPollVotesAndPollingPowerOverTime(pollId, ignoreCache);

                await Task.WhenAll(numberOfVotesTask, votesOverTimeTask);

                var numberOfVotesResult = await numberOfVotesTask;
                var votesOverTimeResult = await votesOverTimeTask;

                var result = new
                {
                    NumberOfVotes = numberOfVotesResult,
                    VotesOverTime = votesOverTimeResult
                };

                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return BadRequest(new { Error = $"Error retrieving data for poll {pollId}" });
            }
        }
        /// <summary>
        /// Retrieves lockups over time and lockup distributions for a given bond.
        /// </summary>
        /// <param name="bondId">The bond whose lockups are to be retrieved.</param>
        /// <param name="ignoreCache">Whether to bypass the cache. Default is false.</param>
        /// <returns>A service result containing both sets of data or an error message.</returns>
        [HttpGet("{bondId}")]
        public async Task<IActionResult> GetLockupSummary(string bondId, bool ignoreCache = false)
        {
            try
            {
                var lockupsOverTimeTask = _analyticsService.GetLockupsOverTime(bondId, ignoreCache);
                var lockupDistributionsTask = _analyticsService.GetLockupDistributions(bondId, ignoreCache);

                await Task.WhenAll(lockupsOverTimeTask, lockupDistributionsTask);

                var lockupsOverTimeResult = await lockupsOverTimeTask;
                var lockupDistributionsResult = await lockupDistributionsTask;

                var result = new
                {
                    LockupsOverTime = lockupsOverTimeResult,
                    LockupDistributions = lockupDistributionsResult
                };

                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return BadRequest(new { Error = $"Error retrieving data for bond {bondId}" });
            }
        }
          /// <summary>
    /// Retrieves the global daily votes and polling power.
    /// </summary>
    /// <param name="ignoreCache">Whether to bypass the cache. Default is false.</param>
    /// <returns>A list of VoteOverTimeDTO objects or an error message.</returns>
    [HttpGet()]
    public async Task<IActionResult> GetGlobalDailyVotesAndPollingPower(bool ignoreCache = false)
    {
        try
        {
            var globalVotes = await _analyticsService.GetGlobalDailyVotesAndPollingPower(ignoreCache);
            return Ok(globalVotes);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return BadRequest(new { Error = "Error retrieving global daily votes and polling power" });
        }
    }

    /// <summary>
    /// Retrieves the density estimation of locked KDA amounts for a specified bond.
    /// </summary>
    /// <param name="bondId">The bond whose lockups are to be retrieved.</param>
    /// <param name="ignoreCache">Whether to bypass the cache. Default is false.</param>
    /// <returns>A service result containing the density estimation data.</returns>
    [HttpGet("{bondId}")]
    public async Task<IActionResult> GetLockupDensity(string bondId, bool ignoreCache = false)
    {
        try
        {
            var densityData = await _analyticsService.GetLockupDensity(bondId, ignoreCache);
            return Ok(densityData);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return BadRequest(new { Error = $"Error retrieving lockup density for bond {bondId}" });
        }
    }
    }
}
