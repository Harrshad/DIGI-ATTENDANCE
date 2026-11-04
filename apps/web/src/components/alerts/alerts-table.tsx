'use client';

import React from 'react';
import Link from 'next/link';
import { ExceptionQueueItem } from '@triattendance/shared';
import { MapPin, AlertTriangle, Clock, ChevronRight } from 'lucide-react';

interface AlertsTableProps {
  items: ExceptionQueueItem[];
}

export const AlertsTable: React.FC<AlertsTableProps> = ({ items }) => {
  const renderStatusBadge = (status: ExceptionQueueItem['status']) => {
    switch (status) {
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            Rejected
          </span>
        );
      case 'Flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Flagged
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Pending
          </span>
        );
    }
  };

  const getAvatarBg = (initials: string) => {
    const charCode = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700',
      'bg-rose-100 text-rose-700',
    ];
    return colors[charCode % colors.length];
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">No alerts in this category</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          All exception flags in this queue have been resolved or escalated.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Check-in</th>
              <th className="py-3.5 px-4">Check-out</th>
              <th className="py-3.5 px-4">Site</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {items.map((item) => {
              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  {/* Employee */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(
                          item.initials
                        )}`}
                      >
                        {item.initials}
                      </div>
                      <div>
                        <Link
                          href={`/alerts/${item.id}`}
                          className="font-semibold text-gray-900 group-hover:text-brand-600 transition"
                        >
                          {item.employeeName}
                        </Link>
                        <span className="block text-[11px] text-gray-400 font-mono">
                          {item.employeeCode}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                    {item.date}
                  </td>

                  {/* Check-in */}
                  <td className="py-3.5 px-4 font-mono text-gray-800 whitespace-nowrap">
                    {item.checkInTime}
                  </td>

                  {/* Check-out */}
                  <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap">
                    {item.checkOutTime || '—'}
                  </td>

                  {/* Site */}
                  <td className="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">{item.siteName}</span>
                    {item.isOutsideBoundary && (
                      <span className="block text-[10px] text-red-600 font-medium">
                        Outside geofence
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(item.status)}
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      href={`/alerts/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 transition"
                    >
                      <span>Review</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
