import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: "ok" });
}

export async function GET() {
  return NextResponse.json({ message: "ok" });
}
