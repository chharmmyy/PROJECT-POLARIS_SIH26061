import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { MONTHLY_FUEL_DATA } from '@/lib/dashboard-data';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function GET() {
  try {
    const res = await query(
      `SELECT month, baseline_fuel_l, optimized_fuel_l FROM monthly_fuel ORDER BY month ASC`
    );

    if (res.rows.length > 0) {
      const data = res.rows.map(r => {
        const monthNum = Number(r.month);
        const baseline = Number(r.baseline_fuel_l) || 50000;
        const opt = Number(r.optimized_fuel_l) || 49000;
        const saved = Math.max(0, baseline - opt);
        const savedPct = baseline > 0 ? Number(((saved / baseline) * 100).toFixed(2)) : 0;

        return {
          Month: monthNum,
          MonthName: MONTH_NAMES[monthNum - 1] || `M${monthNum}`,
          'Baseline Fuel (L)': Math.round(baseline),
          'Optimized Fuel (L)': Math.round(opt),
          FuelSaved_L: Number(saved.toFixed(1)),
          SavedPct: savedPct,
        };
      });

      return NextResponse.json(data);
    }
  } catch (err) {
    console.error('Error fetching monthly fuel from PostgreSQL:', err);
  }

  return NextResponse.json(MONTHLY_FUEL_DATA);
}
