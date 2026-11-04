'use client';

import React, { useState } from 'react';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { TodayTable } from '@/components/dashboard/today-table';
import { TodayAttendanceItem } from '@triattendance/shared';
import { Filter, ChevronDown } from 'lucide-react';

export default function OverviewPage() {
  const [selectedSite, setSelectedSite] = useState('All sites');
  const [selectedTeam, setSelectedTeam] = useState('All teams');

  // Realistic seed mock matching Figma AM 02 screenshot rows
  const [items] = useState<TodayAttendanceItem[]>([
    {
      id: '1',
      employeeId: 'emp-1',
      employeeCode: 'TRIL-4821',
      employeeName: 'Ravi Kumar',
      date: '25 Aug 2026',
      checkInTime: '09:12',
      checkOutTime: '18:05',
      siteName: 'CHN-1',
      reportingSupervisor: 'Priya S',
      status: 'Present',
      isOutsideBoundary: false,
    },
    {
      id: '2',
      employeeId: 'emp-2',
      employeeCode: 'TRIL-3104',
      employeeName: 'Priya S',
      date: '25 Aug 2026',
      checkInTime: '09:28',
      checkOutTime: '18:15',
      siteName: 'CHN-1',
      reportingSupervisor: 'Self',
      status: 'Present',
      isOutsideBoundary: false,
    },
    {
      id: '3',
      employeeId: 'emp-3',
      employeeCode: 'TRIL-9201',
      employeeName: 'Arun Das',
      date: '25 Aug 2026',
      checkInTime: '09:34',
      checkOutTime: '—',
      siteName: 'Outside boundary',
      reportingSupervisor: 'Priya S',
      status: 'Rejected',
      isOutsideBoundary: true,
    },
    {
      id: '4',
      employeeId: 'emp-4',
      employeeCode: 'TRIL-5512',
      employeeName: 'Sneha Patel',
      date: '25 Aug 2026',
      checkInTime: '09:41',
      checkOutTime: '—',
      siteName: 'BLR-3',
      reportingSupervisor: 'Anita Menon',
      status: 'Late',
      isOutsideBoundary: false,
    },
    {
      id: '5',
      employeeId: 'emp-5',
      employeeCode: 'TRIL-6023',
      employeeName: 'Karthik Raja',
      date: '25 Aug 2026',
      checkInTime: '—',
      checkOutTime: '—',
      siteName: 'CHN-1',
      reportingSupervisor: 'Priya S',
      status: 'Absent',
      isOutsideBoundary: false,
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Top Title & Filters Bar matching AM 02 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Team today
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time field attendance & site compliance monitoring
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2.5">
          {/* Site Filter */}
          <div className="relative">
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer shadow-sm"
            >
              <option value="All sites">All sites</option>
              <option value="CHN-1">CHN-1 (Chennai)</option>
              <option value="BLR-3">BLR-3 (Bangalore)</option>
              <option value="HYD-2">HYD-2 (Hyderabad)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Team Filter */}
          <div className="relative">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer shadow-sm"
            >
              <option value="All teams">All teams</option>
              <option value="Operations">Operations</option>
              <option value="Engineering">Engineering</option>
              <option value="Quality">Quality Assurance</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Filters</span>
          </div>
        </div>
      </div>

      {/* 4 Colored KPI Cards */}
      <KPICards
        presentToday={202}
        totalEmployees={250}
        lateToday={2}
        absentToday={5}
        needsReviewCount={3}
      />

      {/* Today's Table */}
      <TodayTable items={items} />
    </div>
  );
}
