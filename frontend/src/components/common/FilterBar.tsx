import type { SortingState } from "@tanstack/react-table";
import type { ReactNode } from "react";

export interface FilterOption<T = any> {
  value: T;
  label: string;
  color?: string;
}

export interface FilterGroupConfig<T = any> {
  id: string;
  label: string;
  icon?: ReactNode;
  options: FilterOption<T>[];
  activeValue: T;
  onChange: (value: T) => void;
}

export interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  sorting?: SortingState;
  onResetSorting?: () => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  filterGroups?: FilterGroupConfig<any>[];
}

import { Button, Input } from "@/components/ui";
import { ArrowUpDown, RotateCcw, Search } from "lucide-react";

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Cerca...",
  sorting = [],
  onResetSorting,
  hasActiveFilters,
  onResetFilters,
  filterGroups = [],
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 w-[400px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Reset Buttons */}
        <div className="flex w-[320px] items-center justify-end gap-4">
          {/* Reset Sorting */}
          {sorting.length > 0 && onResetSorting && (
            <Button
              variant="default"
              size="sm"
              onClick={onResetSorting}
              className="gap-2 cursor-pointer"
            >
              <ArrowUpDown className="h-4 w-4" />
              Reset Ordinamento
              {sorting.length > 1 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {sorting.length}
                </span>
              )}
            </Button>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="default"
              size="sm"
              className="cursor-pointer"
              onClick={onResetFilters}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filtri
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Filter Groups */}
      {filterGroups.length > 0 && (
        <div className="flex flex-wrap items-center justify-between">
          {filterGroups.map((group) => (
            <div
              key={group.id}
              className="flex flex-wrap items-center gap-2 pt-2"
            >
              {/* Group label */}
              <div className="flex items-center text-sm font-medium text-muted-foreground">
                {group.icon && <span className="mr-2">{group.icon}</span>}
                {group.label}
              </div>

              {/* Filter options */}
              {group.options.map(({ value, label, color }) => (
                <Button
                  key={value ?? "all"}
                  variant={
                    group.activeValue === value ? "secondary" : "outline"
                  }
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => group.onChange(value)}
                >
                  {color && (
                    <span className={`mr-2 h-2 w-2 rounded-full ${color}`} />
                  )}
                  {label}
                </Button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
