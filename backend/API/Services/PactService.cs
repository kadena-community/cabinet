using PactSharp;
using PactSharp.Types;
using System.Text.Json;
using Dab.API.Interfaces;

namespace Dab.API.Services;

public class PactService : IPactService
{
    private readonly ILogger<PactService> _logger;
    private readonly PactClient _pactClient;

    protected int DefaultTtl = 600;


    protected PactKeypair? OperatorKeypair { get; set; }

    public PactService(ILogger<PactService> logger, PactClient pactClient, IConfiguration configuration)
    {
        _logger = logger;
        _pactClient = pactClient;
    }

    public async Task<JsonElement> RunLocalCommand(string chain, string code, object? data = null, int gasLimit = 150000)
    {

        var command = _pactClient.GenerateExecCommand(chain, code, data);
        command.Metadata.GasLimit = gasLimit;

        var commandSigned = _pactClient.BuildCommand(command);
        var result = await _pactClient.ExecuteLocalAsync(commandSigned);

        _logger.LogDebug($" Chain: {chain}\n Gas: {result.Gas}\n Code: {code}\n Result: {result.Result.Data}");


        if (result.Result.Status.ToString() == "success")
        {
            return result.Result.Data ?? throw new Exception("Null data on a success response");
        }
        else
        {
            var error = result.Result.Error?.Message;
            throw new Exception(Utils.MapTxError(result.Result.Error));
        }
    }

}
