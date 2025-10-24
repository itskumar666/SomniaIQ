#!/bin/bash

# Load environment variables
source .env

# Quick deployment commands for SomniaIQ contracts

echo "🔑 Using private key from .env file..."
echo "🌐 Deploying to Somnia Shannon Testnet (Chain ID: 50311)"
echo ""

# Deploy AIOracle first
echo "📡 Deploying AIOracle contract..."
forge create src/AIOracle.sol:AIOracle \
  --rpc-url somnia_testnet \
  --private-key $PRIVATE_KEY \
  --constructor-args "0x0000000000000000000000000000000000000000"

echo ""
echo "📊 Next: Copy the AIOracle address and deploy DeFiDecisionMaker"
echo "Run: forge create src/DeFiDecisionMaker.sol:DeFiDecisionMaker --rpc-url somnia_testnet --private-key \$PRIVATE_KEY --constructor-args YOUR_AI_ORACLE_ADDRESS"