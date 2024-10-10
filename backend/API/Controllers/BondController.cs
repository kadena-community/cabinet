using Dab.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Dab.API.Models;
using Dab.API.Models.Events;
using Dab.API.Models.Bonder;

using AutoMapper;

namespace Dab.API.Controllers
{
    /// <summary>
    /// Controller for managing Bonds and their associated data
    /// </summary>
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class BondController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ILogger<BondController> _logger;
        private readonly IBondService _bondService;

        public BondController(ILogger<BondController> logger, IBondService bondService, IMapper mapper)
        {
            _logger = logger;
            _bondService = bondService;
            _mapper = mapper;
        }

        /// <summary>
        /// Get all bond sales, with an option to ignore cached data
        /// </summary>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet(Name = "GetAllBondSales")]
        public async Task<IActionResult> GetAllBondSales(bool ignoreCache = false)
        {
            try
            {
                var bonds = await _bondService.GetAllBonds(ignoreCache);

                var bondSalesDTOs = await Task.WhenAll(bonds.Select(async bond =>
                {
                    var lockupCounts = await _bondService.GetLockedCounts(bond.BondId, ignoreCache);
                    var bondSaleDTO = _mapper.Map<BondSaleDTO>(bond);
                    bondSaleDTO.LockedCount = lockupCounts["locked"];
                    bondSaleDTO.ClaimedCount = lockupCounts["claimed"];
                    return bondSaleDTO;
                }));

                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(bondSalesDTOs.OrderByDescending(t => t.AvailableRewards).ToList()) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = "Error retrieving all bonds" });
            }
        }

        /// <summary>
        /// Get all lockups, with an option to ignore cached data
        /// </summary>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet(Name = "GetAllLockups")]
        public async Task<IActionResult> GetAllLockups(bool ignoreCache = false)
        {
            try
            {
                var lockups = await _bondService.GetAllLockupEvents(ignoreCache);
//                var ret = _mapper.Map<List<LockupDTO>>(lockups);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(lockups) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = "Error retrieving all bonds" });
            }

        }

        /// <summary>
        /// Get all lockups, with an option to ignore cached data
        /// </summary>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet(Name = "GetAllClaims")]
        public async Task<IActionResult> GetAllClaims(bool ignoreCache = false)
        {
            try
            {
                var claims = await _bondService.GetAllClaimEvents(ignoreCache);
//                var ret = _mapper.Map<List<LockupDTO>>(lockups);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(claims) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = "Error retrieving all bonds" });
            }

        }



       /// <summary>
        /// Get active lockups, with an option to ignore cached data
        /// </summary>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet(Name = "GetActiveLockups")]
        public async Task<IActionResult> GetActiveLockups(bool ignoreCache = false)
        {
            try
            {
                var lockups = await _bondService.GetAllLockups(ignoreCache);
               var ret = _mapper.Map<List<LockupDTO>>(lockups);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(ret) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = "Error retrieving all bonds" });
            }

        }

        // Get a specific bond by ID
        /// <summary>
        /// Get details of a specific bond by ID, with an option to ignore cached data
        /// </summary>
        /// <param name="bondId">The ID of the bond</param>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet("{bondId}", Name = "GetBond")]
        public async Task<IActionResult> GetBond(string bondId, bool ignoreCache = false)
        {
            try
            {
                var bond = await _bondService.GetBond(bondId, ignoreCache);
                var ret = _mapper.Map<BondSaleDTO>(bond);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(ret) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = $"Error retrieving bond {bondId}" });
            }
        }

        // Get a specific lockup by ID
        /// <summary>
        /// Get details of a specific lockup by ID, with an option to ignore cached data
        /// </summary>
        /// <param name="lockupId">The ID of the lockup</param>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet("{lockupId}", Name = "GetLockup")]
        public async Task<IActionResult> GetLockup(string lockupId, bool ignoreCache = false)
        {
            try
            {
                var lockup = await _bondService.GetLockup(lockupId, ignoreCache);
                var ret = _mapper.Map<LockupDTO>(lockup);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(ret) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = $"Error retrieving lockup {lockupId}" });
            }
        }

        // Controller for GetAccountLockups
        /// <summary>
        /// Get all lockups associated with a specific account, with an option to ignore cached data
        /// </summary>
        /// <param name="account">The account identifier</param>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet("{account}", Name = "GetAccountLockups")]
        public async Task<IActionResult> GetAccountLockups(string account, bool ignoreCache = false)
        {
            try
            {
                var lockups = await _bondService.GetAccountLockups(account, ignoreCache);
                var ret = _mapper.Map<List<LockupDTO>>(lockups);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(ret) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = $"Error retrieving lockups from account {account}" });
            }
        }

        /// <summary>
        /// Read all lockups from a specific bond, with options for pagination, search, status filtering, and ordering
        /// </summary>
        /// <param name="bondId">The bond identifier</param>
        /// <param name="page">The page number to retrieve. Default is 1.</param>
        /// <param name="pageSize">The number of items per page. Default is 10.</param>
        /// <param name="search">Optional search term to filter lockups by account.</param>
        /// <param name="status">Optional filter to retrieve lockups by status (locked, claimed).</param>
        /// <param name="orderBy">Optional order by most recent or KDA locked.</param>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        /// <returns>A service result containing a paged list of lockups or an error message.</returns>
        [HttpGet("{bondId}", Name = "GetAllLockupsFromBond")]
        public async Task<IActionResult> GetAllLockupsFromBond(
            string bondId,
            int page = 1,
            int pageSize = 10,
            string? search = null,
            string? status = null,
            string? orderBy = null,
            bool ignoreCache = false)
        {
            try
            {
                var allLockups = await _bondService.GetAllLockupsFromBond(bondId, ignoreCache);

                // Apply search filter if provided
                if (!string.IsNullOrEmpty(search))
                {
                    allLockups = allLockups
                        .Where(l => l.Account.ToLower().Contains(search.ToLower()))
                        .ToList();
                }

                // Apply status filter if provided
                if (!string.IsNullOrEmpty(status))
                {
                    allLockups = allLockups
                        .Where(l => l.Type.Equals(status, StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                // Apply ordering
                switch (orderBy?.ToLower())
                {
                    case "kdalocked":
                        allLockups = allLockups.OrderByDescending(l => l.Amount).ToList();
                        break;
                    default:
                        allLockups = allLockups.OrderByDescending(l => l.Timestamp).ToList();
                        break;
                }

                var totalItems = allLockups.Count();
                var paginatedResults = allLockups
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var nPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                var ret = new PagedResult<IBondEvent>
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
                _logger.LogError($"Error retrieving lockups from bond {bondId}: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = $"Error retrieving lockups from bond {bondId}" });
            }
        }
        // Controller for GetMaxLockupReturns
        /// <summary>
        /// Get maximum returns for a lockup, with an option to ignore cached data
        /// </summary>
        /// <param name="amount">The amount locked up</param>
        /// <param name="length">The length of the lockup</param>
        /// <param name="bondId">The bond identifier</param>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet(Name = "GetMaxLockupReturns")]
        public async Task<IActionResult> GetMaxLockupReturns(decimal amount, decimal length, string bondId, bool ignoreCache = false)
        {
            try
            {
                var estimate = await _bondService.GetMaxLockupReturns(amount, length, bondId, ignoreCache);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(estimate) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = "Error getting maximum returns" });
            }
        }

        // Controller for GetMinLockupReturns
        /// <summary>
        /// Get minimum returns for a lockup, with an option to ignore cached data
        /// </summary>
        /// <param name="amount">The amount locked up</param>
        /// <param name="length">The length of the lockup</param>
        /// <param name="bondId">The bond identifier</param>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet(Name = "GetMinLockupReturns")]
        public async Task<IActionResult> GetMinLockupReturns(decimal amount, decimal length, string bondId, bool ignoreCache = false)
        {
            try
            {
                var estimate = await _bondService.GetMinLockupReturns(amount, length, bondId, ignoreCache);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(estimate) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = "Error getting minimum returns" });
            }
        }

        /// <summary>
        /// Get the basic statistics for an account
        /// </summary>
        /// <param name="account">The account identifier</param>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet("{account}", Name = "GetAccountStats")]
        public async Task<IActionResult> GetAccountStats(string account, bool ignoreCache = false)
        {
            try
            {
                var activeBondIds = await _bondService.GetAccountStats(account, ignoreCache);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(activeBondIds) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = $"Error retrieving stats from account {account}" });
            }
        }


        // Controller for GetAllBondIds
        /// <summary>
        /// Get all bond IDs, with an option to ignore cached data
        /// </summary>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet(Name = "GetAllBondIds")]
        public async Task<IActionResult> GetAllBondIds(bool ignoreCache = false)
        {
            try
            {
                var bondIds = await _bondService.GetAllBondIds(ignoreCache);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(bondIds) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = "Error retrieving all bonds" });
            }
        }

        // Controller for IsBonderAccount
        /// <summary>
        /// Check if an account is a bonder account, with an option to ignore cached data
        /// </summary>
        /// <param name="account">The account identifier</param>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet("{account}")]
        public async Task<IActionResult> IsBonderAccount(string account, bool ignoreCache = false)
        {
            try
            {
                var isBonder = await _bondService.IsBonderAccount(account, ignoreCache);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(isBonder) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = $"Error retrieving bonder status for account {account}" });
            }
        }

        // Controller for IsCoreAccount
        /// <summary>
        /// Check if an account is a core account, with an option to ignore cached data
        /// </summary>
        /// <param name="account">The account identifier</param>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet("{account}")]
        public async Task<IActionResult> IsCoreAccount(string account, bool ignoreCache = false)
        {
            try
            {
                var isCore = await _bondService.IsCoreAccount(account, ignoreCache);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(isCore) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = $"Error retrieving core status for account {account}" });
            }
        }

        // Controller for GetBondLockupOptions
        /// <summary>
        /// Get lockup options for a specific bond, with an option to ignore cached data
        /// </summary>
        /// <param name="bondId">The bond identifier</param>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet("{bondId}", Name = "GetBondLockupOptions")]
        public async Task<IActionResult> GetBondLockupOptions(string bondId, bool ignoreCache = false)
        {
            try
            {
                var lockupOptions = await _bondService.GetBondLockupOptions(bondId, ignoreCache);
                var des = _mapper.Map<List<LockupOptionDTO>>(lockupOptions);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(des) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = $"Error retrieving lockup options for bond {bondId}" });
            }
        }

        // Controller for CanAccountBond
        /// <summary>
        /// Check if an account has a lockup in the specified bond, with an option to ignore cached data
        /// </summary>
        /// <param name="account">The account identifier</param>
        /// <param name="bondId">The bond identifier</param>
        /// <param name="ignoreCache">Whether to ignore cached data and fetch fresh data</param>
        [HttpGet("{account}/{bondId}")]
        public async Task<IActionResult> CanAccountBond(string account, string bondId, bool ignoreCache = false)
        {
            try
            {
                var isCore = await _bondService.CanAccountBond(account, bondId, ignoreCache);
                return Ok(new ServiceResult { HasErrors = false, JsonString = Utils.JsonPrettify(isCore) });
            }
            catch (Exception e)
            {
                _logger.LogError($"Error retrieving all bonds: {e.Message}");
                return BadRequest(new ServiceResult { HasErrors = true, JsonString = $"Error retrieving core bonding status for account {account}" });
            }
        }


    }
}
