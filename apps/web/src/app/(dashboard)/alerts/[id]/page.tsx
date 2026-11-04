'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  Building,
  Radio,
} from 'lucide-react';
import { GeofenceMap } from '@/components/map/geofence-map';
import { DecisionPanel } from '@/components/alerts/decision-panel';
import { ExceptionReviewDetail } from '@triattendance/shared';

export default function ExceptionReviewPage() {
  const params = useParams();
  const id = params?.id as string;

  // Realistic mock detail matching AM 07 · Exception review.png
  const [detail] = useState<ExceptionReviewDetail>({
    id: id || 'exc-1',
    attendanceRecordId: 'att-101',
    employeeId: 'emp-1',
    employeeCode: 'TRIL-4821',
    employeeName: 'Ravi Kumar',
    dateFormatted: 'Monday, 21 August 2026',
    reportingManagerName: 'Anita Menon',
    attemptedCheckInTime: '09:02 AM',
    assignedSiteCode: 'CHN-1',
    assignedSiteRadiusMeters: 500,
    siteCenterLatitude: 13.0102,
    siteCenterLongitude: 80.2157,
    actualCheckInLatitude: 13.0228,
    actualCheckInLongitude: 80.2195,
    measuredDistanceMeters: 1400,
    distanceOutsideBoundaryMeters: 900,
    gpsAccuracyMeters: 8,
    isGpsReliable: true,
    blinkVerificationPassed: true,
    blinkAttemptCount: 1,
    checkOutTime: null,
    selfiePresignedUrl: '', // Will render fallback avatar if empty
    selfieCapturedAt: '09:14 AM',
    currentStatus: 'Rejected',
    canApproveOrReject: true, // Special permission enabled per user spec
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top back navigation */}
      <div>
        <Link
          href="/alerts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to alerts</span>
        </Link>
      </div>

      {/* Employee Header Banner matching AM 07 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-inner">
            RK
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900">{detail.employeeName}</h1>
              <span className="text-xs font-mono text-gray-400">({detail.employeeCode})</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
              <span>{detail.dateFormatted}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                Reports to: <strong className="text-gray-700">{detail.reportingManagerName}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            {detail.currentStatus}
          </span>
        </div>
      </div>

      {/* Captured Evidence Section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            Captured Evidence
          </h2>
          <span className="text-xs text-gray-400">Biometric & GPS audit data</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Selfie Preview */}
          <div className="md:col-span-5 space-y-3">
            <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden border border-gray-200 bg-slate-900 shadow-sm flex items-center justify-center">
              {detail.selfiePresignedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={detail.selfiePresignedUrl}
                  alt={`Selfie of ${detail.employeeName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Fallback stylized portrait placeholder */
                <div className="flex flex-col items-center justify-center text-slate-400 space-y-2 p-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xl">
                    RK
                  </div>
                  <span className="text-xs font-medium text-slate-300">
                    Live Biometric Check-in Selfie
                  </span>
                </div>
              )}

              {/* Timestamp Badge */}
              <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-sm text-[11px] font-mono text-white flex items-center gap-1.5 shadow">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Captured: {detail.selfieCapturedAt}</span>
              </div>
            </div>

            {/* Biometric verification details */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-emerald-950">Liveness verification</span>
              </div>
              <span className="font-medium text-emerald-700">
                Passed ({detail.blinkAttemptCount} blink attempt)
              </span>
            </div>
          </div>

          {/* Right: MapLibre Map with Geofence circle */}
          <div className="md:col-span-7 space-y-3">
            <GeofenceMap
              siteCenterLat={detail.siteCenterLatitude}
              siteCenterLng={detail.siteCenterLongitude}
              siteRadiusMeters={detail.assignedSiteRadiusMeters}
              siteName={detail.assignedSiteCode}
              checkInLat={detail.actualCheckInLatitude}
              checkInLng={detail.actualCheckInLongitude}
              distanceOutsideMeters={detail.distanceOutsideBoundaryMeters}
              measuredDistanceMeters={detail.measuredDistanceMeters}
            />

            <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl flex items-center justify-between text-xs text-red-900">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Geofence Mismatch</span>
              </div>
              <span className="font-mono text-red-700 font-bold">
                +{detail.distanceOutsideBoundaryMeters}m outside {detail.assignedSiteRadiusMeters}m radius
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Record Details Grid */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-gray-700" />
            Record Details
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">
              Attempted Check-in
            </span>
            <span className="text-sm font-bold text-gray-900 font-mono">
              {detail.attemptedCheckInTime}
            </span>
          </div>

          <div>
            <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">
              Assigned Site
            </span>
            <span className="text-sm font-bold text-gray-900">
              {detail.assignedSiteCode} ({detail.assignedSiteRadiusMeters}m radius)
            </span>
          </div>

          <div>
            <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">
              Measured Distance
            </span>
            <span className="text-sm font-bold text-red-600 font-mono">
              {(detail.measuredDistanceMeters / 1000).toFixed(1)} km from site center
            </span>
          </div>

          <div>
            <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">
              GPS Accuracy
            </span>
            <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>±{detail.gpsAccuracyMeters}m (Reliable)</span>
            </span>
          </div>

          <div>
            <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">
              Blink Verification
            </span>
            <span className="text-sm font-medium text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Passed</span>
            </span>
          </div>

          <div>
            <span className="text-gray-400 uppercase tracking-wider font-semibold block mb-1">
              Check-out
            </span>
            <span className="text-sm font-mono text-gray-500">
              {detail.checkOutTime || 'None recorded'}
            </span>
          </div>
        </div>
      </section>

      {/* Decision Panel */}
      <DecisionPanel
        exceptionId={detail.id}
        employeeName={detail.employeeName}
        canApproveOrReject={detail.canApproveOrReject}
      />
    </div>
  );
}
