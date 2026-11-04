'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Navigation } from 'lucide-react';

interface GeofenceMapProps {
  siteCenterLat: number;
  siteCenterLng: number;
  siteRadiusMeters: number;
  siteName: string;
  checkInLat: number;
  checkInLng: number;
  distanceOutsideMeters?: number;
  measuredDistanceMeters?: number;
  className?: string;
}

export const GeofenceMap: React.FC<GeofenceMapProps> = ({
  siteCenterLat,
  siteCenterLng,
  siteRadiusMeters,
  siteName,
  checkInLat,
  checkInLng,
  distanceOutsideMeters: _distanceOutsideMeters = 900,
  measuredDistanceMeters = 1400,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let mapInstance: any = null;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        const maplibregl = (await import('maplibre-gl')).default;

        // Using standard vector/raster OpenStreetMap style for offline/dev resilience
        mapInstance = new maplibregl.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap Contributors',
              },
            },
            layers: [
              {
                id: 'osm-tiles-layer',
                type: 'raster',
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19,
              },
            ],
          },
          center: [checkInLng, checkInLat],
          zoom: 14,
          interactive: true,
        });

        mapInstance.on('load', () => {
          // Calculate GeoJSON circle for site geofence
          const circleFeature = generateCircleFeature(
            [siteCenterLng, siteCenterLat],
            siteRadiusMeters
          );

          mapInstance.addSource('geofence-circle', {
            type: 'geojson',
            data: circleFeature,
          });

          // Geofence fill
          mapInstance.addLayer({
            id: 'geofence-fill',
            type: 'fill',
            source: 'geofence-circle',
            paint: {
              'fill-color': '#EF4444',
              'fill-opacity': 0.12,
            },
          });

          // Geofence dashed stroke
          mapInstance.addLayer({
            id: 'geofence-line',
            type: 'line',
            source: 'geofence-circle',
            paint: {
              'line-color': '#DC2626',
              'line-width': 2,
              'line-dasharray': [3, 2],
            },
          });

          // Add marker for site center
          const siteMarkerEl = document.createElement('div');
          siteMarkerEl.className =
            'px-2 py-1 bg-white border border-gray-300 rounded shadow-sm text-[10px] font-bold text-gray-800 flex items-center gap-1';
          siteMarkerEl.innerHTML = `<span>🏢 ${siteName}</span>`;
          new maplibregl.Marker({ element: siteMarkerEl })
            .setLngLat([siteCenterLng, siteCenterLat])
            .addTo(mapInstance);

          // Add marker for check-in pin
          const pinEl = document.createElement('div');
          pinEl.className =
            'w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-red-400 animate-bounce';
          pinEl.innerHTML =
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
          new maplibregl.Marker({ element: pinEl })
            .setLngLat([checkInLng, checkInLat])
            .addTo(mapInstance);
        });

        mapInstance.on('error', () => {
          // If offline or tile network blocked, fallback gracefully
          setMapError(true);
        });
      } catch (err) {
        console.warn('MapLibre GL failed to initialize, using visual vector fallback', err);
        setMapError(true);
      }
    }

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [siteCenterLat, siteCenterLng, siteRadiusMeters, checkInLat, checkInLng, siteName]);

  const formattedDistance =
    measuredDistanceMeters >= 1000
      ? `${(measuredDistanceMeters / 1000).toFixed(1)} km`
      : `${measuredDistanceMeters} m`;

  return (
    <div
      className={`relative w-full h-72 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 ${className}`}
    >
      {/* MapLibre Container */}
      <div
        ref={mapContainerRef}
        data-testid="geofence-maplibre-container"
        className="w-full h-full"
      />

      {/* Visual Vector Fallback when WebGL/network is unavailable in testing environments */}
      {mapError && (
        <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
          <svg className="w-full h-full max-h-52" viewBox="0 0 400 240">
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="240" fill="url(#grid)" />

            {/* Geofence boundary circle (red dashed) */}
            <circle
              cx="140"
              cy="120"
              r="65"
              fill="rgba(239, 68, 68, 0.12)"
              stroke="#DC2626"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Site Center */}
            <circle cx="140" cy="120" r="4" fill="#3B82F6" />
            <text x="140" y="145" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E293B">
              {siteName} ({siteRadiusMeters}m geofence)
            </text>

            {/* Distance connecting line */}
            <line
              x1="140"
              y1="120"
              x2="280"
              y2="80"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeDasharray="3 3"
            />

            {/* Check-in Pin */}
            <g transform="translate(280, 80)">
              <circle cx="0" cy="0" r="14" fill="#DC2626" />
              <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
            </g>
            <text x="280" y="112" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#DC2626">
              Actual Check-in
            </text>
          </svg>
        </div>
      )}

      {/* Red Pill Overlay matching AM 07 */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/95 text-white font-semibold text-xs shadow-md backdrop-blur-sm">
        <Navigation className="w-3.5 h-3.5 fill-white text-white" />
        <span>
          {formattedDistance} outside {siteName}
        </span>
      </div>

      {/* GPS Coordinates Badge bottom-right */}
      <div className="absolute bottom-2.5 right-2.5 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 text-[10px] font-mono text-gray-600 px-2.5 py-1 rounded-md shadow-xs">
        {checkInLat.toFixed(4)}°N, {checkInLng.toFixed(4)}°E
      </div>
    </div>
  );
};

/**
 * Generates GeoJSON polygon feature approximating a circle around center [lng, lat]
 */
function generateCircleFeature(center: [number, number], radiusInMeters: number, points = 64) {
  const [lng, lat] = center;
  const coords: [number, number][] = [];
  const km = radiusInMeters / 1000;
  const distanceX = km / (111.32 * Math.cos((lat * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lng + x, lat + y]);
  }
  if (coords[0]) {
    coords.push(coords[0]);
  }

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [coords],
    },
    properties: {},
  };
}
