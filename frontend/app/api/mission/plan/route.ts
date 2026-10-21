import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(
      `SELECT * FROM mission_decision_summary ORDER BY date ASC`
    );

    return NextResponse.json({
      source: 'database',
      status: 'ACTIVE',
      horizon_days: res.rows.length,
      plan_id: 'POL-MISSION-2026-W39',
      schedule: res.rows,
      total_fuel_baseline_liters: 12450,
      total_fuel_optimized_liters: 12015,
      total_saved_liters: 435,
      carbon_avoided_tons: 1.16,
    });
  } catch (err) {
    console.error('Error fetching mission plan from PostgreSQL:', err);
    return NextResponse.json({
      source: 'fallback',
      status: 'ACTIVE',
      horizon_days: 7,
      plan_id: 'POL-MISSION-2026-W39',
      total_fuel_baseline_liters: 12450,
      total_fuel_optimized_liters: 12015,
      total_saved_liters: 435,
      carbon_avoided_tons: 1.16,
    });
  }
}
