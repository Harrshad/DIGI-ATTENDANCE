'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, MapPin, Building, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createLocationSchema } from '@triattendance/shared';
import { EmployeePickerTable } from '@/components/locations/employee-picker-table';

export default function AddLocationPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    city: 'Bangalore',
    address: '',
    radiusMeters: 500,
    latitude: 12.9260,
    longitude: 77.6762,
    assignedEmployeeIds: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const cityOptions = [
    'Bangalore',
    'Chennai',
    'Hyderabad',
    'Mumbai',
    'Pune',
    'Delhi NCR',
    'Kolkata',
    'Ahmedabad',
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleEmployeesChange = (ids: string[]) => {
    setFormData((prev) => ({
      ...prev,
      assignedEmployeeIds: ids,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationResult = createLocationSchema.safeParse({
      name: formData.name,
      city: formData.city,
      address: formData.address,
      radiusMeters: Number(formData.radiusMeters),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      assignedEmployeeIds: formData.assignedEmployeeIds,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const fieldName = issue.path[0] as string;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call / create location simulation
      await new Promise((res) => setTimeout(res, 600));
      setSuccessMessage(`Work location "${formData.name}" created successfully!`);
      setTimeout(() => {
        router.push('/locations');
      }, 1000);
    } catch {
      setErrors({ form: 'Failed to create work location. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb Navigation matching add-location-page.png */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/locations"
          className="hover:text-gray-900 transition flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1 text-gray-400" />
          Locations
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-300" />
        <span className="font-semibold text-gray-900">Add New Work Location</span>
      </nav>

      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
          <Building className="w-6 h-6 text-brand-600" />
          Add New Work Location
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure physical office coordinates, allowed check-in geofence radius, and assign staff.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errors.form && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Location Details */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">
                1
              </span>
              Location Details
            </h2>
            <span className="text-xs text-gray-400">All fields required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Location Name / Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. BLR-4, HYD-1, CHN-2"
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                  errors.name ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                }`}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition"
              >
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Full Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 5th Floor, Block 2, EcoSpace Business Park, Bellandur, Bangalore 560103"
              className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                errors.address ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
              }`}
            />
            {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
          </div>

          {/* Allowed Area & Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Allowed Area / Radius */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Allowed Area (Radius in Meters) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="radiusMeters"
                  min="50"
                  max="10000"
                  step="50"
                  value={formData.radiusMeters}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                    errors.radiusMeters ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                  meters
                </span>
              </div>
              {errors.radiusMeters && (
                <p className="text-xs text-red-600 mt-1">{errors.radiusMeters}</p>
              )}
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 12.9260"
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                  errors.latitude ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                }`}
              />
              {errors.latitude && <p className="text-xs text-red-600 mt-1">{errors.latitude}</p>}
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. 77.6762"
                className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${
                  errors.longitude ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                }`}
              />
              {errors.longitude && <p className="text-xs text-red-600 mt-1">{errors.longitude}</p>}
            </div>
          </div>
        </section>

        {/* Section 2: Assign Employees */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs flex items-center justify-center font-bold">
                2
              </span>
              Assign Employees
            </h2>
            <span className="text-xs text-gray-500">
              {formData.assignedEmployeeIds.length} employee{formData.assignedEmployeeIds.length === 1 ? '' : 's'} selected
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Employees assigned to this location will have their mobile check-in requests validated against this geofence boundary.
          </p>

          <EmployeePickerTable
            selectedIds={formData.assignedEmployeeIds}
            onChange={handleEmployeesChange}
          />
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/locations">
            <Button type="button" variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="md"
            disabled={isSubmitting}
            className="gap-2 min-w-[140px]"
          >
            <MapPin className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Location'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
