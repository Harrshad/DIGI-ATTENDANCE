'use client';

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

export interface AssignableEmployee {
  id: string;
  name: string;
  code: string;
  department: string;
  role: string;
  avatarBg?: string;
}

export const MOCK_ASSIGNABLE_EMPLOYEES: AssignableEmployee[] = [
  { id: 'emp-1', name: 'Ravi Kumar', code: 'TRIL-4821', department: 'Engineering', role: 'Senior Frontend Dev', avatarBg: 'bg-blue-100 text-blue-700' },
  { id: 'emp-2', name: 'Priya Sharma', code: 'TRIL-4822', department: 'Engineering', role: 'Backend Engineer', avatarBg: 'bg-emerald-100 text-emerald-700' },
  { id: 'emp-3', name: 'Amit Patel', code: 'TRIL-4823', department: 'Product', role: 'Product Manager', avatarBg: 'bg-purple-100 text-purple-700' },
  { id: 'emp-4', name: 'Sneha Reddy', code: 'TRIL-4824', department: 'Design', role: 'UI/UX Designer', avatarBg: 'bg-pink-100 text-pink-700' },
  { id: 'emp-5', name: 'Vikram Singh', code: 'TRIL-4825', department: 'Operations', role: 'Site Specialist', avatarBg: 'bg-amber-100 text-amber-700' },
  { id: 'emp-6', name: 'Deepa Nair', code: 'TRIL-4826', department: 'Engineering', role: 'QA Engineer', avatarBg: 'bg-indigo-100 text-indigo-700' },
  { id: 'emp-7', name: 'Karthik Raja', code: 'TRIL-4827', department: 'DevOps', role: 'Cloud Engineer', avatarBg: 'bg-teal-100 text-teal-700' },
  { id: 'emp-8', name: 'Ananya Roy', code: 'TRIL-4828', department: 'HR', role: 'HR Business Partner', avatarBg: 'bg-rose-100 text-rose-700' },
];

interface EmployeePickerTableProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  employees?: AssignableEmployee[];
}

export const EmployeePickerTable: React.FC<EmployeePickerTableProps> = ({
  selectedIds,
  onChange,
  employees = MOCK_ASSIGNABLE_EMPLOYEES,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    const term = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(term) ||
        emp.code.toLowerCase().includes(term) ||
        emp.department.toLowerCase().includes(term) ||
        emp.role.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  const selectedEmployees = useMemo(() => {
    return employees.filter((emp) => selectedIds.includes(emp.id));
  }, [employees, selectedIds]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeSelected = (id: string) => {
    onChange(selectedIds.filter((item) => item !== id));
  };

  const isAllFilteredSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((emp) => selectedIds.includes(emp.id));

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredIdSet = new Set(filteredEmployees.map((e) => e.id));
      onChange(selectedIds.filter((id) => !filteredIdSet.has(id)));
    } else {
      const combined = Array.from(
        new Set([...selectedIds, ...filteredEmployees.map((e) => e.id)])
      );
      onChange(combined);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected chips row */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Selected Staff ({selectedIds.length})
          </label>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-red-600 hover:text-red-700 font-medium transition"
            >
              Clear all
            </button>
          )}
        </div>

        {selectedEmployees.length === 0 ? (
          <div className="text-xs text-gray-400 italic bg-gray-50 p-2.5 rounded-lg border border-dashed border-gray-200">
            No employees assigned yet. Select from the roster below.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 bg-gray-50 rounded-lg border border-gray-200">
            {selectedEmployees.map((emp) => (
              <span
                key={emp.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200"
              >
                <span>{emp.name}</span>
                <span className="text-brand-500 font-mono text-[11px]">({emp.code})</span>
                <button
                  type="button"
                  onClick={() => removeSelected(emp.id)}
                  aria-label={`Remove ${emp.name}`}
                  className="hover:bg-brand-200 rounded-full p-0.5 text-brand-700 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Search directory input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, ID, department, or role..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder-gray-400 transition"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Roster table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                    aria-label="Select all employees in view"
                  />
                </th>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No employees matching &ldquo;{searchTerm}&rdquo;
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isChecked = selectedIds.includes(emp.id);
                  const initials = emp.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => toggleSelect(emp.id)}
                      className={`cursor-pointer transition-colors ${
                        isChecked ? 'bg-brand-50/50 hover:bg-brand-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(emp.id)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              emp.avatarBg || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {initials}
                          </div>
                          <span>{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-600">{emp.code}</td>
                      <td className="py-2.5 px-3 text-gray-600">{emp.department}</td>
                      <td className="py-2.5 px-3 text-gray-500">{emp.role}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
