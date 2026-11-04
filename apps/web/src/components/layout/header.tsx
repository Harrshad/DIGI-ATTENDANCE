'use client';

import React, { useState } from 'react';
import { Search, Bell, Download, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NotificationDrawer,
  NotificationItem,
} from './notification-drawer';
import Link from 'next/link';

export const Header: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Geofence Exception Detected',
      message: 'Arun Das (TRIL-9201) attempted check-in 900m outside CHN-1 boundary.',
      type: 'EXCEPTION_RAISED',
      read: false,
      createdAt: '10m ago',
      linkUrl: '/alerts',
    },
    {
      id: '2',
      title: 'Monthly Report Generated',
      message: 'Your requested report "August 2026 · BLR-3" is ready for download.',
      type: 'REPORT_READY',
      read: true,
      createdAt: '1h ago',
      linkUrl: '/records',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <>
      <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between sticky top-0 z-30">
        {/* Global Search Bar */}
        <div className="relative w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, ID or site..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Right Header Actions matching AM 02 / Figma */}
        <div className="flex items-center gap-3">
          {/* Date Selector Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 select-none">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>Today · 25 Aug</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>

          {/* Quick Download Report Button */}
          <Link href="/records">
            <Button variant="secondary" size="sm" className="gap-2">
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Download report</span>
            </Button>
          </Link>

          {/* Notification Bell with Unread Badge */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open notifications"
            className="relative p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-600 rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>
      </header>

      {/* Notification Drawer Slide-over */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </>
  );
};
