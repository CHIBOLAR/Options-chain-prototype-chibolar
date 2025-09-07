// NSE Market Data Service with real-time simulation
export interface OptionData {
  strike: number;
  call: {
    ltp: number;
    change: number;
    changePercent: number;
    volume: number;
    oi: number;
    bid: number;
    ask: number;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    iv: number;
  };
  put: {
    ltp: number;
    change: number;
    changePercent: number;
    volume: number;
    oi: number;
    bid: number;
    ask: number;
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
    iv: number;
  };
}

export interface MarketData {
  symbol: string;
  spotPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_OPEN';
  lastUpdate: string;
  options: OptionData[];
  lotSize: number;
  maxPain: number;
  pcr: number;
}

class MarketDataService {
  private cache = new Map<string, MarketData>();
  private subscribers = new Set<(data: MarketData) => void>();
  private updateInterval: NodeJS.Timeout | null = null;

  // Simulate real market data
  generateOptionChain(symbol: string): MarketData {
    const instruments = {
      'NIFTY': { spotPrice: 19850, lotSize: 50, tickSize: 0.05 },
      'BANKNIFTY': { spotPrice: 45120, lotSize: 15, tickSize: 0.05 },
      'RELIANCE': { spotPrice: 2450, lotSize: 250, tickSize: 0.05 },
      'TCS': { spotPrice: 3850, lotSize: 150, tickSize: 0.05 },
      'HDFCBANK': { spotPrice: 1650, lotSize: 550, tickSize: 0.05 }
    };

    const instrument = instruments[symbol as keyof typeof instruments] || instruments.NIFTY;
    const spotPrice = instrument.spotPrice + (Math.random() - 0.5) * 20; // Simulate price movement
    
    const strikes = this.generateStrikes(spotPrice, symbol);
    const options = strikes.map(strike => this.generateOptionData(spotPrice, strike));

    return {
      symbol,
      spotPrice: Math.round(spotPrice * 20) / 20, // Round to tick size
      change: (Math.random() - 0.5) * 100,
      changePercent: (Math.random() - 0.5) * 2,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      marketStatus: this.getMarketStatus(),
      lastUpdate: new Date().toLocaleTimeString('en-IN'),
      options,
      lotSize: instrument.lotSize,
      maxPain: this.calculateMaxPain(options),
      pcr: this.calculatePCR(options)
    };
  }

  private generateStrikes(spotPrice: number, symbol: string): number[] {
    const strikeInterval = symbol === 'NIFTY' ? 50 : symbol === 'BANKNIFTY' ? 100 : 50;
    const strikes: number[] = [];
    
    const atm = Math.round(spotPrice / strikeInterval) * strikeInterval;
    
    // Generate strikes around ATM
    for (let i = -10; i <= 10; i++) {
      strikes.push(atm + (i * strikeInterval));
    }
    
    return strikes.sort((a, b) => a - b);
  }

