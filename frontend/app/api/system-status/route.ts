import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { SYSTEM_KPIS } from '@/lib/dashboard-data';

export async function GET(req: NextRequest) {
  const stationParam = req.nextUrl.searchParams.get('station');
  const station = stationParam ? stationParam.toUpperCase() : 'MAITRI';

  try {
    // Fetch latest telemetry for station from database
    const telemetryRes = await query(
      `SELECT * FROM station_telemetry 
       WHERE UPPER(station) = $1 
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [station]
    );

    // Fetch executive summary KPIs from database
    const execRes = await query(`SELECT kpi, value FROM executive_summary`);
    const execMap: Record<string, number> = {};
    for (const r of execRes.rows) {
      execMap[r.kpi] = Number(r.value);
    }

    if (telemetryRes.rows.length > 0) {
      const row = telemetryRes.rows[0];
      const stationLoad = Math.round(Number(row.total_load_kw) || 312);
      const solarKw = Math.round(Number(row.pv_output_kw) || 42);
      const windKw = Math.round(Number(row.wind_output_kw) || 104);
      const reKw = Math.round(Number(row.renewable_output_kw) || (solarKw + windKw));
      const dieselKw = Math.round(Number(row.diesel_required_kw) || Math.max(0, stationLoad - reKw));
      const batteryKw = Math.round(Math.max(0, reKw - stationLoad));
      const rePct = stationLoad > 0 ? Number(((reKw / stationLoad) * 100).toFixed(1)) : 47.0;

      const dieselSaved = execMap['Diesel Saved (L)'] || 242.0;
      const co2Reduction = execMap['CO₂ Reduction (kg)'] || 650.0;
      const batteryCapacity = execMap['Battery Capacity (kWh)'] || 250.0;

      return NextResponse.json({
        status: 'OPTIMAL',
        source: 'database',
        timestamp: row.timestamp,
        station: `${station.charAt(0) + station.slice(1).toLowerCase()} Research Station`,
        kpis: {
          station_load_kw: stationLoad,
          renewable_kw: reKw,
          solar_kw: solarKw,
          wind_kw: windKw,
          battery_kw: batteryKw,
          battery_soc_pct: 78,
          battery_capacity_kwh: batteryCapacity,
          diesel_kw: dieselKw,
          diesel_burn_rate_lph: Math.round(Number(row.diesel_liters) || 68),
          fuel_reserve_liters: 14500,
          fuel_buffer_days: 5.8,
          avoided_co2_kg_week: co2Reduction,
          gwo_fuel_saved_liters_week: dieselSaved,
          renewable_penetration_pct: Math.min(100, rePct),
          ambient_temp_c: Number(row.temp_c),
          wind_speed_ms: Number(row.wind_speed_ms),
        },
      });
    }
  } catch (err) {
    console.error('Failed to query PostgreSQL system status, using fallback:', err);
  }

  // Graceful fallback
  return NextResponse.json({
    status: 'OPTIMAL',
    source: 'fallback',
    timestamp: new Date().toISOString(),
    station: `${station.charAt(0) + station.slice(1).toLowerCase()} Research Station`,
    kpis: SYSTEM_KPIS,
  });
}
