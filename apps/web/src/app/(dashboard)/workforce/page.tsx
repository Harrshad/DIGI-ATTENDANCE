'use client';

import React, { useState, useMemo } from 'react';
import { Users, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmployeeDirectoryItem } from '@triattendance/shared';
import {
  WorkforceFilters,
  WorkforceFilterState,
} from '@/components/workforce/workforce-filters';
import { WorkforceTable } from '@/components/workforce/workforce-table';

const MOCK_WORKFORCE_DATA: EmployeeDirectoryItem[] = [
  {
    id: 'emp-1',
    employeeCode: 'TRIL-4821',
    name: 'Ravi Kumar',
    department: 'Engineering',
    role: 'Senior Frontend Dev',
    reportingManagerId: 'mgr-1',
    reportingManagerName: 'Anita Menon',
    assignedSiteId: 'loc-1',
    assignedSiteCode: 'CHN-1',
    checkInTime: '09:02 AM',
    checkOutTime: '06:15 PM',
    status: 'Present',
  },
  {
    id: 'emp-2',
    employeeCode: 'TRIL-4822',
    name: 'Priya Sharma',
    department: 'Engineering',
    role: 'Backend Architect',
    reportingManagerId: 'mgr-1',
    reportingManagerName: 'Anita Menon',
    assignedSiteId: 'loc-1',
    assignedSiteCode: 'CHN-1',
    checkInTime: '09:14 AM',
    checkOutTime: '06:00 PM',
    status: 'Present',
  },
  {
    id: 'emp-3',
    employeeCode: 'TRIL-4823',
    name: 'Arun Das',
    department: 'Product',
    role: 'Technical Product Manager',
    reportingManagerId: 'mgr-2',
    reportingManagerName: 'Sarah Mitchell',
    assignedSiteId: 'loc-2',
    assignedSiteCode: 'BLR-1',
    checkInTime: '09:42 AM',
    checkOutTime: null,
    status: 'Late',
  },
  {
    id: 'emp-4',
    employeeCode: 'TRIL-4824',
    name: 'Nithya R',
    department: 'Operations',
    role: 'Site Coordinator',
    reportingManagerId: 'mgr-1',
    reportingManagerName: 'Anita Menon',
    assignedSiteId: 'loc-1',
    assignedSiteCode: 'CHN-1',
    checkInTime: null,
    checkOutTime: null,
    status: 'Absent',
  },
  {
    id: 'emp-5',
    employeeCode: 'TRIL-4825',
    name: 'Vikram T',
    department: 'DevOps',
    role: 'Site Reliability Engineer',
    reportingManagerId: 'mgr-2',
    reportingManagerName: 'Sarah Mitchell',
    assignedSiteId: 'loc-3',
    assignedSiteCode: 'BLR-3',
    checkInTime: '08:58 AM',
    checkOutTime: '05:30 PM',
    status: 'Present',
  },
  {
    id: 'emp-6',
    employeeCode: 'TRIL-4826',
    name: 'Sneha Patel',
    department: 'Design',
    role: 'Senior Product Designer',
    reportingManagerId: 'mgr-2',
    reportingManagerName: 'Sarah Mitchell',
    assignedSiteId: 'loc-2',
    assignedSiteCode: 'BLR-1',
    checkInTime: '09:15 AM',
    checkOutTime: null,
    status: 'Present',
  },
  {
    id: 'emp-7',
    employeeCode: 'TRIL-4827',
    name: 'Karthik Raja',
    department: 'Engineering',
    role: 'Cloud Systems Engineer',
    reportingManagerId: 'mgr-1',
    reportingManagerName: 'Anita Menon',
    assignedSiteId: 'loc-1',
    assignedSiteCode: 'CHN-1',
    checkInTime: '09:05 AM',
    checkOutTime: '06:10 PM',
    status: 'Present',
  },
  {
    id: 'emp-8',
    employeeCode: 'TRIL-4828',
    name: 'Ananya Roy',
    department: 'People Operations',
    role: 'HR Specialist',
    reportingManagerId: 'mgr-2',
    reportingManagerName: 'Sarah Mitchell',
    assignedSiteId: 'loc-4',
    assignedSiteCode: 'HYD-2',
    checkInTime: null,
    checkOutTime: null,
    status: 'Absent',
  },
  {
    id: 'emp-9',
    employeeCode: 'TRIL-4829',
    name: 'Vikram Malhotra',
    department: 'Engineering',
    role: 'QA Automation Lead',
    reportingManagerId: 'mgr-2',
    reportingManagerName: 'Sarah Mitchell',
    assignedSiteId: 'loc-4',
    assignedSiteCode: 'HYD-2',
    checkInTime: '09:00 AM',
    checkOutTime: null,
    status: 'Present',
  },
  {
    id: 'emp-10',
    employeeCode: 'TRIL-4830',
    name: 'Anita Desai',
    department: 'Finance',
    role: 'Senior Analyst',
    reportingManagerId: 'mgr-1',
    reportingManagerName: 'Anita Menon',
    assignedSiteId: 'loc-1',
    assignedSiteCode: 'CHN-1',
    checkInTime: '09:48 AM',
    checkOutTime: '06:30 PM',
    status: 'Late',
  },
  {
    id: 'emp-11',
    employeeCode: 'TRIL-4831',
    name: 'Rahul Mehra',
    department: 'Support',
    role: 'Technical Lead',
    reportingManagerId: 'mgr-2',
    reportingManagerName: 'Sarah Mitchell',
    assignedSiteId: 'loc-3',
    assignedSiteCode: 'BLR-3',
    checkInTime: '08:50 AM',
    checkOutTime: null,
    status: 'Present',
  },
  {
    id: 'emp-12',
    employeeCode: 'TRIL-4832',
    name: 'Deepa Nair',
    department: 'Engineering',
    role: 'Frontend Engineer',
    reportingManagerId: 'mgr-1',
    reportingManagerName: 'Anita Menon',
    assignedSiteId: 'loc-1',
    assignedSiteCode: 'CHN-1',
    checkInTime: '09:20 AM',
    checkOutTime: '06:05 PM',
    status: 'Present',
  },
];

