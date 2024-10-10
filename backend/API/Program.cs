using System.Reflection;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;
using PactSharp;
using PactSharp.Types;
using Dab.API.Interfaces;
using Dab.API.Services;
using Dab.API.AppSettings;
using AutoMapper;
using Dab.API.Models.Poller;
using Dab.API.Models.Bonder;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{

    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Kadena Cabinet API", Version = "v1" });
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);

});


builder.Services.AddControllers();
builder.Services.AddResponseCaching();
builder.Services.AddHttpClient();

//CORS
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins,
                          policy =>
                          {
                              policy.WithOrigins("*")
                                                  .AllowAnyHeader()
                                                  .AllowAnyMethod();
                          });
});



// Redis configuration
var redisSettingsConfig = builder.Configuration.GetSection("RedisSettingsConfig").Get<RedisSettingsConfig>();
var redisString = System.Environment.GetEnvironmentVariable("CACHE_HOST");
var multiplexer = ConnectionMultiplexer.Connect(redisSettingsConfig?.Url ?? "");
builder.Services.AddSingleton<IConnectionMultiplexer>(multiplexer);
builder.Services.AddSingleton<ICacheService, CacheService>();

// Kadena blockchain configuration
var kadenaSettingsConfig = builder.Configuration.GetSection("KadenaSettingsConfig").Get<KadenaSettingsConfig>()
    ?? throw new Exception("Could not find KadenaSettingsConfig");

var kadenaSettings = new PactClientSettings
(
    (Network)Enum.Parse(typeof(Network), kadenaSettingsConfig.Network),
    kadenaSettingsConfig.ApiHost,
    kadenaSettingsConfig.NetworkId
);

// Pact-Sharp Client
builder.Services.AddSingleton<PactClient>(sp => new PactClient(new HttpClient(), kadenaSettings));

// Auto Mapper Configurations
var mapperConfig = new MapperConfiguration(cfg =>
{
    cfg.CreateMap<Poll, PollDTO>()
      .ForMember(dest => dest.CreationTime, opt => opt.MapFrom(src => src.CreationTime.Date.ToString("o", CultureInfo.InvariantCulture)))
      .ForMember(dest => dest.ElectionEnd, opt => opt.MapFrom(src => src.ElectionEnd.Date.ToString("o", CultureInfo.InvariantCulture)))
      .ForMember(dest => dest.ElectionStart, opt => opt.MapFrom(src => src.ElectionStart.Date.ToString("o", CultureInfo.InvariantCulture)));

    cfg.CreateMap<PollVote, PollVoteDTO>()
            .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Date.Date.ToString("o", CultureInfo.InvariantCulture)));

    cfg.CreateMap<Lockup, LockupDTO>()
      .ForMember(dest => dest.LockupStartTime, opt => opt.MapFrom(src => src.LockupStartTime.Date.ToString("o", CultureInfo.InvariantCulture)))
      .ForMember(dest => dest.LockupEndTime, opt => opt.MapFrom(src => src.LockupEndTime.Date.ToString("o", CultureInfo.InvariantCulture)));

    cfg.CreateMap<LockupOption, LockupOptionDTO>();

    cfg.CreateMap<BondSale, BondSaleDTO>()
      .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src => src.StartTime.Date.ToString("o", CultureInfo.InvariantCulture)))
      .ForMember(dest => dest.LockupOptions, opt => opt.MapFrom(src => src.LockupOptions));

});

IMapper mapper = mapperConfig.CreateMapper();
builder.Services.AddSingleton(mapper);



// Business logic services
// builder.Services.AddSingleton<IDaoService, DaoService>();
builder.Services.AddSingleton<IPactService, PactService>();
builder.Services.AddSingleton<IChainwebDataRetriever, ChainwebDataRetriever>();
builder.Services.AddSingleton<ChainwebGraphQLRetriever>();
builder.Services.AddSingleton<IBondService, BondService>();
builder.Services.AddSingleton<IPollService, PollService>();
builder.Services.AddSingleton<IAnalyticsService, AnalyticsService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Staging"))
// {
    app.UseSwagger();
    app.UseSwaggerUI();
// }

app.UseCors(MyAllowSpecificOrigins);
app.UseResponseCaching();
app.UseHttpsRedirection();

app.MapControllers();

var pactClient = app.Services.GetRequiredService<PactClient>();
await pactClient.Initialize();

app.Run();
