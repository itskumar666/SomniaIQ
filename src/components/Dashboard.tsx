"use client";

import { useState, useEffect } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client, somniaTestnet } from "@/lib/thirdweb";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import AIDemoPanel from "./AIDemoPanel";
import PortfolioDashboard from "./PortfolioDashboard";

export default function Dashboard() {
  const account = useActiveAccount();
  const { analysis, isLoading, error, runAnalysis } = useAIAnalysis();
  
  // Mock user balances - this would come from wallet/blockchain in production
  const userBalances = {
    STT: 1000,    // 1000 STT tokens
    ETH: 0.5,     // 0.5 ETH
    USDC: 500,    // 500 USDC
    BTC: 0.02,    // 0.02 BTC
  };

  const handleAIAnalysis = async () => {
    await runAnalysis(userBalances);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          DeFi Decision Maker
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          AI-driven portfolio optimization on Somnia
        </p>
        
        {/* Wallet Connection */}
        <div className="flex justify-center">
          <ConnectButton
            client={client}
            appMetadata={{
              name: "DeFi Decision Maker",
              url: "https://defi-decision-maker.vercel.app",
            }}
          />
        </div>
      </header>

      {/* AI Demo Panel */}
      <AIDemoPanel />

      {/* Main Dashboard */}
      {account ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Portfolio Dashboard */}
          <div className="lg:col-span-2">
            <PortfolioDashboard userBalances={userBalances} />
          </div>

          {/* AI Analysis Panel */}
          <div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                🤖 AI Analysis
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Market Sentiment</span>
                  <span className={`font-medium ${
                    analysis?.sentiment === 'Bullish' ? 'text-green-400' :
                    analysis?.sentiment === 'Bearish' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {analysis?.sentiment || 'Neutral'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Risk Level</span>
                  <span className={`font-medium ${
                    analysis?.riskLevel === 'Low' ? 'text-green-400' :
                    analysis?.riskLevel === 'High' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {analysis?.riskLevel || 'Medium'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Recommendation</span>
                  <span className="text-blue-400 font-medium">
                    {analysis?.recommendation || 'Hold'}
                  </span>
                </div>
                {analysis?.confidence && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Confidence</span>
                    <span className="text-purple-400 font-medium">
                      {analysis.confidence}%
                    </span>
                  </div>
                )}
                <button
                  onClick={handleAIAnalysis}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-colors px-4 py-3 rounded-lg text-white font-medium disabled:opacity-50"
                >
                  {isLoading ? "🔄 Analyzing..." : "🚀 Run AI Analysis"}
                </button>
                {error && (
                  <p className="text-orange-400 text-sm">{error}</p>
                )}
              </div>
              {analysis?.analysis && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-300 text-sm leading-relaxed">{analysis.analysis}</p>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button 
                  className={`w-full transition-colors px-4 py-2 rounded-lg text-white ${
                    analysis?.recommendation === 'Rebalance' 
                      ? 'bg-green-600 hover:bg-green-700 animate-pulse' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Auto-Rebalance
                  {analysis?.recommendation === 'Rebalance' && (
                    <span className="text-xs block">⚡ AI Recommended</span>
                  )}
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg text-white">
                  Set Risk Level
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 transition-colors px-4 py-2 rounded-lg text-white">
                  View Strategy
                </button>
              </div>
              
              {/* AI Suggestions */}
              {analysis?.suggestions && analysis.suggestions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-white mb-3">
                    🤖 AI Suggestions
                  </h3>
                  <div className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="text-sm text-gray-300 bg-white/5 p-2 rounded">
                        • {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12">
            <h2 className="text-3xl font-semibold text-white mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-300 mb-6">
              Connect your wallet to start using the DeFi Decision Maker AI agent
            </p>
            <p className="text-sm text-gray-400">
              Connected wallet: {account ? "Connected" : "None"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}