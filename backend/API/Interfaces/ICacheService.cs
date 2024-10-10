namespace Dab.API.Interfaces
{
    public interface ICacheService
    {
        Task<bool> HasItem(string key);
        Task<T> GetItem<T>(string key);
        Task<bool> SetItem(string key, string item, int expirySeconds = 0);
    }
}
