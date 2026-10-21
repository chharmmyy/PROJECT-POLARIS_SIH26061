import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { FEATURE_IMPORTANCE } from '@/lib/dashboard-data';

export async function GET() {
  try {
    const res = await query(
      `SELECT feature, importance FROM feature_importance ORDER BY importance DESC`
    );

    if (res.rows.length > 0) {
      const data = res.rows.map(r => ({
        Feature: r.feature,
        Importance: Number(r.importance),
      }));
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error('Error fetching feature importance from PostgreSQL:', err);
  }

  return NextResponse.json(FEATURE_IMPORTANCE);
}
