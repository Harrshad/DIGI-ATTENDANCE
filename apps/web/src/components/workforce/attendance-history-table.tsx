'use client';

import React, { useState, useMemo } from 'react';
import { AttendanceHistoryRecord } from '@triattendance/shared';
import { Lock, ArrowUpDown, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface AttendanceHistoryTableProps {
  records: AttendanceHistoryRecord[];
  totalRecordsCount?: number;
}

export const AttendanceHistoryTable: React.FC<AttendanceHistoryTableProps> = ({
  records,
  totalRecordsCount = 22,
}) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [records, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const renderStatusBadge = (status: AttendanceHistoryRecord['status']) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Present
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Late
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Absent
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden space-y-0">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Attendance History
          </h2>
          <span className="text-xs text-gray-500">
            Showing {sortedRecords.length} of {totalRecordsCount} recorded cycles
          </span>
        </div>

        {/* Read-only compliance badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
          <Lock className="w-3.5 h-3.5 text-gray-500" />
          <span>Read-only — Managers cannot edit records</span>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">
                <button
                  type="button"
                  onClick={toggleSort}
                  className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-semibold"
                >
                  <span>Date</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </th>
              <th className="py-3 px-4">Check-in</th>
              <th className="py-3 px-4">Check-out</th>
              <th className="py-3 px-4">Site</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {sortedRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3 px-4 text-gray-900 font-semibold whitespace-nowrap">
                  {record.date}
                </td>
                <td className="py-3 px-4 font-mono text-gray-800 whitespace-nowrap">
                  {record.checkInTime}
                </td>
                <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                  {record.checkOutTime || '—'}
                </td>
                <td className="py-3 px-4 text-gray-700 whitespace-nowrap font-medium">
                  {record.siteName}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {renderStatusBadge(record.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
