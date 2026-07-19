/* eslint-disable @typescript-eslint/no-explicit-any */
import { getStadiumSnapshot, getRoute, FacilityType, Facility } from '../data/stadium';

// --- 1. get_crowd_status ---
export const getCrowdStatusSchema = {
  name: "get_crowd_status",
  description: "Returns crowd level and status for a specific gate, or all gates if none specified.",
  parameters: {
    type: "object",
    properties: {
      gateId: {
        type: "string",
        description: "The ID of the gate to check (e.g., 'gate-a'). Optional.",
      }
    }
  }
};

export async function get_crowd_status(args: { gateId?: string }) {
  const state = getStadiumSnapshot();
  if (args.gateId) {
    const gate = state.gates.find(g => g.id === args.gateId);
    if (!gate) return { error: `Gate ${args.gateId} not found` };
    return { gate };
  }
  return { gates: state.gates };
}

// --- 2. get_nearest_facility ---
export const getNearestFacilitySchema = {
  name: "get_nearest_facility",
  description: "Returns the closest facility of a given type relative to a specific gate.",
  parameters: {
    type: "object",
    properties: {
      facilityType: {
        type: "string",
        enum: ["restroom", "medical", "transit"],
        description: "The type of facility to find (restroom, medical, or transit).",
      },
      nearGateId: {
        type: "string",
        description: "The ID of the gate you are currently near (e.g., 'gate-a').",
      }
    },
    required: ["facilityType", "nearGateId"]
  }
};

function calculateDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export async function get_nearest_facility(args: { facilityType: FacilityType, nearGateId: string }) {
  const state = getStadiumSnapshot();
  const gate = state.gates.find(g => g.id === args.nearGateId);
  if (!gate) return { error: `Gate ${args.nearGateId} not found` };

  const facilities = state.facilities.filter(f => f.type === args.facilityType);
  if (facilities.length === 0) return { error: `No facility of type ${args.facilityType} found` };

  let nearest: Facility | null = null;
  let minDistance = Infinity;

  for (const fac of facilities) {
    const dist = calculateDistance(gate.coordinates.x, gate.coordinates.y, fac.coordinates.x, fac.coordinates.y);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = fac;
    }
  }

  return { nearestFacility: nearest, distance: Math.round(minDistance) };
}

// --- 3. get_route ---
export const getRouteSchema = {
  name: "get_route",
  description: "Returns an ordered list of waypoints from a gate to a facility type.",
  parameters: {
    type: "object",
    properties: {
      fromGateId: {
        type: "string",
        description: "The starting gate ID (e.g., 'gate-a').",
      },
      toFacilityType: {
        type: "string",
        enum: ["restroom", "medical", "transit"],
        description: "The type of facility to route to.",
      },
      accessible: {
        type: "boolean",
        description: "Whether the route must be wheelchair accessible.",
      }
    },
    required: ["fromGateId", "toFacilityType", "accessible"]
  }
};

export async function get_route(args: { fromGateId: string, toFacilityType: FacilityType, accessible: boolean }) {
  // Find nearest facility of that type first
  const nearestResult = await get_nearest_facility({ facilityType: args.toFacilityType, nearGateId: args.fromGateId });
  if ('error' in nearestResult || !nearestResult.nearestFacility) {
    return nearestResult;
  }
  
  const targetFacilityId = nearestResult.nearestFacility.id;
  try {
    const routeWaypoints = getRoute(args.fromGateId, targetFacilityId, args.accessible);
    return { 
      route: routeWaypoints, 
      destination: nearestResult.nearestFacility 
    };
  } catch (error: any) {
    return { error: error.message };
  }
}

// --- 4. get_facility_info ---
export const getFacilityInfoSchema = {
  name: "get_facility_info",
  description: "Returns details on a specific facility.",
  parameters: {
    type: "object",
    properties: {
      facilityId: {
        type: "string",
        description: "The ID of the facility.",
      }
    },
    required: ["facilityId"]
  }
};

export async function get_facility_info(args: { facilityId: string }) {
  const state = getStadiumSnapshot();
  const facility = state.facilities.find(f => f.id === args.facilityId);
  if (!facility) return { error: `Facility ${args.facilityId} not found` };
  return { facility };
}

// --- Tool Registry Export ---
export const tools = [
  { schema: getCrowdStatusSchema, handler: get_crowd_status },
  { schema: getNearestFacilitySchema, handler: get_nearest_facility },
  { schema: getRouteSchema, handler: get_route },
  { schema: getFacilityInfoSchema, handler: get_facility_info }
];
