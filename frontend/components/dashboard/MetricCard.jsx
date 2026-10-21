"use client";

import React from 'react';

export default function MetricCard({ 
  title, 
  value, 
  unit = '', 
  subtitle, 
  icon: Icon, 
  accent = 'cyan', // 'cyan', 'emerald', 'amber', 'rose'
  badge,
  badgeType = 'neutral'
}) {
  const accentClasses = {
    cyan: {
      border: 'border-sky-500/20',
      text: 'text-sky-400',
      bgIcon: 'bg-sky-500/10 text-sky-400',
      glow: 'hover:border-sky-500/40'
    },
    emerald: {
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      bgIcon: 'bg-emerald-500/10 text-emerald-400',
      glow: 'hover:border-emerald-500/40'
    },
    amber: {
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      bgIcon: 'bg-amber-500/10 text-amber-400',
      glow: 'hover:border-amber-500/40'
    },
    rose: {
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      bgIcon: 'bg-rose-500/10 text-rose-400',
      glow: 'hover:border-rose-500/40'
    }
  }[accent] || {
    border: 'border-slate-700',
    text: 'text-white',
    bgIcon: 'bg-slate-800 text-slate-300',
    glow: ''
  };

  const badgeStyles = {
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-950/80 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-950/80 text-rose-400 border-rose-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700'
  }[badgeType] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <div className={`polar-card p-4 flex flex-col justify-between ${accentClasses.border} ${accentClasses.glow}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${accentClasses.bgIcon}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">{value}</span>
        {unit && <span className="text-xs font-mono text-slate-400">{unit}</span>}
      </div>

      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/60">
        <span className="text-[11px] text-slate-400 truncate">{subtitle}</span>
        {badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
