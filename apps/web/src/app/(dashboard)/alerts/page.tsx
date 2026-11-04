'use client';

import React, { useState, useMemo } from 'react';
import { ExceptionQueueItem } from '@triattendance/shared';
import { AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertsTabs, AlertTabFilter } from '@/components/alerts/alerts-tabs';
import { AlertsTable } from '@/components/alerts/alerts-table';

const MOCK_EXCEPTIONS: ExceptionQueueItem[] = [
  {
    id: 'exc-1',
    attendanceRecordId: 'att-101',
    employeeId: 'emp-1',
    employeeCode: 'TRIL-4821',
    employeeName: 'Ravi Kumar',
    initials: 'RK',
    date: '21 Aug 2026',
    checkInTime: '09:02 AM',
    checkOutTime: '06:15 PM',
    siteName: 'CHN-1',
    status: 'Rejected',
    type: 'GEOFENCE',
    isOutsideBoundary: true,
  },
  {
    id: 'exc-2',
    attendanceRecordId: 'att-102',
    employeeId: 'emp-4',
    employeeCode: 'TRIL-4829',
    employeeName: 'Sneha Patel',
    initials: 'SP',
    date: '21 Aug 2026',
    checkInTime: '09:15 AM',
    checkOutTime: '—',
    siteName: 'BLR-1',
    status: 'Flagged',
    type: 'LIVENESS',
    isOutsideBoundary: false,
  },
  {
    id: 'exc-3',
    attendanceRecordId: 'att-103',
    employeeId: 'emp-5',
    employeeCode: 'TRIL-4830',
    employeeName: 'Vikram Malhotra',
    initials: 'VM',
    date: '20 Aug 2026',
    checkInTime: '09:00 AM',
    checkOutTime: '—',
    siteName: 'HYD-2',
    status: 'Pending',
    type: 'MISSING_CHECKOUT',
    isOutsideBoundary: false,
  },
  {
    id: 'exc-4',
    attendanceRecordId: 'att-104',
    employeeId: 'emp-6',
    employeeCode: 'TRIL-4831',
    employeeName: 'Anita Desai',
    initials: 'AD',
    date: '20 Aug 2026',
    checkInTime: '09:45 AM',
    checkOutTime: '06:30 PM',
    siteName: 'CHN-1',
    status: 'Flagged',
    type: 'GEOFENCE',
    isOutsideBoundary: true,
  },
  {
    id: 'exc-5',
    attendanceRecordId: 'att-105',
    employeeId: 'emp-7',
    employeeCode: 'TRIL-4832',
    employeeName: 'Rahul Mehra',
    initials: 'RM',
    date: '19 Aug 2026',
    checkInTime: '08:55 AM',
    checkOutTime: '—',
    siteName: 'BLR-3',
    status: 'Pending',
    type: 'MISSING_CHECKOUT',
    isOutsideBoundary: false,
  },
];

export default function AlertsQueuePage() {
  const [activeTab, setActiveTab] = useState<AlertTabFilter>('ALL');
  const [items] = useState<ExceptionQueueItem[]>(MOCK_EXCEPTIONS);

  const counts: Record<AlertTabFilter, number> = useMemo(() => {
    return {
      ALL: items.length,
      GEOFENCE: items.filter((i) => i.type === 'GEOFENCE').length,
      LIVENESS: items.filter((i) => i.type === 'LIVENESS').length,
      MISSING_CHECKOUT: items.filter((i) => i.type === 'MISSING_CHECKOUT').length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'ALL') return items;
    return items.filter((item) => item.type === activeTab);
  }, [items, activeTab]);

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'ID,Employee,Code,Date,Check-in,Check-out,Site,Status,Type',
        ...filteredItems.map(
          (i) =>
            `${i.id},"${i.employeeName}",${i.employeeCode},${i.date},${i.checkInTime},${i.checkOutTime},${i.siteName},${i.status},${i.type}`
        ),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `triattendance_alerts_${activeTab.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Alerts
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Review flagged check-ins, geofence breaches, and liveness verification exceptions
          </p>
        </div>

        {/* Export Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2 self-start sm:self-auto font-semibold"
        >
          <Download className="w-4 h-4 text-gray-600" />
          <span>Export</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <AlertsTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />

      {/* Exceptions Table */}
      <AlertsTable items={filteredItems} />
    </div>
  );
}
