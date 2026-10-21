"use client";

import React from 'react';
import { 
  Battery, 
  Wind, 
  Sun, 
  Fuel, 
  ArrowDown,
  ArrowDownLeft,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Zap
} from 'lucide-react';

export default function PolarMicrogrid3DNetwork({
  loadKw = 120,
  windKw = 1,
  solarKw = 4,
  batteryKw = 0,
  batterySoc = 78,
  dieselKw = 116,
  dieselLph = 104,
  stationName = 'Maitri'
}) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-900/65 backdrop-blur-xl rounded-2xl border border-sky-400/30 p-2 sm:p-2.5 overflow-hidden select-none shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-sky-400/20 text-white">
      
      {/* Background Layer: Subtle Darker Radial Area Behind Station */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.35)_0%,transparent_70%)]" />

      {/* Network Header with Live Microgrid Telemetry Layer */}
      <div className="flex items-center justify-between z-20 shrink-0 mb-0.5 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.9)]"></div>
          <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
            Microgrid Power Flow &amp; Digital Twin
          </span>
        </div>

        {/* Live Telemetry Status Line */}
        <div className="flex items-center gap-2 font-mono">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-cyan-400/35 text-[9px] sm:text-[10px] text-cyan-200 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-extrabold text-[8.5px] sm:text-[9.5px] tracking-wider text-emerald-300">LIVE MICROGRID</span>
            <span className="text-slate-600">&bull;</span>
            <span className="font-bold text-white">50.01 Hz</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-sky-300">124 ms latency</span>
          </div>
        </div>
      </div>

      {/* Main Isometric Stage Container */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 w-full overflow-hidden">
        
        <div className="relative w-full max-w-[580px] h-full flex items-center justify-center mx-auto">
          
          {/* Animated SVG Flow Conduits */}
          <svg 
            viewBox="0 0 580 260" 
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#38bdf8" floodOpacity="0.7"/>
              </filter>
              <filter id="greenGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#34d399" floodOpacity="0.8"/>
              </filter>
              <filter id="redGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#f87171" floodOpacity="0.9"/>
              </filter>
            </defs>

            {/* 1. BATTERY CONDUIT (Battery Card <-> Station) */}
            <path 
              d="M 100 36 Q 170 75 245 115" 
              stroke="#c084fc" 
              strokeWidth="4" 
              strokeOpacity="0.18"
              fill="none" 
            />
            <path 
              d="M 100 36 Q 170 75 245 115" 
              stroke="#c084fc" 
              strokeWidth="2" 
              fill="none" 
              strokeDasharray="5 4"
              className="animate-flow-dash"
            />
            <circle cx="100" cy="36" r="3.5" fill="#c084fc" />
            <circle cx="245" cy="115" r="2.5" fill="#c084fc" />
            <circle r="2.5" fill="#e9d5ff">
              <animateMotion dur="3.5s" repeatCount="indefinite" path="M 100 36 Q 170 75 245 115" />
            </circle>

            {/* 2. WIND CONDUIT (Wind Card -> Station) */}
            <path 
              d="M 480 36 Q 410 75 335 115" 
              stroke="#38bdf8" 
              strokeWidth="4" 
              strokeOpacity="0.18"
              fill="none" 
            />
            <path 
              d="M 480 36 Q 410 75 335 115" 
              stroke="#38bdf8" 
              strokeWidth="2" 
              fill="none" 
              strokeDasharray="5 4"
              className="animate-flow-dash"
              filter="url(#cyanGlow)"
            />
            <circle cx="480" cy="36" r="3.5" fill="#38bdf8" />
            <circle cx="335" cy="115" r="2.5" fill="#38bdf8" />
            <circle r="2.5" fill="#e0f2fe" filter="url(#cyanGlow)">
              <animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 36 Q 410 75 335 115" />
            </circle>

            {/* 3. DIESEL CONDUIT (Diesel Card -> Station) */}
            <path 
              d="M 100 215 Q 170 185 245 155" 
              stroke="#f87171" 
              strokeWidth="4.5" 
              strokeOpacity="0.25"
              fill="none" 
            />
            <path 
              d="M 100 215 Q 170 185 245 155" 
              stroke="#f87171" 
              strokeWidth="2.5" 
              fill="none" 
              strokeDasharray="6 4"
              className="animate-flow-dash"
              filter="url(#redGlow)"
            />
            <circle cx="100" cy="215" r="4" fill="#f87171" />
            <circle cx="245" cy="155" r="3" fill="#f87171" />
            <circle r="3.5" fill="#fecdd3" filter="url(#redGlow)">
              <animateMotion dur="2.0s" repeatCount="indefinite" path="M 100 215 Q 170 185 245 155" />
            </circle>
            <circle r="2.5" fill="#ffe4e6">
              <animateMotion dur="2.0s" begin="1.0s" repeatCount="indefinite" path="M 100 215 Q 170 185 245 155" />
            </circle>

            {/* 4. SOLAR CONDUIT (Solar Card -> Station) */}
            <path 
              d="M 480 215 Q 410 185 335 155" 
              stroke="#34d399" 
              strokeWidth="4" 
              strokeOpacity="0.2"
              fill="none" 
            />
            <path 
              d="M 480 215 Q 410 185 335 155" 
              stroke="#34d399" 
              strokeWidth="2.2" 
              fill="none" 
              strokeDasharray="5 4"
              className="animate-flow-dash"
              filter="url(#greenGlow)"
            />
            <circle cx="480" cy="215" r="3.5" fill="#34d399" />
            <circle cx="335" cy="155" r="3" fill="#34d399" />
            <circle r="3" fill="#a7f3d0" filter="url(#greenGlow)">
              <animateMotion dur="2.5s" repeatCount="indefinite" path="M 480 215 Q 410 185 335 155" />
            </circle>

            {/* 5. TOTAL LOAD CONDUIT */}
            <path 
              d="M 290 175 L 290 236" 
              stroke="#38bdf8" 
              strokeWidth="4" 
              strokeOpacity="0.2"
              fill="none" 
            />
            <path 
              d="M 290 175 L 290 236" 
              stroke="#38bdf8" 
              strokeWidth="2" 
              fill="none" 
              filter="url(#cyanGlow)"
            />
            <polygon points="285,231 295,231 290,238" fill="#38bdf8" />
            <circle r="3" fill="#e0f2fe" filter="url(#cyanGlow)">
              <animateMotion dur="1.7s" repeatCount="indefinite" path="M 290 175 L 290 236" />
            </circle>
          </svg>

          {/* Central 3D Isometric Station with Subtle Atmospheric Glow & Ground Shadow */}
          <div className="relative z-0 flex items-center justify-center my-auto">
            {/* Subtle Atmospheric Halo */}
            <div className="absolute w-56 h-32 sm:w-72 sm:h-40 lg:w-88 lg:h-48 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none transform translate-y-3 z-0" />
            
            {/* Very Subtle Ground Shadow Beneath 3D Station */}
            <div className="absolute w-44 sm:w-56 lg:w-64 h-5 sm:h-6 bg-slate-950/25 rounded-[100%] blur-md pointer-events-none transform translate-y-16 sm:translate-y-18 z-0" />
            
            {/* Previous Stable 3D Station Image */}
            <img 
              src="/polar_station_3d.png" 
              alt="Antarctic Research Station 3D Digital Twin" 
              className="w-56 h-56 sm:w-68 sm:h-68 lg:w-80 lg:h-80 max-h-[175px] sm:max-h-[210px] object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.65)] brightness-110 contrast-105 hover:scale-[1.02] transition-transform duration-500 pointer-events-auto relative z-10"
            />
          </div>

          {/* --- 4 REFINED CORNER ATTRIBUTE LABELS --- */}

          {/* 1. BATTERY (Top-Left) */}
          <div className="absolute top-1 left-1 sm:left-2 z-20 bg-slate-900/90 backdrop-blur-md border border-purple-400/40 rounded-lg sm:rounded-xl px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-[0_4px_16px_rgba(168,85,247,0.2)] text-left hover:border-purple-300 transition hover:scale-105">
            <div className="flex items-center justify-between gap-1.5 mb-0.5">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <Battery className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="text-[9px] sm:text-xs font-bold text-purple-200 uppercase tracking-wider">Battery</span>
              </div>
              <span className="text-[9px] text-purple-300 flex items-center" title="Bidirectional Storage Flow">
                <ArrowLeftRight className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="text-[12px] sm:text-sm font-black text-white leading-tight">
              {batteryKw} kW
            </div>
            <div className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9.5px] font-bold text-purple-300 bg-purple-500/20 border border-purple-400/30 px-1.5 py-0.2 rounded mt-0.5">
              <span>⚡</span> {batterySoc}% SOC
            </div>
          </div>

          {/* 2. WIND (Top-Right) */}
          <div className="absolute top-1 right-1 sm:right-2 z-20 bg-slate-900/90 backdrop-blur-md border border-sky-400/40 rounded-lg sm:rounded-xl px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-[0_4px_16px_rgba(56,189,248,0.2)] text-right hover:border-sky-300 transition hover:scale-105">
            <div className="flex items-center justify-end gap-1.5 mb-0.5">
              <span className="text-[9px] text-sky-300 flex items-center" title="Flowing into Station">
                <ArrowDownLeft className="w-2.5 h-2.5" />
              </span>
              <span className="text-[9px] sm:text-xs font-bold text-sky-200 uppercase tracking-wider">Wind</span>
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                <Wind className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <div className="text-[12px] sm:text-sm font-black text-white leading-tight">
              {windKw} kW
            </div>
            <span className="text-[8.5px] sm:text-[9.5px] font-bold text-cyan-300 block mt-0.5">
              12.0 m/s
            </span>
          </div>

          {/* 3. DIESEL (Bottom-Left) */}
          <div className="absolute bottom-4 left-1 sm:left-2 z-20 bg-slate-900/90 backdrop-blur-md border border-rose-400/50 rounded-lg sm:rounded-xl px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-[0_4px_20px_rgba(244,63,94,0.3)] text-left hover:border-rose-300 transition hover:scale-105">
            <div className="flex items-center justify-between gap-1.5 mb-0.5">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
                  <Fuel className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="text-[9px] sm:text-xs font-bold text-rose-200 uppercase tracking-wider">Diesel</span>
              </div>
              <span className="text-[9px] text-rose-300 flex items-center" title="Flowing into Station">
                <ArrowUpRight className="w-2.5 h-2.5" />
              </span>
            </div>
            <div className="text-[12px] sm:text-sm font-black text-white leading-tight">
              {dieselKw} kW
            </div>
            <span className="text-[8.5px] sm:text-[9.5px] font-bold text-rose-300 block mt-0.5">
              {dieselLph} L/h
            </span>
          </div>

          {/* 4. SOLAR (Bottom-Right) */}
          <div className="absolute bottom-4 right-1 sm:right-2 z-20 bg-slate-900/90 backdrop-blur-md border border-emerald-400/50 rounded-lg sm:rounded-xl px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-[0_4px_20px_rgba(16,185,129,0.25)] text-right hover:border-emerald-300 transition hover:scale-105">
            <div className="flex items-center justify-end gap-1.5 mb-0.5">
              <span className="text-[9px] text-emerald-300 flex items-center" title="Flowing into Station">
                <ArrowUpLeft className="w-2.5 h-2.5" />
              </span>
              <span className="text-[9px] sm:text-xs font-bold text-emerald-200 uppercase tracking-wider">Solar</span>
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Sun className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <div className="text-[12px] sm:text-sm font-black text-white leading-tight">
              {solarKw} kW
            </div>
            <span className="text-[8.5px] sm:text-[9.5px] font-bold text-emerald-300 block mt-0.5">
              330 W/m²
            </span>
          </div>

          {/* 5. TOTAL MICROGRID LOAD (Bottom-Center Destination) */}
          <div className="absolute bottom-0 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-0.5 rounded-full bg-slate-900/95 backdrop-blur-md border border-cyan-400/70 shadow-[0_4px_20px_rgba(34,211,238,0.45)] ring-1 ring-cyan-400/30">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300">
              <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-300" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-200">Station Load:</span>
            <span className="text-[11px] sm:text-xs md:text-sm font-black text-cyan-300 font-mono">
              {loadKw} kW
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}

