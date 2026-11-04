'use client';

import React from 'react';
import Link from 'next/link';
import { EmployeeDirectoryItem } from '@triattendance/shared';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ChevronRight } from 'lucide-react';

interface WorkforceTableProps {
  employees: EmployeeDirectoryItem[];
}

export const WorkforceTable: React.FC<WorkforceTableProps> = ({ employees }) => {
  const renderStatusBadge = (status: EmployeeDirectoryItem['status']) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Present
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Late
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Absent
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarBg = (name: string) => {
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
      'bg-teal-100 text-teal-700',
    ];
    return colors[sum % colors.length];
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">No employees match these filters</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          Try clearing or adjusting your search term and filter selections.
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
              <th className="py-3.5 px-4">Employee ID</th>
              <th className="py-3.5 px-4">Reporting Manager</th>
              <th className="py-3.5 px-4">Assigned Site</th>
              <th className="py-3.5 px-4">Check-in</th>
              <th className="py-3.5 px-4">Check-out</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {employees.map((emp) => {
              const initials = getInitials(emp.name);
              const avatarClass = getAvatarBg(emp.name);

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                >
                  {/* Employee Name & Role */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/workforce/${emp.id}`}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatarClass}`}
                      >
                        {initials}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 group-hover:text-brand-600 transition block">
                          {emp.name}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {emp.role} • {emp.department}
                        </span>
                      </div>
                    </Link>
                  </td>

                  {/* Employee ID */}
                  <td className="py-3.5 px-4 font-mono text-gray-700 whitespace-nowrap">
                    {emp.employeeCode}
                  </td>

                  {/* Reporting Manager */}
                  <td className="py-3.5 px-4 text-gray-800 whitespace-nowrap">
                    {emp.reportingManagerName}
                  </td>

                  {/* Assigned Site */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">{emp.assignedSiteCode}</span>
                  </td>

                  {/* Check-in */}
                  <td className="py-3.5 px-4 font-mono text-gray-800 whitespace-nowrap">
                    {emp.checkInTime || '—'}
                  </td>

                  {/* Check-out */}
                  <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap">
                    {emp.checkOutTime || '—'}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(emp.status)}
                  </td>

                  {/* Action Link */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <Link
                      href={`/workforce/${emp.id}`}
                      className="p-1 rounded-md text-gray-400 hover:text-brand-600 hover:bg-gray-100 transition inline-flex items-center"
                      aria-label={`View details for ${emp.name}`}
                    >
                      <ChevronRight className="w-4 h-4" />
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
