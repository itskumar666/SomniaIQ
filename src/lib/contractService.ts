import { getContract, prepareContractCall, readContract, sendTransaction } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { client, somniaTestnet } from "@/lib/thirdweb";

// Contract addresses (will be updated after deployment)
export const CONTRACT_ADDRESSES = {
  AI_ORACLE: "0x742d35Cc6634C0532925a3b8D48C405e764F23BC", // Placeholder
  PORTFOLIO_MANAGER: "0x96b8d8eC7DAb7503f91fD5A0c9be4E5A08b9036C", // Placeholder
} as const;

// Somnia testnet with proper RPC configuration
const somniaChain = defineChain({
  id: 50311,
  name: "Somnia Shannon Testnet",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-testnet.somnia.network"] },
  },
  blockExplorers: {
    default: { name: "Somnia Explorer", url: "https://explorer-testnet.somnia.network" },
  },
  testnet: true,
});

// Contract ABIs (simplified for key functions)
const AI_ORACLE_ABI = [
  {
    type: "function",
    name: "submitAIAnalysis", 
    inputs: [
      { name: "user", type: "address" },
      { name: "sentiment", type: "string" },
      { name: "riskLevel", type: "uint8" },
      { name: "recommendation", type: "string" },
      { name: "confidence", type: "uint8" },
      { name: "analysis", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "updateMarketData",
    inputs: [
      { name: "ethPrice", type: "uint256" },
      { name: "btcPrice", type: "uint256" },
      { name: "sttPrice", type: "uint256" },
      { name: "usdcPrice", type: "uint256" },
      { name: "marketSentimentScore", type: "int256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function", 
    name: "getLatestAnalysis",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "sentiment", type: "string" },
      { name: "riskLevel", type: "uint8" },
      { name: "recommendation", type: "string" },
      { name: "confidence", type: "uint8" },
      { name: "analysis", type: "string" },
      { name: "timestamp", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isAnalysisValid", 
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  }
] as const;

const PORTFOLIO_MANAGER_ABI = [
  {
    type: "function",
    name: "createPortfolio",
    inputs: [{ name: "riskTolerance", type: "uint8" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "executeRebalance",
    inputs: [{ name: "recommendationIndex", type: "uint256" }], 
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "setAutoRebalance",
    inputs: [{ name: "enabled", type: "bool" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getPortfolioBalance",
    inputs: [
      { name: "user", type: "address" },
      { name: "token", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getUserRecommendations",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "fromToken", type: "address" },
          { name: "toToken", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "reason", type: "string" },
          { name: "timestamp", type: "uint256" },
          { name: "confidenceScore", type: "uint8" },
          { name: "executed", type: "bool" }
        ]
      }
    ],
    stateMutability: "view"
  }
] as const;

/**
 * Service class for interacting with DeFi Decision Maker smart contracts
 */
export class ContractService {
  private getAIOracle() {
    return getContract({
      client,
      chain: somniaChain,
      address: CONTRACT_ADDRESSES.AI_ORACLE,
      abi: AI_ORACLE_ABI,
    });
  }

  private getPortfolioManager() {
    return getContract({
      client,
      chain: somniaChain,
      address: CONTRACT_ADDRESSES.PORTFOLIO_MANAGER,
      abi: PORTFOLIO_MANAGER_ABI,
    });
  }

  // AI Oracle Methods
  async submitAIAnalysisToChain(
    userAddress: string,
    sentiment: string,
    riskLevel: number,
    recommendation: string,
    confidence: number,
    analysis: string,
    account: any
  ) {
    try {
      const contract = this.getAIOracle();
      const transaction = prepareContractCall({
        contract,
        method: "submitAIAnalysis",
        params: [userAddress, sentiment, riskLevel, recommendation, confidence, analysis]
      });

      const result = await sendTransaction({
        transaction,
        account
      });
      return result;
    } catch (error) {
      console.error("Failed to submit AI analysis to chain:", error);
      throw error;
    }
  }

  async updateMarketDataOnChain(
    ethPrice: bigint,
    btcPrice: bigint,
    sttPrice: bigint,
    usdcPrice: bigint,
    marketSentiment: bigint,
    account: any
  ) {
    try {
      const contract = this.getAIOracle();
      const transaction = prepareContractCall({
        contract,
        method: "updateMarketData",
        params: [ethPrice, btcPrice, sttPrice, usdcPrice, marketSentiment]
      });

      const result = await sendTransaction({
        transaction,
        account
      });
      return result;
    } catch (error) {
      console.error("Failed to update market data on chain:", error);
      throw error;
    }
  }

  async getLatestAnalysisFromChain(userAddress: string) {
    try {
      const contract = this.getAIOracle();
      const result = await readContract({
        contract,
        method: "getLatestAnalysis",
        params: [userAddress]
      });

      return {
        sentiment: result[0],
        riskLevel: result[1], 
        recommendation: result[2],
        confidence: result[3],
        analysis: result[4],
        timestamp: result[5],
      };
    } catch (error) {
      console.error("Failed to get latest analysis from chain:", error);
      return null;
    }
  }

  // Portfolio Manager Methods
  async createPortfolioOnChain(riskTolerance: number, account: any) {
    try {
      const contract = this.getPortfolioManager();
      const transaction = prepareContractCall({
        contract,
        method: "createPortfolio",
        params: [riskTolerance]
      });

      const result = await sendTransaction({
        transaction,
        account
      });
      return result;
    } catch (error) {
      console.error("Failed to create portfolio on chain:", error);
      throw error;
    }
  }

  async executeRebalanceOnChain(recommendationIndex: bigint, account: any) {
    try {
      const contract = this.getPortfolioManager();
      const transaction = prepareContractCall({
        contract,
        method: "executeRebalance",
        params: [recommendationIndex]
      });

      const result = await sendTransaction({
        transaction,
        account
      });
      return result;
    } catch (error) {
      console.error("Failed to execute rebalance on chain:", error);
      throw error;
    }
  }

  async setAutoRebalanceOnChain(enabled: boolean, account: any) {
    try {
      const contract = this.getPortfolioManager();
      const transaction = prepareContractCall({
        contract,
        method: "setAutoRebalance",
        params: [enabled]
      });

      const result = await sendTransaction({
        transaction,
        account
      });
      return result;
    } catch (error) {
      console.error("Failed to set auto rebalance on chain:", error);
      throw error;
    }
  }

  async getPortfolioBalanceFromChain(userAddress: string, tokenAddress: string) {
    try {
      const contract = this.getPortfolioManager();
      const balance = await readContract({
        contract,
        method: "getPortfolioBalance",
        params: [userAddress, tokenAddress]
      });
      return balance;
    } catch (error) {
      console.error("Failed to get portfolio balance from chain:", error);
      return "0";
    }
  }

  async getUserRecommendationsFromChain(userAddress: string) {
    try {
      const contract = this.getPortfolioManager();
      const recommendations = await readContract({
        contract,
        method: "getUserRecommendations",
        params: [userAddress]
      });
      
      return recommendations.map((rec: any) => ({
        fromToken: rec[0],
        toToken: rec[1],
        amount: rec[2],
        reason: rec[3],
        timestamp: rec[4],
        confidenceScore: rec[5],
        executed: rec[6],
      }));
    } catch (error) {
      console.error("Failed to get user recommendations from chain:", error);
      return [];
    }
  }

  // Utility Methods
  getContractAddresses() {
    return CONTRACT_ADDRESSES;
  }

  async checkContractHealth() {
    try {
      // Simple health check by calling view functions
      const aiOracleContract = this.getAIOracle();
      const portfolioContract = this.getPortfolioManager();
      
      await readContract({
        contract: aiOracleContract,
        method: "isAnalysisValid",
        params: ["0x0000000000000000000000000000000000000000"]
      });
      
      await readContract({
        contract: portfolioContract,
        method: "getPortfolioBalance", 
        params: ["0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"]
      });

      return {
        aiOracle: true, // If no error thrown, it's healthy
        portfolioManager: true,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Contract health check failed:", error);
      return {
        aiOracle: false,
        portfolioManager: false,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export a singleton instance
export const contractService = new ContractService();

// Helper function to convert numbers to blockchain format (18 decimals)
export function toWei(amount: number): bigint {
  return BigInt(Math.floor(amount * 1e18));
}

// Helper function to convert blockchain format to regular numbers
export function fromWei(amount: bigint | string): number {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  return Number(value) / 1e18;
}