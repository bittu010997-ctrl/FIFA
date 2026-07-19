import { NextResponse } from 'next/server';
import { getStadiumSnapshot, simulateCrowdChange } from '@/lib/data/stadium';

export const dynamic = 'force-dynamic'; // Ensure this route is never cached

export async function GET() {
  // Simulate the real-time changes in crowd levels
  simulateCrowdChange();
  
  // Fetch the updated snapshot
  const snapshot = getStadiumSnapshot();
  
  return NextResponse.json(snapshot);
}
