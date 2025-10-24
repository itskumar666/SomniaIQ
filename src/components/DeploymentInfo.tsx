"use client";

import { useState } from "react";

// Static contract addresses to avoid import issues during build
const CONTRACTS = {
  AI_ORACLE: "0x3282abB702F8c70725B2449938589c40Cab962Da",
  PORTFOLIO_MANAGER: "0x908be11922c8A217467D2e7e87E48C007E2a04Fe"
} as const;

export default function DeploymentInfo() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-blue-300 font-medium text-sm">
            🚀 SomniaIQ Deployed
          </span>
        </div>
        <span className="text-blue-300 text-xs">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Network:</span>
              <span className="text-blue-400">Somnia Shannon (50312)</span>
            </div>
            
            <div className="border-t border-blue-500/20 pt-2">
              <div className="text-gray-300 mb-1">Smart Contracts:</div>
              
              <div className="space-y-1">
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">AI Oracle:</span>
                    <a 
                      href={`https://browser.somnia.network/address/${CONTRACTS.AI_ORACLE}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-mono"
                    >
                      {CONTRACTS.AI_ORACLE.slice(0, 8)}...{CONTRACTS.AI_ORACLE.slice(-6)} ↗
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Portfolio Manager:</span>
                    <a 
                      href={`https://browser.somnia.network/address/${CONTRACTS.PORTFOLIO_MANAGER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-mono"
                    >
                      {CONTRACTS.PORTFOLIO_MANAGER.slice(0, 8)}...{CONTRACTS.PORTFOLIO_MANAGER.slice(-6)} ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-blue-500/20 pt-2">
              <div className="text-gray-300 mb-1">Features:</div>
              <div className="grid grid-cols-2 gap-1 text-gray-400">
                <div>✅ AI Analysis</div>
                <div>✅ Live Prices</div>
                <div>✅ Risk Metrics</div>
                <div>✅ On-Chain Storage</div>
              </div>
            </div>

            <div className="border-t border-blue-500/20 pt-2">
              <div className="text-center">
                <a 
                  href="https://github.com/itskumar666/SomniaIQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  📚 View Source Code ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}