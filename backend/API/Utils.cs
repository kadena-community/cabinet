using System.Text.Json;
using PactSharp.Types;
using Dab.API.Models;
using Dab.API.Models.Bonder;
namespace Dab.API
{
    public static class Utils
    {
        public static string JsonPrettify(object json)
        {
            return JsonSerializer.Serialize(json, new JsonSerializerOptions { WriteIndented = true });

        }

        public static decimal GetDecimal(JsonElement data)
        {
            if (data.ValueKind == JsonValueKind.Number)
            {
                return (decimal)data.GetDouble();
            }
            else
            {
                return decimal.Parse(data.GetProperty("decimal").GetString() ?? throw new Exception("Unexpected decimal format {data}"));
            }
        }

        public static decimal GetInteger(JsonElement data)
        {
            if (data.ValueKind == JsonValueKind.Number)
            {
                return (decimal) data.GetDouble();
            }
            else
            {
                return data.GetProperty("int").GetDecimal();
            }
        }

        public static string GetOptionName(BondSale bond, decimal optionLenght){

            var options = bond.LockupOptions;
            return options.Where(e => e.OptionLength == optionLenght).First().OptionName;

        }

        public static string MapTxError(PactError error)
        {
            TxErrorData txError = new()
            {
                Message = error.Message,
                Info = error.Info,
                Type = error.Type,
                CallStack = string.Join('\n', error.CallStack)
            };
            return JsonPrettify(txError);
        }

        public static int NumberOfPages(int nEntries, int pageSize)
        {
            return (int)Math.Ceiling((decimal)nEntries / pageSize);
        }

        public static string ToUniversalIso8601(this DateTime dateTime)
        {
            return dateTime.ToUniversalTime().ToString("u").Replace(" ", "T");
        }
    }
}
