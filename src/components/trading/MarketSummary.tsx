import { TrendingUp, TrendingDown, DollarSign, Activity, Target, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarketData } from '@/services/marketDataService';

interface MarketSummaryProps {
  data: MarketData;
}

const MarketSummary = ({ data }: MarketSummaryProps) => {
  const totalCallOI = data.options.reduce((sum, opt) => sum + opt.call.oi, 0);
  const totalPutOI = data.options.reduce((sum, opt) => sum + opt.put.oi, 0);
  const totalCallVolume = data.options.reduce((sum, opt) => sum + opt.call.volume, 0);
  const totalPutVolume = data.options.reduce((sum, opt) => sum + opt.put.volume, 0);

  const metrics = [
    {
      title: 'Max Pain',
      value: `₹${data.maxPain.toLocaleString('en-IN')}`,
      change: data.maxPain - data.spotPrice,
      icon: Target,
      description: 'Price where maximum options expire worthless'
    },
    {
      title: 'PCR (Put-Call Ratio)',
      value: data.pcr.toFixed(2),
      change: data.pcr - 1,
      icon: BarChart3,
      description: 'Put OI / Call OI ratio'
    },
    {
      title: 'Total Call OI',
      value: totalCallOI.toLocaleString('en-IN'),
      change: 0,
      icon: TrendingUp,
      description: 'Total call open interest'
    },
    {
      title: 'Total Put OI',
      value: totalPutOI.toLocaleString('en-IN'),
      change: 0,
      icon: TrendingDown,
      description: 'Total put open interest'
    },
    {
      title: 'Call Volume',
      value: totalCallVolume.toLocaleString('en-IN'),
      change: 0,
      icon: Activity,
      description: "Today's call trading volume"
    },
    {
      title: 'Put Volume',
      value: totalPutVolume.toLocaleString('en-IN'),
      change: 0,
      icon: Activity,
      description: "Today's put trading volume"
    }
  ];

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-profit';
    if (change < 0) return 'text-loss';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  const getBadgeVariant = (title: string, value: number) => {
    if (title === 'PCR (Put-Call Ratio)') {
      if (value > 1.2) return 'bg-put-light text-put';
      if (value < 0.8) return 'bg-call-light text-call';
      return 'bg-secondary text-secondary-foreground';
    }
    return 'bg-secondary text-secondary-foreground';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{metric.title}</span>
                </span>
                {metric.title === 'PCR (Put-Call Ratio)' && (
                  <Badge 
                    className={`text-xs ${getBadgeVariant(metric.title, parseFloat(metric.value))}`}
                  >
                    {parseFloat(metric.value) > 1.2 ? 'Bearish' : 
                     parseFloat(metric.value) < 0.8 ? 'Bullish' : 'Neutral'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <div className="text-lg font-bold">{metric.value}</div>
                {metric.change !== 0 && (
                  <div className={`flex items-center space-x-1 text-xs ${getChangeColor(metric.change)}`}>
                    {getChangeIcon(metric.change)}
                    <span>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {metric.description}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MarketSummary;