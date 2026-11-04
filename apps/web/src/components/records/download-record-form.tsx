'use client';

import React, { useState, useMemo } from 'react';
import { Download, Calendar, MapPin, Users, Filter, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadRecordSchema, RecentDownloadItem } from '@triattendance/shared';

interface DownloadRecordFormProps {
  onExportSubmitted?: (newJob: RecentDownloadItem) => void;
}

export const DownloadRecordForm: React.FC<DownloadRecordFormProps> = ({
  onExportSubmitted,
}) => {
  const [formData, setFormData] = useState({
    dateRangeStart: '2026-08-01',
    dateRangeEnd: '2026-08-25',
    locationId: 'all',
    employeeScope: 'all',
    status: 'all',
    format: 'CSV' as 'CSV' | 'PDF',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Dynamic row estimation based on selected inputs
  const estimatedInfo = useMemo(() => {
    let base = 670;
    if (formData.locationId === 'all') base *= 2; // 1,340
    if (formData.status !== 'all') base = Math.round(base * 0.7);
    if (formData.employeeScope !== 'all') base = Math.round(base * 0.15);

    const locationsCount = formData.locationId === 'all' ? 2 : 1;
    return {
      rows: base,
      locations: locationsCount,
    };
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = downloadRecordSchema.safeParse(formData);
    if (!parseResult.success) {
      alert('Please fill out all required date ranges');
      return;
    }

    setIsSubmitting(true);
    setSuccess(null);

    try {
      await new Promise((res) => setTimeout(res, 600));

      const locationLabel =
        formData.locationId === 'all' ? 'All Managed Sites' : formData.locationId;
      const jobItem: RecentDownloadItem = {
        id: `job-${Date.now()}`,
        title: `August 2026 · ${locationLabel}`,
        generatedDate: 'Just now',
        rowCount: estimatedInfo.rows,
        fileFormat: formData.format,
        downloadUrl: `/api/reports/download/job-${Date.now()}`,
      };

      onExportSubmitted?.(jobItem);
      setSuccess(`Export ready: ${jobItem.title} (${jobItem.rowCount.toLocaleString()} rows)`);
    } catch {
      alert('Failed to generate attendance record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5"
    >
      <div className="border-b border-gray-100 pb-3">
        <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Download className="w-5 h-5 text-brand-600" />
          Download an Attendance Record
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Covers only the sites and workforce teams you manage
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date Range Start & End */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Date Range Start</span>
          </label>
          <input
            type="date"
            value={formData.dateRangeStart}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dateRangeStart: e.target.value }))
            }
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Date Range End</span>
          </label>
          <input
            type="date"
            value={formData.dateRangeEnd}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dateRangeEnd: e.target.value }))
            }
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>

        {/* Location Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>Location</span>
          </label>
          <select
            value={formData.locationId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, locationId: e.target.value }))
            }
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="all">All Managed Sites (CHN-1, BLR-3)</option>
            <option value="CHN-1">CHN-1 (Guindy, Chennai)</option>
            <option value="BLR-3">BLR-3 (CV Raman Nagar, Bangalore)</option>
          </select>
        </div>

        {/* Employees Scope Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span>Employees Scope</span>
          </label>
          <select
            value={formData.employeeScope}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, employeeScope: e.target.value }))
            }
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="all">All Workforce in Scope (207 employees)</option>
            <option value="direct_reports">Direct Reports Only (14 employees)</option>
            <option value="engineering">Engineering Department</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Attendance Status</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="all">All Statuses (Present, Late, Absent, Exceptions)</option>
            <option value="PRESENT">Present only</option>
            <option value="LATE">Late only</option>
            <option value="ABSENT">Absent only</option>
            <option value="FLAGGED">Flagged & Exceptions only</option>
          </select>
        </div>

        {/* Format */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Export Format
          </label>
          <div className="flex items-center gap-3 h-10">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="CSV"
                checked={formData.format === 'CSV'}
                onChange={() => setFormData((prev) => ({ ...prev, format: 'CSV' }))}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span>CSV (Standard)</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="PDF"
                checked={formData.format === 'PDF'}
                onChange={() => setFormData((prev) => ({ ...prev, format: 'PDF' }))}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span>PDF (Audit Report)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Dynamic estimated row counter & Download action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-gray-100">
        <div>
          <span className="text-xs text-gray-500">Estimated export size:</span>
          <p className="text-sm font-bold text-gray-900">
            Estimated {estimatedInfo.rows.toLocaleString()} rows across{' '}
            {estimatedInfo.locations} location{estimatedInfo.locations === 1 ? '' : 's'}
          </p>
        </div>

        <Button
          type="submit"
          size="md"
          disabled={isSubmitting}
          className="gap-2 font-semibold min-w-[160px]"
        >
          <Download className="w-4 h-4" />
          <span>{isSubmitting ? 'Generating...' : 'Download Record'}</span>
        </Button>
      </div>
    </form>
  );
};
