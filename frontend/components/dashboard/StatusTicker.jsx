"use client";

import React from 'react';
import { ShieldCheck, Zap, Thermometer, Wind } from 'lucide-react';

export default function StatusTicker({
  station = 'Maitri',
  temp = -18,
  windSpeed = 12,
  fuelSaved = 242,
  renewablePct = 47
}) {
  return (
    <div className="w-full bg-[#071938]/80 backdrop-blur-xl border-b border-white/15 py-1.5 px-4 text-xs font-mono flex items-center justify-between overflow-x-auto scrollbar-none text-white select-none z-20">
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          <span>AUTONOMOUS GWO ACTIVE</span>
        </div>

        <div className="flex items-center gap-1 text-blue-200">
          <span>Station:</span>
          <span className="font-bold text-white">{station}</span>
        </div>

        <div className="flex items-center gap-1 text-blue-200">
          <Thermometer className="w-3.5 h-3.5 text-cyan-300" />
          <span>Temp:</span>
          <span className="font-bold text-cyan-200">{temp}°C</span>
        </div>

        <div className="flex items-center gap-1 text-blue-200">
          <Wind className="w-3.5 h-3.5 text-sky-300" />
          <span>Wind:</span>
          <span className="font-bold text-sky-200">{windSpeed} m/s</span>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 pl-4">
        <div className="flex items-center gap-1 text-blue-200">
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>RE Share:</span>
          <span className="font-bold text-emerald-300">{renewablePct}%</span>
        </div>

        <div className="flex items-center gap-1 text-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span>Fuel Saved:</span>
          <span className="font-bold text-emerald-200">{fuelSaved} L/wk</span>
        </div>

        <div className="text-[10px] text-blue-300/80">
          Telemetry Latency: 124ms (Satellite Uplink)
        </div>
      </div>
    </div>
  );
}
