import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    active_stations: 3,
    monitored_assets: 18,
    avg_fuel_savings_pct: 3.49,
    overall_health: 'OPTIMAL',
    last_uplink: new Date().toISOString(),
  });
}
