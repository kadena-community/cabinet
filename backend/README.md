# Cabinet Backend API

Cabinet Backend API serves as the middle layer consumed by the Cabinet UI. It is responsible for caching, parsing, and retrieving blockchain responses and historical data from multiple sources like Chainweb Nodes, PostgreSQL, or GraphQL.

## Requirements

To run the Cabinet Backend API, ensure you have the following:

- **Chainweb Node Instance**: An instance of the [Chainweb Node](https://github.com/kadena-io/chainweb-node) with the parameter `allowReadsInLocal: true` set for local reads.
- A **[Kadena GraphQL](https://github.com/kadena-community/kadena.js/tree/main/packages/apps/graph)** server.
- **.NET SDK**: Version 7.0 or 8.0 with all required dependencies installed.
- **Redis**: A running Redis instance for caching purposes.
- **Docker & Docker Compose**: Alternatively, you can deploy the entire stack using Docker Compose.

## Installation

1. **Configure `appsettings.json`**:
   - Use the provided template to set up your `appsettings.json` file with appropriate parameters for your environment. Below is an example configuration:

   ```json
   {
     "Logging": {
       "LogLevel": {
         "Default": "Information",
         "Microsoft.AspNetCore": "Warning",
         "Dab.API": "Debug"
       }
     },
     "KadenaSettingsConfig": {
       "Network": "Custom",
       "NetworkId": "development",
       "ApiHost": "http://127.0.0.1:8080",
       "ServerType": "Chainweb"
     },
     "RedisSettingsConfig": {
       "Url": "127.0.0.1:6379"
     },
     "ApiSettingsConfig": {
       "Url": "https://youdomain.co/api",
       "Mode": "Development"
     },
     "DabContractConfig": {
       "ContractChain": "0",
       "Namespace": "n_yournamespace",
       "GraphQLEndpoint": "https://127.0.0.1:4000/graph"
     }
   }
   ```

2. **Run the API**:
   - **Via .NET CLI**:
     ```bash
     dotnet run
     ```
   - **Via Docker Compose**:
     - Ensure Docker and Docker Compose are installed.
     - Run:
     
       ```bash
       docker compose up --build 
       ```

## Configuration Overview

- **KadenaSettingsConfig**:
  - `Network`: Set to `"Custom"` for development or specify another network.
  - `ApiHost`: The base URL for the Chainweb API.
  - `ServerType`: Should be `"Chainweb"` for accessing the Kadena blockchain.
- **RedisSettingsConfig**:
  - `Url`: The Redis server's URL for caching purposes.
- **ApiSettingsConfig**:
  - `Url`: The API endpoint for external integrations or services.
  - `Mode`: Set to `"Development"` for local testing.
- **DabContractConfig**:
  - `ContractChain`: The specific chain ID for contract interactions.
  - `Namespace`: Namespace used for the contracts.
  - `GraphQLEndpoint`: The endpoint for Kadena's GraphQL server.

## Getting Started

1. **Ensure Dependencies**:
   - Install .NET SDK 7.0 or 8.0 and make sure Redis is running.
   - Ensure that a Chainweb Node instance is running with the parameter `allowReadsInLocal: true`.
2. **Setup Configuration Files**:
   - Populate `appsettings.json` based on the example above with your own environment-specific values.
3. **Run the API**:
   - You can run the API either directly using the .NET CLI (`dotnet run`) or through Docker Compose (`docker-compose up`).

## Project Structure

Here's a concise breakdown of the folder names and their specific purposes:

- **AppSettings/**: Stores environment-specific configuration files for setting up application behavior and settings.

- **Controllers/**: Manages HTTP requests, routing them to appropriate services (entry points for the API).

- **Interfaces/**: Defines contracts for services, promoting loose coupling and enabling dependency injection.

- **Models/**: Contains data models and entities used for structuring request and response objects.

- **Services/**: Implements business logic and interactions with external systems like blockchain, cache, and databases.

- `docker-compose.yaml`: Provides a Docker Compose setup to deploy the application stack easily.

## Data Sources

The API fetches and processes blockchain historical data from the following sources:

1. **Chainweb Data**: Retrieves transaction and event history directly from Chainweb’s API endpoints.
2. **PostgreSQL Database**: Queries historical data stored locally for faster access and caching.
3. **GraphQL**: Pulls data using GraphQL queries from Kadena’s testnet or mainnet.

