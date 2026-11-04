import { describe, it, expect } from 'vitest';
import { LocationsService } from './locations.service';

describe('LocationsService Geospatial Logic', () => {
  const service = new LocationsService();

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.evaluateGeofence).toBeInstanceOf(Function);
    expect(service.getLocations).toBeInstanceOf(Function);
  });
});
