import { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, PieChart, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  onNavigateToOptions: (symbol: string) => void;
}

const HomePage = ({ onNavigateToOptions }: HomePageProps) => {
  const [portfolio] = useState({
    totalValue: 485750,
    dayPnL: 12450,
    dayPnLPercent: 2.63,
    availableBalance: 125000,
    usedMargin: 95000
  });

  const recentTrades = [
    { symbol: 'NIFTY', action: 'BUY', strike: 19900, type: 'CALL', qty: 50, price: 125.50, time: '14:30' },
    { symbol: 'BANKNIFTY', action: 'SELL', strike: 45000, type: 'PUT', qty: 15, price: 89.75, time: '13:45' },
    { symbol: 'RELIANCE', action: 'BUY', strike: 2500, type: 'CALL', qty: 250, price: 45.20, time: '12:15' }
  ];

  const watchlist = [
    { symbol: 'NIFTY', price: 19845.30, change: 2.45, changePercent: 1.24 },
    { symbol: 'BANKNIFTY', price: 45120.85, change: -45.20, changePercent: -0.98 },
    { symbol: 'RELIANCE', price: 2456.75, change: 12.30, changePercent: 0.51 }
  ];

  const marketNews = [
    { title: 'NIFTY hits new high amid positive sentiment', time: '15:30' },
    { title: 'Banking sector shows strong momentum', time: '14:45' },
    { title: 'IT stocks gain on global cues', time: '13:20' }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
              <p className="text-2xl font-bold">₹{portfolio.totalValue.toLocaleString('en-IN')}</p>
            </div>
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Day P&L</p>
              <p className={`text-2xl font-bold ${portfolio.dayPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {portfolio.dayPnL >= 0 ? '+' : ''}₹{portfolio.dayPnL.toLocaleString('en-IN')}
              </p>
              <p className={`text-sm ${portfolio.dayPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                ({portfolio.dayPnLPercent.toFixed(2)}%)
              </p>
            </div>
            {portfolio.dayPnL >= 0 ? 
              <TrendingUp className="w-8 h-8 text-profit" /> : 
              <TrendingDown className="w-8 h-8 text-loss" />
            }
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold">₹{portfolio.availableBalance.toLocaleString('en-IN')}</p>
            </div>
            <Activity className="w-8 h-8 text-accent" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Used Margin</p>
              <p className="text-2xl font-bold">₹{portfolio.usedMargin.toLocaleString('en-IN')}</p>
            </div>
            <PieChart className="w-8 h-8 text-atm" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS'].map(symbol => (
            <Button
              key={symbol}
              variant="outline"
              onClick={() => onNavigateToOptions(symbol)}
              className="h-12"
            >
              {symbol} Options
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trades */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Trades
          </h3>
          <div className="space-y-3">
            {recentTrades.map((trade, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    trade.action === 'BUY' ? 'bg-profit' : 'bg-loss'
                  }`} />
                  <div>
                    <div className="font-medium">
                      {trade.action} {trade.symbol} {trade.strike} {trade.type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trade.qty} @ ₹{trade.price}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">{trade.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Watchlist */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Watchlist
          </h3>
          <div className="space-y-3">
            {watchlist.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between py-2 px-3 hover:bg-secondary/50 rounded cursor-pointer"
                   onClick={() => onNavigateToOptions(stock.symbol)}>
                <div>
                  <div className="font-medium">{stock.symbol}</div>
                  <div className="text-2xl font-bold">₹{stock.price.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${stock.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </div>
                  <div className={`text-sm ${stock.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                    ({stock.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Market News */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Market News</h3>
        <div className="space-y-3">
          {marketNews.map((news, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex-1">
                <p className="text-sm">{news.title}</p>
              </div>
              <div className="text-xs text-muted-foreground ml-4">{news.time}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HomePage;