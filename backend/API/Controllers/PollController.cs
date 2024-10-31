using AutoMapper;
using System.Text.Json;
using Dab.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Dab.API.Models.Poller;
using Dab.API.Models;


namespace Dab.API.Controllers;

/// <summary>
/// Controller for managing Polls and their associated data
/// </summary>
[Route("api/[controller]/[action]")]
[ApiController]
public class PollController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly ILogger<PollController> _logger;
    private readonly IPollService _pollService;

    public PollController(ILogger<PollController> logger, IPollService pollService, IMapper mapper)
    {
        _logger = logger;
        _mapper = mapper;
        _pollService = pollService;
    }

    /// <summary>
    /// Retrieves a paged list of all polls.
    /// </summary>
    /// <param name="page">The page number to retrieve. Default is 1.</param>
    /// <param name="pageSize">The number of items per page. Default is 10.</param>
    /// <param name="search">Optional search term to filter polls by title or description.</param>
    /// <param name="status">Optional filter to retrieve polls by status.</param>
    /// <param name="bond">Optional filter to retrieve polls from specific bond.</param>
    /// <param name="ignoreCache">Whether to bypass the cache. Default is false.</param>
    /// <returns>A service result containing a paged list of polls or an error message.</returns>
    [HttpGet(Name = "GetAllPolls")]
    public async Task<IActionResult> GetAllPolls(int page = 1, int pageSize = 10, string? search = null, PollStatus? status = null, string? bond = null, bool ignoreCache = false)
    {
        try
        {
            var result = await _pollService.GetAllPolls(ignoreCache);
            var allResults = _mapper.Map<List<PollDTO>>(result);

            // Apply search filter if provided
            if (!string.IsNullOrEmpty(search))
            {
                allResults = allResults
                    .Where(e => e.Title.ToLower().Contains(search.ToLower())
                           || e.Description.ToLower().Contains(search.ToLower())
                           || e.PollId.ToLower().Contains(search.ToLower())
                           || e.Author.ToLower().Contains(search.ToLower()))
                    .ToList();
            }

            // Apply status filter if provided
            if (status.HasValue)
            {
                allResults = allResults
                    .Where(e => e.Status == status.Value)
                    .ToList();
            }

            if(bond != null)
            {
                allResults = allResults
                    .Where(e => e.BondId == bond)
                    .ToList();
            }

            var totalItems = allResults.Count();
            var paginatedResults = allResults
                .OrderByDescending(b => b.CreationTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();


            var nPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var ret = new PagedResult<PollDTO>
            {
                CurrentPage = page,
                PageCount = nPages,
                Results = paginatedResults,
                TotalItems = totalItems,
            };


            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e, e.Message);
            return BadRequest(new PagedResult<PollDTO>());
        }
    }


    /// <summary>
    /// Retrieves a list of active polls.
    /// </summary>
    /// <param name="ignoreCache">Whether to bypass the cache.</param>
    /// <returns>A service result containing a list of active polls or an error message.</returns>
    [HttpGet(Name = "GetActivePolls")]
    public async Task<IActionResult> GetActivePolls(bool ignoreCache = false)
    {
        try
        {
            var result = await _pollService.GetActivePolls(ignoreCache);
            var pollsDTO = _mapper.Map<List<PollDTO>>(result);

            var ret = new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(pollsDTO) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = "Error retrieving active polls" };
            return BadRequest(ret);
        }

    }

    /// <summary>
    /// Retrieves a specific poll by ID.
    /// </summary>
    /// <param name="pollId">The unique identifier for the poll.</param>
    /// <param name="ignoreCache">Whether to bypass the cache.</param>
    /// <returns>A service result containing the requested poll or an error message.</returns>
    [HttpGet("{pollId}")]
    public async Task<IActionResult> GetPoll(string pollId, bool ignoreCache = false)
    {
        try
        {
            var result = await _pollService.GetPoll(pollId, ignoreCache);
            var votesDTO = _mapper.Map<PollDTO>(result); //result.PollOptions.Select(e => new PollOptionDTO(e));
            var ret = new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(votesDTO) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = $"Error retrieving poll with ID {pollId}" };
            return BadRequest(ret);
        }
    }

    /// <summary>
    /// Retrieves the maximum polling power of an account.
    /// </summary>
    /// <param name="account">The account for which polling power is being queried.</param>
    /// <param name="ignoreCache">Whether to bypass the cache.</param>
    /// <returns>A service result containing the polling power or an error message.</returns>
    [HttpGet("{account}")]
    public async Task<IActionResult> GetMaxPollingPower(string account, bool ignoreCache = false)
    {
        try
        {
            var pollingPower = await _pollService.GetMaxPollingPower(account, ignoreCache);
            var ret = new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(pollingPower) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = "Error retrieving polling power" };
            return BadRequest(ret);
        }
    }


    /// <summary>
    /// Retrieves the polling power of an account.
    /// </summary>
    /// <param name="account">The account for which polling power is being queried.</param>
    /// <param name="pollId">The poll for which the account polling power is being queried.</param>
    /// <param name="ignoreCache">Whether to bypass the cache.</param>
    /// <returns>A service result containing the polling power or an error message.</returns>
    [HttpGet("{account}/{pollId}")]
    public async Task<IActionResult> GetPollingPower(string account, string pollId, bool ignoreCache = false)
    {
        try
        {
            var pollingPower = await _pollService.GetPollingPower(account, pollId, ignoreCache);
            var ret = new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(pollingPower) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = "Error retrieving polling power" };
            return BadRequest(ret);
        }
    }
    /// <summary>
    /// Checks if a specific poll is approved.
    /// </summary>
    /// <param name="pollId">The poll ID to check for approval.</param>
    /// <param name="ignoreCache">Whether to bypass the cache.</param>
    /// <returns>A service result indicating if the poll is approved or an error message.</returns>
    [HttpGet("{pollId}")]
    public async Task<IActionResult> IsPollApproved(string pollId, bool ignoreCache = false)
    {
        try
        {
            bool isApproved = await _pollService.IsPollApproved(pollId, ignoreCache);
            var ret = new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(isApproved) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = $"Error checking approval status for poll ID {pollId}" };
            return BadRequest(ret);
        }
    }
    /// <summary>
    /// Retrieves all polls created by a specific account.
    /// </summary>
    /// <param name="account">The account whose polls are to be retrieved.</param>
    /// <param name="ignoreCache">Whether to bypass the cache.</param>
    /// <returns>A service result containing a list of polls created by the account or an error message.</returns>
    [HttpGet("{account}")]
    public async Task<IActionResult> GetAccountCreatedPolls(string account, bool ignoreCache = false)
    {
        try
        {
            var result = await _pollService.GetAccountCreatedPolls(account, ignoreCache);
            var pollsDTO = _mapper.Map<List<PollDTO>>(result);
            var ret = new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(pollsDTO) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = $"Error retrieving polls created by account {account}" };
            return BadRequest(ret);
        }
    }

    /// <summary>
    /// Retrieves all the votes from a specific account.
    /// </summary>
    /// <param name="account">The account whose votes  are to be retrieved.</param>
    /// <param name="ignoreCache">Whether to bypass the cache.</param>
    /// <returns>A service result containing a list of all votes done by the account.</returns>
    [HttpGet("{account}")]
    public async Task<IActionResult> GetAllAccountVotes(string account, bool ignoreCache = false)
    {
        try
        {
            var result = await _pollService.GetAllAccountVotes(account, ignoreCache);
            var votesDTO = _mapper.Map<List<PollVoteDTO>>(result);
            var ret = new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(votesDTO) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = $"Error retrieving votes by account {account}" };
            return BadRequest(ret);
        }
    }


    /// <summary>
    /// Retrieves the summary of the votes from a specific account.
    /// </summary>
    /// <param name="account">The account whose vote summary is to be retrieved.</param>
    /// <param name="ignoreCache">Whether to bypass the cache.</param>
    /// <returns>A service result containing the account vote stats for the account.</returns>
    [HttpGet("{account}")]
    public async Task<IActionResult> GetAccountVoteStats(string account, bool ignoreCache = false)
    {
        try
        {
            var result = await _pollService.GetAccountVoteStats(account, ignoreCache);
            var ret = new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(result) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = $"Error retrieving vote stats for account {account}" };
            return BadRequest(ret);
        }
    }

    /// <summary>
    /// Retrieves a paged list of votes from a specific poll.
    /// </summary>
    /// <param name="pollId">The poll whose votes are to be retrieved.</param>
    /// <param name="page">The page number to retrieve. Default is 1.</param>
    /// <param name="pageSize">The number of items per page. Default is 10.</param>
    /// <param name="search">Optional search term to filter votes by account.</param>
    /// <param name="sortByPollingPower">Optional parameter to sort by PollingPower if true, otherwise by Date. Default is false.</param>
    /// <param name="actionFilter">Optional filter to retrieve votes by action type.</param>
    /// <param name="ignoreCache">Whether to bypass the cache. Default is false.</param>
    /// <returns>A service result containing a paged list of votes or an error message.</returns>
    [HttpGet("{pollId}")]
    public async Task<IActionResult> GetPollVotes(
    string pollId,
    int page = 1,
    int pageSize = 10,
    string? search = null,
    bool sortByPollingPower = false,
    string? actionFilter = null,
    bool ignoreCache = false)
    {
        try
        {
            var result = await _pollService.GetPollVotes(pollId, ignoreCache);
            var votesDTO = _mapper.Map<List<PollVoteDTO>>(result);

            // Apply search filter if provided
            if (!string.IsNullOrEmpty(search))
            {
                votesDTO = votesDTO
                    .Where(v => v.Account.ToLower().Contains(search.ToLower()))
                    .ToList();
            }

            // Apply action filter if provided
            if (!string.IsNullOrEmpty(actionFilter))
            {

                votesDTO = votesDTO
                    .Where(v => v.Action.Equals(actionFilter, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            // Apply sorting
            votesDTO = sortByPollingPower
                ? votesDTO.OrderByDescending(v => v.PollingPower).ToList()
                : votesDTO.OrderByDescending(v => v.Date).ToList();

            // Calculate total items after filtering and sorting
            var totalItems = votesDTO.Count();

            // Apply pagination
            var paginatedResults = votesDTO
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var nPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            var ret = new PagedResult<PollVoteDTO>
            {
                CurrentPage = page,
                PageCount = nPages,
                Results = paginatedResults,
                TotalItems = totalItems,
            };

            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new PagedResult<PollVoteDTO>();
            return BadRequest(ret);
        }
    }

    /// <summary>
    /// Retrieves all votes from a specific poll.
    /// </summary>
    /// <param name="pollId">The poll whose votes are to be retrieved.</param>
    /// <param name="ignoreCache">Whether to bypass the cache. Default is false.</param>
    /// <returns>A service result containing a paged list of votes or an error message.</returns>
    [HttpGet("{pollId}")]
    public async Task<IActionResult> GetAllPollVotes(
    string pollId,
    bool ignoreCache = false)
    {
        try
        {
            var result = await _pollService.GetPollVotes(pollId, ignoreCache);
            var votesDTO = _mapper.Map<List<PollVoteDTO>>(result);

            var ret = new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(votesDTO) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = $"Error retrieving vote stats for poll {pollId}" };
            return BadRequest(ret);
        }
    }

    /// <summary>
    /// Checks if an account can vote on a specific poll. Does not account for previous votes
    /// </summary>
    /// <param name="account">The account to check.</param>
    /// <param name="pollId">The poll ID to check against.</param>
    /// <param name="ignoreCache">Whether to bypass the cache.</param>
    /// <returns>A service result indicating if the account can vote or an error message.</returns>
    [HttpGet("{account}/{pollId}")]
    public async Task<IActionResult> CanAccountVote(string account, string pollId, bool ignoreCache = false)
    {
        try
        {
            bool hasVoted = await _pollService.CanAccountVote(account, pollId, ignoreCache);
            var ret = new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(hasVoted) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = $"Error checking voting status for account {account} on poll ID {pollId}" };
            return BadRequest(ret);
        }
    }

    /// <summary>
    /// Checks if an account can vote on multiple polls. Does not account for previous votes
    /// </summary>
    /// <param name="account">The account to check.</param>
    /// <param name="pollIds">A comma-separated list of poll IDs to check against.</param>
    /// <param name="ignoreCache">Whether to bypass the cache.</param>
    /// <returns>A service result indicating if the account can vote on the polls or an error message.</returns>
    [HttpGet("{account}/polls")]
    public async Task<IActionResult> CanAccountVoteMultiple(string account, [FromQuery] string pollIds, bool ignoreCache = false)
    {
        try
        {
            var pollIdList = pollIds.Split(',').ToList();
            var canVoteResults = await _pollService.CanAccountVoteMultiple(account, pollIdList, ignoreCache);
            var ret = new ServiceResult { HasErrors = false, JsonString = JsonSerializer.Serialize(canVoteResults) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = $"Error checking voting status for account {account} on poll IDs {pollIds}" };
            return BadRequest(ret);
        }
    }



    /// <summary>
    /// Checks if an account has already voted in a specific poll.
    /// </summary>
    /// <param name="account">The account to check.</param>
    /// <param name="pollId">The poll ID to check against.</param>
    /// <param name="ignoreCache">Whether to bypass the cache.</param>
    /// <returns>A service result indicating if the account has voted or an error message.</returns>
    [HttpGet("{account}/{pollId}")]
    public async Task<IActionResult> AccountAlreadyVoted(string account, string pollId, bool ignoreCache = false)
    {
        try
        {
            bool hasVoted = await _pollService.AccountAlreadyVoted(account, pollId, ignoreCache);
            var ret = new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(hasVoted) };
            return Ok(ret);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            var ret = new ServiceResult { HasErrors = true, JsonString = $"Error checking voting status for account {account} on poll ID {pollId}" };
            return BadRequest(ret);
        }
    }

}
