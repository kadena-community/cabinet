# Kadena Cabinet UI

Kadena Cabinet UI is a frontend application built with [Next.js](https://nextjs.org/) that provides a user interface for interacting with the Kadena Cabinet platform. It enables KDA token holders to participate in governance by voting, locking tokens, and managing their participation in the Kadena ecosystem.

## Getting Started

1. **Install Dependencies**:
   ```bash
   yarn install
   # or
   npm install
   # or
   pnpm install
   ```

2. **Run the Development Server**:
   ```bash
   yarn dev
   # or
   npm run dev
   # or
   pnpm dev
   # or
   bun dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the Cabinet UI.

## Environment Variables

The environment variables required for the application are outlined in the `env.example` file. Copy this file and rename it to `.env`, then populate it with the appropriate values for your environment.

### Explanation of Key Environment Variables

- **PUBLIC_URL**: The base URL of the Cabinet application.
- **NEXT_PUBLIC_BACKEND_API_BASE_URL**: URL of the backend API used for blockchain interactions.
- **NEXT_PUBLIC_KADENA_NETWORK_ID**: Specifies the Kadena network ID (e.g., `testnet04` or `mainnet01`).
- **NEXT_PUBLIC_KADENA_CHAIN_ID**: The chain ID used for Kadena interactions (e.g., `1` for the default chain).
- **NEXT_PUBLIC_BACKEND_API_MODE**: Mode of the backend API (`production`, `development`, etc.).
- **NEXT_PUBLIC_KADENA_HOST**: The host URL for the Kadena network (e.g., a testnet or mainnet URL).
- **NEXT_PUBLIC_CONTRACT_NAMESPACE**: Namespace used for the smart contracts.
- **NEXT_PUBLIC_RELAY_URL**: WebSocket URL for WalletConnect relay services.
- **NEXT_PUBLIC_BONDER_BANK_ACCOUNT**: Specifies the bonder bank account used in the platform.
- **NEXT_PUBLIC_GAS_STATION_ACCOUNT**: Gas station account configuration for transaction fees.

## Project Structure

### Root Level

- **Dockerfile**: Defines the Docker configuration for building and running the application.
- **next.config.js / next.config.mjs**: Next.js configuration files for customizing the build and runtime behavior of the application.
- **nginx.conf**: Configuration for Nginx, used if the application is deployed with an Nginx server.
- **package.json**: Lists dependencies, scripts, and configuration for the application.
- **postcss.config.js**: Configuration file for PostCSS, used in conjunction with Tailwind CSS for styling.
- **public/**: Contains static assets such as images and fonts that are publicly accessible.
- **README.md**: Documentation file for the project.
- **tailwind.config.ts**: Configuration file for Tailwind CSS, defining custom styles and themes.
- **tsconfig.json**: TypeScript configuration file for setting up type-checking rules.
- **yarn.lock**: Lock file for dependency management using Yarn.

### `src/` Directory

- **app/**: Main application components and layout structures.
- **assets/**: Stores image files, icons, and other static resources used within the app.
- **connectors/**: Manages connection logic, such as wallet or blockchain integration connectors.
- **constants/**: Contains application-wide constants for configuration and settings.
- **features/**: Organizes specific features of the application, including components and logic tied to distinct functionalities.
- **hooks/**: Custom React hooks for managing state, API calls, and other reusable logic.
- **kadena/**: Houses Kadena-specific modules and utilities for interacting with the blockchain (e.g., API functions, contracts).
- **pages/**: Next.js pages directory, where each file represents a different route in the application.
- **styles/**: Contains global CSS and styling files, including Tailwind and other custom styles.
- **utils/**: Utility functions and helper methods for data formatting, API integration, and other common operations.

This structure is designed to promote a modular and scalable architecture, making it easier to maintain and extend the Kadena Cabinet UI.

## Learn More

To learn more about Next.js and its capabilities:

- [Next.js Documentation](https://nextjs.org/docs) - Explore Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - An interactive tutorial to get familiar with Next.js.

You can also check out the [Next.js GitHub repository](https://github.com/vercel/next.js/) for community contributions and feedback.

## Deployment

The Kadena Cabinet UI is designed to be easily deployable using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). You can also deploy using other platforms by following the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

For best results, ensure your environment variables are configured correctly in production settings.

