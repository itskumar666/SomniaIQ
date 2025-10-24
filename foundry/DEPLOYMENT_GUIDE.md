# SomniaIQ Smart Contract Deployment Guide

## Prerequisites
- ✅ Foundry installed (already done)
- ✅ Contracts compiled successfully
- 🔑 Private key with STT tokens for gas fees
- 💰 Somnia testnet STT tokens

## Quick Deployment Commands

### Step 1: Set your private key
```bash
export PRIVATE_KEY=your_private_key_here
```

### Step 2: Deploy AIOracle first
```bash
cd /Users/ashutoshkumar/Desktop/Somania/foundry

forge create src/AIOracle.sol:AIOracle \
  --rpc-url somnia_testnet \
  --private-key $PRIVATE_KEY \
  --constructor-args "0x0000000000000000000000000000000000000000"
```

### Step 3: Deploy DeFiDecisionMaker (replace AI_ORACLE_ADDRESS with result from step 2)
```bash
forge create src/DeFiDecisionMaker.sol:DeFiDecisionMaker \
  --rpc-url somnia_testnet \
  --private-key $PRIVATE_KEY \
  --constructor-args AI_ORACLE_ADDRESS_FROM_STEP_2
```

### Step 4: Update contract addresses
After deployment, update the addresses in:
- `../src/lib/contractService.ts`
- Lines 6-9: Replace placeholder addresses with your deployed contract addresses

## Alternative: Use automated script
```bash
cd /Users/ashutoshkumar/Desktop/Somania/foundry
export PRIVATE_KEY=your_private_key_here
./deploy.sh
```

## Network Configuration
- **Network**: Somnia Shannon Testnet
- **Chain ID**: 50311
- **RPC URL**: https://rpc-testnet.somnia.network
- **Explorer**: https://explorer-testnet.somnia.network
- **Native Token**: STT (Somnia Test Token)

## Get Testnet Tokens
If you need STT tokens for deployment:
1. Visit Somnia Discord/Community channels
2. Request testnet tokens from faucet
3. Or bridge tokens if available

## Verify Deployment
After deployment, you can verify your contracts at:
https://explorer-testnet.somnia.network

## Troubleshooting
- Ensure you have enough STT for gas fees
- Verify your private key has the correct format (0x...)
- Check network connection to Somnia testnet