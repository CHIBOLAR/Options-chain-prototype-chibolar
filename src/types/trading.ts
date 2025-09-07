export interface Trade {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  optionType: 'CALL' | 'PUT';
  strike: number;
  quantity: number;
  price: number;
  orderType: 'MARKET' | 'LIMIT';
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';
  timestamp: Date;
  totalCost: number;
  marginRequired: number;
}

export interface Position {
  id: string;
  symbol: string;
  optionType: 'CALL' | 'PUT';
  strike: number;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  marginUsed: number;
}

export interface Portfolio {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  availableMargin: number;
  usedMargin: number;
  positions: Position[];
  dayTrades: Trade[];
  totalDelta: number;
  totalGamma: number;
  totalTheta: number;
  totalVega: number;
}

export interface OrderDialogData {
  symbol: string;
  action: 'BUY' | 'SELL';
  optionType: 'CALL' | 'PUT';
  strike: number;
  price: number;
  lotSize: number;
}