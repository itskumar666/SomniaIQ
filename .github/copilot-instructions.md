# DeFi Decision Maker - Copilot Instructions

This project is an AI-driven DeFi agent built for the Somnia blockchain using Thirdweb SDK. The agent analyzes market trends, predicts asset performance, and automatically reallocates portfolio assets for optimal returns.

## Project Architecture

- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **Blockchain**: Somnia Shannon Testnet (EVM-compatible)
- **SDK**: Thirdweb SDK for wallet connection and smart contract interactions
- **AI/ML**: Custom algorithms for market analysis and portfolio optimization
- **Data Sources**: DIA Oracles for real-time price feeds
- **Smart Contracts**: Portfolio management and automated rebalancing logic

## Key Components

1. **Wallet Integration**: Account abstraction with gasless transactions
2. **Market Analysis**: Real-time price feeds and trend analysis
3. **Portfolio Manager**: Automated asset reallocation logic
4. **Risk Assessment**: Dynamic risk tolerance and safety mechanisms
5. **Dashboard**: Real-time portfolio performance and analytics

## Development Guidelines

- Use TypeScript for all code with strict type checking
- Implement error handling for all blockchain interactions
- Follow React hooks patterns for state management
- Use Thirdweb hooks for blockchain operations
- Implement proper loading states and user feedback
- Add comprehensive testing for critical functions
- Focus on security for financial operations

## Environment Setup

Required environment variables:
- NEXT_PUBLIC_THIRDWEB_CLIENT_ID
- NEXT_PUBLIC_SOMNIA_RPC_URL
- Private keys and API endpoints for production

## Deployment

- Target: Somnia Shannon Testnet initially
- Smart contracts deployed via Thirdweb CLI
- Frontend deployed on Vercel/Netlify
- Integration with Somnia ecosystem partners