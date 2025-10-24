import { useState, useCallback, useEffect } from 'react';
import { diaOracle, PriceData } from '@/lib/diaOracle';
import { portfolioManager, Portfolio, Asset, RebalanceRecommendation, RiskMetrics } from '@/lib/portfolioManager';

interface MarketData {
  timestamp: number;
  priceData: PriceData[];
  trending: PriceData[];
}

interface EnhancedPortfolioData {
  portfolio: Portfolio;
  riskMetrics: RiskMetrics;
  recommendations: RebalanceRecommendation[];
}

interface AIAnalysis {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: 'Hold' | 'Rebalance' | 'Diversify';
  confidence: number;
  analysis: string;
  suggestions: string[];
}

export const useAIAnalysis = () => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [portfolioData, setPortfolioData] = useState<EnhancedPortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real market data from DIA Oracle
  const fetchMarketData = useCallback(async (): Promise<MarketData> => {
    try {
      // Get real price data from DIA
      const symbols = ['ETH', 'BTC', 'USDC'];
      const priceData = await diaOracle.getMultipleAssetPrices(symbols);
      
      // Add mock STT data
      const sttPrice = diaOracle.getMockSTTPrice();
      priceData.push(sttPrice);
      
      // Get trending assets
      const trending = await diaOracle.getTrendingAssets();
      
      return {
        timestamp: Date.now(),
        priceData,
        trending,
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Fallback to mock data
      return {
        timestamp: Date.now(),
        priceData: [
          { symbol: 'ETH', price: 2400, timestamp: Date.now(), change24h: 5.2, volume24h: 1000000000 },
          { symbol: 'BTC', price: 67000, timestamp: Date.now(), change24h: 3.1, volume24h: 2000000000 },
          { symbol: 'USDC', price: 1.0, timestamp: Date.now(), change24h: 0.1, volume24h: 500000000 },
          { symbol: 'STT', price: 0.15, timestamp: Date.now(), change24h: 8.5, volume24h: 50000000 },
        ],
        trending: [],
      };
    }
  }, []);

  const createPortfolioFromBalances = useCallback((balances: Record<string, number>, prices: PriceData[]): EnhancedPortfolioData => {
    const assets: Asset[] = Object.entries(balances).map(([symbol, balance]) => {
      const priceInfo = prices.find(p => p.symbol === symbol);
      const price = priceInfo?.price || 0;
      const change24h = priceInfo?.change24h || 0;
      
      return {
        symbol,
        name: getAssetName(symbol),
        balance,
        priceUSD: price,
        value: balance * price,
        allocation: 0, // Will be calculated in portfolioManager
        change24h,
      };
    });

    const portfolio = portfolioManager.calculatePortfolio(assets);
    const riskMetrics = portfolioManager.calculateRiskMetrics(portfolio);
    const recommendations = portfolioManager.generateRebalanceRecommendations(portfolio);

    return {
      portfolio,
      riskMetrics, 
      recommendations,
    };
  }, []);

  const getAssetName = (symbol: string): string => {
    const names: Record<string, string> = {
      'ETH': 'Ethereum',
      'BTC': 'Bitcoin',
      'USDC': 'USD Coin',
      'STT': 'Somnia Token',
      'USDT': 'Tether',
      'SOL': 'Solana',
    };
    return names[symbol] || symbol;
  };

  const runAnalysis = useCallback(async (userBalances: Record<string, number>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch fresh market data
      const freshMarketData = await fetchMarketData();
      setMarketData(freshMarketData);
      
      // Create portfolio analysis
      const enhancedPortfolio = createPortfolioFromBalances(userBalances, freshMarketData.priceData);
      setPortfolioData(enhancedPortfolio);
      
      // Call AI for analysis
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioData: enhancedPortfolio,
          marketData: freshMarketData,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        // Use fallback analysis if AI fails
        setAnalysis(result.fallback);
        setError('AI analysis partially unavailable');
      }
    } catch (err) {
      setError('Failed to run analysis');
      // Provide fallback analysis
      setAnalysis({
        sentiment: 'Neutral',
        riskLevel: 'Medium',
        recommendation: 'Hold',
        confidence: 50,
        analysis: 'Unable to connect to AI service. Using conservative analysis.',
        suggestions: [
          'Monitor market conditions closely',
          'Maintain current allocation', 
          'Review portfolio in 24 hours'
        ]
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchMarketData, createPortfolioFromBalances]);

  // Auto-fetch market data on mount
  useEffect(() => {
    fetchMarketData().then(setMarketData);
  }, [fetchMarketData]);

  return {
    analysis,
    marketData,
    portfolioData,
    isLoading,
    error,
    runAnalysis,
  };
};