"use client";

import { useState } from "react";
import { CONTRACT_ADDRESSES } from "@/lib/contractService";

export default function ContractDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      // Test network connectivity to Somnia
      const networkTest = await fetch('https://dream-rpc.somnia.network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        })
      });
      
      const networkResponse = await networkTest.json();
      
      // Check if we can access the contract addresses via block explorer API
      const contractChecks = await Promise.all([
        fetch(`https://browser.somnia.network/api/v2/addresses/${CONTRACT_ADDRESSES.AI_ORACLE}`).catch(() => null),
        fetch(`https://browser.somnia.network/api/v2/addresses/${CONTRACT_ADDRESSES.PORTFOLIO_MANAGER}`).catch(() => null)
      ]);

      setDiagnostics({
        networkConnected: networkResponse.result === '0xc458', // 50312 in hex
        chainId: networkResponse.result,
        aiOracleExists: contractChecks[0]?.ok || false,
        portfolioManagerExists: contractChecks[1]?.ok || false,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setDiagnostics({
        networkConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 z-50 max-w-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            🔧
          </div>
          <h3 className="text-lg font-semibold text-white">Contract Diagnostics</h3>
        </div>
      </div>
      
      <div className="space-y-4 text-sm">
        <div className="bg-red-500/20 border border-red-500/30 rounded p-3">
          <p className="text-red-300 font-medium mb-2">Issue Detected:</p>
          <p className="text-red-200 text-xs">Cannot decode zero data - contracts may not be deployed or accessible</p>
        </div>
        
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Running diagnostics...</span>
            </>
          ) : (
            <>
              <span>🔍</span>
              <span>Run Diagnostics</span>
            </>
          )}
        </button>

        {diagnostics && (
          <div className="space-y-2 bg-gray-800/50 rounded p-3">
            <h4 className="text-white font-medium">Results:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2 rounded ${diagnostics.networkConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <div className="font-medium">Network</div>
                <div className={diagnostics.networkConnected ? 'text-green-400' : 'text-red-400'}>
                  {diagnostics.networkConnected ? '✓ Connected' : '✗ Failed'}
                </div>
                {diagnostics.chainId && (
                  <div className="text-gray-400">Chain: {parseInt(diagnostics.chainId, 16)}</div>
                )}
              </div>
              
              <div className={`p-2 rounded ${diagnostics.aiOracleExists ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <div className="font-medium">AI Oracle</div>
                <div className={diagnostics.aiOracleExists ? 'text-green-400' : 'text-red-400'}>
                  {diagnostics.aiOracleExists ? '✓ Found' : '✗ Not Found'}
                </div>
              </div>
              
              <div className={`p-2 rounded ${diagnostics.portfolioManagerExists ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <div className="font-medium">Portfolio</div>
                <div className={diagnostics.portfolioManagerExists ? 'text-green-400' : 'text-red-400'}>
                  {diagnostics.portfolioManagerExists ? '✓ Found' : '✗ Not Found'}
                </div>
              </div>

              <div className="p-2 rounded bg-blue-500/20">
                <div className="font-medium">Status</div>
                <div className="text-blue-400">
                  {diagnostics.error ? '⚠ Error' : '✓ Complete'}
                </div>
              </div>
            </div>

            {diagnostics.error && (
              <div className="text-red-300 text-xs bg-red-500/20 rounded p-2">
                Error: {diagnostics.error}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-1">
          <div><strong>Quick Fixes:</strong></div>
          <div>• Check if wallet is connected to Somnia network</div>
          <div>• Verify contract addresses in block explorer</div>
          <div>• Try switching networks and back to Somnia</div>
        </div>
      </div>
    </div>
  );
}