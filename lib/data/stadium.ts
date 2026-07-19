/**
 * STADIUM DIGITAL TWIN - SIMULATED DATA
 * 
 * This file contains a mock dataset representing the live state of a FIFA World Cup 2026 stadium.
 * It serves as a simulated digital twin, standing in for real IoT, crowd-sensor, and telemetry data.
 * For the purposes of this hackathon/demo, crowd levels and statuses are simulated to demonstrate
 * real-time responsiveness and operational decision-making without needing physical hardware.
 */

export type CrowdStatus = "low" | "moderate" | "congested";
export type FacilityType = "restroom" | "medical" | "transit";

export interface Coordinates {
  x: number;
  y: number;
}

export interface Gate {
  id: string;
  name: string;
  crowdLevel: number; // 0-100
  status: CrowdStatus;
  coordinates: Coordinates;
  wheelchairAccessible: boolean;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  coordinates: Coordinates;
  accessible: boolean;
}

export interface Waypoint {
  id: string;
  coordinates: Coordinates;
  description: string;
}

export interface StadiumState {
  gates: Gate[];
  facilities: Facility[];
}

// Initial mock state representing 6 gates
let gates: Gate[] = [
  { id: "gate-a", name: "Gate A", crowdLevel: 25, status: "low", coordinates: { x: 100, y: 500 }, wheelchairAccessible: true },
  { id: "gate-b", name: "Gate B", crowdLevel: 65, status: "moderate", coordinates: { x: 200, y: 800 }, wheelchairAccessible: false },
  { id: "gate-c", name: "Gate C", crowdLevel: 90, status: "congested", coordinates: { x: 500, y: 900 }, wheelchairAccessible: true },
  { id: "gate-d", name: "Gate D", crowdLevel: 40, status: "moderate", coordinates: { x: 800, y: 800 }, wheelchairAccessible: false },
  { id: "gate-e", name: "Gate E", crowdLevel: 15, status: "low", coordinates: { x: 900, y: 500 }, wheelchairAccessible: true },
  { id: "gate-f", name: "Gate F", crowdLevel: 80, status: "congested", coordinates: { x: 500, y: 100 }, wheelchairAccessible: true },
];

// Initial mock state representing 4 key facilities
const facilities: Facility[] = [
  { id: "fac-rest-1", name: "North Restroom", type: "restroom", coordinates: { x: 450, y: 800 }, accessible: true },
  { id: "fac-rest-2", name: "South Restroom", type: "restroom", coordinates: { x: 450, y: 200 }, accessible: false },
  { id: "fac-med-1", name: "Main Medical Station", type: "medical", coordinates: { x: 850, y: 450 }, accessible: true },
  { id: "fac-tran-1", name: "West Transit Hub", type: "transit", coordinates: { x: 50, y: 450 }, accessible: true },
];

/**
 * Returns the current live snapshot of the stadium state.
 */
export function getStadiumSnapshot(): StadiumState {
  return {
    gates: [...gates],
    facilities: [...facilities],
  };
}

/**
 * Simulates real-time crowd fluctuations.
 * NOTE: This randomly nudges crowd levels for hackathon demonstration purposes 
 * to emulate a live stream of IoT sensor data.
 */
export function simulateCrowdChange(): void {
  gates = gates.map((gate) => {
    // Random fluctuation between -10 and +10
    const change = Math.floor(Math.random() * 21) - 10;
    let newLevel = gate.crowdLevel + change;
    
    // Clamp between 0 and 100
    if (newLevel < 0) newLevel = 0;
    if (newLevel > 100) newLevel = 100;
    
    // Determine status based on new level
    let newStatus: CrowdStatus = "low";
    if (newLevel >= 75) {
      newStatus = "congested";
    } else if (newLevel >= 40) {
      newStatus = "moderate";
    }

    return {
      ...gate,
      crowdLevel: newLevel,
      status: newStatus,
    };
  });
}

/**
 * Calculates a simplified route between a gate and a facility.
 * Demonstrates accessible routing by inserting a detour if an accessible route is requested 
 * but the destination or direct path isn't straightforwardly accessible.
 */
export function getRoute(fromGateId: string, toFacilityId: string, accessible: boolean): Waypoint[] {
  const gate = gates.find(g => g.id === fromGateId);
  const facility = facilities.find(f => f.id === toFacilityId);

  if (!gate || !facility) {
    throw new Error("Invalid Gate ID or Facility ID");
  }

  const route: Waypoint[] = [];
  
  // Starting point
  route.push({
    id: `wp-start-${gate.id}`,
    coordinates: gate.coordinates,
    description: `Start at ${gate.name}`,
  });

  // Mock routing logic: 
  // If accessibility is required, and either the gate is not accessible or we just want to show a varied path,
  // we add an accessible ramp/elevator waypoint detour.
  if (accessible && (!gate.wheelchairAccessible || !facility.accessible)) {
    // Add a detour through a central accessible concourse
    route.push({
      id: "wp-ramp-center",
      coordinates: { x: 500, y: 500 },
      description: "Take the accessible ramp at the Central Concourse",
    });
  } else {
    // Normal direct path goes through a generic halfway point
    const midX = Math.round((gate.coordinates.x + facility.coordinates.x) / 2);
    const midY = Math.round((gate.coordinates.y + facility.coordinates.y) / 2);
    route.push({
      id: "wp-mid",
      coordinates: { x: midX, y: midY },
      description: "Proceed through the main walkway",
    });
  }

  // End point
  route.push({
    id: `wp-end-${facility.id}`,
    coordinates: facility.coordinates,
    description: `Arrive at ${facility.name}`,
  });

  return route;
}
