using System.Text.Json;

namespace Dab.API.Interfaces;

public interface IPactService
{
    Task<JsonElement> RunLocalCommand(string chain, string code, object? data = null, int gasLimit = 150000);
}
