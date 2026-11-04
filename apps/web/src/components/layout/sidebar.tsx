'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MapPin,
  FileSpreadsheet,
  AlertCircle,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  userInitials?: string;
  userName?: string;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userInitials = 'JJ',
  userName = 'Joseph J',
  userRole = 'Account Manager',
}) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/overview', icon: LayoutDashboard },
    { name: 'Workforce', href: '/workforce', icon: Users },
    { name: 'Locations', href: '/locations', icon: MapPin },
    { name: 'Records', href: '/records', icon: FileSpreadsheet },
    { name: 'Alerts', href: '/alerts', icon: AlertCircle },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-gray-900 tracking-tight">
                TriAttendance
              </span>
              <span className="block text-[11px] text-gray-400 font-medium">
                Enterprise AM Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/overview' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-brand-600' : 'text-gray-400'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Pill (matching AM 02 / Figma sidebar) */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold ring-2 ring-white">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 truncate">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
