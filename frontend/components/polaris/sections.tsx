import { Wind, ShieldAlert, BatteryCharging, Snowflake } from "lucide-react";

const stats = [
  { v: "168 h", l: "Forecast horizon (7 days, hourly)" },
  { v: "3", l: "Stations: Bharati, Maitri, Himadri" },
  { v: "3.49%", l: "Fuel saved in the 7-day planning run" },
  { v: "2%", l: "Operating hours flagged for review" },
];
const features = [
  { i: Snowflake, t: "Load forecasting", d: "Random Forest trained on Bharati, validated on Maitri, predicts hourly station demand from weather." },
  { i: BatteryCharging, t: "Grey Wolf dispatch", d: "Battery first, then diesel held in the efficient loading band to cut fuel and CO₂." },
  { i: ShieldAlert, t: "Anomaly alerts", d: "Isolation Forest flags abnormal energy patterns with plain-language reasons." },
  { i: Wind, t: "Mission planning", d: "Daily risk levels and recommendations for the next seven days." },
];

export default function Sections() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 text-slate-900">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l}>
            <p className="text-4xl font-semibold tracking-tight text-[#2c4fb3]">{s.v}</p>
            <p className="mt-1 text-sm text-slate-500">{s.l}</p>
          </div>
        ))}
      </div>
      <div id="technology" className="mt-20 grid gap-6 md:grid-cols-2">
        {features.map(({ i: Icon, t, d }) => (
          <article key={t} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Icon aria-hidden className="h-6 w-6 text-[#2c4fb3]" />
            <h3 className="mt-4 text-lg font-medium">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
