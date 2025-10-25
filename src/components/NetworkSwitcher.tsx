"use client";

import { useState } from "react";
import { useActiveAccount, useActiveWallet, useSwitchActiveWalletChain } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";

const somniaChain = defineChain({
  id: 50312,
  name: "Somnia Shannon Testnet",
  rpc: "https://dream-rpc.somnia.network",
  nativeCurrency: {
    name: "Somnia Test Token",
    symbol: "STT", 
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Somnia Explorer",
      url: "https://browser.somnia.network",
    },
  ],
  testnet: true,
});

export default function NetworkSwitcher() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const switchChain = useSwitchActiveWalletChain();
  const [isSwitching, setIsSwitching] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  // Only show if wallet is connected and user manually requests it
  if (!account || !wallet || !showSwitcher) {
    return account && wallet ? (
      <button
        onClick={() => setShowSwitcher(true)}
        className="fixed top-4 right-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 px-3 py-2 rounded-lg text-sm z-40 transition-colors"
      >
        🌐 Switch to Somnia
      </button>
    ) : null;
  }

  // We'll show the switcher when requested
  const needsSwitch = true;

  const handleSwitchToSomnia = async () => {
    if (!wallet) return;

    try {
      setIsSwitching(true);
      await switchChain(somniaChain);
    } catch (error) {
      console.error("Failed to switch to Somnia:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!needsSwitch) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-900/95 to-purple-900/95 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 z-50 max-w-md">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          🌐
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">Switch to Somnia Network</h3>
        <p className="text-gray-300 text-sm mb-6">
          To use SomniaIQ, please switch to the Somnia Shannon Testnet. This will add the network to your MetaMask if it&apos;s not already there.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleSwitchToSomnia}
            disabled={isSwitching}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isSwitching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Switching...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Switch to Somnia</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowSwitcher(false)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <div className="text-xs text-gray-400 bg-gray-800/50 rounded-lg p-3">
            <div className="font-medium text-gray-300 mb-1">Network Details:</div>
            <div>Chain ID: 50312</div>
            <div>RPC: dream-rpc.somnia.network</div>
            <div>Currency: STT</div>
          </div>
        </div>
      </div>
    </div>
  );
}