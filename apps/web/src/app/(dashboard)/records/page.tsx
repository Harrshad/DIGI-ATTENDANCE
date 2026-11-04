'use client';

import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { RecentDownloadItem } from '@triattendance/shared';
import { DownloadRecordForm } from '@/components/records/download-record-form';
import { RecentDownloadsList } from '@/components/records/recent-downloads-list';

const INITIAL_RECENT_DOWNLOADS: RecentDownloadItem[] = [
  {
    id: 'dl-1',
    title: 'August 2026 · BLR-3',
    generatedDate: '26 Aug',
    rowCount: 812,
    fileFormat: 'CSV',
    downloadUrl: '/api/reports/download/dl-1',
  },
  {
    id: 'dl-2',
    title: 'July 2026 · CHN-1',
    generatedDate: '31 Jul',
    rowCount: 1240,
    fileFormat: 'CSV',
    downloadUrl: '/api/reports/download/dl-2',
  },
  {
    id: 'dl-3',
    title: 'Q2 2026 Audit Summary',
    generatedDate: '15 Jul',
    rowCount: 3450,
    fileFormat: 'PDF',
    downloadUrl: '/api/reports/download/dl-3',
  },
];

export default function RecordsPage() {
  const [recentDownloads, setRecentDownloads] = useState<RecentDownloadItem[]>(
    INITIAL_RECENT_DOWNLOADS
  );

  const handleNewJob = (newJob: RecentDownloadItem) => {
    setRecentDownloads((prev) => [newJob, ...prev]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-brand-600" />
          Records
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Generate scoped attendance exports and download historical compliance logs
        </p>
      </div>

      {/* Download Record Form */}
      <DownloadRecordForm onExportSubmitted={handleNewJob} />

      {/* Recent Downloads List */}
      <RecentDownloadsList downloads={recentDownloads} />
    </div>
  );
}
