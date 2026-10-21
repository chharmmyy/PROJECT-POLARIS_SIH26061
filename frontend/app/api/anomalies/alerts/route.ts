import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ALERTS_LIST } from '@/lib/dashboard-data';

export async function GET() {
  try {
    const res = await query(
      `SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 25`
    );

    if (res.rows.length > 0) {
      const dbAlerts = res.rows.map((r, i) => {
        const d = r.timestamp ? new Date(r.timestamp) : new Date();
        const timeStr = !isNaN(d.getTime())
          ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '14:15';
        const dateStr = !isNaN(d.getTime())
          ? d.toISOString().split('T')[0]
          : '2026-09-29';

        const category = Number(r.wind_speed_ms) > 12
          ? 'Wind Inflow'
          : Number(r.total_load_kw) > 115
          ? 'Peak Demand'
          : 'Energy Balance';

        return {
          id: Number(r.id) || i + 1,
          time: timeStr,
          date: dateStr,
          severity: r.severity || 'Warning',
          message: `${r.alert_title} (${Math.round(Number(r.total_load_kw) || 115)} kW Load, ${Math.round(Number(r.renewable_kw) || 45)} kW RE)`,
          action: r.severity === 'Warning' ? 'Inspect subsystem & stabilize' : 'Automatic balance active',
          category,
          temp_c: r.temp_c,
          wind_speed_ms: r.wind_speed_ms,
          renewable_kw: r.renewable_kw,
          total_load_kw: r.total_load_kw,
          actionTaken: false,
          resolved: false,
        };
      });

      return NextResponse.json(dbAlerts);
    }
  } catch (err) {
    console.error('Error fetching alerts from PostgreSQL:', err);
  }

  return NextResponse.json(ALERTS_LIST);
}
