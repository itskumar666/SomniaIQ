"use client";

import { useState, useEffect } from "react";
import { contractService, CONTRACT_ADDRESSES } from "@/lib/contractService";
import { useActiveAccount } from "thirdweb/react";

interface ContractHealth {
  aiOracle: boolean;
  portfolioManager: boolean;
  timestamp: number;
  error?: string;
}

export default function ContractStatus() {
  const [health, setHealth] = useState<ContractHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();

  const checkHealth = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const healthStatus = await contractService.checkContractHealth();
      setHealth(healthStatus);
    } catch (error) {
      console.error("Health check failed:", error);
      setHealth({
        aiOracle: false,
        portfolioManager: false,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      checkHealth();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  if (!account) {
    return (
      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-yellow-300 text-sm font-medium">Wallet not connected</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Contract Status</h3>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-1 rounded text-white transition-colors"
        >
          {loading ? "🔄" : "🔍"} Check
        </button>
      </div>

      <div className="space-y-4">
        {/* Network Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Network</span>
          <span className="text-blue-400">Somnia Shannon (50312)</span>
        </div>

        {/* AI Oracle Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              health?.aiOracle ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-300 text-sm">AI Oracle</span>
          </div>
          <div className="text-right">
            <div className={`text-xs font-medium ${
              health?.aiOracle ? 'text-green-400' : 'text-red-400'
            }`}>
              {health?.aiOracle ? 'Active' : 'Inactive'}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {CONTRACT_ADDRESSES.AI_ORACLE.slice(0, 6)}...{CONTRACT_ADDRESSES.AI_ORACLE.slice(-4)}
            </div>
          </div>
        </div>

        {/* Portfolio Manager Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              health?.portfolioManager ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-300 text-sm">Portfolio Manager</span>
          </div>
          <div className="text-right">
            <div className={`text-xs font-medium ${
              health?.portfolioManager ? 'text-green-400' : 'text-red-400'
            }`}>
              {health?.portfolioManager ? 'Active' : 'Inactive'}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {CONTRACT_ADDRESSES.PORTFOLIO_MANAGER.slice(0, 6)}...{CONTRACT_ADDRESSES.PORTFOLIO_MANAGER.slice(-4)}
            </div>
          </div>
        </div>

        {/* Last Check */}
        {health?.timestamp && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Last checked</span>
            <span className="text-gray-400">
              {new Date(health.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Error Display */}
        {health?.error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded p-2">
            <p className="text-red-300 text-xs">{health.error}</p>
          </div>
        )}

        {/* Quick Links */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex space-x-2">
            <a
              href={`https://browser.somnia.network/address/${CONTRACT_ADDRESSES.AI_ORACLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View Oracle ↗
            </a>
            <a
              href={`https://browser.somnia.network/address/${CONTRACT_ADDRESSES.PORTFOLIO_MANAGER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View Portfolio ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}