import { useState } from 'react';
import { PieChart, TrendingUp, TrendingDown, Target, AlertTriangle, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const PortfolioPage = () => {
  const [portfolio] = useState({
    totalValue: 485750,
    investedAmount: 450000,
    dayPnL: 12450,
    totalPnL: 35750,
    dayPnLPercent: 2.63,
    totalPnLPercent: 7.94,
    availableBalance: 125000,
    usedMargin: 95000
  });

  const positions = [
    {
      symbol: 'NIFTY',
      type: 'CALL',
      strike: 19900,
      qty: 100,
      avgPrice: 125.50,
      ltp: 142.75,
      pnl: 1725,
      pnlPercent: 13.75,
      expiry: '2024-01-25'
    },
    {
      symbol: 'BANKNIFTY',
      type: 'PUT',
      strike: 45000,
      qty: 30,
      avgPrice: 89.75,
      ltp: 78.20,
      pnl: -346.50,
      pnlPercent: -12.88,
      expiry: '2024-01-25'
    },
    {
      symbol: 'RELIANCE',
      type: 'CALL',
      strike: 2500,
      qty: 500,
      avgPrice: 45.20,
      ltp: 52.80,
      pnl: 3800,
      pnlPercent: 16.81,
      expiry: '2024-01-30'
    }
  ];

  const greeks = {
    totalDelta: 0.67,
    totalGamma: 0.023,
    totalTheta: -12.45,
    totalVega: 8.90
  };

  const riskMetrics = [
    { label: 'Portfolio Beta', value: '1.12', status: 'moderate' },
    { label: 'Max Daily Loss', value: '₹25,000', status: 'high' },
    { label: 'Concentration Risk', value: '23%', status: 'low' },
    { label: 'Margin Utilization', value: '43%', status: 'moderate' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-loss';
      case 'moderate': return 'text-atm';
      case 'low': return 'text-profit';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">₹{portfolio.totalValue.toLocaleString('en-IN')}</p>
            </div>
            <PieChart className="w-8 h-8 text-primary" />
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
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <p className={`text-2xl font-bold ${portfolio.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {portfolio.totalPnL >= 0 ? '+' : ''}₹{portfolio.totalPnL.toLocaleString('en-IN')}
              </p>
              <p className={`text-sm ${portfolio.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                ({portfolio.totalPnLPercent.toFixed(2)}%)
              </p>
            </div>
            <Target className="w-8 h-8 text-accent" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold">₹{portfolio.availableBalance.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">
                Used: ₹{portfolio.usedMargin.toLocaleString('en-IN')}
              </p>
            </div>
            <Activity className="w-8 h-8 text-atm" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="greeks">Greeks</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Current Positions</h3>
            <div className="space-y-3">
              {positions.map((position, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        position.type === 'CALL' ? 'bg-profit' : 'bg-loss'
                      }`} />
                      <div>
                        <div className="font-medium">
                          {position.symbol} {position.strike} {position.type}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {position.qty} | Exp: {position.expiry}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Avg/LTP</div>
                    <div className="font-medium">₹{position.avgPrice} / ₹{position.ltp}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${position.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {position.pnl >= 0 ? '+' : ''}₹{Math.abs(position.pnl).toFixed(2)}
                    </div>
                    <div className={`text-sm ${position.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      ({position.pnlPercent.toFixed(2)}%)
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button variant="outline" size="sm">Exit</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="greeks" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Portfolio Greeks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-secondary/50 rounded-lg text-center">
                <div className="text-sm text-muted-foreground">Delta</div>
                <div className="text-2xl font-bold">{greeks.totalDelta.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">Directional Risk</div>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg text-center">
                <div className="text-sm text-muted-foreground">Gamma</div>
                <div className="text-2xl font-bold">{greeks.totalGamma.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">Delta Sensitivity</div>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg text-center">
                <div className="text-sm text-muted-foreground">Theta</div>
                <div className="text-2xl font-bold text-loss">{greeks.totalTheta.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Time Decay</div>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg text-center">
                <div className="text-sm text-muted-foreground">Vega</div>
                <div className="text-2xl font-bold">{greeks.totalVega.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Volatility Risk</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Risk Metrics
            </h3>
            <div className="space-y-4">
              {riskMetrics.map((metric, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="font-medium">{metric.label}</div>
                  <div className={`text-lg font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Win Rate</div>
                <div className="text-2xl font-bold text-profit">67%</div>
                <div className="text-xs text-muted-foreground">Last 30 trades</div>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Avg Return</div>
                <div className="text-2xl font-bold">12.5%</div>
                <div className="text-xs text-muted-foreground">Per trade</div>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                <div className="text-2xl font-bold">1.8</div>
                <div className="text-xs text-muted-foreground">Risk-adjusted</div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioPage;