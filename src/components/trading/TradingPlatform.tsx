import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NavigationHeader from './NavigationHeader';
import FilterPanel, { FilterState } from './FilterPanel';
import MarketSummary from './MarketSummary';
import OptionChainTable from './OptionChainTable';
import TradingDialog from './TradingDialog';
import HomePage from './HomePage';
import MarketPage from './MarketPage';
import PortfolioPage from './PortfolioPage';
import { marketDataService, MarketData } from '@/services/marketDataService';
import { OrderDialogData, Trade } from '@/types/trading';

const TradingPlatform = () => {
  const [activeTab, setActiveTab] = useState('options');
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [flashingCells, setFlashingCells] = useState<Set<string>>(new Set());
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState<OrderDialogData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    expiry: 'current',
    strikeRange: 10,
    minVolume: 0,
    minOI: 0,
    moneyness: 'ALL',
    deltaRange: [0, 1],
    showUnusualActivity: false
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = marketDataService.getMarketData(selectedSymbol);
        setMarketData(data);
      } catch (error) {
        toast.error('Failed to load market data');
        console.error('Market data error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSymbol]);

  // Start real-time updates
  useEffect(() => {
    marketDataService.startRealTimeUpdates();
    
    const unsubscribe = marketDataService.subscribe((data) => {
      if (data.symbol === selectedSymbol) {
        // Flash cells that have price changes
        const newFlashing = new Set<string>();
        
        if (marketData) {
          data.options.forEach((option, index) => {
            const oldOption = marketData.options[index];
            if (oldOption) {
              if (option.call.ltp !== oldOption.call.ltp) {
                newFlashing.add(`${option.strike}-CALL`);
              }
              if (option.put.ltp !== oldOption.put.ltp) {
                newFlashing.add(`${option.strike}-PUT`);
              }
            }
          });
        }
        
        setFlashingCells(newFlashing);
        setMarketData(data);
        
        // Clear flashing after animation
        setTimeout(() => setFlashingCells(new Set()), 500);
      }
    });

    return () => {
      marketDataService.stopRealTimeUpdates();
      unsubscribe();
    };
  }, [selectedSymbol, marketData]);

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveTab('options');
    setLoading(true);
  };

  const handleNavigateToOptions = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveTab('options');
    setLoading(true);
  };

  const handleTrade = (orderData: OrderDialogData) => {
    setCurrentOrderData(orderData);
    setIsTradeDialogOpen(true);
  };

  const handleTradeSubmit = (trade: Omit<Trade, 'id' | 'timestamp' | 'status'>) => {
    const newTrade: Trade = {
      ...trade,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      status: 'EXECUTED' // Simplified for demo
    };

    setTrades(prev => [newTrade, ...prev]);
    
    toast.success(
      `${trade.action} order executed: ${trade.quantity} ${trade.optionType} @ ₹${trade.price}`,
      {
        description: `Total value: ₹${trade.totalCost.toLocaleString('en-IN')}`,
        duration: 5000,
      }
    );

    // Log trade to console for demo
    console.log('Trade executed:', newTrade);
  };

  if (loading || !marketData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-24 bg-secondary"></div>
          <div className="h-20 bg-muted/50"></div>
          <div className="p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <NavigationHeader
        currentSymbol={selectedSymbol}
        onSymbolChange={handleSymbolChange}
        marketStatus={marketData?.marketStatus || 'CLOSED'}
        spotPrice={marketData?.spotPrice || 0}
        change={marketData?.change || 0}
        changePercent={marketData?.changePercent || 0}
      />

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
          <TabsList className="grid w-full grid-cols-4 h-12 rounded-none bg-transparent">
            <TabsTrigger value="home" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Home
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Market
            </TabsTrigger>
            <TabsTrigger value="options" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Options
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Portfolio
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="home" className="mt-0">
          <HomePage onNavigateToOptions={handleNavigateToOptions} />
        </TabsContent>

        <TabsContent value="market" className="mt-0">
          <MarketPage onNavigateToOptions={handleNavigateToOptions} />
        </TabsContent>

        <TabsContent value="options" className="mt-0">
          {/* Filter Panel */}
          {marketData && (
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              spotPrice={marketData.spotPrice}
            />
          )}

          {/* Main Content */}
          <div className="p-4 space-y-6">
            {/* Market Summary Cards */}
            {marketData && <MarketSummary data={marketData} />}

            {/* Option Chain Table */}
            {marketData && (
              <div className="bg-card rounded-lg border border-border shadow-sm">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">
                        {marketData.symbol} Option Chain
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {marketData.lastUpdate} | 
                        Market: <span className={
                          marketData.marketStatus === 'OPEN' ? 'text-profit' :
                          marketData.marketStatus === 'PRE_OPEN' ? 'text-atm' : 'text-loss'
                        }>
                          {marketData.marketStatus}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ₹{marketData.spotPrice.toLocaleString('en-IN')}
                      </div>
                      <div className={`text-sm ${marketData.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)} 
                        ({marketData.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>

                <OptionChainTable
                  data={marketData}
                  filters={filters}
                  onTrade={handleTrade}
                  flashingCells={flashingCells}
                />
              </div>
            )}

            {/* Recent Trades (if any) */}
            {trades.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-4">
                <h3 className="text-lg font-semibold mb-3">Recent Trades</h3>
                <div className="space-y-2">
                  {trades.slice(0, 5).map(trade => (
                    <div key={trade.id} className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          trade.action === 'BUY' ? 'bg-profit' : 'bg-loss'
                        }`} />
                        <span className="font-medium">
                          {trade.action} {trade.optionType} {trade.strike}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {trade.quantity} @ ₹{trade.price}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{trade.totalCost.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-muted-foreground">
                          {trade.timestamp.toLocaleTimeString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-0">
          <PortfolioPage />
        </TabsContent>
      </Tabs>

      {/* Trading Dialog */}
      <TradingDialog
        isOpen={isTradeDialogOpen}
        onClose={() => setIsTradeDialogOpen(false)}
        orderData={currentOrderData}
        onSubmit={handleTradeSubmit}
      />
    </div>
  );
};

export default TradingPlatform;