import { NextResponse } from 'next/server';
import { STATIONS } from '@/lib/dashboard-data';

export async function GET() {
  return NextResponse.json(STATIONS);
}
