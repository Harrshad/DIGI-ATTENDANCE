'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WorkLocation } from '@triattendance/shared';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Users,
  Building,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LocationsPage() {
  // Realistic seed mock matching Figma locations-admin-view.png screenshot
  const [locations, setLocations] = useState<WorkLocation[]>([
    {
      id: 'loc-1',
      name: 'CHN-1',
      city: 'Chennai',
      address: 'Olympia Tech Park, Guindy, Chennai, Tamil Nadu 600032',
      radiusMeters: 500,
      latitude: 13.0102,
      longitude: 80.2157,
      peopleCount: 88,
      presentTodayCount: 79,
      status: 'Active',
    },
    {
      id: 'loc-2',
      name: 'BLR-1',
      city: 'Bangalore',
      address: 'Prestige Tech Park, Marathahalli Outer Ring Rd, Bangalore 560103',
      radiusMeters: 500,
      latitude: 12.9352,
      longitude: 77.6946,
      peopleCount: 64,
      presentTodayCount: 58,
      status: 'Active',
    },
    {
      id: 'loc-3',
      name: 'BLR-3',
      city: 'Bangalore',
      address: 'Bagmane Tech Park, CV Raman Nagar, Bangalore 560093',
      radiusMeters: 400,
      latitude: 12.9815,
      longitude: 77.6627,
      peopleCount: 55,
      presentTodayCount: 47,
      status: 'Active',
    },
    {
      id: 'loc-4',
      name: 'HYD-2',
      city: 'Hyderabad',
      address: 'Hitec City, Madhapur, Hyderabad, Telangana 500081',
      radiusMeters: 600,
      latitude: 17.4483,
      longitude: 78.3742,
      peopleCount: 43,
      presentTodayCount: 0,
      status: 'Disabled',
    },
  ]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete work location ${name}?`)) {
      setLocations((prev) => prev.filter((loc) => loc.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar matching locations-admin-view.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Manage Work Locations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Geofence radii, GPS boundaries, and site employee assignments
          </p>
        </div>

        {/* Add Location button linking to /locations/new */}
        <Link href="/locations/new">
          <Button size="md" className="gap-2 font-semibold">
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </Button>
        </Link>
      </div>

      {/* Locations Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">City</th>
                <th className="py-3.5 px-6">Allowed area</th>
                <th className="py-3.5 px-6">People</th>
                <th className="py-3.5 px-6">Present today</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Location code + address */}
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">{loc.name}</span>
                        <p className="text-xs text-gray-400 max-w-xs truncate mt-0.5">
                          {loc.address}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* City */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <Building className="w-3.5 h-3.5 text-gray-400" />
                      <span>{loc.city}</span>
                    </div>
                  </td>

                  {/* Radius */}
                  <td className="py-4 px-6 text-gray-600 font-medium">
                    {loc.radiusMeters}m radius
                  </td>

                  {/* People assigned */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>{loc.peopleCount} assigned</span>
                    </div>
                  </td>

                  {/* Present today */}
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">
                      {loc.presentTodayCount}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      / {loc.peopleCount}
                    </span>
                  </td>

                  {/* Status chip */}
                  <td className="py-4 px-6">
                    {loc.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        <XCircle className="w-3.5 h-3.5 text-gray-400" />
                        Disabled
                      </span>
                    )}
                  </td>

                  {/* Actions: Edit pen & Delete trash */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/locations/${loc.id}/edit`}>
                        <button
                          title="Edit location"
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        title="Delete location"
                        onClick={() => handleDelete(loc.id, loc.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
