import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    total_anomalies: 1111,
    unresolved_count: 4,
    categories: [
      { type: 'Extreme cold surge', count: 420, color: '#0ea5e9' },
      { type: 'High wind blizzard', count: 310, color: '#10b981' },
      { type: 'Peak demand surge', count: 180, color: '#f59e0b' },
      { type: 'Renewable deficit', count: 120, color: '#ef4444' },
      { type: 'Sensor drift', count: 81, color: '#a855f7' },
    ]
  });
}
