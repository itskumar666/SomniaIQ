#!/bin/bash

# SomniaIQ Smart Contract Deployment Script
# Deploys AIOracle and DeFiDecisionMaker contracts to Somnia Shannon Testnet

echo "🚀 SomniaIQ - Smart Contract Deployment"
echo "=========================================="
echo ""

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded configuration from .env file"
else
    echo "❌ Error: .env file not found"
    echo "Please create .env file with your PRIVATE_KEY"
    exit 1
fi

# Check if private key is provided
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "your_private_key_here" ]; then
    echo "❌ Error: Please set your actual PRIVATE_KEY in .env file"
    echo "Edit .env file and replace 'your_private_key_here' with your real private key"
    exit 1
fi

echo "🔧 Configuration:"
echo "   Network: Somnia Shannon Testnet"
echo "   Chain ID: 50311"
echo "   RPC: https://rpc-testnet.somnia.network"
echo "   Explorer: https://explorer-testnet.somnia.network"
echo ""

# Deploy AIOracle contract first (it doesn't need constructor args initially)
echo "📡 Step 1: Deploying AIOracle contract..."
AI_ORACLE_ADDRESS=$(forge create src/AIOracle.sol:AIOracle \
    --rpc-url somnia_testnet \
    --private-key $PRIVATE_KEY \
    --constructor-args "0x0000000000000000000000000000000000000000" \
    --json | jq -r '.deployedTo')

if [ "$AI_ORACLE_ADDRESS" = "null" ] || [ -z "$AI_ORACLE_ADDRESS" ]; then
    echo "❌ Failed to deploy AIOracle contract"
    exit 1
fi

echo "✅ AIOracle deployed at: $AI_ORACLE_ADDRESS"
echo ""

# Deploy DeFiDecisionMaker contract with AIOracle address
echo "📊 Step 2: Deploying DeFiDecisionMaker contract..."
PORTFOLIO_MANAGER_ADDRESS=$(forge create src/DeFiDecisionMaker.sol:DeFiDecisionMaker \
    --rpc-url somnia_testnet \
    --private-key $PRIVATE_KEY \
    --constructor-args $AI_ORACLE_ADDRESS \
    --json | jq -r '.deployedTo')

if [ "$PORTFOLIO_MANAGER_ADDRESS" = "null" ] || [ -z "$PORTFOLIO_MANAGER_ADDRESS" ]; then
    echo "❌ Failed to deploy DeFiDecisionMaker contract"
    exit 1
fi

echo "✅ DeFiDecisionMaker deployed at: $PORTFOLIO_MANAGER_ADDRESS"
echo ""

echo "🎉 Deployment Successful!"
echo "========================="
echo "AIOracle: $AI_ORACLE_ADDRESS"
echo "DeFiDecisionMaker: $PORTFOLIO_MANAGER_ADDRESS"
echo ""

echo "🔗 Verify contracts on Somnia Explorer:"
echo "AIOracle: https://explorer-testnet.somnia.network/address/$AI_ORACLE_ADDRESS"
echo "DeFiDecisionMaker: https://explorer-testnet.somnia.network/address/$PORTFOLIO_MANAGER_ADDRESS"
echo ""

echo "📝 Next steps:"
echo "1. Update contract addresses in ../src/lib/contractService.ts"
echo "2. Test contract interactions"
echo "3. Update frontend configuration"
echo ""

# Save addresses to a file for easy reference
cat > deployment-addresses.json << EOF
{
  "network": "somnia-testnet",
  "chainId": 50311,
  "contracts": {
    "AIOracle": "$AI_ORACLE_ADDRESS",
    "DeFiDecisionMaker": "$PORTFOLIO_MANAGER_ADDRESS"
  },
  "explorer": {
    "AIOracle": "https://explorer-testnet.somnia.network/address/$AI_ORACLE_ADDRESS",
    "DeFiDecisionMaker": "https://explorer-testnet.somnia.network/address/$PORTFOLIO_MANAGER_ADDRESS"
  },
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "💾 Deployment info saved to: deployment-addresses.json"