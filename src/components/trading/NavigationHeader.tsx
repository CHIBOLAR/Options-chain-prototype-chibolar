import { useState } from 'react';
import { Search, TrendingUp, BarChart3, Wallet, Home, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NavigationHeaderProps {
  currentSymbol: string;
  onSymbolChange: (symbol: string) => void;
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_OPEN';
  spotPrice: number;
  change: number;
  changePercent: number;
}

const NavigationHeader = ({
  currentSymbol,
  onSymbolChange,
  marketStatus,
  spotPrice,
  change,
  changePercent
}: NavigationHeaderProps) => {
  const [activeTab, setActiveTab] = useState('options');

  const symbols = [
    { value: 'NIFTY', label: 'NIFTY 50', fullName: 'NIFTY 50' },
    { value: 'BANKNIFTY', label: 'BANK NIFTY', fullName: 'BANK NIFTY' },
    { value: 'RELIANCE', label: 'RELIANCE', fullName: 'Reliance Industries' },
    { value: 'TCS', label: 'TCS', fullName: 'Tata Consultancy Services' },
    { value: 'HDFCBANK', label: 'HDFC BANK', fullName: 'HDFC Bank Limited' }
  ];

  const getMarketStatusColor = () => {
    switch (marketStatus) {
      case 'OPEN': return 'text-profit';
      case 'PRE_OPEN': return 'text-atm';
      case 'CLOSED': return 'text-loss';
      default: return 'text-muted-foreground';
    }
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'options', label: 'Options', icon: BarChart3 },
    { id: 'market', label: 'Market', icon: TrendingUp },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Main Navigation */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-nse rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-nse-foreground" />
            </div>
            <span className="text-lg font-bold text-nse hidden sm:block">NSE Options</span>
          </div>
        </div>

        {/* Symbol Search and Selection */}
        <div className="flex items-center space-x-4 flex-1 max-w-md mx-4">
          <Select value={currentSymbol} onValueChange={onSymbolChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select symbol" />
            </SelectTrigger>
            <SelectContent>
              {symbols.map(symbol => (
                <SelectItem key={symbol.value} value={symbol.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{symbol.label}</span>
                    <span className="text-xs text-muted-foreground">{symbol.fullName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Market Status and Price */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">₹{spotPrice.toLocaleString('en-IN')}</span>
              <span className={`text-sm ${change >= 0 ? 'text-profit' : 'text-loss'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className={`text-xs ${getMarketStatusColor()}`}>
              {marketStatus === 'OPEN' ? '● Market Open' : 
               marketStatus === 'PRE_OPEN' ? '○ Pre-Open' : '● Market Closed'}
            </div>
          </div>
          <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-t border-border">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary ${
                activeTab === tab.id
                  ? 'text-nse border-b-2 border-nse bg-secondary/50'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Price Display */}
      <div className="sm:hidden px-4 py-2 bg-secondary/50 border-t border-border">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold">₹{spotPrice.toLocaleString('en-IN')}</span>
            <span className={`ml-2 text-sm ${change >= 0 ? 'text-profit' : 'text-loss'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
          <div className={`text-xs ${getMarketStatusColor()}`}>
            {marketStatus === 'OPEN' ? '● OPEN' : 
             marketStatus === 'PRE_OPEN' ? '○ PRE-OPEN' : '● CLOSED'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;