import { useState } from 'react';
import { Filter, SlidersHorizontal, Calendar, TrendingUp, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';

export interface FilterState {
  expiry: string;
  strikeRange: number;
  minVolume: number;
  minOI: number;
  moneyness: 'ALL' | 'ITM' | 'ATM' | 'OTM';
  deltaRange: [number, number];
  showUnusualActivity: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  spotPrice: number;
}

const FilterPanel = ({ filters, onChange, spotPrice }: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const expiryOptions = [
    { value: 'current', label: 'Current Week' },
    { value: 'next', label: 'Next Week' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'all', label: 'All Expiries' }
  ];

  const moneynessOptions = [
    { value: 'ALL', label: 'All Options' },
    { value: 'ITM', label: 'In The Money' },
    { value: 'ATM', label: 'At The Money' },
    { value: 'OTM', label: 'Out of Money' }
  ];

  return (
    <div className="bg-card border-b border-border">
      <div className="px-4 py-3">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Quick Filters */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Select value={filters.expiry} onValueChange={(value) => updateFilter('expiry', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expiryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <Select 
                  value={filters.moneyness} 
                  onValueChange={(value) => updateFilter('moneyness', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moneynessOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Strike Range Quick Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Range:</span>
                <div className="flex space-x-1">
                  {[5, 10, 20].map(range => (
                    <Button
                      key={range}
                      variant={filters.strikeRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter('strikeRange', range)}
                      className="px-2 py-1 text-xs"
                    >
                      ±{range}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter('showUnusualActivity', !filters.showUnusualActivity)}
                className={filters.showUnusualActivity ? 'bg-atm-light text-atm' : ''}
              >
                <Volume2 className="w-4 h-4 mr-1" />
                Unusual Activity
              </Button>
              
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="w-4 h-4 mr-1" />
                  Advanced
                  <Filter className="w-4 h-4 ml-1" />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-secondary/30 rounded-lg">
              {/* Strike Range Slider */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Strike Range (±{filters.strikeRange})</Label>
                <Slider
                  value={[filters.strikeRange]}
                  onValueChange={([value]) => updateFilter('strikeRange', value)}
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">
                  {spotPrice - filters.strikeRange * 50} - {spotPrice + filters.strikeRange * 50}
                </div>
              </div>

              {/* Volume Filter */}
              <div className="space-y-2">
                <Label htmlFor="minVolume" className="text-sm font-medium">Min Volume</Label>
                <Input
                  id="minVolume"
                  type="number"
                  value={filters.minVolume}
                  onChange={(e) => updateFilter('minVolume', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="h-8"
                />
              </div>

              {/* OI Filter */}
              <div className="space-y-2">
                <Label htmlFor="minOI" className="text-sm font-medium">Min Open Interest</Label>
                <Input
                  id="minOI"
                  type="number"
                  value={filters.minOI}
                  onChange={(e) => updateFilter('minOI', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="h-8"
                />
              </div>

              {/* Delta Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Delta Range ({filters.deltaRange[0]} - {filters.deltaRange[1]})
                </Label>
                <Slider
                  value={filters.deltaRange}
                  onValueChange={(value) => updateFilter('deltaRange', value as [number, number])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default FilterPanel;