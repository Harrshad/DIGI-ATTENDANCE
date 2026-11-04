'use client';

import React from 'react';
import { EmployeePerformanceKPISummary } from '@triattendance/shared';
import { CalendarCheck, Clock, AlertCircle, Timer } from 'lucide-react';

interface EmployeeKPIsProps {
  kpis: EmployeePerformanceKPISummary;
}

export const EmployeeKPIs: React.FC<EmployeeKPIsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Attendance Rate */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-gray-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Attendance Rate</span>
          <CalendarCheck className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">
            {kpis.attendanceRatePercent}%
          </span>
          <span className="text-xs font-medium text-emerald-600">
            +{kpis.attendanceRateDeltaVsLastMonth}% vs last month
          </span>
        </div>
        <p className="text-[11px] text-gray-400">Past 30 calendar days</p>
      </div>

      {/* 2. Late Arrivals */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-gray-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Late Arrivals</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">
            {kpis.lateArrivalsCount}
          </span>
          <span className="text-xs font-medium text-gray-500">
            Arrived after 09:30 AM IST
          </span>
        </div>
        <p className="text-[11px] text-gray-400">Recorded within current cycle</p>
      </div>

      {/* 3. Exceptions Raised */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-gray-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Exceptions Raised</span>
          <AlertCircle className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">
            {kpis.exceptionsRaisedCount}
          </span>
          <span className="text-xs font-medium text-emerald-600">
            {kpis.exceptionsRaisedCount === 0 ? 'No open flags' : 'Requires review'}
          </span>
        </div>
        <p className="text-[11px] text-gray-400">Geofence or liveness alerts</p>
      </div>

      {/* 4. Avg Hours / Day */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-gray-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Avg Hours / Day</span>
          <Timer className="w-4 h-4 text-brand-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">
            {kpis.avgHoursPerDay}
          </span>
          <span className="text-xs font-medium text-gray-500">
            Across {kpis.recordedDaysCount} days
          </span>
        </div>
        <p className="text-[11px] text-gray-400">Calculated from check-in to check-out</p>
      </div>
    </div>
  );
};
