import { NextResponse } from 'next/server';
import { SFC_CURVE } from '@/lib/dashboard-data';

export async function GET() {
  return NextResponse.json(SFC_CURVE);
}
