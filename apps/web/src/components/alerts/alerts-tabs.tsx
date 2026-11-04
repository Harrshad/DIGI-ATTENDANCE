'use client';

import React from 'react';

export type AlertTabFilter = 'ALL' | 'GEOFENCE' | 'LIVENESS' | 'MISSING_CHECKOUT';

interface TabItem {
  id: AlertTabFilter;
  label: string;
  count: number;
}

interface AlertsTabsProps {
  activeTab: AlertTabFilter;
  onChange: (tab: AlertTabFilter) => void;
  counts: Record<AlertTabFilter, number>;
}

export const AlertsTabs: React.FC<AlertsTabsProps> = ({
  activeTab,
  onChange,
  counts,
}) => {
  const tabs: TabItem[] = [
    { id: 'ALL', label: 'All open', count: counts.ALL },
    { id: 'GEOFENCE', label: 'Geofence', count: counts.GEOFENCE },
    { id: 'LIVENESS', label: 'Liveness', count: counts.LIVENESS },
    { id: 'MISSING_CHECKOUT', label: 'Missing check-out', count: counts.MISSING_CHECKOUT },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Alert queue filters">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
              isActive
                ? 'bg-gray-900 text-white shadow-gray-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
