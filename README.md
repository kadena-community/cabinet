# Kadena Cabinet

Kadena Cabinet is a Community Advisory Board (CAB) where KDA token holders come together to influence strategic decisions within the Kadena ecosystem via an on-chain polling mechanism. By locking their tokens, members engage in governance and are eligible to earn participation rewards, which are distributed alongside the original deposit after the lockup period concludes.

## Requirements

- **Chainweb Node Instance:**
  - An instance of the [Chainweb Node](https://github.com/kadena-io/chainweb-node) with the `allowReadsInLocal: true` parameter set.

- **One of the Following:**
  - A [Kadena GraphQL](https://github.com/kadena-community/kadena.js/tree/main/packages/apps/graph) server.
  - Access to the `events` endpoint from [Chainweb Data](https://github.com/kadena-io/chainweb-data).
  - SQL access to the PostgreSQL database from [Chainweb Data](https://github.com/kadena-io/chainweb-data).


## Project Structure

- `pact/`: Smart contracts and related files for on-chain governance.
  - `*.pact`: Smart contract files.
  - `*.repl`: Interactive Pact session files.
  - `root/`: Contains on-chain contracts used locally.
  - `devnet/`: Deployment scripts using the [kda tool](https://github.com/kadena-io/kda-tool).
- `backend`:
  - `API/`: Contains the C# API backend logic
  - `PactSharp/`: C# integration for Pact smart contracts uses [PactSharp](https://github.com/hexafluoride/PactSharp/).  
- `web/`: Frontend application built with Next.js.
- `docker-compose.yaml`: Docker Compose configuration for deploying the application.

## Getting Started

To start using or contributing to Kadena Cabinet:

1. Clone this repository to your local machine.
2. Deploy the Pact smart contracts as described in the `pact/README.org` and through the `devnet` directory scripts.
3. Set up the required `/web/.env` and `/backend/API/appsettings.json` files based on the provided examples.
4. Use `docker-compose.yaml` to deploy the entire application stack.

## Contributing

We welcome contributions to the Kadena Cabinet! Please feel free to open [pull requests](https://github.com/eckoDAO-org/kda-bonding/pulls).

## License

Kadena Cabinet is open-source and available under the [LICENSE](LICENSE).

## Support

For any questions or issues, please [open an issue](https://github.com/kadena-cabinet/kadena-cabinet/issues) on GitHub.

Happy governing!