  private generateOptionData(spotPrice: number, strike: number): OptionData {
    const timeToExpiry = 0.05; // ~18 days
    const riskFreeRate = 0.065;
    const volatility = 0.15 + Math.random() * 0.1;

    // Simplified Black-Scholes approximation
    const callValue = this.blackScholesCall(spotPrice, strike, timeToExpiry, riskFreeRate, volatility);
    const putValue = this.blackScholesPut(spotPrice, strike, timeToExpiry, riskFreeRate, volatility);

    // Calculate Greeks (simplified)
    const callDelta = this.calculateDelta(spotPrice, strike, timeToExpiry, riskFreeRate, volatility, 'call');
    const putDelta = this.calculateDelta(spotPrice, strike, timeToExpiry, riskFreeRate, volatility, 'put');
    const gamma = this.calculateGamma(spotPrice, strike, timeToExpiry, riskFreeRate, volatility);
    const theta = -0.02 - Math.random() * 0.08; // Time decay
    const vega = 0.1 + Math.random() * 0.3;

    return {
      strike,
      call: {
        ltp: Math.max(0.05, Math.round(callValue * 20) / 20),
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 20,
        volume: Math.floor(Math.random() * 50000),
        oi: Math.floor(Math.random() * 100000),
        bid: Math.max(0.05, Math.round((callValue - 0.25) * 20) / 20),
        ask: Math.round((callValue + 0.25) * 20) / 20,
        delta: Math.round(callDelta * 100) / 100,
        gamma: Math.round(gamma * 1000) / 1000,
        theta: Math.round(theta * 100) / 100,
        vega: Math.round(vega * 100) / 100,
        iv: Math.round((volatility * 100) * 100) / 100
      },
      put: {
        ltp: Math.max(0.05, Math.round(putValue * 20) / 20),
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 20,
        volume: Math.floor(Math.random() * 50000),
        oi: Math.floor(Math.random() * 100000),
        bid: Math.max(0.05, Math.round((putValue - 0.25) * 20) / 20),
        ask: Math.round((putValue + 0.25) * 20) / 20,
        delta: Math.round(putDelta * 100) / 100,
        gamma: Math.round(gamma * 1000) / 1000,
        theta: Math.round(theta * 100) / 100,
        vega: Math.round(vega * 100) / 100,
        iv: Math.round((volatility * 100) * 100) / 100
      }
    };
  }

  // Simplified Black-Scholes calculations
  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private blackScholesCall(S: number, K: number, T: number, r: number, sigma: number): number {
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    return S * this.normalCDF(d1) - K * Math.exp(-r * T) * this.normalCDF(d2);
  }

  private blackScholesPut(S: number, K: number, T: number, r: number, sigma: number): number {
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    return K * Math.exp(-r * T) * this.normalCDF(-d2) - S * this.normalCDF(-d1);
  }

  private calculateDelta(S: number, K: number, T: number, r: number, sigma: number, type: 'call' | 'put'): number {
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    return type === 'call' ? this.normalCDF(d1) : this.normalCDF(d1) - 1;
  }

  private calculateGamma(S: number, K: number, T: number, r: number, sigma: number): number {
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    return Math.exp(-d1 * d1 / 2) / (S * sigma * Math.sqrt(2 * Math.PI * T));
  }

  private getMarketStatus(): 'OPEN' | 'CLOSED' | 'PRE_OPEN' {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const hour = istTime.getHours();
    const minute = istTime.getMinutes();
    const day = istTime.getDay();

    if (day === 0 || day === 6) return 'CLOSED';
    if (hour === 9 && minute >= 15 || (hour > 9 && hour < 15) || (hour === 15 && minute <= 30)) {
      return 'OPEN';
    }
    return hour < 9 ? 'PRE_OPEN' : 'CLOSED';
  }

  private calculateMaxPain(options: OptionData[]): number {
    // Simplified max pain calculation
    let maxPain = 0;
    let minLoss = Infinity;

    options.forEach(option => {
      const totalOI = option.call.oi + option.put.oi;
      if (totalOI < minLoss) {
        minLoss = totalOI;
        maxPain = option.strike;
      }
    });

    return maxPain;
  }

  private calculatePCR(options: OptionData[]): number {
    const totalCallOI = options.reduce((sum, opt) => sum + opt.call.oi, 0);
    const totalPutOI = options.reduce((sum, opt) => sum + opt.put.oi, 0);
    return Math.round((totalPutOI / totalCallOI) * 100) / 100;
  }

  startRealTimeUpdates() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      // Update cached data with new prices
      this.cache.forEach((data, symbol) => {
        const updated = this.generateOptionChain(symbol);
        this.cache.set(symbol, updated);
        this.subscribers.forEach(callback => callback(updated));
      });
    }, 15000); // Update every 15 seconds
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  subscribe(callback: (data: MarketData) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getMarketData(symbol: string): MarketData {
    if (!this.cache.has(symbol)) {
      const data = this.generateOptionChain(symbol);
      this.cache.set(symbol, data);
    }
    return this.cache.get(symbol)!;
  }
}

export const marketDataService = new MarketDataService();