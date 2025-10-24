"use client";

import { useState } from "react";

interface AIDemo {
  scenario: string;
  description: string;
  mockResult: {
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    riskLevel: 'Low' | 'Medium' | 'High';
    recommendation: string;
    confidence: number;
    analysis: string;
    suggestions: string[];
  };
}

const demoScenarios: AIDemo[] = [
  {
    scenario: "Bull Market Rally",
    description: "ETH up 15%, STT gaining momentum",
    mockResult: {
      sentiment: "Bullish",
      riskLevel: "Medium", 
      recommendation: "Rebalance",
      confidence: 87,
      analysis: "Strong upward momentum detected across major assets. Current allocation shows good diversification but consider taking profits on ETH position and increasing STT exposure given Somnia's growing ecosystem adoption.",
      suggestions: [
        "Reduce ETH allocation by 20% and increase STT",
        "Maintain USDC buffer for potential dips", 
        "Set stop-losses at current support levels"
      ]
    }
  },
  {
    scenario: "Market Correction", 
    description: "Broader crypto market down 8%",
    mockResult: {
      sentiment: "Bearish",
      riskLevel: "High",
      recommendation: "Diversify", 
      confidence: 92,
      analysis: "Market showing signs of correction with high volatility. Risk metrics indicate overexposure to volatile assets. Recommend increasing stablecoin allocation and reducing leverage exposure.",
      suggestions: [
        "Increase USDC allocation to 50% temporarily",
        "DCA into quality assets during dips",
        "Avoid leverage until volatility subsides"
      ]
    }
  },
  {
    scenario: "Stable Consolidation",
    description: "Sideways movement, low volatility", 
    mockResult: {
      sentiment: "Neutral",
      riskLevel: "Low",
      recommendation: "Hold",
      confidence: 74,
      analysis: "Markets entering consolidation phase with reduced volatility. Current allocation is well-balanced for range-bound conditions. Good time to accumulate quality assets gradually.",
      suggestions: [
        "Maintain current allocation ratios",
        "Consider yield farming opportunities",
        "Prepare for potential breakout scenarios"
      ]
    }
  }
];

export default function AIDemoPanel() {
  const [selectedDemo, setSelectedDemo] = useState<AIDemo | null>(null);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
      <h2 className="text-2xl font-semibold text-white mb-4">
        🤖 AI Analysis Demo
      </h2>
      <p className="text-gray-300 text-sm mb-4">
        Try different market scenarios to see AI-powered analysis in action
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {demoScenarios.map((demo, index) => (
          <button
            key={index}
            onClick={() => setSelectedDemo(demo)}
            className="text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <h3 className="text-white font-medium">{demo.scenario}</h3>
            <p className="text-gray-400 text-xs mt-1">{demo.description}</p>
          </button>
        ))}
      </div>

      {selectedDemo && (
        <div className="bg-white/5 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">Analysis Result:</h3>
            <span className="text-purple-400 text-sm">
              Confidence: {selectedDemo.mockResult.confidence}%
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-gray-300 text-xs">Sentiment</p>
              <p className={`font-medium ${
                selectedDemo.mockResult.sentiment === 'Bullish' ? 'text-green-400' :
                selectedDemo.mockResult.sentiment === 'Bearish' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {selectedDemo.mockResult.sentiment}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-xs">Risk</p>
              <p className={`font-medium ${
                selectedDemo.mockResult.riskLevel === 'Low' ? 'text-green-400' :
                selectedDemo.mockResult.riskLevel === 'High' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {selectedDemo.mockResult.riskLevel}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-xs">Action</p>
              <p className="text-blue-400 font-medium">
                {selectedDemo.mockResult.recommendation}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-300 text-sm">{selectedDemo.mockResult.analysis}</p>
          </div>

          <div>
            <h4 className="text-white text-sm font-medium mb-2">AI Suggestions:</h4>
            <div className="space-y-1">
              {selectedDemo.mockResult.suggestions.map((suggestion, idx) => (
                <p key={idx} className="text-gray-400 text-xs">• {suggestion}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}