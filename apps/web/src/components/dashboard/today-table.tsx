'use client';

import React from 'react';
import Link from 'next/link';
import { TodayAttendanceItem } from '@triattendance/shared';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface TodayTableProps {
  items: TodayAttendanceItem[];
}

export const TodayTable: React.FC<TodayTableProps> = ({ items }) => {
  const getStatusBadge = (status: string, isOutside?: boolean) => {
    if (isOutside || status === 'Rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Rejected
        </span>
      );
    }
    if (status === 'Late') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Late
        </span>
      );
    }
    if (status === 'Absent') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          Absent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Present
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            Today&apos;s team attendance
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time check-in log for your direct reports
          </p>
        </div>
        <div className="text-xs text-gray-400 font-medium">
          Showing {items.length} records
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-6">Employee</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Check-in</th>
              <th className="py-3 px-6">Check-out</th>
              <th className="py-3 px-6">Site</th>
              <th className="py-3 px-6">Reporting supervisor</th>
              <th className="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3.5 px-6">
                  <Link
                    href={`/workforce/${row.employeeId}`}
                    className="group block"
                  >
                    <span className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                      {row.employeeName}
                    </span>
                    <span className="block text-xs text-gray-400">
                      {row.employeeCode}
                    </span>
                  </Link>
                </td>
                <td className="py-3.5 px-6 text-gray-600 font-medium">
                  {row.date}
                </td>
                <td className="py-3.5 px-6 text-gray-900 font-medium">
                  {row.checkInTime}
                </td>
                <td className="py-3.5 px-6 text-gray-500 font-medium">
                  {row.checkOutTime}
                </td>
                <td className="py-3.5 px-6">
                  {row.isOutsideBoundary ? (
                    <span className="inline-flex items-center gap-1.5 text-rose-600 font-medium text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Outside boundary
                    </span>
                  ) : (
                    <span className="text-gray-700 font-medium text-xs">
                      {row.siteName}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-6 text-gray-600 text-xs">
                  {row.reportingSupervisor}
                </td>
                <td className="py-3.5 px-6">
                  {getStatusBadge(row.status, row.isOutsideBoundary)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching AM 02 */}
      <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">
          Showing 1 to {items.length} of 14 direct reports
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled
            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
