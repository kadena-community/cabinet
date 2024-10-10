using Dab.API.Interfaces;
using StackExchange.Redis;

namespace Dab.API.Services
{
    public class CacheService : ICacheService
    {
        private readonly IConnectionMultiplexer _redis;
        public CacheService(IConnectionMultiplexer redis)
        {
            _redis = redis;
        }

        public async Task<T> GetItem<T>(string key)
        {
            var db = _redis.GetDatabase();

            var cachedItem = await db.StringGetAsync(key);

            T result = default;

            if (cachedItem.HasValue)
            {
                result = (T)Convert.ChangeType(cachedItem, typeof(T));
            }

            return result;
        }

        public async Task<bool> HasItem(string key)
        {
            var db = _redis.GetDatabase();

            var cachedItem = await db.StringGetAsync(key);

            return cachedItem.HasValue;
        }

        public async Task<bool> SetItem(string key, string item, int expirySeconds = 0)
        {
            var db = _redis.GetDatabase();
            var length = expirySeconds == 0 ? TimeSpan.FromSeconds(3600) : TimeSpan.FromSeconds(expirySeconds);

            return await db.StringSetAsync(key, item, length);
        }
    }
}
