"use client";

import React from 'react';
import { Sun, Wind, Battery, Fuel, ArrowRight, Zap } from 'lucide-react';

export default function MicrogridFlow({
  solarKw = 42,
  windKw = 104,
  batteryKw = 31,
  dieselKw = 166,
  loadKw = 312
}) {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 text-white">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs sm:text-sm font-bold tracking-wide">REAL-TIME BUS DISPATCH TOPOLOGY</h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
          50.0 Hz Synchronized
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-center font-mono">
        <div className="p-2 rounded-lg bg-slate-950 border border-amber-500/30">
          <Sun className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 block">Solar PV</span>
          <span className="text-sm font-bold text-amber-300">{solarKw} kW</span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950 border border-sky-500/30">
          <Wind className="w-4 h-4 text-sky-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 block">Wind Array</span>
          <span className="text-sm font-bold text-sky-300">{windKw} kW</span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950 border border-purple-500/30">
          <Battery className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 block">BESS (78%)</span>
          <span className="text-sm font-bold text-purple-300">{batteryKw} kW</span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950 border border-rose-500/30">
          <Fuel className="w-4 h-4 text-rose-400 mx-auto mb-1" />
          <span className="text-[10px] text-slate-400 block">Diesel G-1</span>
          <span className="text-sm font-bold text-rose-300">{dieselKw} kW</span>
        </div>

        <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-900/60 to-indigo-950/80 border-2 border-indigo-400/50">
          <Zap className="w-4 h-4 text-cyan-300 mx-auto mb-1 animate-bounce" />
          <span className="text-[10px] text-slate-300 font-bold block">TOTAL LOAD</span>
          <span className="text-base font-black text-white">{loadKw} kW</span>
        </div>
      </div>
    </div>
  );
}