const INITIAL_FILTERS: WorkforceFilterState = {
  search: '',
  exception: 'all',
  checkInStatus: 'all',
  locationMismatch: 'all',
  status: 'all',
  site: 'all',
};

export default function WorkforceDirectoryPage() {
  const [filters, setFilters] = useState<WorkforceFilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalEmployeesInOrg = 207; // Total roster count matching employee-directory.png

  const filteredEmployees = useMemo(() => {
    return MOCK_WORKFORCE_DATA.filter((emp) => {
      // Search term
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matches =
          emp.name.toLowerCase().includes(query) ||
          emp.employeeCode.toLowerCase().includes(query) ||
          emp.reportingManagerName.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Check-in status
      if (filters.checkInStatus === 'checked_in' && !emp.checkInTime) return false;
      if (filters.checkInStatus === 'checked_out' && !emp.checkOutTime) return false;
      if (filters.checkInStatus === 'not_checked_in' && emp.checkInTime) return false;

      // Status
      if (filters.status !== 'all' && emp.status !== filters.status) return false;

      // Site
      if (filters.site !== 'all' && emp.assignedSiteCode !== filters.site) return false;

      return true;
    });
  }, [filters]);

  const totalPages = Math.ceil(totalEmployeesInOrg / pageSize);
  const displayedEmployees = filteredEmployees.slice(0, pageSize);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            Workforce Directory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Active employee roster across assigned enterprise sites ({totalEmployeesInOrg} total employees)
          </p>
        </div>
      </div>

      {/* 5 Dropdown Filters + Search */}
      <WorkforceFilters
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Workforce Roster Table */}
      <WorkforceTable employees={displayedEmployees} />

      {/* Numbered Pagination matching employee-directory.png */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1">
        <span className="text-xs text-gray-500 font-medium">
          Showing 1–{displayedEmployees.length} of {totalEmployeesInOrg} employees
        </span>

        <div className="flex items-center gap-1.5" aria-label="Pagination">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            className={`w-8 h-8 rounded-lg text-xs font-semibold ${
              currentPage === 1
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button
            type="button"
            className={`w-8 h-8 rounded-lg text-xs font-semibold ${
              currentPage === 2
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button
            type="button"
            className={`w-8 h-8 rounded-lg text-xs font-semibold ${
              currentPage === 3
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setCurrentPage(3)}
          >
            3
          </button>
          <span className="text-gray-400 px-1 text-xs">...</span>
          <button
            type="button"
            className={`w-8 h-8 rounded-lg text-xs font-semibold ${
              currentPage === totalPages
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </button>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom HR Advisory Note matching employee-directory.png */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3 text-xs text-gray-600">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-gray-800">HR Advisory:</strong> Account manager access
          provides read-only oversight for workforce attendance and geofence verification. Shifts,
          leave approvals, and employee profile alterations are managed exclusively through HR Central.
        </p>
      </div>
    </div>
  );
}
