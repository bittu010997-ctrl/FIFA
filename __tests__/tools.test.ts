import { expect, test, describe } from 'vitest';
import { get_crowd_status, get_nearest_facility, get_route, get_facility_info } from '@/lib/tools';

describe('Stadium Tools', () => {
  test('get_crowd_status returns all gates if no id', async () => {
    const res = await get_crowd_status({});
    expect(res).toHaveProperty('gates');
    expect((res as any).gates.length).toBe(6);
  });

  test('get_crowd_status handles missing gate gracefully', async () => {
    const res = await get_crowd_status({ gateId: 'fake-gate' });
    expect(res).toHaveProperty('error');
  });

  test('get_nearest_facility finds nearest', async () => {
    const res = await get_nearest_facility({ facilityType: 'restroom', nearGateId: 'gate-a' });
    expect(res).toHaveProperty('nearestFacility');
  });

  test('get_nearest_facility handles missing gate gracefully', async () => {
    const res = await get_nearest_facility({ facilityType: 'restroom', nearGateId: 'fake-gate' });
    expect(res).toHaveProperty('error');
  });

  test('get_route works end to end', async () => {
    const res = await get_route({ fromGateId: 'gate-a', toFacilityType: 'restroom', accessible: true });
    expect(res).toHaveProperty('route');
    expect(res).toHaveProperty('destination');
  });

  test('get_route handles bad inputs gracefully', async () => {
    const res = await get_route({ fromGateId: 'fake', toFacilityType: 'restroom', accessible: true });
    expect(res).toHaveProperty('error');
  });

  test('get_facility_info works', async () => {
    const res = await get_facility_info({ facilityId: 'fac-rest-1' });
    expect(res).toHaveProperty('facility');
  });

  test('get_facility_info handles bad input', async () => {
    const res = await get_facility_info({ facilityId: 'fake' });
    expect(res).toHaveProperty('error');
  });
});
