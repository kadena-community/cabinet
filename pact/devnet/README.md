# Devnet Deployment Scripts

This directory contains scripts and configurations for deploying and testing against a Kadena devnet environment.

## Contents

- **devnet.yaml**: This configuration file contains key parameters such as accounts, public keys, network settings, and the chain used.
- **send_tx.sh**: Bash script for preview transactions, deploying contracts, signing them, and interacting with the Kadena blockchain.

## Setting Up Devnet

Refer to the official Kadena documentation for more information on setting up Devnet environments: [Kadena Devnet Docs](https://docs.kadena.io/build/election/start-a-local-blockchain#run-the-development-network-in-dockerh-1429256263).

To run a local instance of the Kadena blockchain, use the following Docker command:

```bash
docker run --interactive --tty --publish 8080:8080 --volume kadena_devnet:/data --name devnet kadena/devnet
```

This command pulls the `kadena/devnet` Docker image, sets up a volume for data persistence, and maps the default Kadena port to `8080` on your local machine.

After creating the docker image, you can manage the Devnet instance using Docker commands:

- **Start Devnet**: `docker start devnet`
- **Stop Devnet**: `docker stop devnet`

For additional details and context about this environment, refer to the official Kadena Devnet repository: [Kadena Devnet Repo](https://github.com/kadena-io/devnet/).


### Keys in Devnet

The keys controlling the Devnet environment are used for specific roles and can be found in the following locations:

- [Main Namespace Admin Account](https://github.com/kadena-io/devnet/blob/a7efa99e69c3d814e018978b3a6ad7d8675a769e/test/pact-local.sh#L20) - This key is used to create and manage namespaces without needing to be principled.
- [Miner Account](https://github.com/kadena-io/devnet/blob/a7efa99e69c3d814e018978b3a6ad7d8675a769e/README.md?plain=1#L42) - This key is designated for the miner account, which is responsible for mining activities within the Devnet.

Plain keys follow this format:

```plaintext
public: badbabdabadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbad
secret: deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef
```

These key pairs consist of a **public key**, which is used for identifying the account, and a **secret key**, which must be kept secure as it authorizes actions on the account. Make sure to replace placeholders or examples in your configuration files with the appropriate keys for your environment.

### Installing the `kda` Tool

Ensure that the `kda` tool is installed. You can download it from the [official releases](https://github.com/kadena-io/kda-tool/releases/) and include the executable in your system path. For extensive documentation, refer to the [Kadena `kda` Tool Repo](https://github.com/kadena-io/kda-tool).

## Usage of `send_tx.sh`

Before running the script, ensure that the required key files (`admin.key`, `dev.key`, and `user.key`) are placed in the directory. These keys are essential as they correspond to the accounts and public keys specified in the `devnet.yaml` file.

- Include the `3688..` key as `admin.key` and `f89..` as `dev.key` in the folder. These keys should work out of the box.
- For the `user.key`, you can generate it using the `kda` tool with the command:

```bash
kda keygen plain 
```

Then, specify the generated key and `k:account` in the `user-account:` and `user-pk:` fields in the `devnet.yaml` file.

### About the `devnet.yaml` Configuration

The `devnet.yaml` file contains crucial configurations that determine how the Devnet environment is set up and how the blockchain interacts with different accounts. Each field plays a specific role in setting up the development network. Below is a breakdown of the configuration options:

```yaml
admin-account: k:f89ef46927f506c70b6a58fd322450a936311dc6ac91f4ec3d8ef949608dbf1f
user-pk: <user-public-key-placeholder>
user-account: k:<user-public-key-placeholder>
admin-pk: f89ef46927f506c70b6a58fd322450a936311dc6ac91f4ec3d8ef949608dbf1f
chain: 0
network: development
ns: dab
ns-admin-pk: 368820f80c324bbc7c2b0610688a7da43e39f91d118732671cd9c7500ff43cca
upgrade: false
```

#### Field Descriptions

- **admin-account**: The account ID for the admin, formatted as `k:<public_key>`. This account manages deployments and higher-privilege actions.
- **user-pk**: The placeholder for the public key of the user account (`<user-public-key-placeholder>`), which is used for general transactions and interactions with the blockchain.
- **user-account**: The placeholder for the user’s account ID (`k:<user-public-key-placeholder>`). It must correspond to the `user-pk` for proper authentication and transaction signing.
- **admin-pk**: The public key of the admin account. It should match the public key part of `admin-account` for consistency.
- **chain**: Specifies the chain ID within the Devnet (e.g., `0`). Ensure this matches the chain where you intend to deploy contracts and execute transactions.
- **network**: Defines the network name, typically set to `"development"` for Devnet environments.
- **ns**: Specifies the namespace to be used (e.g., `dab`). Namespaces help organize contracts and accounts within the blockchain.
- **ns-admin-pk**: The public key for the namespace admin account, which allows the creation of namespaces and manages namespace-level operations without requiring a principal.
- **upgrade**: A boolean (`true` or `false`) indicating whether the environment is set for contract upgrades. Set this to `true` if the contract has already been deployed (i.e., the tables or resources already exist and cannot be created again). This allows modifications to the existing contract without re-creating the schema. Otherwise, set it to `false` for initial deployments.

Ensure these configurations match your development needs and environment setup. Replace placeholders with actual values as necessary for proper deployment and interaction with the Devnet.

### About the `devnet.yaml` Configuration

The `devnet.yaml` file contains essential configurations that dictate how the deployment and interactions with the blockchain operate. Ensure these configurations are accurate and tailored to your development needs.

### Running the `send_tx.sh` Script

- **Without Parameters**: Running `./send_tx.sh` without any parameters previews all transactions in the folder and prompts to send them to the local Devnet environment.
- **With a Specific `ktpl` File**: If you specify a `ktpl` file, only that transaction will be sent.
- **Specifying a Node URL**: Use the `-n` parameter to specify an alternative node URL.

If no `network-url` is provided, the script defaults to `http://127.0.0.1:8080`.

Here's a brief list of all transactions (`.ktpl` files) in the Devnet environment:

1. **00-create-ns.ktpl** - Creates the `dab` namespace.
2. **00-deploy-utils.ktpl** - Deploys utility contracts needed for further operations.
3. **01-define-keysets.ktpl** - Defines the keysets required for security and account management.
4. **02-deploy-bonder.ktpl** - Deploys the bonder contract.
5. **03-deploy-bonder-utils.ktpl** - Deploys utility functions for the bonder.
6. **04-add-bond-creator.ktpl** - Adds a bond creator to the environment.
7. **04-deploy-poller.ktpl** - Deploys the poller contract.
8. **05-fund-creator.ktpl** - Funds the bond creator account.
9. **06-create-bonding.ktpl** - Creates the bonding mechanism.
10. **07-create-lockup.ktpl** - Sets up a lockup mechanism for funds or assets.
11. **08-create-poll.ktpl** - Creates a poll for governance or decision-making purposes.
12. **09-vote.ktpl** - Casts a vote in the poll.
13. **11-deploy-gas-guards.ktpl** - Deploys gas guards for transaction management.
14. **12-deploy-gas-station.ktpl** - Deploys a gas station for managing gas fees.
15. **13-fund-gas-station.ktpl** - Funds the gas station to ensure it can cover gas fees for transactions.

This list provides an overview of each transaction template and its purpose in the Devnet setup.

## Important Links

- [Kadena Devnet GitHub Repository](https://github.com/kadena-io/devnet) - For more information on configuring and using the Kadena devnet.
- [Kadena `kda` Tool GitHub Repository](https://github.com/kadena-io/kda-tool): Detailed documentation and installation instructions for the `kda` tool.
