"use client";

import { useState } from "react";

export default function TransactionInfo() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-green-500/20 border border-green-500/30 rounded-xl p-4 z-40 max-w-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-black text-xs font-bold">
            ✓
          </div>
          <h4 className="text-green-300 font-semibold">Fixed!</h4>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-green-300 hover:text-green-100 text-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="text-green-100 text-sm space-y-2">
        <p><strong>Transaction loop resolved!</strong></p>
        <div className="space-y-1 text-xs text-green-200">
          <div>• No more automatic MetaMask popups</div>
          <div>• Contract interactions now manual only</div>
          <div>• Wallet connection stable</div>
        </div>
        
        <div className="mt-3 p-2 bg-green-500/20 rounded text-xs">
          💡 <strong>Tip:</strong> AI analysis now works without requiring transactions. Contract submission is optional and manual.
        </div>
      </div>
    </div>
  );
}