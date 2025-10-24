// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AIOracle.sol";
import "../src/DeFiDecisionMaker.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy AIOracle first (with zero address as placeholder)
        AIOracle oracle = new AIOracle(address(0));
        console.log("AIOracle deployed to:", address(oracle));
        
        // Deploy DeFiDecisionMaker with the oracle address
        DeFiDecisionMaker portfolioManager = new DeFiDecisionMaker(address(oracle));
        console.log("DeFiDecisionMaker deployed to:", address(portfolioManager));
        
        vm.stopBroadcast();
        
        console.log("Deployment Summary:");
        console.log("AIOracle:", address(oracle));
        console.log("DeFiDecisionMaker:", address(portfolioManager));
        console.log("Note: Update frontend contract addresses with these deployed addresses");
    }
}