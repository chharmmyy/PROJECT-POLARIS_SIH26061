import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const temp_c = typeof body.temp_c === 'number' ? body.temp_c : -18.0;
    const wind_speed_ms = typeof body.wind_speed_ms === 'number' ? body.wind_speed_ms : 12.0;
    const ghi_est_w_m2 = typeof body.ghi_est_w_m2 === 'number' ? body.ghi_est_w_m2 : 320.0;

    // Thermodynamic Heating Load Model
    const thermalBase = 312 + (-18 - temp_c) * 4.2;
    const loadKw = Math.round(Math.max(120, thermalBase));

    // Renewable Solar & Wind generation
    const solarKw = Math.round((ghi_est_w_m2 / 1000) * 150 * 0.78);
    const windKw = Math.round(Math.min(300, Math.pow(wind_speed_ms / 12, 3) * 104));
    const totalRenewableKw = solarKw + windKw;

    const netLoadKw = Math.max(0, loadKw - totalRenewableKw);
    const rePenetrationPct = Math.min(100, Math.round((totalRenewableKw / loadKw) * 100));

    return NextResponse.json({
      success: true,
      inputs: { temp_c, wind_speed_ms, ghi_est_w_m2 },
      predictions: {
        predicted_load_kw: loadKw,
        total_renewable_kw: totalRenewableKw,
        solar_kw: solarKw,
        wind_kw: windKw,
        net_load_kw: netLoadKw,
        renewable_penetration_pct: rePenetrationPct,
      }
    });
  } catch {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}
