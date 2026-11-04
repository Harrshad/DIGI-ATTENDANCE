'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, User, Building, CheckCircle2 } from 'lucide-react';
import {
  EmployeePerformanceKPISummary,
  AttendanceHistoryRecord,
} from '@triattendance/shared';
import { EmployeeKPIs } from '@/components/workforce/employee-kpis';
import { AttendanceHistoryTable } from '@/components/workforce/attendance-history-table';

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  // Realistic mock matching AM 05 · Employee detail.png
  const [employee] = useState({
    id: id || 'emp-1',
    name: 'Ravi Kumar',
    employeeCode: 'TRIL-4821',
    siteCode: 'CHN-1',
    reportingManagerName: 'Anita Menon',
    status: 'Present',
    department: 'Engineering',
    role: 'Senior Frontend Dev',
  });

  const [kpis] = useState<EmployeePerformanceKPISummary>({
    attendanceRatePercent: 96,
    attendanceRateDeltaVsLastMonth: 2,
    totalEmployeesInOrg: 207,
    lateArrivalsCount: 1,
    exceptionsRaisedCount: 0,
    avgHoursPerDay: '08h 41m',
    recordedDaysCount: 22,
  });

  const [history] = useState<AttendanceHistoryRecord[]>([
    {
      id: 'rec-1',
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      date: '25 Aug 2026',
      checkInTime: '09:02 AM',
      checkOutTime: '06:15 PM',
      siteName: 'CHN-1',
      status: 'Present',
    },
    {
      id: 'rec-2',
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      date: '24 Aug 2026',
      checkInTime: '09:12 AM',
      checkOutTime: '06:08 PM',
      siteName: 'CHN-1',
      status: 'Present',
    },
    {
      id: 'rec-3',
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      date: '23 Aug 2026',
      checkInTime: '09:38 AM',
      checkOutTime: '06:22 PM',
      siteName: 'CHN-1',
      status: 'Late',
    },
    {
      id: 'rec-4',
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      date: '22 Aug 2026',
      checkInTime: '08:58 AM',
      checkOutTime: '05:45 PM',
      siteName: 'CHN-1',
      status: 'Present',
    },
    {
      id: 'rec-5',
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: employee.name,
      date: '21 Aug 2026',
      checkInTime: '09:04 AM',
      checkOutTime: '06:01 PM',
      siteName: 'CHN-1',
      status: 'Present',
    },
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top back navigation */}
      <div>
        <Link
          href="/workforce"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to workforce</span>
        </Link>
      </div>

      {/* Employee Header Card matching AM 05 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shadow-inner">
            RK
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900">{employee.name}</h1>
              <span className="text-xs font-mono text-gray-400">({employee.employeeCode})</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                {employee.siteCode}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                Reports to: <strong className="text-gray-700">{employee.reportingManagerName}</strong>
              </span>
              <span>•</span>
              <span className="text-gray-400">
                {employee.role} ({employee.department})
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {employee.status}
          </span>
        </div>
      </div>

      {/* 4 30-Day KPI Cards */}
      <EmployeeKPIs kpis={kpis} />

      {/* Read-Only Attendance History */}
      <AttendanceHistoryTable records={history} totalRecordsCount={kpis.recordedDaysCount} />
    </div>
  );
}
