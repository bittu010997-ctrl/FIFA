import { expect, test, describe } from 'vitest';
import { getStadiumSnapshot, simulateCrowdChange, getRoute } from '@/lib/data/stadium';

describe('Stadium Data', () => {
  test('getStadiumSnapshot returns correct shape', () => {
    const snap = getStadiumSnapshot();
    expect(snap).toHaveProperty('gates');
    expect(snap).toHaveProperty('facilities');
    expect(snap.gates.length).toBe(6);
    expect(snap.facilities.length).toBe(4);
  });

  test('simulateCrowdChange alters crowd levels', () => {
    const snap1 = getStadiumSnapshot();
    simulateCrowdChange();
    const snap2 = getStadiumSnapshot();
    // Object references should be the same arrays since we recreate them in simulateCrowdChange, 
    // but the levels might be different. Let's just JSON.stringify and compare.
    expect(JSON.stringify(snap1)).not.toEqual(JSON.stringify(snap2));
  });

  test('getRoute handles accessible=true differently than accessible=false', () => {
    // gate-b is not wheelchair accessible
    const routeNormal = getRoute('gate-b', 'fac-rest-2', false); 
    const routeAccessible = getRoute('gate-b', 'fac-rest-2', true);
    
    // accessible route should have the detour (wp-ramp-center)
    expect(routeAccessible.length).toBe(3);
    expect(routeAccessible[1].id).toBe('wp-ramp-center');
    
    // normal route should just be direct (wp-mid)
    expect(routeNormal.length).toBe(3);
    expect(routeNormal[1].id).toBe('wp-mid');
  });
});
