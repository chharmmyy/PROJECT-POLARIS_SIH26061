"use client";

import React from 'react';
import { 
  Sun, 
  Wind, 
  BatteryCharging, 
  Fuel, 
  Home 
} from 'lucide-react';

export default function EnergyFlowCard({
  solarKw = 42,
  windKw = 104,
  batteryKw = 0,
  dieselKw = 166,
  loadKw = 312
}) {
  return (
    <div className="bg-[#0b1428] border border-[#16274a] rounded-xl p-4 sm:p-5 flex flex-col justify-between h-full shadow-lg">
      {/* Title */}
      <div className="mb-2">
        <h3 className="font-semibold text-white text-base tracking-wide">
          Energy Flow
        </h3>
      </div>

      {/* Sources Row (4 items) */}
      <div className="grid grid-cols-4 gap-2 text-center pt-1">
        
        {/* Solar */}
        <div className="flex flex-col items-center">
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-[#081022] border border-[#1b2f5c] flex items-center justify-center mb-1.5 shadow-md">
            <Sun className="w-7 h-7 text-yellow-400" />
          </div>
          <span className="text-xs text-slate-300 font-medium">Solar</span>
          <span className="text-xs sm:text-sm font-bold text-white mt-0.5">{solarKw} kW</span>
        </div>

        {/* Wind */}
        <div className="flex flex-col items-center">
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-[#081022] border border-[#1b2f5c] flex items-center justify-center mb-1.5 shadow-md">
            <Wind className="w-7 h-7 text-sky-400" />
          </div>
          <span className="text-xs text-slate-300 font-medium">Wind</span>
          <span className="text-xs sm:text-sm font-bold text-white mt-0.5">{windKw} kW</span>
        </div>

        {/* Battery */}
        <div className="flex flex-col items-center">
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-[#081022] border border-[#1b2f5c] flex items-center justify-center mb-1.5 shadow-md">
            <BatteryCharging className="w-7 h-7 text-emerald-400" />
          </div>
          <span className="text-xs text-slate-300 font-medium">Battery</span>
          <span className="text-xs sm:text-sm font-bold text-white mt-0.5">{batteryKw} kW</span>
        </div>

        {/* Diesel */}
        <div className="flex flex-col items-center">
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-xl bg-[#081022] border border-[#1b2f5c] flex items-center justify-center mb-1.5 shadow-md">
            <Fuel className="w-7 h-7 text-red-500" />
          </div>
          <span className="text-xs text-slate-300 font-medium">Diesel</span>
          <span className="text-xs sm:text-sm font-bold text-white mt-0.5">{dieselKw} kW</span>
        </div>

      </div>

      {/* Circuit Green Lines SVG with crisp directional arrows */}
      <div className="w-full h-14 sm:h-16 relative my-1">
        <svg 
          viewBox="0 0 400 60" 
          className="w-full h-full" 
          fill="none" 
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="greenGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Solar line */}
          <path
            d="M 50 0 L 50 28 L 170 28 L 170 58"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#greenGlow)"
          />
          <polygon points="105,24 116,28 105,32" fill="#22c55e" filter="url(#greenGlow)" />
          <polygon points="166,45 174,45 170,54" fill="#22c55e" filter="url(#greenGlow)" />

          {/* Wind line */}
          <path
            d="M 150 0 L 150 18 L 185 28 L 185 58"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#greenGlow)"
          />
          <polygon points="181,45 189,45 185,54" fill="#22c55e" filter="url(#greenGlow)" />

          {/* Battery line */}
          <path
            d="M 250 0 L 250 18 L 215 28 L 215 58"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#greenGlow)"
          />
          <polygon points="211,45 219,45 215,54" fill="#22c55e" filter="url(#greenGlow)" />

          {/* Diesel line */}
          <path
            d="M 350 0 L 350 28 L 230 28 L 230 58"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#greenGlow)"
          />
          <polygon points="295,24 284,28 295,32" fill="#22c55e" filter="url(#greenGlow)" />
          <polygon points="226,45 234,45 230,54" fill="#22c55e" filter="url(#greenGlow)" />
        </svg>
      </div>

      {/* Load Node (Center Bottom) */}
      <div className="flex flex-col items-center pb-1">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#091124] border-2 border-indigo-500/70 shadow-lg shadow-indigo-950/40">
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Home className="w-5 h-5 text-indigo-300" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs text-slate-300 font-medium">Load</span>
            <span className="text-sm sm:text-base font-bold text-white">{loadKw} kW</span>
          </div>
        </div>
      </div>

    </div>
  );
}
