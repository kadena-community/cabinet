FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env

COPY . .

WORKDIR /API

RUN dotnet restore

RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS run-env

EXPOSE 5000

WORKDIR /app

COPY --from=build-env /API/out .

ENTRYPOINT [ "dotnet" , "API.dll" ]
