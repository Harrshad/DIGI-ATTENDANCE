'use client';

import React from 'react';
import { X, Bell, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  linkUrl?: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Notifications
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    n.read
                      ? 'bg-white border-gray-100 text-gray-600'
                      : 'bg-brand-50/50 border-brand-100 text-gray-900 font-medium'
                  }`}
                  onClick={() => onMarkAsRead(n.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold">{n.title}</p>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {n.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  {n.linkUrl && (
                    <Link
                      href={n.linkUrl}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium mt-2"
                    >
                      View details <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
