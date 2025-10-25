"use client";

import { useActiveAccount } from "thirdweb/react";
import { useMemo } from "react";

export default function WalletStatus() {
  const account = useActiveAccount();

  const statusDisplay = useMemo(() => {
    if (!account) return null;

    return (
      <div className="fixed top-4 left-4 bg-green-500/20 border border-green-500/30 rounded-lg p-3 z-40">
        <div className="flex items-center space-x-2 text-green-300">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">
            Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
        </div>
      </div>
    );
  }, [account]);

  return statusDisplay;
}