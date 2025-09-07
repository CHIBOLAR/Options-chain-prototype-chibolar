import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Volume2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MarketData, OptionData } from '@/services/marketDataService';
import { FilterState } from './FilterPanel';
import { OrderDialogData } from '@/types/trading';

interface OptionChainTableProps {
  data: MarketData;
  filters: FilterState;
  onTrade: (orderData: OrderDialogData) => void;
  flashingCells: Set<string>;
}

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

const OptionChainTable = ({ data, filters, onTrade, flashingCells }: OptionChainTableProps) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'strike', direction: 'asc' });
  const [hoveredStrike, setHoveredStrike] = useState<number | null>(null);

  const filteredAndSortedOptions = useMemo(() => {
    let filtered = data.options.filter(option => {
      const { strikeRange, minVolume, minOI, moneyness, deltaRange, showUnusualActivity } = filters;
      const spotPrice = data.spotPrice;
      
      // Strike range filter
      if (Math.abs(option.strike - spotPrice) > strikeRange * 50) return false;
      
      // Volume filter
      if (option.call.volume < minVolume && option.put.volume < minVolume) return false;
      
      // OI filter
      if (option.call.oi < minOI && option.put.oi < minOI) return false;
      
      // Moneyness filter
      if (moneyness !== 'ALL') {
        const isITM = option.strike < spotPrice; // For calls
        const isATM = Math.abs(option.strike - spotPrice) < 25;
        
        if (moneyness === 'ITM' && !isITM) return false;
        if (moneyness === 'ATM' && !isATM) return false;
        if (moneyness === 'OTM' && (isITM || isATM)) return false;
      }
      
      // Delta range filter
      const callDelta = Math.abs(option.call.delta);
      const putDelta = Math.abs(option.put.delta);
      if (callDelta < deltaRange[0] || callDelta > deltaRange[1]) {
        if (putDelta < deltaRange[0] || putDelta > deltaRange[1]) return false;
      }
      
      // Unusual activity filter
      if (showUnusualActivity) {
        const avgVolume = 10000; // Simplified threshold
        if (option.call.volume < avgVolume * 2 && option.put.volume < avgVolume * 2) return false;
      }
      
      return true;
    });

    // Sort options
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.column) {
        case 'strike':
          aValue = a.strike;
          bValue = b.strike;
          break;
        case 'callVolume':
          aValue = a.call.volume;
          bValue = b.call.volume;
          break;
        case 'putVolume':
          aValue = a.put.volume;
          bValue = b.put.volume;
          break;
        case 'callOI':
          aValue = a.call.oi;
          bValue = b.call.oi;
          break;
        case 'putOI':
          aValue = a.put.oi;
          bValue = b.put.oi;
          break;
        case 'callLTP':
          aValue = a.call.ltp;
          bValue = b.call.ltp;
          break;
        case 'putLTP':
          aValue = a.put.ltp;
          bValue = b.put.ltp;
          break;
        default:
          aValue = a.strike;
          bValue = b.strike;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data.options, data.spotPrice, filters, sortConfig]);

  const handleSort = (column: string) => {
    setSortConfig({
      column,
      direction: sortConfig.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIcon = (column: string) => {
    if (sortConfig.column !== column) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const isATM = (strike: number) => Math.abs(strike - data.spotPrice) < 25;
  const isUnusualVolume = (volume: number) => volume > 20000; // Simplified threshold

  const PriceCell = ({ 
    price, 
    change, 
    changePercent, 
    type, 
    strike, 
    optionType 
  }: { 
    price: number; 
    change: number; 
    changePercent: number;
    type: 'call' | 'put';
    strike: number;
    optionType: 'CALL' | 'PUT';
  }) => {
    const isFlashing = flashingCells.has(`${strike}-${optionType}`);
    const isPositive = change >= 0;
    
    return (
      <div 
        className={`
          cursor-pointer transition-all duration-200 p-1 rounded
          ${isFlashing ? (isPositive ? 'animate-flash-green' : 'animate-flash-red') : ''}
          ${type === 'call' ? 'hover:bg-call-light' : 'hover:bg-put-light'}
        `}
        onClick={() => onTrade({
          symbol: data.symbol,
          action: 'BUY',
          optionType: optionType,
          strike,
          price,
          lotSize: data.lotSize
        })}
      >
        <div className="text-sm font-medium">₹{price.toFixed(2)}</div>
        <div className={`text-xs ${isPositive ? 'text-profit' : 'text-loss'}`}>
          {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(1)}%)
        </div>
      </div>
    );
  };

  const BidAskCell = ({ 
    bid, 
    ask, 
    strike, 
    optionType 
  }: { 
    bid: number; 
    ask: number; 
    strike: number;
    optionType: 'CALL' | 'PUT';
  }) => (
    <div className="flex space-x-1 text-xs">
      <button
        className="bg-loss/10 hover:bg-loss/20 text-loss px-1 py-0.5 rounded transition-colors"
        onClick={() => onTrade({
          symbol: data.symbol,
          action: 'SELL',
          optionType,
          strike,
          price: bid,
          lotSize: data.lotSize
        })}
      >
        {bid.toFixed(2)}
      </button>
      <button
        className="bg-profit/10 hover:bg-profit/20 text-profit px-1 py-0.5 rounded transition-colors"
        onClick={() => onTrade({
          symbol: data.symbol,
          action: 'BUY',
          optionType,
          strike,
          price: ask,
          lotSize: data.lotSize
        })}
      >
        {ask.toFixed(2)}
      </button>
    </div>
  );

  const GreeksCell = ({ delta, gamma, theta, vega }: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-xs cursor-help">
            <div>Δ {delta.toFixed(2)}</div>
            <div className="text-muted-foreground">Γ {gamma.toFixed(3)}</div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <div>Delta: {delta.toFixed(3)} (Price sensitivity)</div>
            <div>Gamma: {gamma.toFixed(4)} (Delta acceleration)</div>
            <div>Theta: {theta.toFixed(3)} (Time decay)</div>
            <div>Vega: {vega.toFixed(3)} (Volatility sensitivity)</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-table-header hover:bg-table-header">
            <TableHead colSpan={6} className="text-center text-call font-bold py-3 border-r">
              CALLS
            </TableHead>
            <TableHead className="text-center font-bold py-3">STRIKE</TableHead>
            <TableHead colSpan={6} className="text-center text-put font-bold py-3 border-l">
              PUTS
            </TableHead>
          </TableRow>
          <TableRow className="bg-table-header hover:bg-table-header">
            {/* Call Headers */}
            <TableHead 
              className="cursor-pointer hover:bg-secondary text-xs"
              onClick={() => handleSort('callOI')}
            >
              OI {getSortIcon('callOI')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-secondary text-xs"
              onClick={() => handleSort('callVolume')}
            >
              Volume {getSortIcon('callVolume')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-secondary text-xs"
              onClick={() => handleSort('callLTP')}
            >
              LTP {getSortIcon('callLTP')}
            </TableHead>
            <TableHead className="text-xs">Bid/Ask</TableHead>
            <TableHead className="text-xs">Greeks</TableHead>
            <TableHead className="text-xs border-r">IV%</TableHead>
            
            {/* Strike Header */}
            <TableHead 
              className="text-center font-bold cursor-pointer hover:bg-secondary"
              onClick={() => handleSort('strike')}
            >
              STRIKE {getSortIcon('strike')}
            </TableHead>
            
            {/* Put Headers */}
            <TableHead className="text-xs border-l">IV%</TableHead>
            <TableHead className="text-xs">Greeks</TableHead>
            <TableHead className="text-xs">Bid/Ask</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-secondary text-xs"
              onClick={() => handleSort('putLTP')}
            >
              LTP {getSortIcon('putLTP')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-secondary text-xs"
              onClick={() => handleSort('putVolume')}
            >
              Volume {getSortIcon('putVolume')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-secondary text-xs"
              onClick={() => handleSort('putOI')}
            >
              OI {getSortIcon('putOI')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedOptions.map((option) => (
            <TableRow
              key={option.strike}
              className={`
                hover:bg-table-row-hover transition-colors border-b
                ${isATM(option.strike) ? 'bg-atm-light' : ''}
                ${hoveredStrike === option.strike ? 'bg-secondary/50' : ''}
              `}
              onMouseEnter={() => setHoveredStrike(option.strike)}
              onMouseLeave={() => setHoveredStrike(null)}
            >
              {/* CALL DATA */}
              <TableCell className="text-sm font-mono">
                <div className="flex items-center space-x-1">
                  <span>{option.call.oi.toLocaleString('en-IN')}</span>
                  {isUnusualVolume(option.call.oi) && (
                    <AlertTriangle className="w-3 h-3 text-atm" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm font-mono">
                <div className="flex items-center space-x-1">
                  <span>{option.call.volume.toLocaleString('en-IN')}</span>
                  {isUnusualVolume(option.call.volume) && (
                    <Volume2 className="w-3 h-3 text-profit" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <PriceCell
                  price={option.call.ltp}
                  change={option.call.change}
                  changePercent={option.call.changePercent}
                  type="call"
                  strike={option.strike}
                  optionType="CALL"
                />
              </TableCell>
              <TableCell>
                <BidAskCell
                  bid={option.call.bid}
                  ask={option.call.ask}
                  strike={option.strike}
                  optionType="CALL"
                />
              </TableCell>
              <TableCell>
                <GreeksCell
                  delta={option.call.delta}
                  gamma={option.call.gamma}
                  theta={option.call.theta}
                  vega={option.call.vega}
                />
              </TableCell>
              <TableCell className="text-xs font-mono border-r">
                {option.call.iv.toFixed(1)}%
              </TableCell>

              {/* STRIKE PRICE */}
              <TableCell className={`
                text-center font-bold text-lg py-3
                ${isATM(option.strike) ? 'bg-atm text-atm-foreground' : ''}
              `}>
                {option.strike}
              </TableCell>

              {/* PUT DATA */}
              <TableCell className="text-xs font-mono border-l">
                {option.put.iv.toFixed(1)}%
              </TableCell>
              <TableCell>
                <GreeksCell
                  delta={option.put.delta}
                  gamma={option.put.gamma}
                  theta={option.put.theta}
                  vega={option.put.vega}
                />
              </TableCell>
              <TableCell>
                <BidAskCell
                  bid={option.put.bid}
                  ask={option.put.ask}
                  strike={option.strike}
                  optionType="PUT"
                />
              </TableCell>
              <TableCell>
                <PriceCell
                  price={option.put.ltp}
                  change={option.put.change}
                  changePercent={option.put.changePercent}
                  type="put"
                  strike={option.strike}
                  optionType="PUT"
                />
              </TableCell>
              <TableCell className="text-sm font-mono">
                <div className="flex items-center space-x-1">
                  <span>{option.put.volume.toLocaleString('en-IN')}</span>
                  {isUnusualVolume(option.put.volume) && (
                    <Volume2 className="w-3 h-3 text-profit" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm font-mono">
                <div className="flex items-center space-x-1">
                  <span>{option.put.oi.toLocaleString('en-IN')}</span>
                  {isUnusualVolume(option.put.oi) && (
                    <AlertTriangle className="w-3 h-3 text-atm" />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredAndSortedOptions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-lg mb-2">No options match your filters</div>
          <div className="text-sm">Try adjusting your filter criteria</div>
        </div>
      )}
    </div>
  );
};

export default OptionChainTable;