import React from 'react';
import { UserCheck, Clock, UserX, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface KPICardsProps {
  presentToday: number;
  totalEmployees: number;
  lateToday: number;
  absentToday: number;
  needsReviewCount: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  presentToday = 202,
  totalEmployees = 250,
  lateToday = 2,
  absentToday = 5,
  needsReviewCount = 3,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Present Today Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Present today
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900">{presentToday}</span>
            <span className="text-sm font-medium text-gray-400">/{totalEmployees}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+1 vs yesterday</span>
          </div>
        </div>
      </div>

      {/* 2. Late Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Late
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-gray-900">{lateToday}</div>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            After 09:30 AM cutoff
          </p>
        </div>
      </div>

      {/* 3. Absent Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Absent
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <UserX className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold text-gray-900">{absentToday}</div>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            No check-in recorded
          </p>
        </div>
      </div>

      {/* 4. Needs Review Card (Interactive link to Alerts queue) */}
      <Link href="/alerts" className="block group">
        <div className="bg-white p-5 rounded-2xl border border-brand-200 bg-brand-50/20 group-hover:border-brand-400 transition-all shadow-sm flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
              Needs review
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-brand-900">{needsReviewCount}</div>
            <p className="text-xs text-brand-600 mt-1 font-medium">
              Oldest: 2d ago · Review now &rarr;
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};
