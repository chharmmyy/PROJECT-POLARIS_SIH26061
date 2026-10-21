import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const temp_c = typeof body.temp_c === 'number' ? body.temp_c : -18.0;
    const wind_speed_ms = typeof body.wind_speed_ms === 'number' ? body.wind_speed_ms : 12.0;

    const is_extreme_cold = temp_c < -25.0;
    const is_high_wind = wind_speed_ms > 15.0;
    const is_anomaly = is_extreme_cold || is_high_wind;

    if (is_anomaly) {
      return NextResponse.json({
        is_anomaly: true,
        system_status: 'Critical Weather Anomaly',
        severity: 'Critical',
        alert: is_extreme_cold && is_high_wind 
          ? 'Extreme Cold & High Wind Blizzard Spike'
          : is_extreme_cold 
            ? 'Extreme Polar Cold Surge (< -25°C)'
            : 'Katabatic High Wind Velocity Spike (> 15 m/s)',
        recommendation: 'Lock Life-Support Heating Guard (60%). Pre-dispatch diesel genset to 80% sweet spot and preserve BESS buffer.',
      });
    }

    return NextResponse.json({
      is_anomaly: false,
      system_status: 'Normal Operations',
      severity: 'Nominal',
      alert: 'Telemetry operating within safe hyper-boundary',
      recommendation: 'Maintain standard autonomous GWO dispatch schedule.',
    });
  } catch {
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 400 });
  }
}
