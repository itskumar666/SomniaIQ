import { PriceData } from './diaOracle';

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  priceUSD: number;
  value: number;
  allocation: number;
  change24h: number;
}

export interface Portfolio {
  assets: Asset[];
  totalValue: number;
  totalChange24h: number;
  riskScore: number;
  diversificationScore: number;
}

export interface RebalanceRecommendation {
  fromAsset: string;
  toAsset: string;
  amount: number;
  reason: string;
  expectedImpact: string;
}

export interface RiskMetrics {
  volatility: number;
  concentration: number;
  correlationRisk: number;
  liquidityRisk: number;
  overallRisk: 'Low' | 'Medium' | 'High';
}

class PortfolioManager {
  calculatePortfolio(assets: Asset[]): Portfolio {
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    
    // Calculate allocations
    const assetsWithAllocation = assets.map(asset => ({
      ...asset,
      allocation: totalValue > 0 ? (asset.value / totalValue) * 100 : 0,
    }));

    // Calculate total 24h change
    const totalChange24h = assetsWithAllocation.reduce((sum, asset) => {
      return sum + (asset.change24h * asset.allocation / 100);
    }, 0);

    // Calculate risk and diversification scores
    const riskScore = this.calculateRiskScore(assetsWithAllocation);
    const diversificationScore = this.calculateDiversificationScore(assetsWithAllocation);

    return {
      assets: assetsWithAllocation,
      totalValue,
      totalChange24h,
      riskScore,
      diversificationScore,
    };
  }

  calculateRiskScore(assets: Asset[]): number {
    // Simple risk calculation based on concentration and volatility
    const maxAllocation = Math.max(...assets.map(a => a.allocation));
    const avgVolatility = assets.reduce((sum, a) => sum + Math.abs(a.change24h), 0) / assets.length;
    
    // Risk increases with concentration and volatility
    const concentrationRisk = maxAllocation / 100; // 0-1 scale
    const volatilityRisk = Math.min(avgVolatility / 20, 1); // Cap at 20% daily change
    
    return Math.min((concentrationRisk * 0.6 + volatilityRisk * 0.4) * 100, 100);
  }

  calculateDiversificationScore(assets: Asset[]): number {
    if (assets.length <= 1) return 0;
    
    // Shannon diversity index adapted for portfolio
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    let diversity = 0;
    
    assets.forEach(asset => {
      if (asset.value > 0) {
        const proportion = asset.value / totalValue;
        diversity -= proportion * Math.log2(proportion);
      }
    });
    
    // Normalize to 0-100 scale
    const maxDiversity = Math.log2(assets.length);
    return maxDiversity > 0 ? (diversity / maxDiversity) * 100 : 0;
  }

  generateRebalanceRecommendations(
    portfolio: Portfolio, 
    targetAllocations?: Record<string, number>
  ): RebalanceRecommendation[] {
    const recommendations: RebalanceRecommendation[] = [];
    
    // Default target allocations if not provided
    const defaultTargets = {
      'ETH': 40,
      'STT': 30,
      'USDC': 20,
      'BTC': 10,
    };
    
    const targets = targetAllocations || defaultTargets;
    
    portfolio.assets.forEach(asset => {
      const targetAllocation = targets[asset.symbol as keyof typeof targets] || 0;
      const currentAllocation = asset.allocation;
      const difference = targetAllocation - currentAllocation;
      
      // If difference is significant (>5%), recommend rebalancing
      if (Math.abs(difference) > 5) {
        if (difference > 0) {
          // Need to buy more of this asset
          recommendations.push({
            fromAsset: 'USDC', // Assume buying with stablecoin
            toAsset: asset.symbol,
            amount: (difference / 100) * portfolio.totalValue,
            reason: `Increase ${asset.symbol} allocation to ${targetAllocation}%`,
            expectedImpact: `Better diversification, target allocation achieved`,
          });
        } else {
          // Need to sell some of this asset
          recommendations.push({
            fromAsset: asset.symbol,
            toAsset: 'USDC',
            amount: Math.abs(difference / 100) * portfolio.totalValue,
            reason: `Reduce ${asset.symbol} allocation to ${targetAllocation}%`,
            expectedImpact: `Reduce concentration risk, take profits`,
          });
        }
      }
    });
    
    return recommendations.slice(0, 3); // Limit to top 3 recommendations
  }

  calculateRiskMetrics(portfolio: Portfolio): RiskMetrics {
    const { assets } = portfolio;
    
    // Volatility: average of absolute daily changes
    const volatility = assets.reduce((sum, asset) => 
      sum + Math.abs(asset.change24h) * (asset.allocation / 100), 0
    );
    
    // Concentration: max single asset allocation
    const concentration = Math.max(...assets.map(a => a.allocation));
    
    // Correlation risk: simplified - assumes similar assets are correlated
    const cryptoAllocation = assets
      .filter(a => !['USDC', 'USDT', 'DAI'].includes(a.symbol))
      .reduce((sum, a) => sum + a.allocation, 0);
    const correlationRisk = cryptoAllocation;
    
    // Liquidity risk: based on asset types and volumes
    const liquidityRisk = assets.reduce((risk, asset) => {
      let assetLiquidityRisk = 0;
      if (asset.symbol === 'STT') assetLiquidityRisk = 30; // New token, higher risk
      else if (['ETH', 'BTC'].includes(asset.symbol)) assetLiquidityRisk = 5;
      else if (['USDC', 'USDT'].includes(asset.symbol)) assetLiquidityRisk = 1;
      else assetLiquidityRisk = 15;
      
      return risk + (assetLiquidityRisk * asset.allocation / 100);
    }, 0);
    
    // Overall risk assessment
    const overallRiskScore = (volatility * 0.3 + concentration * 0.3 + correlationRisk * 0.2 + liquidityRisk * 0.2);
    const overallRisk: 'Low' | 'Medium' | 'High' = 
      overallRiskScore < 30 ? 'Low' : 
      overallRiskScore < 60 ? 'Medium' : 'High';
    
    return {
      volatility,
      concentration,
      correlationRisk,
      liquidityRisk,
      overallRisk,
    };
  }

  // AI-enhanced rebalancing based on market sentiment
  generateAIRebalanceStrategy(
    portfolio: Portfolio,
    marketSentiment: 'Bullish' | 'Bearish' | 'Neutral',
    riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive'
  ): RebalanceRecommendation[] {
    const recommendations: RebalanceRecommendation[] = [];
    
    if (marketSentiment === 'Bullish' && riskTolerance !== 'Conservative') {
      // Increase exposure to growth assets
      recommendations.push({
        fromAsset: 'USDC',
        toAsset: 'ETH',
        amount: portfolio.totalValue * 0.1,
        reason: 'Bullish sentiment: Increase ETH exposure',
        expectedImpact: 'Higher potential returns in rising market',
      });
      
      recommendations.push({
        fromAsset: 'USDC',
        toAsset: 'STT',
        amount: portfolio.totalValue * 0.05,
        reason: 'Somnia ecosystem growth potential',
        expectedImpact: 'Early exposure to growing L1 ecosystem',
      });
    }
    
    if (marketSentiment === 'Bearish' || riskTolerance === 'Conservative') {
      // Increase stablecoin allocation
      recommendations.push({
        fromAsset: 'ETH',
        toAsset: 'USDC',
        amount: portfolio.totalValue * 0.15,
        reason: 'Bearish sentiment: Preserve capital',
        expectedImpact: 'Reduce downside risk, maintain liquidity',
      });
    }
    
    return recommendations;
  }
}

export const portfolioManager = new PortfolioManager();