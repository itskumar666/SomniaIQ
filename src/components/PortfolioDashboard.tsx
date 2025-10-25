"use client";

import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { useState, useEffect } from "react";

interface PortfolioDashboardProps {
  userBalances: Record<string, number>;
}

export default function PortfolioDashboard({ userBalances }: PortfolioDashboardProps) {
  const { portfolioData, marketData, isLoading, runAnalysis } = useAIAnalysis();
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default to prevent permission loops

  // Removed automatic initial analysis to prevent permission loops
  // Users can manually trigger analysis using the button

  useEffect(() => {
    if (!autoRefresh) return;
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      runAnalysis(userBalances);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, userBalances, runAnalysis]);

  if (isLoading && !portfolioData) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/20 rounded w-1/3"></div>
          <div className="h-32 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white">Enhanced Portfolio</h2>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded text-sm ${
              autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
            {autoRefresh ? '🔄 Live' : '⏸️ Paused'}
          </button>
        </div>

        {portfolioData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-300 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">
                ${portfolioData.portfolio.totalValue.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">24h Change</p>
              <p className={`text-2xl font-bold ${
                portfolioData.portfolio.totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {portfolioData.portfolio.totalChange24h >= 0 ? '+' : ''}
                {portfolioData.portfolio.totalChange24h.toFixed(2)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">Risk Level</p>
              <p className={`text-2xl font-bold ${
                portfolioData.riskMetrics.overallRisk === 'Low' ? 'text-green-400' :
                portfolioData.riskMetrics.overallRisk === 'High' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {portfolioData.riskMetrics.overallRisk}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">Diversification</p>
              <p className="text-2xl font-bold text-blue-400">
                {portfolioData.portfolio.diversificationScore.toFixed(0)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Asset Breakdown */}
      {portfolioData && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Asset Breakdown</h3>
          <div className="space-y-3">
            {portfolioData.portfolio.assets.map((asset, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {asset.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{asset.name}</p>
                    <p className="text-gray-400 text-sm">{asset.balance} {asset.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">${asset.value.toFixed(2)}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">{asset.allocation.toFixed(1)}%</span>
                    <span className={`text-sm ${
                      asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Metrics */}
      {portfolioData && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Risk Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-300 text-sm">Volatility</p>
              <p className="text-lg font-semibold text-yellow-400">
                {portfolioData.riskMetrics.volatility.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">Concentration</p>
              <p className="text-lg font-semibold text-orange-400">
                {portfolioData.riskMetrics.concentration.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">Correlation</p>
              <p className="text-lg font-semibold text-purple-400">
                {portfolioData.riskMetrics.correlationRisk.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">Liquidity</p>
              <p className="text-lg font-semibold text-cyan-400">
                {portfolioData.riskMetrics.liquidityRisk.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rebalancing Recommendations */}
      {portfolioData && portfolioData.recommendations.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            🎯 Rebalancing Recommendations
          </h3>
          <div className="space-y-3">
            {portfolioData.recommendations.map((rec, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">
                    {rec.fromAsset} → {rec.toAsset}
                  </p>
                  <span className="text-green-400 font-semibold">
                    ${rec.amount.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-1">{rec.reason}</p>
                <p className="text-gray-400 text-xs">{rec.expectedImpact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Data */}
      {marketData && marketData.priceData.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Live Market Data</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketData.priceData.map((price, index) => (
              <div key={index} className="text-center bg-white/5 rounded-lg p-3">
                <p className="text-gray-300 text-sm">{price.symbol}</p>
                <p className="text-white font-bold">${price.price.toFixed(price.price < 1 ? 4 : 2)}</p>
                <p className={`text-sm ${
                  price.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Last updated: {new Date(marketData.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}