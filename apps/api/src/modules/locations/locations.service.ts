import { Injectable, NotFoundException } from '@nestjs/common';
import { sql, eq, inArray } from 'drizzle-orm';
import { db } from '../../database/drizzle.client';
import { locations, employees, attendanceRecords } from '../../database/schema';
import { WorkLocation, CreateLocationRequest } from '@triattendance/shared';

@Injectable()
export class LocationsService {
  /**
   * Retrieves list of work locations scoped to manager assignments (or all for Admin)
   * Includes active employee count and present today count matching locations-admin-view.png
   */
  async getLocations(scopedLocationIds?: string[]): Promise<WorkLocation[]> {
    let query = db
      .select({
        id: locations.id,
        name: locations.name,
        city: locations.city,
        address: locations.address,
        radiusMeters: locations.radiusMeters,
        latitude: locations.latitude,
        longitude: locations.longitude,
        status: locations.status,
      })
      .from(locations);

    if (scopedLocationIds && scopedLocationIds.length > 0) {
      query = query.where(inArray(locations.id, scopedLocationIds)) as any;
    }

    const locList = await query;

    // Aggregate people count and present today count per location
    const results: WorkLocation[] = [];

    for (const loc of locList) {
      // People assigned
      const [peopleRes] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(employees)
        .where(eq(employees.assignedLocationId, loc.id));

      // Present today (Asia/Kolkata date boundary)
      const [presentRes] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(attendanceRecords)
        .where(
          sql`${attendanceRecords.locationId} = ${loc.id} 
              AND ${attendanceRecords.status} IN ('Present', 'Late')
              AND (${attendanceRecords.attemptedCheckInAt} AT TIME ZONE 'Asia/Kolkata')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date`
        );

      results.push({
        id: loc.id,
        name: loc.name,
        city: loc.city,
        address: loc.address,
        radiusMeters: loc.radiusMeters,
        latitude: parseFloat(loc.latitude),
        longitude: parseFloat(loc.longitude),
        status: loc.status as 'Active' | 'Disabled',
        peopleCount: peopleRes?.count || 0,
        presentTodayCount: presentRes?.count || 0,
      });
    }

    return results;
  }

  /**
   * Creates a new work location with PostGIS GEOGRAPHY point
   */
  async createLocation(dto: CreateLocationRequest): Promise<WorkLocation> {
    const lat = dto.latitude;
    const lng = dto.longitude;

    const [created] = await db
      .insert(locations)
      .values({
        name: dto.name,
        city: dto.city,
        address: dto.address,
        radiusMeters: dto.radiusMeters,
        latitude: lat.toString(),
        longitude: lng.toString(),
        geog: sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography` as any,
        status: 'Active',
      })
      .returning();

    if (!created) {
      throw new Error('Failed to create location record.');
    }

    // Assign employees if provided
    if (dto.assignedEmployeeIds && dto.assignedEmployeeIds.length > 0) {
      await db
        .update(employees)
        .set({ assignedLocationId: created.id })
        .where(inArray(employees.id, dto.assignedEmployeeIds));
    }

    return {
      id: created.id,
      name: created.name,
      city: created.city,
      address: created.address,
      radiusMeters: created.radiusMeters,
      latitude: parseFloat(created.latitude),
      longitude: parseFloat(created.longitude),
      status: created.status as 'Active' | 'Disabled',
      peopleCount: dto.assignedEmployeeIds?.length || 0,
      presentTodayCount: 0,
    };
  }

  /**
   * Calculates ellipsoidal distance and geofence boundary check via PostGIS ST_Distance & ST_DWithin
   */
  async evaluateGeofence(
    locationId: string,
    checkInLat: number,
    checkInLng: number
  ): Promise<{
    isInside: boolean;
    measuredDistanceMeters: number;
    distanceOutsideBoundaryMeters: number;
    allowedRadiusMeters: number;
    locationName: string;
    centerLat: number;
    centerLng: number;
  }> {
    const [loc] = await db
      .select({
        id: locations.id,
        name: locations.name,
        radiusMeters: locations.radiusMeters,
        centerLat: locations.latitude,
        centerLng: locations.longitude,
        distanceMeters: sql<number>`
          ST_Distance(
            ${locations.geog},
            ST_SetSRID(ST_MakePoint(${checkInLng}, ${checkInLat}), 4326)::geography
          )
        `,
        isInside: sql<boolean>`
          ST_DWithin(
            ${locations.geog},
            ST_SetSRID(ST_MakePoint(${checkInLng}, ${checkInLat}), 4326)::geography,
            ${locations.radiusMeters}
          )
        `,
      })
      .from(locations)
      .where(eq(locations.id, locationId));

    if (!loc) {
      throw new NotFoundException(`Location #${locationId} not found.`);
    }

    const measuredDistance = Math.round(Number(loc.distanceMeters));
    const distanceOutside = Math.max(0, measuredDistance - loc.radiusMeters);

    return {
      isInside: Boolean(loc.isInside),
      measuredDistanceMeters: measuredDistance,
      distanceOutsideBoundaryMeters: distanceOutside,
      allowedRadiusMeters: loc.radiusMeters,
      locationName: loc.name,
      centerLat: parseFloat(loc.centerLat),
      centerLng: parseFloat(loc.centerLng),
    };
  }

  /**
   * Deletes a location by ID
   */
  async deleteLocation(id: string): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }
}
