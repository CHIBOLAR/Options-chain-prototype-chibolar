import { useState, useEffect } from 'react';
import { X, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrderDialogData, Trade } from '@/types/trading';

interface TradingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: OrderDialogData | null;
  onSubmit: (trade: Omit<Trade, 'id' | 'timestamp' | 'status'>) => void;
}

const TradingDialog = ({ isOpen, onClose, orderData, onSubmit }: TradingDialogProps) => {
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState(0);
  const [marginPercentage, setMarginPercentage] = useState(10); // For position sizing

  useEffect(() => {
    if (orderData) {
      setLimitPrice(orderData.price);
    }
  }, [orderData]);

  if (!orderData) return null;

  const totalQuantity = quantity * orderData.lotSize;
  const totalCost = totalQuantity * (orderType === 'MARKET' ? orderData.price : limitPrice);
  const marginRequired = totalCost * 0.2; // Simplified margin calculation
  const maxAffordableQuantity = Math.floor((marginPercentage * 100000) / (orderData.lotSize * orderData.price * 0.2)); // Assuming 1L capital

  const handleSubmit = () => {
    const trade: Omit<Trade, 'id' | 'timestamp' | 'status'> = {
      symbol: orderData.symbol,
      action: orderData.action,
      optionType: orderData.optionType,
      strike: orderData.strike,
      quantity: totalQuantity,
      price: orderType === 'MARKET' ? orderData.price : limitPrice,
      orderType,
      totalCost,
      marginRequired
    };

    onSubmit(trade);
    onClose();
    // Reset form
    setQuantity(1);
    setOrderType('MARKET');
    setMarginPercentage(10);
  };

  const adjustQuantityByCapital = () => {
    const recommendedQuantity = Math.min(maxAffordableQuantity, 5); // Cap at 5 lots for safety
    setQuantity(Math.max(1, recommendedQuantity));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              orderData.action === 'BUY' ? 'bg-profit' : 'bg-loss'
            }`} />
            <span>
              {orderData.action} {orderData.optionType} - {orderData.strike}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Symbol and Current Price */}
          <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
            <div>
              <div className="font-medium">{orderData.symbol}</div>
              <div className="text-sm text-muted-foreground">
                {orderData.optionType} @ {orderData.strike}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">₹{orderData.price.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Current Price</div>
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="space-y-2">
            <Label>Quantity (Lots)</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
                min="1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
              <div className="text-sm text-muted-foreground ml-2">
                = {totalQuantity} shares
              </div>
            </div>
          </div>

          {/* Capital-based Position Sizing */}
          <div className="space-y-2">
            <Label>Use % of Capital</Label>
            <div className="flex items-center space-x-2">
              <Select 
                value={marginPercentage.toString()} 
                onValueChange={(value) => setMarginPercentage(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 25].map(percent => (
                    <SelectItem key={percent} value={percent.toString()}>
                      {percent}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={adjustQuantityByCapital}
                className="flex items-center space-x-1"
              >
                <Calculator className="w-4 h-4" />
                <span>Auto Calculate</span>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Max affordable: {maxAffordableQuantity} lots with {marginPercentage}% capital
            </div>
          </div>

          {/* Order Type */}
          <div className="space-y-2">
            <Label>Order Type</Label>
            <div className="flex space-x-2">
              <Button
                variant={orderType === 'MARKET' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrderType('MARKET')}
                className="flex-1"
              >
                Market
              </Button>
              <Button
                variant={orderType === 'LIMIT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrderType('LIMIT')}
                className="flex-1"
              >
                Limit
              </Button>
            </div>
          </div>

          {/* Limit Price Input */}
          {orderType === 'LIMIT' && (
            <div className="space-y-2">
              <Label>Limit Price</Label>
              <Input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                step="0.05"
                placeholder="Enter limit price"
              />
            </div>
          )}

          {/* Order Summary */}
          <div className="space-y-2 p-3 bg-secondary/30 rounded-lg">
            <div className="font-medium mb-2">Order Summary</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Quantity:</span>
                <span className="font-medium">{totalQuantity} shares</span>
              </div>
              <div className="flex justify-between">
                <span>Price per share:</span>
                <span className="font-medium">
                  ₹{(orderType === 'MARKET' ? orderData.price : limitPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Cost:</span>
                <span className="font-bold">₹{totalCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Margin Required:</span>
                <span className="font-bold text-atm">₹{marginRequired.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          {totalCost > 50000 && (
            <div className="flex items-start space-x-2 p-2 bg-atm-light/50 rounded border border-atm/20">
              <AlertTriangle className="w-4 h-4 text-atm mt-0.5" />
              <div className="text-xs text-atm">
                High value trade. Please ensure you have sufficient margin and risk management in place.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className={`flex-1 ${
                orderData.action === 'BUY' 
                  ? 'bg-profit hover:bg-profit/90 text-profit-foreground' 
                  : 'bg-loss hover:bg-loss/90 text-loss-foreground'
              }`}
            >
              {orderData.action} Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradingDialog;