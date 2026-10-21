import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const stationParam = req.nextUrl.searchParams.get('station') || 'Bharati';
  const stationCode = stationParam.trim().toUpperCase();

  try {
    const res = await query(
      `SELECT * FROM station_telemetry 
       WHERE UPPER(station) = $1 
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [stationCode]
    );

    if (res.rows.length > 0) {
      const r = res.rows[0];
      return NextResponse.json({
        station: stationParam,
        source: 'database',
        status: 'ONLINE',
        timestamp: r.timestamp,
        ambient_temp_c: Number(r.temp_c) || -18.2,
        wind_speed_ms: Number(r.wind_speed_ms) || 12.4,
        solar_irradiance_wm2: Number(r.ghi_est_w_m2) || 320,
        active_load_kw: Math.round(Number(r.total_load_kw) || 312),
        pv_output_kw: Math.round(Number(r.pv_output_kw) || 42),
        wind_output_kw: Math.round(Number(r.wind_output_kw) || 104),
        renewable_output_kw: Math.round(Number(r.renewable_output_kw) || 146),
        diesel_required_kw: Math.round(Number(r.diesel_required_kw) || 166),
        battery_soc_pct: 78,
        diesel_sfc_l_kwh: 0.288,
      });
    }
  } catch (err) {
    console.error('Error fetching station sample from database:', err);
  }

  // Fallback
  return NextResponse.json({
    station: stationParam,
    source: 'fallback',
    status: 'ONLINE',
    ambient_temp_c: -18.2,
    wind_speed_ms: 12.4,
    solar_irradiance_wm2: 320,
    active_load_kw: 312,
    battery_soc_pct: 78,
    diesel_sfc_l_kwh: 0.288,
  });
}
