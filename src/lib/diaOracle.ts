// DIA Oracle integration for Somnia
// DIA provides decentralized price feeds for Somnia network

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
  change24h: number;
  volume24h: number;
}

export interface OracleResponse {
  Symbol: string;
  Name: string;
  Price: number;
  PriceYesterday: number;
  VolumeYesterdayUSD: number;
  Time: string;
  Source: string;
}

class DIAOracleService {
  private baseUrl = 'https://api.diadata.org/v1';
  
  async getAssetPrice(symbol: string): Promise<PriceData | null> {
    try {
      // DIA API endpoint for getting asset prices
      const response = await fetch(`${this.baseUrl}/assetQuotation/${symbol}/USD`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`DIA API error: ${response.status}`);
      }

      const data: OracleResponse = await response.json();
      
      const change24h = data.PriceYesterday > 0 
        ? ((data.Price - data.PriceYesterday) / data.PriceYesterday) * 100 
        : 0;

      return {
        symbol: data.Symbol,
        price: data.Price,
        timestamp: new Date(data.Time).getTime(),
        change24h,
        volume24h: data.VolumeYesterdayUSD,
      };
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return null;
    }
  }

  async getMultipleAssetPrices(symbols: string[]): Promise<PriceData[]> {
    const promises = symbols.map(symbol => this.getAssetPrice(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<PriceData> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  // Get trending assets data
  async getTrendingAssets(): Promise<PriceData[]> {
    try {
      // Common DeFi assets to track
      const trendingSymbols = ['ETH', 'BTC', 'USDC', 'USDT', 'MATIC', 'SOL'];
      return await this.getMultipleAssetPrices(trendingSymbols);
    } catch (error) {
      console.error('Failed to fetch trending assets:', error);
      return [];
    }
  }

  // Mock Somnia Token (STT) price since it might not be in DIA yet
  getMockSTTPrice(): PriceData {
    const basePrice = 0.15;
    const volatility = 0.05;
    const randomChange = (Math.random() - 0.5) * volatility;
    
    return {
      symbol: 'STT',
      price: basePrice + randomChange,
      timestamp: Date.now(),
      change24h: (Math.random() - 0.5) * 10, // -5% to +5%
      volume24h: 50000 + Math.random() * 100000,
    };
  }
}

export const diaOracle = new DIAOracleService();