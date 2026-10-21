"use client";

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Zap, 
  Wind, 
  Battery, 
  Fuel, 
  Sun,
  Activity,
  Sliders,
  ChevronRight,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowUpRight,
  Cpu,
  Flame,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  fetchSystemStatus, 
  fetchMonthlyFuel, 
  fetchAlerts
} from '@/lib/api';
import PolarMicrogrid3DNetwork from './PolarMicrogrid3DNetwork';

export default function OverviewPage({
  selectedStation = 'Maitri',
  onNavigateTab
}) {
  const [systemKpis, setSystemKpis] = useState(null);
  const [monthlyFuelData, setMonthlyFuelData] = useState([]);
  const [alertsList, setAlertsList] = useState([]);
  const [appliedActions, setAppliedActions] = useState({});
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState({});

  // Dynamically derive Energy Mix Donut Data from PostgreSQL systemKpis with operational defaults
  const solarKw = systemKpis?.solar_kw ?? 4;
  const windKw = systemKpis?.wind_kw ?? 1;
  const batteryKw = systemKpis?.battery_kw ?? 0;
  const dieselKw = systemKpis?.diesel_kw ?? 116;
  const stationLoadKw = systemKpis?.station_load_kw ?? 120;
  const totalGen = Math.max(1, solarKw + windKw + batteryKw + dieselKw);

  const energyMixData = [
    { name: 'Wind', value: Math.round((windKw / totalGen) * 100), kw: windKw, color: '#38bdf8' },
    { name: 'Solar', value: Math.round((solarKw / totalGen) * 100), kw: solarKw, color: '#34d399' },
    { name: 'Battery', value: Math.round((batteryKw / totalGen) * 100), kw: batteryKw, color: '#c084fc' },
    { name: 'Diesel', value: Math.round((dieselKw / totalGen) * 100), kw: dieselKw, color: '#f87171' }
  ];

  // Next 24 Hours (Forecast) Data
  const next24HoursForecast = [
    { time: '00', demand: 195, renewables: 38 },
    { time: '04', demand: 260, renewables: 65 },
    { time: '08', demand: 230, renewables: 135 },
    { time: '12', demand: 140, renewables: 285 },
    { time: '16', demand: 190, renewables: 240 },
    { time: '20', demand: 210, renewables: 220 },
    { time: '24', demand: 175, renewables: 290 },
  ];

  // AI Optimization Suggestions for Polar Microgrid Operator
  const aiSuggestions = [
    {
      id: 'ai-1',
      title: 'Pre-charge Thermal Storage Bank',
      category: 'Thermal Storage',
      urgency: 'OPTIMAL',
      urgencyColor: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300',
      impact: '+18.4 L Fuel Saved',
      description: 'Wind & solar surplus (+84 kW) predicted from 11:30 to 15:00. Pre-heat hydronic buffer to shave evening diesel peak.',
      actionText: 'Dispatch Thermal',
      actionKey: 'dispatch_thermal'
    },
    {
      id: 'ai-2',
      title: 'Throttle Diesel G-2 to 42% Base',
      category: 'GWO Dispatch',
      urgency: 'RECOMMENDED',
      urgencyColor: 'border-cyan-400/40 bg-cyan-500/20 text-cyan-300',
      impact: '+9.2% SFC Efficiency',
      description: 'Renewable coverage is 46.8%. Ramp down Generator #2 to prevent wet stacking and optimize fuel rate.',
      actionText: 'Ramp Down G-2',
      actionKey: 'throttle_g2'
    },
    {
      id: 'ai-3',
      title: 'BESS Sub-Zero Thermal Guard',
      category: 'Battery Guard',
      urgency: 'PREVENTATIVE',
      urgencyColor: 'border-purple-400/40 bg-purple-500/20 text-purple-300',
      impact: 'Preserves 99.4% SOH',
      description: 'Ambient temp dropping to -26°C. Engage battery rack trace heating (+3.5 kW) before 19:00.',
      actionText: 'Pre-Heat Racks',
      actionKey: 'preheat_bess'
    },
    {
      id: 'ai-4',
      title: 'Shift Science Lab Core-Drill Load',
      category: 'Demand Side',
      urgency: 'ADVISORY',
      urgencyColor: 'border-blue-400/40 bg-blue-500/20 text-blue-300',
      impact: '-42 kg CO₂ Saved',
      description: 'Defer high-load ice core furnace and centrifuge runs to the 13:00 clean solar peak window.',
      actionText: 'Schedule Shift',
      actionKey: 'shift_load'
    }
  ];

  // Fallback polar alerts
  const polarAlerts = [
    {
      id: 'alert-1',
      title: 'Katabatic Wind Warning',
      time: '4m ago',
      severity: 'WARNING',
      severityColor: 'border-amber-400/40 bg-amber-500/20 text-amber-300',
      icon: Wind,
      iconColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      message: 'Gusts 18.2 m/s from ice sheet. Pitch feathering active on Turbines WT-1 & WT-2.'
    },
    {
      id: 'alert-2',
      title: 'Diesel Generator SFC Variance',
      time: '18m ago',
      severity: 'CRITICAL',
      severityColor: 'border-rose-400/40 bg-rose-500/20 text-rose-300',
      icon: Fuel,
      iconColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
      message: 'G-1 SFC elevated at 0.34 L/kWh. GWO optimization rebalancing active generator loading.'
    }
  ];

  // Dynamic display alerts from PostgreSQL alertsList with fallback
  const displayAlerts = alertsList.length > 0
    ? alertsList.map(a => ({
        id: `db-alert-${a.id}`,
        title: a.category || 'System Alert',
        time: a.time || 'Recent',
        severity: (a.severity || 'Warning').toUpperCase(),
        severityColor: a.severity?.toLowerCase() === 'critical'
          ? 'border-rose-400/40 bg-rose-500/20 text-rose-300'
          : a.severity?.toLowerCase() === 'warning'
          ? 'border-amber-400/40 bg-amber-500/20 text-amber-300'
          : 'border-cyan-400/40 bg-cyan-500/20 text-cyan-300',
        icon: a.category?.includes('Wind') ? Wind : a.category?.includes('Demand') ? Zap : Fuel,
        iconColor: a.severity?.toLowerCase() === 'critical'
          ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
          : a.severity?.toLowerCase() === 'warning'
          ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
          : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
        message: a.message
      }))
    : polarAlerts;

  // Load Polaris data
  useEffect(() => {
    async function loadPolarisData() {
      try {
        const [status, fuel, alerts] = await Promise.all([
          fetchSystemStatus(selectedStation).catch(() => null),
          fetchMonthlyFuel().catch(() => null),
          fetchAlerts({ limit: 10 }).catch(() => null),
        ]);

        if (status?.kpis) setSystemKpis(status.kpis);
        if (Array.isArray(fuel) && fuel.length > 0) setMonthlyFuelData(fuel);
        if (Array.isArray(alerts) && alerts.length > 0) setAlertsList(alerts);
      } catch (err) {
        console.error('Error loading Polaris microgrid data:', err);
      }
    }

    loadPolarisData();
  }, [selectedStation]);

  const handleApplyAction = (actionKey) => {
    setAppliedActions(prev => ({
      ...prev,
      [actionKey]: !prev[actionKey]
    }));
  };

  const handleApplyAllActions = () => {
    const all = {};
    aiSuggestions.forEach(s => {
      all[s.actionKey] = true;
    });
    setAppliedActions(all);
  };

  const handleAcknowledgeAlert = (id) => {
    setAcknowledgedAlerts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full flex flex-col gap-3 select-none text-white">
      
      {/* Top Header: Sleek, compact inline bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 py-0.5">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-none drop-shadow-sm truncate">
            Dashboard Overview
          </h1>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-300 shrink-0"></span>
          <p className="text-xs text-blue-200/90 font-medium hidden sm:block truncate">
            Project Polaris &bull; {selectedStation} Research Station Digital Twin
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button 
            onClick={() => onNavigateTab && onNavigateTab('optimization')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl border border-white/25 bg-white/10 text-white text-[11px] sm:text-xs font-semibold hover:bg-white/20 transition shadow-xs cursor-pointer backdrop-blur-md"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-300" />
            <span>GWO Optimizer</span>
          </button>

          <button 
            onClick={() => {
              window.dispatchEvent(new CustomEvent('polaris:download-report'));
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[11px] sm:text-xs font-semibold transition shadow-md cursor-pointer border border-cyan-300/40"
            title="Download Operational Report (PDF)"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Download Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Metric Cards (Visual Hierarchy: Primary Anchor + Secondary Tier) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 shrink-0">
        
        {/* Card 1: PRIMARY KPI ANCHOR - Station Power Load (Level 3 Active Dominant Anchor) */}
        <div className="bg-gradient-to-br from-sky-950/80 via-slate-900/90 to-blue-950/80 border border-sky-400/35 rounded-xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(2,6,23,0.7)] ring-1 ring-sky-400/20 flex flex-col justify-between hover:border-sky-300/60 transition-all relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] sm:text-xs font-bold text-sky-200 uppercase tracking-wide truncate">
              Station Power Load
            </span>
            <div className="w-5 h-5 rounded-md bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-cyan-300 shrink-0">
              <Zap className="w-3 h-3 text-cyan-300" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.5 relative z-10">
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">
              {systemKpis?.station_load_kw ?? 120}
            </span>
            <span className="text-xs sm:text-sm font-black text-cyan-300">kW</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-500/20 text-cyan-300 border border-cyan-400/30 text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              PRIMARY
            </span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-sky-200/80 font-medium mt-0.5 truncate relative z-10">
            Diesel Req: {systemKpis?.diesel_kw ?? 116} kW &bull; Burn: {systemKpis?.diesel_burn_rate_lph ?? 104} L/h
          </div>
        </div>

        {/* Card 2: SECONDARY KPI - Renewable Integration (Level 2 Translucent Glass) */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-300 truncate">Renewable Integration</span>
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-300 shrink-0">
              <Wind className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-300" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.5">
            <span className="text-base sm:text-lg lg:text-xl font-bold text-slate-100 tracking-tight leading-none">
              {systemKpis?.renewable_kw ?? 5}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-300">kW</span>
            <span className="inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 text-[9px] sm:text-[10px] font-medium ml-auto">
              ▲ {systemKpis?.renewable_penetration_pct ?? 4.2}%
            </span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-400 font-normal mt-0.5 truncate">
            Wind: {systemKpis?.wind_kw ?? 1} kW &bull; Solar: {systemKpis?.solar_kw ?? 4} kW
          </div>
        </div>

        {/* Card 3: SECONDARY KPI - Battery Reserve (Level 2 Translucent Glass) */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-300 truncate">Battery Reserve</span>
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-purple-500/15 border border-purple-400/20 flex items-center justify-center text-purple-300 shrink-0">
              <Battery className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-300" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.5">
            <span className="text-base sm:text-lg lg:text-xl font-bold text-slate-100 tracking-tight leading-none">
              {systemKpis?.battery_soc_pct ?? 78}%
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-purple-300">SOC</span>
            <span className="inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.2 rounded-md bg-purple-500/15 text-purple-300 border border-purple-400/25 text-[9px] sm:text-[10px] font-medium ml-auto">
              ▲ Buffer
            </span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-400 font-normal mt-0.5 truncate">
            Cap: {systemKpis?.battery_capacity_kwh ?? 250} kWh &bull; 50.01 Hz Safe
          </div>
        </div>

        {/* Card 4: SECONDARY KPI - Fuel Inventory (Level 2 Translucent Glass) */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-2 sm:p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-300 truncate">Diesel Inventory</span>
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-rose-500/15 border border-rose-400/20 flex items-center justify-center text-rose-300 shrink-0">
              <Fuel className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-300" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.5">
            <span className="text-base sm:text-lg lg:text-xl font-bold text-slate-100 tracking-tight leading-none">
              {(systemKpis?.fuel_reserve_liters ?? 14500).toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-rose-300">L</span>
            <span className="inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 text-[9px] sm:text-[10px] font-medium ml-auto">
              ▲ {systemKpis?.fuel_buffer_days ?? 5.8}d
            </span>
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-400 font-normal mt-0.5 truncate">
            Saved: {systemKpis?.gwo_fuel_saved_liters_week ?? 242}L &bull; CO₂: -{systemKpis?.avoided_co2_kg_week ?? 650}kg
          </div>
        </div>

      </div>

      {/* Row 2: Separated Generation Mix, 24h Forecast, and 3D Microgrid Digital Twin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-2.5 items-stretch flex-1 min-h-[400px]">
        
        {/* Left Column: 2 Independent Cards (Balanced 50/50 Stable Proportions) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-2 sm:gap-2.5 h-full">
          
          {/* Card A: Source Generation Mix Card (Balanced Stable Height, Picture Perfect) */}
          <div className="flex-1 min-h-[195px] bg-slate-900/75 backdrop-blur-xl border border-white/15 rounded-2xl p-3 sm:p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between hover:border-cyan-400/30 transition-all">
            {/* Header */}
            <div className="w-full flex items-center justify-between shrink-0 mb-1.5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Source Generation Mix
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {systemKpis?.renewable_penetration_pct ?? 4.2}% Clean
                </span>
                <span className="text-[9px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-400/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  Live Dispatch
                </span>
              </div>
            </div>

            {/* Main Area: High-Res Donut + 4 Polished Source Cards */}
            <div className="flex-1 w-full flex items-center justify-between gap-3 sm:gap-4 my-auto py-1">
              {/* Donut Chart (Stable 105-112px diameter) */}
              <div className="relative w-[105px] h-[105px] sm:w-[112px] sm:h-[112px] shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#ffffff', fontSize: '11px' }}
                      formatter={(val, name, entry) => [`${val}% (${entry.payload.kw} kW)`, name]}
                    />
                    <Pie
                      data={energyMixData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="88%"
                      paddingAngle={3}
                      stroke="#0f172a"
                      strokeWidth={2}
                    >
                      {energyMixData.map((entry, index) => (
                        <Cell key={`mix-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Central Load Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm sm:text-base font-black text-white tracking-tight leading-none drop-shadow-md">
                    {stationLoadKw} kW
                  </span>
                  <span className="text-[7.5px] font-extrabold text-cyan-300 uppercase tracking-widest mt-0.5">
                    LOAD
                  </span>
                </div>
              </div>

              {/* 4 Source Cards: Polished 2x2 grid with ample breathing room */}
              <div className="flex-1 grid grid-cols-2 gap-1.5 sm:gap-2">
                {energyMixData.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="px-2.5 py-1.5 sm:py-2 rounded-xl bg-slate-950/70 border border-white/10 hover:border-white/20 transition flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0 shadow-xs" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-bold text-slate-200 truncate text-[8.5px] sm:text-[9px] uppercase tracking-wider leading-none">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[8px] sm:text-[8.5px] font-mono font-bold text-blue-200/80 leading-none">
                        {item.value}%
                      </span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-xs sm:text-sm font-black text-white leading-none">
                        {item.kw} <span className="text-[9px] font-semibold text-slate-400">kW</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Operational Summary Footer matching Card B */}
            <div className="shrink-0 flex items-center justify-between pt-1.5 mt-0.5 border-t border-white/10 text-[9px] sm:text-[9.5px] text-blue-200/80">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Clean Output: <strong className="text-emerald-300 font-bold">{systemKpis?.renewable_kw ?? 5} kW</strong>
              </span>
              <span className="text-slate-400 font-medium">
                Diesel Req: <strong className="text-rose-300 font-bold">{systemKpis?.diesel_kw ?? 116} kW</strong>
              </span>
            </div>
          </div>

          {/* Card B: Next 24h Forecast Horizon Card (Balanced Stable Height) */}
          <div className="flex-1 min-h-[195px] bg-slate-900/75 backdrop-blur-xl border border-white/15 rounded-2xl p-3 sm:p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between hover:border-cyan-400/30 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between gap-1 mb-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Next 24h Forecast Horizon
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[9.5px] font-semibold">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs"></span>
                  <span className="text-blue-100">Demand</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-xs"></span>
                  <span className="text-blue-100">Renewables</span>
                </div>
              </div>
            </div>

            {/* Area Chart Container */}
            <div className="w-full flex-1 min-h-0 overflow-hidden py-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={next24HoursForecast}
                  margin={{ top: 6, right: 8, left: -22, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="forecastDemandMiniGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="forecastRenewablesMiniGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 9, fill: '#cbd5e1' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val}:00`}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 9, fill: '#cbd5e1' }} 
                    ticks={[0, 100, 200, 300]}
                    domain={[0, 320]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#ffffff', fontSize: '10px' }}
                    formatter={(val, name) => [`${val} kW`, name === 'demand' ? 'Demand' : 'Renewables']}
                    labelFormatter={(label) => `Hour ${label}:00`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#forecastDemandMiniGrad)" 
                    name="demand"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="renewables" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#forecastRenewablesMiniGrad)" 
                    name="renewables"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Forecast Summary */}
            <div className="shrink-0 flex items-center justify-between pt-1 border-t border-white/10 text-[9.5px] text-blue-200/80">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Peak Window: <strong className="text-amber-300">12:00–16:00</strong>
              </span>
              <span className="text-emerald-300 font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/25">
                +84 kW Surplus
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Prominent 3D Polar Microgrid Model (Matching Height) */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col min-h-[400px] h-full">
          <PolarMicrogrid3DNetwork 
            loadKw={systemKpis?.station_load_kw ?? 120}
            windKw={systemKpis?.wind_kw ?? 1}
            solarKw={systemKpis?.solar_kw ?? 4}
            batteryKw={systemKpis?.battery_kw ?? 0}
            batterySoc={systemKpis?.battery_soc_pct ?? 78}
            dieselKw={systemKpis?.diesel_kw ?? 116}
            dieselLph={systemKpis?.diesel_burn_rate_lph ?? 104}
            stationName={selectedStation}
          />
        </div>
      </div>

      {/* Row 3: Split 50% / 50% - Showing 2 Compact Visible Items (Alerts & AI Optimization Suggestions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2.5 shrink-0">
        
        {/* Left Half: System Alerts (Level 2 Translucent Glass + Optimal Scanability) */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between hover:border-white/20 transition-all">
          
          {/* Alerts Header */}
          <div className="flex items-center justify-between mb-1.5 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center shadow-xs shrink-0">
                <Bell className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
              <h2 className="text-xs font-bold text-white tracking-tight leading-none">
                System Alerts &amp; Polar Anomalies
              </h2>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                {displayAlerts.length - Object.values(acknowledgedAlerts).filter(Boolean).length} Active
              </span>
            </div>

            <button
              onClick={() => onNavigateTab && onNavigateTab('analytics')}
              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-cyan-300 hover:text-cyan-200 transition cursor-pointer"
            >
              <span>All Logs</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Alerts List (Stable balanced height - 2 visible items without overflow) */}
          <div className="max-h-[96px] sm:max-h-[105px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {displayAlerts.map((alert) => {
              const isAck = acknowledgedAlerts[alert.id];
              const IconComp = alert.icon;

              return (
                <div 
                  key={alert.id}
                  className={`p-1.5 sm:p-2 rounded-lg bg-slate-950/60 backdrop-blur-md border transition flex items-center justify-between gap-2 text-left ${
                    isAck ? 'opacity-50 border-white/5 bg-slate-950/30' : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md border flex items-center justify-center shrink-0 ${alert.iconColor}`}>
                      <IconComp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] sm:text-[10.5px] font-bold text-white truncate">
                          {alert.title}
                        </span>
                        <span className={`text-[7.5px] sm:text-[8px] font-extrabold px-1 rounded border uppercase tracking-wider ${alert.severityColor}`}>
                          {alert.severity}
                        </span>
                        <span className="text-[8px] text-blue-300/70 font-medium ml-auto shrink-0">
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[9.5px] text-slate-300 truncate mt-0.5">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className={`px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9px] font-semibold border transition shrink-0 cursor-pointer ${
                      isAck 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
                        : 'bg-white/10 text-blue-200 hover:bg-white/20 border-white/20'
                    }`}
                  >
                    {isAck ? 'Ack ✓' : 'Ack'}
                  </button>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Half: AI Optimization Suggestions (Level 2 Translucent Glass + Optimal Scanability) */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col justify-between hover:border-white/20 transition-all">
          
          {/* AI Header */}
          <div className="flex items-center justify-between mb-1.5 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-gradient-to-br from-cyan-400/30 to-blue-600/30 text-cyan-300 border border-cyan-400/40 flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-300" />
              </div>
              <h2 className="text-xs font-bold text-white tracking-tight leading-none">
                AI Optimization Suggestions
              </h2>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                GWO Active
              </span>
            </div>

            <button
              onClick={handleApplyAllActions}
              className="inline-flex items-center gap-1 text-[9.5px] sm:text-[10px] font-bold text-emerald-300 hover:text-emerald-200 transition cursor-pointer"
            >
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Apply All Directives</span>
            </button>
          </div>

          {/* AI Suggestions List (Stable balanced height - 2 visible items without overflow) */}
          <div className="max-h-[96px] sm:max-h-[105px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {aiSuggestions.map((sugg) => {
              const isApplied = appliedActions[sugg.actionKey];

              return (
                <div 
                  key={sugg.id}
                  className={`p-1.5 sm:p-2 rounded-lg bg-slate-950/60 backdrop-blur-md border transition flex items-center justify-between gap-2 text-left ${
                    isApplied 
                      ? 'border-emerald-500/50 bg-emerald-950/20' 
                      : 'border-white/10 hover:border-cyan-400/30'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-[10.5px] font-bold text-white truncate">
                        {sugg.title}
                      </span>
                      <span className={`text-[7.5px] sm:text-[8px] font-extrabold px-1 rounded border uppercase tracking-wider ${sugg.urgencyColor}`}>
                        {sugg.urgency}
                      </span>
                      <span className="text-[8px] sm:text-[8.5px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/25 px-1 py-0.2 rounded ml-auto shrink-0">
                        {sugg.impact}
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[9.5px] text-slate-300 truncate mt-0.5">
                      {sugg.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleApplyAction(sugg.actionKey)}
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[9.5px] font-bold border transition shrink-0 flex items-center gap-1 cursor-pointer ${
                      isApplied
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                        : 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 hover:from-cyan-500/50 hover:to-blue-600/50 text-cyan-200 border-cyan-400/40 hover:text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        <span>Applied ✓</span>
                      </>
                    ) : (
                      <>
                        <span>{sugg.actionText}</span>
                        <ArrowUpRight className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
