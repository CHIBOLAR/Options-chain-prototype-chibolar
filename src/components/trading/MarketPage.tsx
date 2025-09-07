import { useState } from 'react';
import { TrendingUp, TrendingDown, Search, Filter, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MarketPageProps {
  onNavigateToOptions: (symbol: string) => void;
}

const MarketPage = ({ onNavigateToOptions }: MarketPageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  const indices = [
    { name: 'NIFTY 50', value: 19845.30, change: 156.75, changePercent: 0.80 },
    { name: 'BANK NIFTY', value: 45120.85, change: -245.60, changePercent: -0.54 },
    { name: 'NIFTY IT', value: 31240.50, change: 425.30, changePercent: 1.38 },
    { name: 'NIFTY PHARMA', value: 13567.40, change: 67.85, changePercent: 0.50 }
  ];

  const topGainers = [
    { symbol: 'RELIANCE', price: 2456.75, change: 89.30, changePercent: 3.77, volume: '12.5M' },
    { symbol: 'TCS', price: 3842.60, change: 124.85, changePercent: 3.36, volume: '8.2M' },
    { symbol: 'HDFCBANK', price: 1634.90, change: 45.20, changePercent: 2.84, volume: '15.8M' },
    { symbol: 'INFY', price: 1567.25, change: 38.75, changePercent: 2.53, volume: '9.1M' },
    { symbol: 'ICICIBANK', price: 987.45, change: 23.60, changePercent: 2.45, volume: '18.3M' }
  ];

  const topLosers = [
    { symbol: 'BHARTIARTL', price: 856.30, change: -32.85, changePercent: -3.69, volume: '11.2M' },
    { symbol: 'KOTAKBANK', price: 1734.50, change: -58.40, changePercent: -3.26, volume: '7.8M' },
    { symbol: 'MARUTI', price: 9876.20, change: -285.60, changePercent: -2.81, volume: '2.1M' },
    { symbol: 'ASIANPAINT', price: 3245.75, change: -84.25, changePercent: -2.53, volume: '4.5M' },
    { symbol: 'WIPRO', price: 445.80, change: -10.95, changePercent: -2.40, volume: '13.7M' }
  ];

  const volumeLeaders = [
    { symbol: 'ICICIBANK', volume: '18.3M', price: 987.45, change: 2.45 },
    { symbol: 'RELIANCE', volume: '15.8M', price: 2456.75, change: 3.77 },
    { symbol: 'WIPRO', volume: '13.7M', price: 445.80, change: -2.40 },
    { symbol: 'BHARTIARTL', volume: '11.2M', price: 856.30, change: -3.69 },
    { symbol: 'INFY', volume: '9.1M', price: 1567.25, change: 2.53 }
  ];

  const optionsFlow = [
    { symbol: 'NIFTY', strike: 19900, type: 'CALL', volume: '2.8M', oi: '1.2M', ivChange: 5.2 },
    { symbol: 'BANKNIFTY', strike: 45000, type: 'PUT', volume: '1.9M', oi: '890K', ivChange: -3.1 },
    { symbol: 'RELIANCE', strike: 2500, type: 'CALL', volume: '1.1M', oi: '456K', ivChange: 8.7 },
    { symbol: 'TCS', strike: 3800, type: 'CALL', volume: '780K', oi: '234K', ivChange: 4.3 }
  ];

  const filteredGainers = topGainers.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stocks</SelectItem>
            <SelectItem value="nifty50">NIFTY 50</SelectItem>
            <SelectItem value="banknifty">Bank NIFTY</SelectItem>
            <SelectItem value="midcap">Midcap</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Market Indices */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Market Indices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.map((index) => (
            <div key={index.name} className="p-3 bg-secondary/50 rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">{index.name}</div>
              <div className="text-xl font-bold">{index.value.toFixed(2)}</div>
              <div className={`text-sm flex items-center ${
                index.change >= 0 ? 'text-profit' : 'text-loss'
              }`}>
                {index.change >= 0 ? 
                  <TrendingUp className="w-4 h-4 mr-1" /> : 
                  <TrendingDown className="w-4 h-4 mr-1" />
                }
                {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-profit">
            <TrendingUp className="w-5 h-5 mr-2" />
            Top Gainers
          </h3>
          <div className="space-y-3">
            {filteredGainers.map((stock) => (
              <div key={stock.symbol} 
                   className="flex items-center justify-between py-2 px-3 hover:bg-secondary/50 rounded cursor-pointer"
                   onClick={() => onNavigateToOptions(stock.symbol)}>
                <div className="flex-1">
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-sm text-muted-foreground">Vol: {stock.volume}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{stock.price.toFixed(2)}</div>
                  <div className="text-sm text-profit">
                    +{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Losers */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-loss">
            <TrendingDown className="w-5 h-5 mr-2" />
            Top Losers
          </h3>
          <div className="space-y-3">
            {topLosers.map((stock) => (
              <div key={stock.symbol} 
                   className="flex items-center justify-between py-2 px-3 hover:bg-secondary/50 rounded cursor-pointer"
                   onClick={() => onNavigateToOptions(stock.symbol)}>
                <div className="flex-1">
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-sm text-muted-foreground">Vol: {stock.volume}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{stock.price.toFixed(2)}</div>
                  <div className="text-sm text-loss">
                    {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Leaders */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Volume Leaders
          </h3>
          <div className="space-y-3">
            {volumeLeaders.map((stock) => (
              <div key={stock.symbol} 
                   className="flex items-center justify-between py-2 px-3 hover:bg-secondary/50 rounded cursor-pointer"
                   onClick={() => onNavigateToOptions(stock.symbol)}>
                <div className="flex-1">
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-sm text-accent font-medium">Vol: {stock.volume}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{stock.price.toFixed(2)}</div>
                  <div className={`text-sm ${stock.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Options Flow */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Unusual Options Activity</h3>
          <div className="space-y-3">
            {optionsFlow.map((option, idx) => (
              <div key={idx} 
                   className="flex items-center justify-between py-2 px-3 hover:bg-secondary/50 rounded cursor-pointer"
                   onClick={() => onNavigateToOptions(option.symbol)}>
                <div className="flex-1">
                  <div className="font-medium">
                    {option.symbol} {option.strike} {option.type}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Vol: {option.volume} | OI: {option.oi}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    option.ivChange >= 0 ? 'text-profit' : 'text-loss'
                  }`}>
                    IV: {option.ivChange >= 0 ? '+' : ''}{option.ivChange.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MarketPage;