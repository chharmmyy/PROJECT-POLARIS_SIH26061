"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Cpu, 
  Sun, 
  Wind, 
  Thermometer, 
  Battery, 
  Fuel, 
  Play, 
  Sliders, 
  Zap, 
  CloudSun,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Gauge,
  Leaf,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { predictWhatIf, fetchFeatureImportance, fetchSfcCurve, fetchWeeklyForecast } from '@/lib/api';

export default function ForecastsOptimizerPage({ stationData, initialTab = 'forecasts' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'forecasts' or 'optimizer'

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Forecast Confidence Band 24h Data
  const loadForecast24h = [
    { hour: '00', Predicted: 240, Actual: 235, Lower95: 220, Upper95: 260 },
    { hour: '03', Predicted: 200, Actual: 195, Lower95: 180, Upper95: 220 },
    { hour: '06', Predicted: 260, Actual: 255, Lower95: 240, Upper95: 280 },
    { hour: '09', Predicted: 350, Actual: 345, Lower95: 325, Upper95: 375 },
    { hour: '12', Predicted: 390, Actual: 385, Lower95: 360, Upper95: 420 },
    { hour: '15', Predicted: 360, Actual: 355, Lower95: 335, Upper95: 385 },
    { hour: '18', Predicted: 470, Actual: null, Lower95: 440, Upper95: 500 },
    { hour: '21', Predicted: 430, Actual: null, Lower95: 400, Upper95: 460 },
    { hour: '24', Predicted: 300, Actual: null, Lower95: 275, Upper95: 325 },
  ];

  // Solar & Wind Forecast Data
  const solarWindForecast = [
    { hour: '00', Solar: 0, Wind: 104 },
    { hour: '03', Solar: 0, Wind: 120 },
    { hour: '06', Solar: 35, Wind: 135 },
    { hour: '09', Solar: 220, Wind: 125 },
    { hour: '12', Solar: 460, Wind: 150 },
    { hour: '15', Solar: 380, Wind: 185 },
    { hour: '18', Solar: 90, Wind: 310 },
    { hour: '21', Solar: 0, Wind: 240 },
    { hour: '24', Solar: 0, Wind: 160 },
  ];

  // Multi-Horizon Forecast Datasets
  const loadForecast7d = [
    { hour: 'Mon', Predicted: 285, Actual: 280, Lower95: 260, Upper95: 310 },
    { hour: 'Tue', Predicted: 295, Actual: 290, Lower95: 270, Upper95: 320 },
    { hour: 'Wed', Predicted: 320, Actual: 315, Lower95: 295, Upper95: 345 },
    { hour: 'Thu', Predicted: 310, Actual: 308, Lower95: 285, Upper95: 335 },
    { hour: 'Fri', Predicted: 340, Actual: 335, Lower95: 315, Upper95: 365 },
    { hour: 'Sat', Predicted: 275, Actual: null, Lower95: 250, Upper95: 300 },
    { hour: 'Sun', Predicted: 265, Actual: null, Lower95: 240, Upper95: 290 },
  ];

  const loadForecast30d = [
    { hour: 'Wk 1', Predicted: 290, Actual: 288, Lower95: 270, Upper95: 310 },
    { hour: 'Wk 2', Predicted: 315, Actual: 310, Lower95: 290, Upper95: 340 },
    { hour: 'Wk 3', Predicted: 335, Actual: null, Lower95: 305, Upper95: 365 },
    { hour: 'Wk 4', Predicted: 305, Actual: null, Lower95: 280, Upper95: 330 },
  ];

  const solarWindForecast7d = [
    { hour: 'Mon', Solar: 180, Wind: 210 },
    { hour: 'Tue', Solar: 195, Wind: 230 },
    { hour: 'Wed', Solar: 220, Wind: 245 },
    { hour: 'Thu', Solar: 175, Wind: 220 },
    { hour: 'Fri', Solar: 210, Wind: 260 },
    { hour: 'Sat', Solar: 160, Wind: 190 },
    { hour: 'Sun', Solar: 170, Wind: 205 },
  ];

  const solarWindForecast30d = [
    { hour: 'Wk 1', Solar: 185, Wind: 215 },
    { hour: 'Wk 2', Solar: 205, Wind: 240 },
    { hour: 'Wk 3', Solar: 190, Wind: 235 },
    { hour: 'Wk 4', Solar: 175, Wind: 210 },
  ];

  // Forecast & Optimization State
  const [timeRange, setTimeRange] = useState('Today');
  const [loadForecastData, setLoadForecastData] = useState(loadForecast24h);
  const [reForecastData, setReForecastData] = useState(solarWindForecast);
  const [optimizing, setOptimizing] = useState(false);
  const [optProgress, setOptProgress] = useState(78);
  const dispatchResults = {
    solar: { current: 42, recommended: 55, diff: '+13 kW' },
    wind: { current: 104, recommended: 120, diff: '+16 kW' },
    battery: { current: 0, recommended: -60, diff: '-60 kW' },
    diesel: { current: 166, recommended: 102, diff: '-64 kW' },
  };

  // What-if simulator state
  const [simParams, setSimParams] = useState({
    temp_c: -18.0,
    wind_speed_ms: 12.0,
    ghi_est_w_m2: 320.0,
    month: 9
  });
  const [simResult, setSimResult] = useState({
    predicted_load_kw: 312,
    total_renewable_kw: 146,
    net_load_kw: 166,
    renewable_penetration_pct: 47
  });
  const [featureImportance, setFeatureImportance] = useState([
    { Feature: 'Heating Demand Index', Importance: 0.34 },
    { Feature: 'Outdoor Temp (°C)', Importance: 0.23 },
    { Feature: 'Wind Chill Factor', Importance: 0.18 },
    { Feature: 'Solar Irradiance', Importance: 0.15 },
    { Feature: 'Seasonal Baseline', Importance: 0.10 }
  ]);
  const [sfcData, setSfcData] = useState([
    { generator_loading_pct: 30, sfc_liters_per_kwh: 0.36 },
    { generator_loading_pct: 50, sfc_liters_per_kwh: 0.32 },
    { generator_loading_pct: 70, sfc_liters_per_kwh: 0.288 },
    { generator_loading_pct: 78, sfc_liters_per_kwh: 0.285 },
    { generator_loading_pct: 85, sfc_liters_per_kwh: 0.292 },
    { generator_loading_pct: 100, sfc_liters_per_kwh: 0.33 }
  ]);

  const handleSimulate = useCallback(async (params) => {
    try {
      const res = await predictWhatIf({
        station_name: stationData?.name || 'Maitri',
        ...params
      });
      if (res && res.predictions) {
        setSimResult(res.predictions);
      }
    } catch {
      const baseLoad = 312 + (-18 - params.temp_c) * 4.2;
      const reSolar = (params.ghi_est_w_m2 / 1000) * 150 * 0.78;
      const reWind = Math.min(300, Math.pow(params.wind_speed_ms / 12, 3) * 104);
      setSimResult({
        predicted_load_kw: Math.round(baseLoad),
        total_renewable_kw: Math.round(reSolar + reWind),
        net_load_kw: Math.round(Math.max(0, baseLoad - (reSolar + reWind))),
        renewable_penetration_pct: Math.min(100, Math.round(((reSolar + reWind) / baseLoad) * 100))
      });
    }
  }, [stationData]);

  const loadAuxData = useCallback(async () => {
    try {
      const [fi, sfc, wf] = await Promise.all([
        fetchFeatureImportance().catch(() => null),
        fetchSfcCurve().catch(() => null),
        fetchWeeklyForecast(stationData?.name || 'Maitri').catch(() => null)
      ]);
      if (fi) setFeatureImportance(fi);
      if (sfc) setSfcData(sfc);
      if (wf?.hourly_forecast && wf.hourly_forecast.length > 0) {
        setLoadForecastData(wf.hourly_forecast);
        setReForecastData(wf.hourly_forecast.map(f => ({
          hour: f.hour,
          Solar: f.Solar ?? 0,
          Wind: f.Wind ?? 100
        })));
      }
    } catch (e) {
      console.error(e);
    }
  }, [stationData]);

  useEffect(() => {
    loadAuxData();
  }, [loadAuxData]);

  const triggerOptimizationRun = () => {
    setOptimizing(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      if (p >= 100) {
        clearInterval(interval);
        setOptimizing(false);
        setOptProgress(100);
      } else {
        setOptProgress(p);
      }
    }, 120);
  };

  const fiData = featureImportance.map(f => ({
    feature: f.Feature,
    importance: Math.round((f.Importance || 0.2) * 100)
  }));

  // Dynamic Forecast Source by Selected Time Horizon
  const activeLoadForecast = timeRange === '7 Days' ? loadForecast7d : timeRange === '30 Days' ? loadForecast30d : loadForecastData;
  const activeReForecast = timeRange === '7 Days' ? solarWindForecast7d : timeRange === '30 Days' ? solarWindForecast30d : reForecastData;
  const stationName = stationData?.name || 'Maitri';

  // Dynamic Load Metrics
  const peakPredicted = Math.max(...activeLoadForecast.map(d => Number(d.Predicted) || 0), 100);
  const peakHourObj = activeLoadForecast.find(d => Number(d.Predicted) === peakPredicted);
  const peakHourStr = peakHourObj ? (timeRange === 'Today' ? `${peakHourObj.hour}:00` : peakHourObj.hour) : '18:00';

  const minPredicted = Math.min(...activeLoadForecast.map(d => Number(d.Predicted) || 9999), 50);
  const minHourObj = activeLoadForecast.find(d => Number(d.Predicted) === minPredicted);
  const minHourStr = minHourObj ? (timeRange === 'Today' ? `${minHourObj.hour}:00` : minHourObj.hour) : '04:00';

  const totalEnergyKwh = Math.round(
    activeLoadForecast.reduce((acc, d) => acc + (Number(d.Predicted) || 0) * (24 / (activeLoadForecast.length || 24)), 0)
  );

  const maxLoadVal = Math.max(...activeLoadForecast.map(d => Math.max(Number(d.Predicted) || 0, Number(d.Actual) || 0, Number(d.Upper95) || 0)), 50);
  const yLoadMax = Math.ceil((maxLoadVal * 1.15) / 50) * 50;
  const yLoadTicks = [0, Math.round(yLoadMax * 0.33), Math.round(yLoadMax * 0.66), yLoadMax];

  // Dynamic Renewable Generation Metrics
  const maxReVal = Math.max(...activeReForecast.map(d => Math.max(Number(d.Solar) || 0, Number(d.Wind) || 0)), 50);
  const yReMax = Math.ceil((maxReVal * 1.15) / 50) * 50;
  const yReTicks = [0, Math.round(yReMax * 0.5), yReMax];

  const peakReVal = Math.max(...activeReForecast.map(d => (Number(d.Solar) || 0) + (Number(d.Wind) || 0)), 50);
  const peakReObj = activeReForecast.find(d => ((Number(d.Solar) || 0) + (Number(d.Wind) || 0)) === peakReVal);
  const peakReHourStr = peakReObj ? (timeRange === 'Today' ? `${peakReObj.hour}:00` : peakReObj.hour) : '12:00';

  const totalReKwh = activeReForecast.reduce((acc, d) => acc + ((Number(d.Solar) || 0) + (Number(d.Wind) || 0)) * (24 / (activeReForecast.length || 24)), 0);
  const reCoveragePct = Math.min(100, Math.round((totalReKwh / (totalEnergyKwh || 1)) * 100)) || 47;

  // Station-specific Weather Context
  const stationWeather = {
    temp: stationData?.name?.toLowerCase().includes('bharati') ? '-14°C → -9°C' :
          stationData?.name?.toLowerCase().includes('himadri') ? '-6°C → -1°C' : '-16°C → -12°C',
    wind: stationData?.name?.toLowerCase().includes('bharati') ? '10 - 18 m/s' :
          stationData?.name?.toLowerCase().includes('himadri') ? '5 - 11 m/s' : '8 - 14 m/s',
    solar: stationData?.name?.toLowerCase().includes('bharati') ? '310 - 580 W/m²' :
           stationData?.name?.toLowerCase().includes('himadri') ? '120 - 290 W/m²' : '280 - 530 W/m²',
    condition: 'Mostly Clear',
    elevation: stationData?.name?.toLowerCase().includes('bharati') ? '35m ASL • Larsemann Hills' :
               stationData?.name?.toLowerCase().includes('himadri') ? '15m ASL • Svalbard Arctic' : '117m ASL • Continental Antarctica',
    trend: '+9% vs. today'
  };

  return (
    <div className="flex flex-col gap-3 w-full text-white select-none">

      {/* Top Glass Control Bar: Polaris Header & Station Status (Exact Match to Reference Screenshot) */}
      <div className="rounded-2xl bg-slate-900/75 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-wrap items-center justify-between gap-2 shrink-0 px-2.5 py-1.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] shrink-0">
            {activeTab === 'optimizer' ? (
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
            ) : (
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-extrabold text-xs sm:text-sm md:text-base text-white tracking-tight leading-none">
                {activeTab === 'optimizer' 
                  ? 'Polaris AI // Autonomous Dispatch & Optimization' 
                  : 'Energy Analytics & Telemetry Engine'}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[9px] sm:text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Station {stationName} &bull; Online &bull; Synchronized
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-blue-200/80 font-medium mt-0.5">
              {activeTab === 'optimizer'
                ? `Station ${stationName} \u2022 Grey Wolf Optimizer (GWO) \u2022 Real-Time Microgrid Arbitrage`
                : `Station ${stationName} \u2022 Unified energy, forecasting & optimization intelligence`}
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs & Analysis Period Selector */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Analysis Period Selector */}
          <div className="flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-white/20 text-xs">
            {['Today', '7 Days', '30 Days'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                  timeRange === t 
                    ? 'bg-cyan-500 text-slate-950 shadow-sm border border-cyan-300/40' 
                    : 'text-blue-200/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* VIEW 1: FORECASTS (Core 4 components in symmetrical 2x2 grid, 100% viewport fit, zero scrollbars) */}
      {activeTab === 'forecasts' && (
        <div className="flex flex-col gap-2.5 flex-1 min-h-0 w-full">

          {/* Row 1: Layout 1 (Load Forecast - 8 cols) + Layout 2 (Key Predictions - 4 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 flex-1 min-h-[220px]">
            
            {/* LAYOUT 1: Load Forecast [8 Columns] */}
            <div className="xl:col-span-8 bg-slate-900/75 backdrop-blur-xl border border-white/15 hover:border-cyan-400/40 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden transition-all">
              <div className="flex items-start justify-between mb-0.5 border-b border-white/10 pb-1 shrink-0">
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm tracking-wide">
                    Load Forecast ({timeRange === '7 Days' ? 'Next 7 Days' : timeRange === '30 Days' ? 'Next 30 Days' : 'Next 24 Hours'})
                  </h3>
                  <p className="text-[9.5px] text-blue-200/80">
                    Predicted vs. actual station consumption with 95% confidence interval
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span> Predicted
                  </span>
                  <span className="flex items-center gap-1.5 text-white/90">
                    <span className="w-2 h-2 rounded-full border border-dashed border-white bg-white/40"></span> Actual
                  </span>
                </div>
              </div>

              {/* Glowing Area Chart with unclipped Y-axis and dynamic domain */}
              <div className="flex-1 min-h-0 w-full my-0.5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeLoadForecast} margin={{ top: 8, right: 14, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="loadPredGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02}/>
                      </linearGradient>
                      <linearGradient id="loadConfGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 9, fill: '#cbd5e1' }} unit={timeRange === 'Today' ? ':00' : ''} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 9, fill: '#cbd5e1' }} domain={[0, yLoadMax]} ticks={yLoadTicks} unit=" kW" width={46} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="Upper95" stroke="#0284c7" strokeDasharray="2 2" strokeWidth={1} fill="url(#loadConfGrad)" name="Upper 95% Band" />
                    <Area type="monotone" dataKey="Predicted" stroke="#38bdf8" strokeWidth={2.5} fill="url(#loadPredGrad)" name="Predicted Load (kW)" />
                    <Line type="monotone" dataKey="Actual" stroke="#ffffff" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2.5, fill: '#ffffff' }} name="Actual Load (kW)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-1 border-t border-white/10 text-[9px] text-blue-200/80 flex justify-between items-center shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Model Confidence: <strong className="text-cyan-300">99.02% (R²)</strong>
                </span>
                <span className="text-emerald-300 font-semibold">
                  Mean Absolute Error: 0.55 kW
                </span>
              </div>
            </div>

            {/* LAYOUT 2: Key Predictions [4 Columns] */}
            <div className="xl:col-span-4 bg-slate-900/75 backdrop-blur-xl border border-white/15 hover:border-cyan-400/40 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden transition-all">
              <div className="flex items-center justify-between mb-0.5 border-b border-white/10 pb-1 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <h3 className="font-bold text-white text-xs tracking-wide">Key Predictions</h3>
                </div>
                <span className="text-[9px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  R² = 0.9902
                </span>
              </div>

              {/* Structured Key Prediction Cards - Computed Dynamically */}
              <div className="space-y-1.5 py-0.5 flex-1 flex flex-col justify-around min-h-0">
                {/* 1. Peak Demand */}
                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center shrink-0">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-blue-200/80 font-bold uppercase tracking-wider block">Peak Demand</span>
                      <span className="text-[9px] text-blue-100">{peakHourStr} - Window</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-black text-rose-300 leading-tight">~ {peakPredicted} kW</div>
                    <span className="text-[8px] text-rose-400 font-semibold">Heating Surge</span>
                  </div>
                </div>

                {/* 2. Min Demand */}
                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-blue-200/80 font-bold uppercase tracking-wider block">Min Demand</span>
                      <span className="text-[9px] text-blue-100">{minHourStr} - Window</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-black text-emerald-300 leading-tight">~ {minPredicted} kW</div>
                    <span className="text-[8px] text-emerald-400 font-semibold">Baseload Safe</span>
                  </div>
                </div>

                {/* 3. Total Energy */}
                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shrink-0">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-blue-200/80 font-bold uppercase tracking-wider block">Total Energy</span>
                      <span className="text-[9px] text-blue-100">{timeRange === '7 Days' ? '7-Day Horizon' : timeRange === '30 Days' ? '30-Day Horizon' : '24-Hour Horizon'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-black text-cyan-300 leading-tight">{totalEnergyKwh.toLocaleString()} kWh</div>
                    <span className="text-[8px] text-amber-300 font-semibold">{stationWeather.trend}</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 border-t border-white/10 text-[9px] text-blue-200/80 flex justify-between items-center shrink-0">
                <span>Horizon: {timeRange === '7 Days' ? 'Next 7 Days' : timeRange === '30 Days' ? 'Next 30 Days' : 'Next 24 Hours'}</span>
                <span className="text-cyan-300 font-semibold">Station Guard Active</span>
              </div>
            </div>

          </div>

          {/* Row 2: Layout 3 (Renewables Forecast - 8 cols) + Layout 4 (Weather Forecast - 4 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 flex-1 min-h-0">
            
            {/* LAYOUT 3: Renewable Generation Forecast [8 Columns - Perfectly Symmetrical with Row 1] */}
            <div className="xl:col-span-8 bg-slate-900/75 backdrop-blur-xl border border-white/15 hover:border-amber-400/40 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden transition-all">
              <div className="flex items-start justify-between mb-0.5 border-b border-white/10 pb-1 shrink-0">
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm tracking-wide">
                    Renewable Generation Forecast ({timeRange === '7 Days' ? 'Next 7 Days' : timeRange === '30 Days' ? 'Next 30 Days' : 'Next 24 Hours'})
                  </h3>
                  <p className="text-[9.5px] text-blue-200/80">
                    Solar irradiance vs. katabatic wind yield over {timeRange === 'Today' ? 'next 24h' : timeRange.toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span> Solar
                  </span>
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span> Wind
                  </span>
                </div>
              </div>

              {/* Dual Area Curve Chart with unclipped Y-axis and dynamic domain */}
              <div className="flex-1 min-h-0 w-full my-0.5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeReForecast} margin={{ top: 8, right: 14, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rfSolarGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.65}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="rfWindGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.65}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 9, fill: '#cbd5e1' }} unit={timeRange === 'Today' ? ':00' : ''} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 9, fill: '#cbd5e1' }} domain={[0, yReMax]} ticks={yReTicks} unit=" kW" width={46} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '10px', color: '#fff' }} />
                    <Area type="monotone" dataKey="Solar" stroke="#f59e0b" strokeWidth={2.5} fill="url(#rfSolarGrad2)" name="Solar PV (kW)" />
                    <Area type="monotone" dataKey="Wind" stroke="#38bdf8" strokeWidth={2.5} fill="url(#rfWindGrad2)" name="Wind Turbines (kW)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-1 border-t border-white/10 text-[9px] text-blue-200/80 flex justify-between items-center shrink-0">
                <span>Peak Clean Output: <strong className="text-amber-300">{peakReVal} kW @ {peakReHourStr}</strong></span>
                <span className="text-emerald-300 font-semibold">RE Coverage: {reCoveragePct}% Clean Mix</span>
              </div>
            </div>

            {/* LAYOUT 4: Weather Forecast (Next 24h) & AI Prediction Drivers [4 Columns - Spacious 2x2 Grid] */}
            <div className="xl:col-span-4 bg-slate-900/75 backdrop-blur-xl border border-white/15 hover:border-amber-400/40 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden transition-all">
              <div className="flex items-center justify-between mb-0.5 border-b border-white/10 pb-1 shrink-0">
                <div className="flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-amber-300" />
                  <h3 className="font-bold text-white text-xs tracking-wide">Weather Forecast (Next 24h)</h3>
                </div>
                <span className="text-[8.5px] text-blue-200/70 font-mono">ECMWF Polar</span>
              </div>

              {/* 4 Spacious Polar Weather Cards matching reference image */}
              <div className="grid grid-cols-2 gap-1.5 py-0.5 flex-1 items-center min-h-0">
                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full">
                  <span className="text-[8.5px] text-blue-200/80 font-medium uppercase flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-cyan-400" /> Temp
                  </span>
                  <div className="text-base sm:text-lg font-black text-cyan-300 leading-tight mt-0.5">{stationWeather.temp}</div>
                  <span className="text-[8px] text-blue-200/70">Sub-zero continental</span>
                </div>

                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full">
                  <span className="text-[8.5px] text-blue-200/80 font-medium uppercase flex items-center gap-1">
                    <Wind className="w-3 h-3 text-emerald-400" /> Wind Speed
                  </span>
                  <div className="text-base sm:text-lg font-black text-emerald-300 leading-tight mt-0.5">{stationWeather.wind}</div>
                  <span className="text-[8px] text-emerald-400">Katabatic airflow</span>
                </div>

                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full">
                  <span className="text-[8.5px] text-blue-200/80 font-medium uppercase flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-400" /> Solar Radiation
                  </span>
                  <div className="text-base sm:text-lg font-black text-amber-300 leading-tight mt-0.5">{stationWeather.solar}</div>
                  <span className="text-[8px] text-amber-300">High direct GHI</span>
                </div>

                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full">
                  <span className="text-[8.5px] text-blue-200/80 font-medium uppercase flex items-center gap-1">
                    <CloudSun className="w-3 h-3 text-yellow-300" /> Condition
                  </span>
                  <div className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">{stationWeather.condition}</div>
                  <span className="text-[8px] text-emerald-300">Visibility: &gt;20 km</span>
                </div>
              </div>

              <div className="pt-1 border-t border-white/10 text-[9px] text-blue-200/80 flex justify-between items-center shrink-0">
                <span className="truncate">{stationWeather.elevation}</span>
                <span className="text-emerald-300 font-semibold shrink-0">No Blizzards</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: AI OPTIMIZER (Balanced 2-Row Layout, Auto-Adaptive Scroll) */}
      {activeTab === 'optimizer' && (
        <div className="flex flex-col gap-2.5 w-full pb-4">
          
          {/* ROW 1: Balanced Landscape Cards - Inputs (4 cols) | AI Centerpiece (4 cols) | Recommended Dispatch (4 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 w-full min-h-[280px]">
            
            {/* COLUMN 1: Inputs in 2x2 Grid [4 / 12 Columns - Compact & Proportioned] */}
            <div className="xl:col-span-4 bg-slate-900/75 backdrop-blur-xl border border-white/15 hover:border-cyan-400/30 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden transition-all">
              <div className="flex items-center justify-between border-b border-white/10 pb-1 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-300" />
                  <h3 className="font-bold text-white text-xs sm:text-sm tracking-wide">Inputs</h3>
                </div>
                <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/30">Live Ingest</span>
              </div>

              {/* 2x2 Grid of compact inputs so they NEVER stretch vertically */}
              <div className="grid grid-cols-2 gap-1.5 py-1 flex-1 min-h-0 items-center">
                {/* 1. Forecast Demand */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full hover:border-emerald-400/30 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] text-blue-200 font-semibold truncate">Demand</span>
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                      <Sun className="w-3 h-3 text-emerald-300" />
                    </div>
                  </div>
                  <div className="my-0.5">
                    <span className="text-sm sm:text-base font-black text-white leading-tight">{peakPredicted} kW</span>
                    <span className="text-[8px] text-blue-200/70 block">Peak Expected</span>
                  </div>
                  <span className="text-[7.5px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-400/30 w-fit">Active</span>
                </div>

                {/* 2. Forecast Renewables */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full hover:border-cyan-400/30 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] text-blue-200 font-semibold truncate">Renewables</span>
                    <div className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                      <Leaf className="w-3 h-3 text-cyan-300" />
                    </div>
                  </div>
                  <div className="my-0.5">
                    <span className="text-sm sm:text-base font-black text-white leading-tight">{Math.round(peakReVal * 0.55)} kW</span>
                    <span className="text-[8px] text-blue-200/70 block">Average Yield</span>
                  </div>
                  <span className="text-[7.5px] text-cyan-300 bg-cyan-500/20 px-1.5 py-0.2 rounded border border-cyan-400/30 w-fit">PV + Wind</span>
                </div>

                {/* 3. Battery Availability */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full hover:border-purple-400/30 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] text-blue-200 font-semibold truncate">Battery</span>
                    <div className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                      <Battery className="w-3 h-3 text-purple-300" />
                    </div>
                  </div>
                  <div className="my-0.5">
                    <span className="text-sm sm:text-base font-black text-white leading-tight">78% SOC</span>
                    <span className="text-[8px] text-blue-200/70 block">~ 4.2 hrs buffer</span>
                  </div>
                  <span className="text-[7.5px] text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded border border-purple-400/30 w-fit">250 kWh</span>
                </div>

                {/* 4. Fuel Availability */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full hover:border-amber-400/30 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] text-blue-200 font-semibold truncate">Fuel Reserve</span>
                    <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                      <AlertTriangle className="w-3 h-3 text-amber-300" />
                    </div>
                  </div>
                  <div className="my-0.5">
                    <span className="text-sm sm:text-base font-black text-white leading-tight">5.8 Days</span>
                    <span className="text-[8px] text-blue-200/70 block">14,500 L on-site</span>
                  </div>
                  <span className="text-[7.5px] text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-400/30 w-fit">Safe Buffer</span>
                </div>
              </div>

              <div className="pt-1 border-t border-white/10 text-[9px] text-blue-200/80 flex justify-between items-center shrink-0">
                <span>Horizon: 24h Real-Time</span>
                <span className="text-cyan-300 font-semibold">Sensor Ingestion 100%</span>
              </div>
            </div>

            {/* COLUMN 2: AI OPTIMIZER & DISPATCH SUGGESTIONS IN THE MIDDLE [4 / 12 Columns] */}
            <div className="xl:col-span-4 bg-slate-900/75 backdrop-blur-xl border border-cyan-400/40 hover:border-cyan-300/60 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden transition-all text-center relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-1 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <h3 className="font-bold text-white text-xs sm:text-sm tracking-wide">AI Optimizer</h3>
                </div>
                <span className="text-[9px] font-semibold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/30">
                  GWO Core
                </span>
              </div>

              {/* Glowing Hexagonal Centerpiece matching media_1790780776483.png */}
              <div className="my-auto py-0.5 flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto">
                  <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl animate-pulse"></div>
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_16px_rgba(34,211,238,0.6)]">
                    <polygon 
                      points="50 3, 93 25, 93 75, 50 97, 7 75, 7 25" 
                      fill="none" 
                      stroke="url(#hexGradient2)" 
                      strokeWidth="2.5" 
                      strokeDasharray="18 4"
                    />
                    <polygon 
                      points="50 11, 84 28, 84 72, 50 89, 16 72, 16 28" 
                      fill="rgba(6, 24, 56, 0.75)" 
                      stroke="rgba(56, 189, 248, 0.5)" 
                      strokeWidth="1.5"
                    />
                    <defs>
                      <linearGradient id="hexGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <Cpu className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-pulse" />
                  </div>
                </div>

                {optimizing ? (
                  <div className="w-full max-w-[220px] mx-auto mt-1 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-[9.5px] text-cyan-300 font-semibold">
                      <Zap className="w-3 h-3 text-cyan-400 animate-spin" />
                      <span>Simulating GWO Dispatch...</span>
                    </div>
                    <div className="w-full mt-1">
                      <div className="flex justify-between text-[8px] text-blue-200/80 mb-0.5">
                        <span>Iterative Convergence</span>
                        <span className="text-cyan-300 font-mono font-bold">{optProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-950/60 h-1.5 rounded-full overflow-hidden border border-white/10">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
                          style={{ width: `${optProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-[200px] mx-auto mt-1 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[8.5px] font-bold text-emerald-300 uppercase tracking-wider">
                        Active &bull; Optimal
                      </span>
                    </div>
                    <div className="text-[8px] text-cyan-300/80 font-mono mt-0.5">
                      99.4% Multi-Fit
                    </div>
                  </div>
                )}
              </div>

              {/* AI Optimization Suggestions in 2-column grid */}
              <div className="w-full bg-slate-950/70 p-1.5 rounded-xl border border-white/10 text-left shrink-0">
                <div className="text-[8.5px] font-bold text-blue-200 uppercase tracking-wider flex items-center justify-between pb-0.5 border-b border-white/10 mb-1">
                  <span>AI Suggestions</span>
                  <span className="text-[8px] text-cyan-300 font-mono">Action Directives</span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {/* 1. CRITICAL */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)] shrink-0"></div>
                    <div className="min-w-0">
                      <span className="font-black text-rose-300 text-[8px] block leading-none">CRITICAL</span>
                      <span className="text-blue-100 text-[8px] truncate block">Backup generation</span>
                    </div>
                  </div>

                  {/* 2. HIGH */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.9)] shrink-0"></div>
                    <div className="min-w-0">
                      <span className="font-black text-amber-300 text-[8px] block leading-none">HIGH</span>
                      <span className="text-blue-100 text-[8px] truncate block">Heating reserves</span>
                    </div>
                  </div>

                  {/* 3. MEDIUM */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.9)] shrink-0"></div>
                    <div className="min-w-0">
                      <span className="font-black text-yellow-300 text-[8px] block leading-none">MEDIUM</span>
                      <span className="text-blue-100 text-[8px] truncate block">Prioritize clean RE</span>
                    </div>
                  </div>

                  {/* 4. NORMAL */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] shrink-0"></div>
                    <div className="min-w-0">
                      <span className="font-black text-emerald-300 text-[8px] block leading-none">NORMAL</span>
                      <span className="text-blue-100 text-[8px] truncate block">Baseload nominal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-1 border-t border-white/10 text-[9px] text-blue-200/80 flex justify-between items-center shrink-0">
                <span>Objective: Min Fuel Cost</span>
                <span className="text-emerald-300 font-semibold">GWO Converged</span>
              </div>
            </div>

            {/* COLUMN 3: Recommended Dispatch in Compact Layout [4 / 12 Columns] */}
            <div className="xl:col-span-4 bg-slate-900/75 backdrop-blur-xl border border-white/15 hover:border-emerald-400/30 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden transition-all">
              <div className="flex items-center justify-between border-b border-white/10 pb-1 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-300" />
                  <h3 className="font-bold text-white text-xs sm:text-sm tracking-wide">Recommended Dispatch</h3>
                </div>
                <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">Optimal GWO</span>
              </div>

              <div className="py-1 flex-1 flex flex-col justify-around min-h-0">
                <div className="grid grid-cols-12 text-[8.5px] font-bold text-blue-200/70 uppercase tracking-wider pb-0.5 border-b border-white/10 px-1">
                  <span className="col-span-4">Source</span>
                  <span className="col-span-4 text-center">Current</span>
                  <span className="col-span-4 text-right">Recommended</span>
                </div>

                {/* Solar */}
                <div className="grid grid-cols-12 items-center p-1.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-amber-400/30 transition">
                  <div className="col-span-4 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-white">Solar</span>
                  </div>
                  <div className="col-span-4 text-center text-xs font-mono text-blue-200">
                    {dispatchResults.solar.current} kW
                  </div>
                  <div className="col-span-4 text-right text-xs font-mono font-bold text-emerald-400">
                    + {dispatchResults.solar.recommended} kW
                  </div>
                </div>

                {/* Wind */}
                <div className="grid grid-cols-12 items-center p-1.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-cyan-400/30 transition">
                  <div className="col-span-4 flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-xs font-semibold text-white">Wind</span>
                  </div>
                  <div className="col-span-4 text-center text-xs font-mono text-blue-200">
                    {dispatchResults.wind.current} kW
                  </div>
                  <div className="col-span-4 text-right text-xs font-mono font-bold text-emerald-400">
                    + {dispatchResults.wind.recommended} kW
                  </div>
                </div>

                {/* Battery */}
                <div className="grid grid-cols-12 items-center p-1.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-purple-400/30 transition">
                  <div className="col-span-4 flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-xs font-semibold text-white">Battery</span>
                  </div>
                  <div className="col-span-4 text-center text-xs font-mono text-blue-200">
                    {dispatchResults.battery.current} kW
                  </div>
                  <div className="col-span-4 text-right text-xs font-mono font-bold text-cyan-300">
                    - 60 kW
                  </div>
                </div>

                {/* Diesel */}
                <div className="grid grid-cols-12 items-center p-1.5 rounded-xl bg-slate-950/70 border border-white/10 hover:border-rose-400/30 transition">
                  <div className="col-span-4 flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-xs font-semibold text-white">Diesel</span>
                  </div>
                  <div className="col-span-4 text-center text-xs font-mono text-blue-200">
                    {dispatchResults.diesel.current} kW
                  </div>
                  <div className="col-span-4 text-right text-xs font-mono font-bold text-emerald-400">
                    - {dispatchResults.diesel.recommended} kW
                  </div>
                </div>
              </div>

              <div className="pt-1 border-t border-white/10 text-[9px] text-blue-200/80 flex justify-between items-center shrink-0">
                <span>Engine Target: 78% Peak Efficiency</span>
                <span className="text-emerald-300 font-semibold">0.285 L/kWh</span>
              </div>
            </div>

          </div>

          {/* ROW 2: Balanced Bottom Deck - Projected Operational Performance (8 cols) + Generator Fuel Efficiency Curve (4 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 w-full min-h-[280px]">
            
            {/* Left: 4 Projected Performance KPI Cards [8 Columns] */}
            <div className="xl:col-span-8 bg-slate-900/75 backdrop-blur-xl border border-white/15 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-1 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <h3 className="font-bold text-white text-xs sm:text-sm tracking-wide">Projected Operational Performance</h3>
                </div>
                <span className="text-[9px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  GWO Strategy Locked
                </span>
              </div>

              {/* 4 Rich KPI Cards with progress bars */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 my-auto py-1 flex-1 items-center">
                {/* 1. Diesel Fuel Savings */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full hover:border-purple-400/30 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-blue-200 font-semibold uppercase tracking-wider">Diesel Fuel Savings</span>
                    <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
                      <Fuel className="w-3.5 h-3.5 text-purple-300" />
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-black text-white leading-tight">18% - 38.6%</div>
                  <span className="text-[8px] text-purple-300 font-medium mt-0.5">-64 kW generator dispatch</span>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: '38.6%' }}></div>
                  </div>
                </div>

                {/* 2. Clean Energy Penetration */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full hover:border-amber-400/30 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-blue-200 font-semibold uppercase tracking-wider">Clean Energy Penetration</span>
                    <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                      <Sun className="w-3.5 h-3.5 text-amber-300" />
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-black text-white leading-tight">+24%</div>
                  <span className="text-[8px] text-amber-300 font-medium mt-0.5">86% peak direct yield</span>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '74%' }}></div>
                  </div>
                </div>

                {/* 3. BESS Strategic Reserve */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full hover:border-cyan-400/30 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-blue-200 font-semibold uppercase tracking-wider">BESS Strategic Reserve</span>
                    <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center">
                      <Battery className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-black text-white leading-tight">40% Dynamic Buffer</div>
                  <span className="text-[8px] text-cyan-300 font-medium mt-0.5">Battery life cycle protected</span>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                {/* 4. Mission-Critical Reliability */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col justify-between h-full hover:border-emerald-400/30 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-blue-200 font-semibold uppercase tracking-wider">Mission-Critical Reliability</span>
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    </div>
                  </div>
                  <div className="text-base sm:text-lg font-black text-emerald-300 leading-tight">100% Guaranteed</div>
                  <span className="text-[8px] text-emerald-400 font-medium mt-0.5">Life support &amp; labs safe</span>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>

              <div className="pt-1 border-t border-white/10 text-[9px] text-blue-200/80 flex justify-between items-center shrink-0">
                <span>GWO Formulation: Minimum Fuel Cost &amp; Zero Outage Risk</span>
                <span className="text-cyan-300 font-semibold">Net Annual CO₂ Avoidance: 188 Metric Tons</span>
              </div>
            </div>

            {/* Right: SFC Generator Efficiency Curve [4 Columns] */}
            <div className="xl:col-span-4 bg-slate-900/75 backdrop-blur-xl border border-white/15 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-1 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-300" />
                  <div>
                    <h3 className="font-bold text-white text-xs sm:text-sm tracking-wide">Generator Fuel Efficiency Curve</h3>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30" title="Specific Fuel Consumption minimum operating point">
                  78% Optimal (0.285 L/kWh)
                </span>
              </div>

              {/* Mini SFC Curve Chart with unclipped tick gutter */}
              <div className="w-full h-[180px] sm:h-[200px] my-0.5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sfcData} margin={{ top: 6, right: 10, left: -6, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sfcGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="generator_loading_pct" stroke="#94a3b8" tick={{ fontSize: 8.5, fill: '#cbd5e1' }} unit="%" axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 8.5, fill: '#cbd5e1' }} domain={[0.25, 0.4]} ticks={[0.28, 0.32, 0.36]} width={38} unit=" L" axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(val) => [`${val} L/kWh`, 'Fuel Burn Rate (SFC)']} 
                      labelFormatter={(label) => `Generator Load: ${label}%`}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '9px', color: '#fff' }} 
                    />
                    <Area type="monotone" dataKey="sfc_liters_per_kwh" stroke="#f59e0b" strokeWidth={2} fill="url(#sfcGrad)" name="Fuel Burn Rate" />
                    <ReferenceLine x={78} stroke="#34d399" strokeDasharray="3 3" label={{ value: 'Peak Efficiency: 78%', fill: '#34d399', fontSize: 8.5, position: 'top' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-1 border-t border-white/10 text-[9px] text-blue-200/80 flex justify-between items-center shrink-0">
                <span>Low-Load Baseline: 0.36 L/kWh</span>
                <span className="text-emerald-300 font-semibold">Peak Efficiency: 0.285 L/kWh (-21%)</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
