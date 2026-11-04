'use client';

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface WorkforceFilterState {
  search: string;
  exception: string;
  checkInStatus: string;
  locationMismatch: string;
  status: string;
  site: string;
}

interface WorkforceFiltersProps {
  filters: WorkforceFilterState;
  onChange: (filters: WorkforceFilterState) => void;
  onReset: () => void;
}

export const WorkforceFilters: React.FC<WorkforceFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const updateField = (field: keyof WorkforceFilterState, value: string) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.exception !== 'all' ||
    filters.checkInStatus !== 'all' ||
    filters.locationMismatch !== 'all' ||
    filters.status !== 'all' ||
    filters.site !== 'all';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3.5">
      {/* Top search input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => updateField('search', e.target.value)}
          placeholder="Search employees by name, employee code (TRIL-xxxx), or manager..."
          className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white placeholder-gray-400 transition"
        />
      </div>

      {/* 5 Dropdowns + Clear filters button */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {/* 1. Exceptions */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Exceptions
          </label>
          <select
            value={filters.exception}
            onChange={(e) => updateField('exception', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            <option value="all">All Exceptions</option>
            <option value="has_exception">Has Open Flag</option>
            <option value="geofence">Geofence Mismatch</option>
            <option value="liveness">Liveness Flag</option>
          </select>
        </div>

        {/* 2. Check-in Status */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Check-in
          </label>
          <select
            value={filters.checkInStatus}
            onChange={(e) => updateField('checkInStatus', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            <option value="all">All Check-ins</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="not_checked_in">Not Checked In</option>
          </select>
        </div>

        {/* 3. Location Mismatch */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Boundary
          </label>
          <select
            value={filters.locationMismatch}
            onChange={(e) => updateField('locationMismatch', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            <option value="all">All Boundaries</option>
            <option value="inside">Within Boundary</option>
            <option value="outside">Outside Boundary</option>
          </select>
        </div>

        {/* 4. Status */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateField('status', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* 5. Assigned Site */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Assigned Site
          </label>
          <select
            value={filters.site}
            onChange={(e) => updateField('site', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
          >
            <option value="all">All Sites</option>
            <option value="CHN-1">CHN-1 (Chennai)</option>
            <option value="BLR-1">BLR-1 (Bangalore)</option>
            <option value="BLR-3">BLR-3 (Bangalore)</option>
            <option value="HYD-2">HYD-2 (Hyderabad)</option>
          </select>
        </div>

        {/* Clear Filters Action */}
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="w-full gap-1.5 text-xs text-gray-600 hover:text-gray-900 border-gray-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
