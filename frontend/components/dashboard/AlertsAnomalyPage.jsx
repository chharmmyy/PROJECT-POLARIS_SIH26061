"use client";

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  Play, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip
} from 'recharts';
import { evaluateAnomaly } from '@/lib/api';

export default function AlertsAnomalyPage() {
  const [counters, setCounters] = useState({
    critical: 1,
    warning: 2,
    attention: 3,
    resolved: 12
  });

  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 1,
      time: '14:15',
      severity: 'Critical',
      message: 'Fuel level below 70%',
      action: 'Check fuel status',
      actionTaken: false,
      resolved: false
    },
    {
      id: 2,
      time: '12:00',
      severity: 'Warning',
      message: 'Wind generation decreasing (expected 42% drop)',
      action: 'Monitor & prepare',
      actionTaken: false,
      resolved: false
    },
    {
      id: 3,
      time: '10:20',
      severity: 'Attention',
      message: 'High heating demand expected (19:00 - 22:00)',
      action: 'Keep battery reserve',
      actionTaken: false,
      resolved: false
    },
    {
      id: 4,
      time: '08:35',
      severity: 'Attention',
      message: 'Battery temperature slightly high (24°C)',
      action: 'Check ventilation',
      actionTaken: false,
      resolved: false
    }
  ]);

  const [notification, setNotification] = useState(null);

  const [evalInput, setEvalInput] = useState({
    temp_c: -28.0,
    wind_speed_ms: 16.5,
    rh_pct: 82.0,
    ghi_est_w_m2: 40.0,
    renewable_kw: 6.0,
    total_load_kw: 148.0
  });
  const [evalResult, setEvalResult] = useState({
    is_anomaly: true,
    system_status: 'Critical Weather Anomaly',
    severity: 'Critical',
    alert: 'Extreme Cold & High Wind Blizzard Spike',
    recommendation: 'Lock Life-Support Heating Guard (60%). Pre-dispatch diesel genset to 80% sweet spot.'
  });
  const [evaluating, setEvaluating] = useState(false);

  const anomalyBreakdown = [
    { type: 'Extreme cold surge', count: 420, color: '#0ea5e9' },
    { type: 'High wind blizzard', count: 310, color: '#10b981' },
    { type: 'Peak demand surge', count: 180, color: '#f59e0b' },
    { type: 'Renewable deficit', count: 120, color: '#ef4444' },
    { type: 'Sensor drift', count: 81, color: '#a855f7' }
  ];

  const handleEvaluate = async (input) => {
    try {
      setEvaluating(true);
      const res = await evaluateAnomaly(input);
      setEvalResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleActionClick = (alert) => {
    setActiveAlerts(prev => prev.map(a => {
      if (a.id === alert.id) {
        return { ...a, actionTaken: true };
      }
      return a;
    }));
    setNotification(`Action initiated: "${alert.action}" for ${alert.message}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleResolveAlert = (id) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
    setCounters(prev => ({
      ...prev,
      resolved: prev.resolved + 1
    }));
    setNotification(`Alert successfully resolved and recorded into polar mission logs.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const getSeverityBadgeClass = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-950 text-rose-300 border-rose-500/60';
      case 'warning':
        return 'bg-amber-950 text-amber-300 border-amber-500/60';
      case 'attention':
        return 'bg-yellow-950 text-yellow-300 border-yellow-500/60';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/60';
    }
  };

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 h-full overflow-hidden">

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-slate-900 border border-sky-400 text-sky-200 text-xs font-mono shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner Toolbar */}
      <div className="p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-rose-500/10 text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
              ALERTS, EMERGENCY & AI ANOMALY GUARD
            </span>
            <span className="hidden md:inline text-[10px] text-slate-400 ml-2">
              Real-time triage & Isolation Forest anomaly hyper-boundary
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 radar-pulse shrink-0"></span>
            Telemetry Sentinel Active
          </span>
        </div>
      </div>

      {/* 4 Summary Stat Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 shrink-0 font-mono">
        <div className="polar-card p-1.5 sm:p-2 border-rose-500/40 bg-gradient-to-br from-rose-950/30 to-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider block">CRITICAL</span>
            <div className="text-xl sm:text-2xl font-black text-white leading-none my-0.5">{counters.critical}</div>
            <span className="text-[9px] text-rose-300 truncate block">Immediate intervention</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping mr-1"></span>
        </div>

        <div className="polar-card p-1.5 sm:p-2 border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">WARNING</span>
            <div className="text-xl sm:text-2xl font-black text-white leading-none my-0.5">{counters.warning}</div>
            <span className="text-[9px] text-amber-300 truncate block">Weather & genset shifts</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-1"></span>
        </div>

        <div className="polar-card p-1.5 sm:p-2 border-yellow-500/40 bg-gradient-to-br from-yellow-950/30 to-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-wider block">ATTENTION</span>
            <div className="text-xl sm:text-2xl font-black text-white leading-none my-0.5">{counters.attention}</div>
            <span className="text-[9px] text-yellow-300 truncate block">Preventative maintenance</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 mr-1"></span>
        </div>

        <div className="polar-card p-1.5 sm:p-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-slate-900 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">RESOLVED</span>
            <div className="text-xl sm:text-2xl font-black text-white leading-none my-0.5">{counters.resolved}</div>
            <span className="text-[9px] text-emerald-300 truncate block">Operational logs cleared</span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1" />
        </div>
      </div>

      {/* Active Alerts Table */}
      <div className="polar-card p-2 sm:p-2.5 flex-1 min-h-0 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1 border-b border-slate-800 pb-1">
          <div>
            <h3 className="font-bold text-white text-xs sm:text-sm tracking-wide">
              ACTIVE POLAR OPERATIONAL ALERTS FEED
            </h3>
            <p className="text-[9px] text-slate-400">
              Real-time events with prescribed station operator mitigations
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {activeAlerts.length} Unresolved Alerts
          </span>
        </div>

        <div className="flex-1 min-h-[90px] overflow-y-auto scrollbar-none">
          <table className="w-full text-left text-[11px] font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                <th className="py-1 px-1.5">Time</th>
                <th className="py-1 px-1.5">Severity</th>
                <th className="py-1 px-1.5">Telemetry Event / Message</th>
                <th className="py-1 px-1.5">Prescribed Action</th>
                <th className="py-1 px-1.5 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeAlerts.map((al) => (
                <tr key={al.id} className="hover:bg-slate-900/60">
                  <td className="py-1 px-1.5 font-bold text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{al.time}</span>
                  </td>
                  <td className="py-1 px-1.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getSeverityBadgeClass(al.severity)}`}>
                      {al.severity}
                    </span>
                  </td>
                  <td className="py-1 px-1.5 font-semibold text-white">
                    {al.message}
                  </td>
                  <td className="py-1 px-1.5">
                    <button
                      onClick={() => handleActionClick(al)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition cursor-pointer ${
                        al.actionTaken
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          : 'bg-sky-500/20 text-sky-300 border-sky-400/40 hover:bg-sky-500/30'
                      }`}
                    >
                      {al.actionTaken ? '✓ Dispatched' : al.action}
                    </button>
                  </td>
                  <td className="py-1 px-1.5 text-right">
                    <button
                      onClick={() => handleResolveAlert(al.id)}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-700 transition cursor-pointer"
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostics & Live Evaluator Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-1.5 sm:gap-2 flex-1 min-h-0">
        
        {/* Anomaly Classification Donut */}
        <div className="polar-card p-2 sm:p-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1 border-b border-slate-800 pb-0.5">
              <h3 className="font-bold text-white text-xs tracking-wide">
                ANOMALY BREAKDOWN
              </h3>
              <span className="text-[9px] font-mono text-slate-400">1,111 Total Flags</span>
            </div>

            <div className="relative h-24 sm:h-28 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ backgroundColor: '#0b1329', borderColor: '#334155', fontSize: '10px' }} />
                  <Pie
                    data={anomalyBreakdown}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={44}
                    paddingAngle={3}
                  >
                    {anomalyBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black font-mono text-white leading-none">1,111</span>
                <span className="text-[8px] font-mono text-slate-400">Flags</span>
              </div>
            </div>
          </div>

          <div className="space-y-0.5 pt-1 border-t border-slate-800 text-[10px] font-mono">
            {anomalyBreakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-800/80">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate max-w-[130px]">{item.type}</span>
                </span>
                <span className="font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operational Diagnostic Tool */}
        <div className="xl:col-span-2 polar-card p-2 sm:p-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5 border-b border-slate-800 pb-1">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
                <h3 className="font-bold text-white text-xs sm:text-sm">LIVE AI DIAGNOSTIC EVALUATOR</h3>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40 shrink-0">
                Prescriptive ML
              </span>
            </div>

            <p className="text-[10px] text-slate-400 mb-1.5">
              Submit sensor telemetry to evaluate against the trained Isolation Forest hyper-boundary and receive actionable mitigations.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[10px] font-mono mb-2">
              <div>
                <label className="text-slate-400 block mb-0.5 truncate">Temp (°C):</label>
                <input 
                  type="number" step="0.5"
                  value={evalInput.temp_c}
                  onChange={(e) => setEvalInput({ ...evalInput, temp_c: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5 truncate">Wind (m/s):</label>
                <input 
                  type="number" step="0.5"
                  value={evalInput.wind_speed_ms}
                  onChange={(e) => setEvalInput({ ...evalInput, wind_speed_ms: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5 truncate">Load (kW):</label>
                <input 
                  type="number" step="1"
                  value={evalInput.total_load_kw}
                  onChange={(e) => setEvalInput({ ...evalInput, total_load_kw: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5 truncate">GHI (W/m²):</label>
                <input 
                  type="number" step="10"
                  value={evalInput.ghi_est_w_m2}
                  onChange={(e) => setEvalInput({ ...evalInput, ghi_est_w_m2: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5 truncate">RE (kW):</label>
                <input 
                  type="number" step="0.5"
                  value={evalInput.renewable_kw}
                  onChange={(e) => setEvalInput({ ...evalInput, renewable_kw: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5 truncate">RH (%):</label>
                <input 
                  type="number" step="1"
                  value={evalInput.rh_pct}
                  onChange={(e) => setEvalInput({ ...evalInput, rh_pct: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end mb-1.5">
              <button
                onClick={() => handleEvaluate(evalInput)}
                disabled={evaluating}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] font-mono transition cursor-pointer shadow-md"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run Isolation Forest Diagnostic</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Result Output */}
          {evalResult && (
            <div className={`p-2 rounded-lg border ${
              evalResult.is_anomaly ? 'bg-rose-950/40 border-rose-500/50' : 'bg-emerald-950/40 border-emerald-500/50'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {evalResult.is_anomaly ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="font-bold text-xs text-white font-mono">
                    STATUS: {evalResult.system_status.toUpperCase()}
                  </span>
                </div>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono border ${getSeverityBadgeClass(evalResult.severity)}`}>
                  {evalResult.severity}
                </span>
              </div>

              <div className="text-[11px] font-mono space-y-0.5">
                <div className="text-slate-200">
                  <span className="text-slate-400">Diagnosis: </span>
                  <span className="font-bold text-rose-300">{evalResult.alert}</span>
                </div>
                <div className="text-slate-300">
                  <span className="text-slate-400">Mitigation: </span>
                  <span className="text-emerald-300 font-semibold">{evalResult.recommendation}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
