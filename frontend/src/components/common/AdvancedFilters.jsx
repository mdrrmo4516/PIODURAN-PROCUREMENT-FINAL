import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { Filter, ChevronDown, X, RotateCcw } from 'lucide-react';

const statusOptions = ['All', 'Pending', 'For Review', 'Approved', 'Denied', 'Completed'];
const priorityOptions = ['All', 'Low', 'Normal', 'High', 'Urgent'];
const departmentOptions = ['All', 'MDRRMO'];

export const AdvancedFilters = ({ filters, onFilterChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value === 'All' ? '' : value
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== '').length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-border hover:bg-muted/50"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <CollapsibleContent className="mt-4">
        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Status</Label>
              <Select
                value={filters.status || 'All'}
                onValueChange={(v) => handleChange('status', v)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {statusOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Priority</Label>
              <Select
                value={filters.priority || 'All'}
                onValueChange={(v) => handleChange('priority', v)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {priorityOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
                className="bg-background border-border"
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Date To</Label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleChange('dateTo', e.target.value)}
                className="bg-background border-border"
              />
            </div>

            {/* Min Amount */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Min Amount (₱)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={filters.minAmount || ''}
                onChange={(e) => handleChange('minAmount', e.target.value ? Number(e.target.value) : '')}
                className="bg-background border-border"
              />
            </div>

            {/* Max Amount */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Max Amount (₱)</Label>
              <Input
                type="number"
                min="0"
                placeholder="No limit"
                value={filters.maxAmount || ''}
                onChange={(e) => handleChange('maxAmount', e.target.value ? Number(e.target.value) : '')}
                className="bg-background border-border"
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Department</Label>
              <Select
                value={filters.department || 'All'}
                onValueChange={(v) => handleChange('department', v)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {departmentOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Active:</span>
              {Object.entries(filters).map(([key, value]) => {
                if (!value || value === '') return null;
                return (
                  <span
                    key={key}
                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                  >
                    {key}: {value}
                    <button
                      onClick={() => handleChange(key, '')}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
