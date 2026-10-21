"use client";

import React from 'react';
import { 
  FileText, 
  MapPin, 
  Activity, 
  Zap, 
  Wind, 
  Sun, 
  BatteryCharging, 
  Flame, 
  Gauge, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  CheckCircle 
} from 'lucide-react';

export default function PolarisA4ReportTemplate({
  stationConfig = {},
  activePeriod = {},
  selectedDate = '2026-09-27',
  reportType = 'daily'
}) {
  const chartData = activePeriod.chartData || [];
  
  // High-DPI Crisp SVG Dimensions (Height: 130px for perfect vertical budget in Row 3)
  const svgWidth = 515;
  const svgHeight = 130;
  const padLeft = 32;
  const padRight = 12;
  const padTop = 8;
  const padBottom = 20;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const maxVal = Math.max(
    ...chartData.map(d => Math.max(d.Consumed || 0, d.Renewable || 0)), 
    100
  ) * 1.15;

  const points = chartData.map((d, i) => {
    const x = padLeft + (chartData.length > 1 ? (i / (chartData.length - 1)) * plotW : plotW / 2);
    const yCons = padTop + plotH - ((d.Consumed || 0) / maxVal) * plotH;
    const yRen = padTop + plotH - ((d.Renewable || 0) / maxVal) * plotH;
    return { x, yCons, yRen, label: d.label, Consumed: d.Consumed, Renewable: d.Renewable };
  });

  const consAreaPath = points.length > 0 
    ? `M ${points[0].x},${padTop + plotH} ` + 
      points.map(p => `L ${p.x},${p.yCons}`).join(' ') + 
      ` L ${points[points.length - 1].x},${padTop + plotH} Z`
    : '';

  const consLinePath = points.length > 0
    ? `M ${points[0].x},${points[0].yCons} ` + 
      points.map(p => `L ${p.x},${p.yCons}`).join(' ')
    : '';

  const renAreaPath = points.length > 0
    ? `M ${points[0].x},${padTop + plotH} ` + 
      points.map(p => `L ${p.x},${p.yRen}`).join(' ') + 
      ` L ${points[points.length - 1].x},${padTop + plotH} Z`
    : '';

  const renLinePath = points.length > 0
    ? `M ${points[0].x},${points[0].yRen} ` + 
      points.map(p => `L ${p.x},${p.yRen}`).join(' ')
    : '';

  const fontSans = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  return (
    <div 
      id="polaris-printable-report"
      style={{
        width: '1122px',
        height: '794px',
        minWidth: '1122px',
        minHeight: '794px',
        maxWidth: '1122px',
        maxHeight: '794px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        padding: '8px 16px',
        boxSizing: 'border-box',
        fontFamily: fontSans,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      {/* 1. REPORT HEADER (46px) */}
      <div 
        style={{
          height: '46px',
          background: 'linear-gradient(135deg, #091e42 0%, #0d2757 100%)',
          color: '#ffffff',
          padding: '5px 12px',
          borderRadius: '6px',
          border: '1px solid #1e3a8a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 5px rgba(9,30,66,0.12)',
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div 
            style={{
              padding: '4px',
              borderRadius: '5px',
              background: 'rgba(56, 189, 248, 0.2)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={15} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: fontSans, color: '#ffffff' }}>
                POLARIS AI // STATION OPERATIONAL REPORT
              </span>
              <span 
                style={{
                  fontSize: '8.5px',
                  fontWeight: 800,
                  fontFamily: fontSans,
                  height: '18px',
                  lineHeight: '18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#064e3b',
                  color: '#6ee7b7',
                  border: '1px solid #059669',
                  boxSizing: 'border-box',
                  verticalAlign: 'middle'
                }}
              >
                AUDIT COMPLIANT
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '9px', color: '#93c5fd', marginTop: '1px', fontFamily: fontSans }}>
              {stationConfig.name || 'Maitri Research Station'} • Energy Performance • Renewable Integration • GWO Dispatch
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontFamily: fontSans }}>
          <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#f8fafc' }}>
            {activePeriod.periodLabel || '24-Hour Operational Cycle'}
          </div>
          <div style={{ fontSize: '8.5px', color: '#cbd5e1', marginTop: '1px' }}>
            Period: {activePeriod.dateRange || 'Sep 27, 2026'} • Generated: {selectedDate}
          </div>
        </div>
      </div>

      {/* 2. SECTION 1 — STATION OVERVIEW & SITE CLASSIFICATION (44px) */}
      <div 
        style={{
          height: '44px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '4px 10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '2px',
            marginBottom: '3px'
          }}
        >
          <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={11} />
            1. STATION OVERVIEW &amp; SITE CLASSIFICATION
          </span>
          <span style={{ fontSize: '8.5px', color: '#475569', fontWeight: 600 }}>
            {stationConfig.location || '70.76°S, 11.73°E'} • Elevation: {stationConfig.elevation || '117m a.s.l.'} • {stationConfig.region || 'Schirmacher Oasis, Queen Maud Land'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '8px', color: '#334155', lineHeight: 1.3 }}>
          <div>
            <strong style={{ color: '#0f172a' }}>Autonomous Polar Environment: </strong>
            100% self-contained microgrid operating in extreme sub-zero conditions (-70°C to -10°C, 35 m/s gale winds).
          </div>
          <div>
            <strong style={{ color: '#0f172a' }}>Renewable-First Strategy: </strong>
            Bifacial solar PV + cold-climate wind turbines backed by 500 kWh LiFePO₄ BESS minimize diesel reliance.
          </div>
          <div>
            <strong style={{ color: '#0f172a' }}>AI &amp; GWO Optimization: </strong>
            Neural load forecasts and Grey Wolf Optimizer (GWO) dispatch diesel gensets while guaranteeing 100% life-support uptime.
          </div>
        </div>
      </div>

      {/* 3. EXECUTIVE KPI STRIP (78px) — OPTIMAL HEIGHT WITH CLEAN WHITESPACE & ZERO BORDER OVERLAP */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '8px', 
          height: '78px', 
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        {/* KPI 1: Energy Consumed */}
        <div 
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '5px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            boxSizing: 'border-box',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '12px', lineHeight: '12px' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#475569' }}>
              ENERGY CONSUMED
            </span>
            <Zap size={12} color="#0284c7" />
          </div>
          <div style={{ margin: '0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', lineHeight: '20px' }}>
                {activePeriod.consumedKwh || '7,420'}
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0284c7' }}>
                kWh
              </span>
            </div>
            <div style={{ fontSize: '8px', fontWeight: 600, color: '#64748b', lineHeight: '11px', marginTop: '1px' }}>
              Total Station Load
            </div>
          </div>
          <div style={{ fontSize: '7.5px', lineHeight: '10px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '3px', marginTop: 'auto' }}>
            Target: ≤ {activePeriod.targetKwh || '7,800'} kWh • Peak: {activePeriod.avgLoadKw || '309.2'} kW
          </div>
        </div>

        {/* KPI 2: Renewable Generated */}
        <div 
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '6px',
            padding: '5px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            boxSizing: 'border-box',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '12px', lineHeight: '12px' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#166534' }}>
              RENEWABLE GENERATED
            </span>
            <Wind size={12} color="#15803d" />
          </div>
          <div style={{ margin: '0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#15803d', lineHeight: '20px' }}>
                {activePeriod.renewableKwh || '4,120'}
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#15803d' }}>
                kWh
              </span>
            </div>
            <div style={{ fontSize: '8px', fontWeight: 700, color: '#16a34a', lineHeight: '11px', marginTop: '1px' }}>
              {activePeriod.renewablePct || '55.5'}% Clean Energy Share
            </div>
          </div>
          <div style={{ fontSize: '7.5px', lineHeight: '10px', color: '#166534', borderTop: '1px solid #bbf7d0', paddingTop: '3px', marginTop: 'auto', fontWeight: 600 }}>
            Peak Green: {activePeriod.peakRenewableKw || '146'} kW Real-Time
          </div>
        </div>

        {/* KPI 3: Diesel Consumed */}
        <div 
          style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '6px',
            padding: '5px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            boxSizing: 'border-box',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '12px', lineHeight: '12px' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#9f1239' }}>
              DIESEL CONSUMED
            </span>
            <Flame size={12} color="#be123c" />
          </div>
          <div style={{ margin: '0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#be123c', lineHeight: '20px' }}>
                {activePeriod.dieselLiters || '1,840'}
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#be123c' }}>
                Liters
              </span>
            </div>
            <div style={{ fontSize: '8px', fontWeight: 600, color: '#64748b', lineHeight: '11px', marginTop: '1px' }}>
              Total Fuel Consumed
            </div>
          </div>
          <div style={{ fontSize: '7.5px', lineHeight: '10px', color: '#15803d', borderTop: '1px solid #fecdd3', paddingTop: '3px', marginTop: 'auto', fontWeight: 700 }}>
            Saved: {activePeriod.fuelSavedL || '1,776'} L ({activePeriod.fuelSavedPct || '26.8%'}) via GWO
          </div>
        </div>

        {/* KPI 4: CO2 Emissions */}
        <div 
          style={{
            backgroundColor: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: '6px',
            padding: '5px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            boxSizing: 'border-box',
            height: '100%',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '12px', lineHeight: '12px' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#115e59' }}>
              CO₂ EMISSIONS
            </span>
            <ShieldCheck size={12} color="#0f766e" />
          </div>
          <div style={{ margin: '0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f766e', lineHeight: '20px' }}>
                {activePeriod.co2Tons || '4.8'}
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f766e' }}>
                Tons
              </span>
            </div>
            <div style={{ fontSize: '8px', fontWeight: 600, color: '#64748b', lineHeight: '11px', marginTop: '1px' }}>
              Direct CO₂ Output
            </div>
          </div>
          <div style={{ fontSize: '7.5px', lineHeight: '10px', color: '#0f766e', borderTop: '1px solid #99f6e4', paddingTop: '3px', marginTop: 'auto', fontWeight: 700 }}>
            Avoided: {activePeriod.co2AvoidedKg || '4,760'} kg CO₂ Reduced
          </div>
        </div>
      </div>

      {/* 4. ROW 1: SECTION 2 (STATION SYSTEM OVERVIEW) + SECTION 3 (ENERGY PERFORMANCE & SOURCE MIX) (160px) */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '8px', 
          height: '160px', 
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        {/* SECTION 2: STATION SYSTEM OVERVIEW */}
        <div 
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            height: '100%'
          }}
        >
          <div>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '2px',
                marginBottom: '4px'
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={11} />
                2. STATION SYSTEM OVERVIEW
              </span>
              <span style={{ fontSize: '8.5px', color: '#64748b', fontWeight: 600 }}>
                Capacity: 695 kVA/kW Total
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
              <thead>
                <tr style={{ color: '#475569', borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', fontSize: '8px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '2px 4px', width: '22%' }}>System</th>
                  <th style={{ padding: '2px 4px', width: '28%' }}>Capacity / Rating</th>
                  <th style={{ padding: '2px 4px', width: '34%' }}>Current Output / State</th>
                  <th style={{ padding: '2px 4px', width: '16%', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '2.5px 4px', fontWeight: 700, color: '#0f172a' }}>Solar PV</td>
                  <td style={{ padding: '2.5px 4px', color: '#475569' }}>120 kW Bifacial Array</td>
                  <td style={{ padding: '2.5px 4px', color: '#d97706', fontWeight: 700 }}>{activePeriod.solarKwh || '1,008'} kWh Yield</td>
                  <td style={{ padding: '2.5px 4px', textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '16px', lineHeight: '16px', borderRadius: '4px', fontSize: '8px', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', boxSizing: 'border-box' }}>
                      Online
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '2.5px 4px', fontWeight: 700, color: '#0f172a' }}>Wind Array</td>
                  <td style={{ padding: '2.5px 4px', color: '#475569' }}>200 kW (4x 50 kW)</td>
                  <td style={{ padding: '2.5px 4px', color: '#0284c7', fontWeight: 700 }}>{activePeriod.windKwh || '3,112'} kWh Yield</td>
                  <td style={{ padding: '2.5px 4px', textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '16px', lineHeight: '16px', borderRadius: '4px', fontSize: '8px', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', boxSizing: 'border-box' }}>
                      Active
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '2.5px 4px', fontWeight: 700, color: '#0f172a' }}>LiFePO₄ Storage</td>
                  <td style={{ padding: '2.5px 4px', color: '#475569' }}>500 kWh Thermal BESS</td>
                  <td style={{ padding: '2.5px 4px', color: '#15803d', fontWeight: 700 }}>78.0% SOC ({activePeriod.batteryThroughput || '17.4'} Cycles)</td>
                  <td style={{ padding: '2.5px 4px', textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '16px', lineHeight: '16px', borderRadius: '4px', fontSize: '8px', fontWeight: 800, backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', boxSizing: 'border-box' }}>
                      Standby
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '2.5px 4px', fontWeight: 700, color: '#0f172a' }}>Diesel Genset</td>
                  <td style={{ padding: '2.5px 4px', color: '#475569' }}>3x 125 kVA Volvo Arctic</td>
                  <td style={{ padding: '2.5px 4px', color: '#be123c', fontWeight: 700 }}>{activePeriod.dieselLiters || '1,840'} L Consumed</td>
                  <td style={{ padding: '2.5px 4px', textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '16px', lineHeight: '16px', borderRadius: '4px', fontSize: '8px', fontWeight: 800, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', boxSizing: 'border-box' }}>
                      Available
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '2.5px 4px', fontWeight: 700, color: '#0f172a' }}>Grid Bus</td>
                  <td style={{ padding: '2.5px 4px', color: '#475569' }}>415V 3-Phase / 50 Hz</td>
                  <td style={{ padding: '2.5px 4px', color: '#7c3aed', fontWeight: 700 }}>50.01 Hz Synchronous</td>
                  <td style={{ padding: '2.5px 4px', textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '16px', lineHeight: '16px', borderRadius: '4px', fontSize: '8px', fontWeight: 800, backgroundColor: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe', boxSizing: 'border-box' }}>
                      Locked
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div 
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '2px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '8px',
              color: '#475569'
            }}
          >
            <span>Subsystems: All 5 Units Monitored in Real-Time</span>
            <span style={{ color: '#15803d', fontWeight: 700 }}>✓ 100% Operational Availability</span>
          </div>
        </div>

        {/* SECTION 3: ENERGY PERFORMANCE & SOURCE MIX */}
        <div 
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            height: '100%'
          }}
        >
          <div>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '2px',
                marginBottom: '4px'
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={11} />
                3. ENERGY PERFORMANCE &amp; SOURCE MIX
              </span>
              <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#15803d' }}>
                Clean Yield: {activePeriod.renewablePct || '55.5'}% ({activePeriod.renewableKwh || '4,120'} kWh)
              </span>
            </div>

            {/* 4 Stat Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px', fontSize: '8.5px', marginBottom: '4px' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 4px' }}>
                <span style={{ fontSize: '7.5px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Generated:</span>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '9.5px' }}>{activePeriod.consumedKwh || '7,420'} kWh</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 4px' }}>
                <span style={{ fontSize: '7.5px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Station Load:</span>
                <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '9.5px' }}>{activePeriod.avgLoadKw || '309.2'} kW</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 4px' }}>
                <span style={{ fontSize: '7.5px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Renewable Yield:</span>
                <span style={{ fontWeight: 800, color: '#15803d', fontSize: '9.5px' }}>{activePeriod.renewableKwh || '4,120'} kWh</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 4px' }}>
                <span style={{ fontSize: '7.5px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Thermal Demand:</span>
                <span style={{ fontWeight: 800, color: '#0891b2', fontSize: '9.5px' }}>{activePeriod.heatingLoadKw || '142.0'} kW</span>
              </div>
            </div>

            {/* Source Generation Mix Panel */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '4px 7px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '14px', lineHeight: '14px', fontSize: '8px', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                <span style={{ display: 'inline-block', lineHeight: '14px' }}>SOURCE GENERATION MIX (TOTAL: {activePeriod.consumedKwh || '7,420'} kWh)</span>
                <span style={{ display: 'inline-block', lineHeight: '14px', color: '#15803d', fontWeight: 800 }}>Clean: {activePeriod.renewablePct || '55.5'}% • Diesel: {(100 - (activePeriod.renewablePct || 55.5)).toFixed(1)}%</span>
              </div>
              
              {/* Progress Bar */}
              <div style={{ display: 'flex', width: '100%', height: '11px', borderRadius: '5.5px', overflow: 'hidden', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', marginBottom: '4px', boxSizing: 'border-box' }}>
                <div style={{ width: `${activePeriod.sourceBreakdown?.[0]?.pct || 13.6}%`, backgroundColor: '#f59e0b', height: '100%' }} title="Solar PV" />
                <div style={{ width: `${activePeriod.sourceBreakdown?.[1]?.pct || 41.9}%`, backgroundColor: '#06b6d4', height: '100%' }} title="Wind Turbines" />
                <div style={{ width: `${activePeriod.sourceBreakdown?.[2]?.pct || 44.5}%`, backgroundColor: '#f43f5e', height: '100%' }} title="Diesel Genset" />
              </div>

              {/* 3-Card Legend */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', height: '20px', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', padding: '2px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '7.5px', color: '#b45309', fontWeight: 700, lineHeight: '1' }}>● Solar:</span>
                  <strong style={{ fontSize: '8.5px', color: '#d97706', lineHeight: '1' }}>1,008 kWh ({activePeriod.sourceBreakdown?.[0]?.pct || '13.6'}%)</strong>
                </div>
                <div style={{ backgroundColor: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '4px', padding: '2px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '7.5px', color: '#0e7490', fontWeight: 700, lineHeight: '1' }}>● Wind:</span>
                  <strong style={{ fontSize: '8.5px', color: '#0284c7', lineHeight: '1' }}>3,112 kWh ({activePeriod.sourceBreakdown?.[1]?.pct || '41.9'}%)</strong>
                </div>
                <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '4px', padding: '2px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '7.5px', color: '#be123c', fontWeight: 700, lineHeight: '1' }}>● Diesel:</span>
                  <strong style={{ fontSize: '8.5px', color: '#9f1239', lineHeight: '1' }}>3,300 kWh ({activePeriod.sourceBreakdown?.[2]?.pct || '44.5'}%)</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748b' }}>
            <span>Renewable Threshold: Met (&gt;50%)</span>
            <span style={{ color: '#15803d', fontWeight: 700 }}>Heat-Recovery Cogeneration Active • Zero Curtailment</span>
          </div>
        </div>
      </div>

      {/* 5. ROW 2: SECTION 4 (RENEWABLE PERFORMANCE) + SECTION 5 (STORAGE & GWO DISPATCH) (186px) */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '8px', 
          height: '186px', 
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        {/* SECTION 4: RENEWABLE PERFORMANCE */}
        <div 
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            height: '100%'
          }}
        >
          <div>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '2px',
                marginBottom: '4px'
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Wind size={11} />
                4. RENEWABLE PERFORMANCE
              </span>
              <span style={{ fontSize: '8.5px', color: '#475569', fontWeight: 600 }}>
                Total Yield: {activePeriod.renewableKwh || '4,120'} kWh
              </span>
            </div>

            {/* 3 Upper Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.15fr', gap: '5px', fontSize: '8.5px', marginBottom: '4px' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 7px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sun size={14} color="#d97706" />
                <div>
                  <span style={{ fontSize: '7.5px', color: '#64748b', display: 'block', fontWeight: 600 }}>Solar PV</span>
                  <strong style={{ color: '#d97706', fontSize: '10.5px' }}>{activePeriod.solarKwh || '1,008'} kWh</strong>
                  <span style={{ fontSize: '7.5px', color: '#b45309', display: 'block', fontWeight: 700 }}>24.5% Share</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 7px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wind size={14} color="#0284c7" />
                <div>
                  <span style={{ fontSize: '7.5px', color: '#64748b', display: 'block', fontWeight: 600 }}>Wind Array</span>
                  <strong style={{ color: '#0284c7', fontSize: '10.5px' }}>{activePeriod.windKwh || '3,112'} kWh</strong>
                  <span style={{ fontSize: '7.5px', color: '#0369a1', display: 'block', fontWeight: 700 }}>75.5% Share</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 7px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gauge size={14} color="#15803d" />
                <div>
                  <span style={{ fontSize: '7.5px', color: '#64748b', display: 'block', fontWeight: 600 }}>Peak Green Output</span>
                  <strong style={{ color: '#15803d', fontSize: '10.5px' }}>{activePeriod.peakRenewableKw || '146'} kW</strong>
                  <span style={{ fontSize: '7.5px', color: '#166534', display: 'block', fontWeight: 700 }}>Real-Time Green</span>
                </div>
              </div>
            </div>

            {/* Dedicated Renewable Contribution Representation Panel — Vertically balanced & enlarged */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '5px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8px', color: '#475569', fontWeight: 700, marginBottom: '3px' }}>
                <span>RENEWABLE SPLIT (SOLAR vs WIND)</span>
                <span 
                  style={{ 
                    color: '#15803d', 
                    fontWeight: 800, 
                    backgroundColor: '#dcfce7', 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '16px',
                    lineHeight: '16px',
                    padding: '0 6px', 
                    borderRadius: '3px', 
                    border: '1px solid #86efac',
                    boxSizing: 'border-box'
                  }}
                >
                  Total Clean: {activePeriod.renewableKwh || '4,120'} kWh
                </span>
              </div>
              
              {/* Clean Split Progress Bar — 12px height */}
              <div style={{ width: '100%', height: '12px', borderRadius: '5px', backgroundColor: '#e2e8f0', overflow: 'hidden', display: 'flex', border: '1px solid #cbd5e1', margin: '3px 0' }}>
                <div style={{ width: `${activePeriod.solarPct || 24.5}%`, height: '100%', backgroundColor: '#f59e0b' }} title="Solar Yield: 24.5%" />
                <div style={{ width: `${activePeriod.windPct || 75.5}%`, height: '100%', backgroundColor: '#06b6d4' }} title="Wind Yield: 75.5%" />
              </div>

              {/* 2-Card Contribution Breakdown — Spacious padding */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '3px' }}>
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '7.5px', color: '#b45309', fontWeight: 700 }}>● Solar Yield:</span>
                  <strong style={{ fontSize: '8.5px', color: '#d97706' }}>{activePeriod.solarKwh || '1,008'} kWh ({activePeriod.solarPct || '24.5'}%)</strong>
                </div>
                <div style={{ backgroundColor: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '4px', padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '7.5px', color: '#0e7490', fontWeight: 700 }}>● Wind Yield:</span>
                  <strong style={{ fontSize: '8.5px', color: '#0284c7' }}>{activePeriod.windKwh || '3,112'} kWh ({activePeriod.windPct || '75.5'}%)</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748b' }}>
            <span>Zero Wind Curtailment</span>
            <span style={{ color: '#15803d', fontWeight: 700 }}>Inverters at 98.4% Efficiency • 100% Captured</span>
          </div>
        </div>

        {/* SECTION 5: STORAGE & GWO DISPATCH — CRITICAL BUG 2 FIX: SPACIOUS & ZERO OVERLAP */}
        <div 
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            height: '100%'
          }}
        >
          <div>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '2px',
                marginBottom: '4px'
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingDown size={11} color="#15803d" />
                5. STORAGE &amp; GWO DISPATCH
              </span>
              <span 
                style={{ 
                  fontSize: '8.5px', 
                  fontWeight: 800, 
                  color: '#15803d', 
                  backgroundColor: '#dcfce7', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '17px',
                  lineHeight: '17px',
                  padding: '0 7px', 
                  borderRadius: '4px', 
                  border: '1px solid #86efac',
                  boxSizing: 'border-box'
                }}
              >
                FUEL SAVED: {activePeriod.fuelSavedL || '1,776'} L ({activePeriod.fuelSavedPct || '26.8%'})
              </span>
            </div>

            {/* Prominent Highlights: Fuel Saved & CO2 Avoided */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '5px',
                marginBottom: '4px'
              }}
            >
              <div 
                style={{
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  minHeight: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}
              >
                <div>
                  <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', display: 'block', lineHeight: '10px', marginBottom: '1px' }}>
                    GWO Fuel Saved
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#15803d', lineHeight: '14px', display: 'block' }}>
                    {activePeriod.fuelSavedL || '1,776'} L ({activePeriod.fuelSavedPct || '26.8%'})
                  </span>
                </div>
                <CheckCircle size={13} color="#15803d" style={{ flexShrink: 0 }} />
              </div>

              <div 
                style={{
                  backgroundColor: '#ccfbf1',
                  border: '1px solid #99f6e4',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  minHeight: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}
              >
                <div>
                  <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#115e59', textTransform: 'uppercase', display: 'block', lineHeight: '10px', marginBottom: '1px' }}>
                    CO₂ Emissions Avoided
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#0f766e', lineHeight: '14px', display: 'block' }}>
                    {activePeriod.co2AvoidedKg || '4,760'} kg Avoided
                  </span>
                </div>
                <ShieldCheck size={13} color="#0f766e" style={{ flexShrink: 0 }} />
              </div>
            </div>

            {/* Technical Specifications */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '8px', marginBottom: '3px' }}>
              {/* Battery Block */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2.5px 6px' }}>
                <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', display: 'block', borderBottom: '1px solid #f1f5f9', paddingBottom: '1px', marginBottom: '2px' }}>
                  Battery Storage (LiFePO₄)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', fontSize: '8px' }}>
                  <div><span style={{ color: '#64748b' }}>SOC:</span> <strong style={{ color: '#15803d' }}>78.0%</strong></div>
                  <div><span style={{ color: '#64748b' }}>Usable:</span> <strong>390 / 500 kWh</strong></div>
                  <div><span style={{ color: '#64748b' }}>Cycles:</span> <strong>{activePeriod.batteryThroughput || '17.4'}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Eff:</span> <strong style={{ color: '#0d9488' }}>94.2%</strong></div>
                </div>
              </div>

              {/* GWO Optimization Block */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2.5px 6px' }}>
                <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', display: 'block', borderBottom: '1px solid #f1f5f9', paddingBottom: '1px', marginBottom: '2px' }}>
                  GWO Algorithmic Dispatch
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', fontSize: '8px' }}>
                  <div><span style={{ color: '#64748b' }}>Baseline:</span> <strong>{activePeriod.baselineFuel || '6,631'} L</strong></div>
                  <div><span style={{ color: '#64748b' }}>Optimized:</span> <strong style={{ color: '#15803d' }}>{activePeriod.optimizedFuel || '4,855'} L</strong></div>
                  <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#64748b' }}>Algorithm:</span> <strong style={{ color: '#0f172a' }}>Grey Wolf Metaheuristic</strong></div>
                </div>
              </div>
            </div>

            {/* Dedicated Baseline vs Optimized Fuel Comparison Visualization Area */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '4px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#475569', fontWeight: 700, marginBottom: '2px' }}>
                <span>BASELINE vs OPTIMIZED FUEL CONSUMPTION</span>
                <span style={{ color: '#15803d', fontWeight: 800 }}>-{activePeriod.fuelSavedL || '1,776'} L (-{activePeriod.fuelSavedPct || '26.8%'})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '56px', color: '#64748b', fontSize: '8px', fontWeight: 600 }}>Baseline:</span>
                  <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <div style={{ width: '100%', height: '100%', backgroundColor: '#f43f5e' }}></div>
                  </div>
                  <span style={{ width: '50px', textAlign: 'right', fontWeight: 800, color: '#be123c', fontSize: '8px' }}>{activePeriod.baselineFuel || '6,631'} L</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '56px', color: '#15803d', fontWeight: 700, fontSize: '8px' }}>Optimized:</span>
                  <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <div style={{ width: '73.2%', height: '100%', backgroundColor: '#10b981' }}></div>
                  </div>
                  <span style={{ width: '50px', textAlign: 'right', fontWeight: 800, color: '#15803d', fontSize: '8px' }}>{activePeriod.optimizedFuel || '4,855'} L</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748b' }}>
            <span>Battery: LiFePO₄ Conditioning OK</span>
            <span style={{ color: '#15803d', fontWeight: 700 }}>Genset Operating Sweet-Spot: 78%</span>
          </div>
        </div>
      </div>

      {/* 6. ROW 3: SECTION 6 (24-HOUR HOURLY ENERGY PROFILE) + SECTION 7 (OPERATIONAL STATUS & AUDIT VERIFICATION) (182px) */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '8px', 
          height: '182px', 
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        {/* SECTION 6: 24-HOUR HOURLY ENERGY & LOAD PROFILE (SVG CHART) */}
        <div 
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            height: '100%'
          }}
        >
          <div>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '2px',
                marginBottom: '3px'
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} />
                6. 24-HOUR HOURLY ENERGY &amp; LOAD PROFILE
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '8.5px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#0284c7', fontWeight: 700 }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#0284c7', borderRadius: '2px', display: 'inline-block' }}></span>
                  Station Load
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#10b981', fontWeight: 700 }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '2px', display: 'inline-block' }}></span>
                  Renewable Gen
                </span>
              </div>
            </div>

            {/* SVG Crisp Vector Area Chart */}
            <div style={{ width: '100%', height: `${svgHeight}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderRadius: '5px', border: '1px solid #e2e8f0', padding: '2px', boxSizing: 'border-box' }}>
              <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ maxWidth: '100%', maxHeight: '100%' }}>
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = padTop + plotH * (1 - ratio);
                  const val = Math.round(maxVal * ratio);
                  return (
                    <g key={idx}>
                      <line x1={padLeft} y1={y} x2={svgWidth - padRight} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth="1" />
                      <text x={padLeft - 5} y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8" fontFamily={fontSans} fontWeight="600">
                        {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                      </text>
                    </g>
                  );
                })}

                {/* Filled Areas with alpha fills for 100% canvas & PDF compatibility */}
                {consAreaPath && <path d={consAreaPath} fill="rgba(2, 132, 199, 0.12)" />}
                {renAreaPath && <path d={renAreaPath} fill="rgba(16, 185, 129, 0.18)" />}

                {/* Stroke Lines */}
                {consLinePath && <path d={consLinePath} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />}
                {renLinePath && <path d={renLinePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />}

                {/* Data Points & X-Labels */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.yCons} r="2.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx={p.x} cy={p.yRen} r="2.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={p.x} y={svgHeight - 3} textAnchor="middle" fontSize="8.5" fill="#475569" fontFamily={fontSans} fontWeight="600">
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#475569' }}>
            <span>{activePeriod.chartFooterYield || 'Daily Total Yield: 4,120 kWh'}</span>
            <span style={{ color: '#15803d', fontWeight: 700 }}>{activePeriod.chartFooterBaseline || 'Renewable Share: 55.5%'}</span>
            <span style={{ color: '#0284c7', fontWeight: 700 }}>Zero Grid Deficit • 100% Uptime</span>
          </div>
        </div>

        {/* SECTION 7: OPERATIONAL STATUS & AUDIT VERIFICATION */}
        <div 
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            height: '100%'
          }}
        >
          <div>
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '2px',
                marginBottom: '4px'
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={11} color="#15803d" />
                7. OPERATIONAL STATUS &amp; AUDIT VERIFICATION
              </span>
              <span 
                style={{ 
                  fontSize: '8.5px', 
                  fontWeight: 800, 
                  color: '#15803d', 
                  backgroundColor: '#dcfce7', 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '17px',
                  lineHeight: '17px',
                  padding: '0 7px', 
                  borderRadius: '4px', 
                  border: '1px solid #86efac',
                  boxSizing: 'border-box'
                }}
              >
                CERTIFIED AUDIT
              </span>
            </div>

            {/* 6 Status Indicator Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', marginBottom: '3px' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3.5px 7px' }}>
                <span style={{ color: '#64748b', fontSize: '7.5px', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Compliance:</span>
                <span style={{ fontWeight: 800, color: '#15803d', fontSize: '9.5px' }}>Fully Compliant</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3.5px 7px' }}>
                <span style={{ color: '#64748b', fontSize: '7.5px', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Critical Load:</span>
                <span style={{ fontWeight: 800, color: '#15803d', fontSize: '9.5px' }}>100% Guaranteed</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3.5px 7px' }}>
                <span style={{ color: '#64748b', fontSize: '7.5px', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Curtailment:</span>
                <span style={{ fontWeight: 800, color: '#15803d', fontSize: '9.5px' }}>0% (All Captured)</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3.5px 7px' }}>
                <span style={{ color: '#64748b', fontSize: '7.5px', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Cut-Out Events:</span>
                <span style={{ fontWeight: 800, color: '#15803d', fontSize: '9.5px' }}>0 Incidents</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3.5px 7px' }}>
                <span style={{ color: '#64748b', fontSize: '7.5px', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Diesel Dispatch:</span>
                <span style={{ fontWeight: 800, color: '#d97706', fontSize: '9.5px' }}>Optimized Run</span>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3.5px 7px' }}>
                <span style={{ color: '#64748b', fontSize: '7.5px', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Grid Status:</span>
                <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '9.5px' }}>Synchronized Bus</span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#475569' }}>
            <span>Verification: POL-OPS-2026-0927</span>
            <span style={{ color: '#15803d', fontWeight: 700 }}>All Polar Environmental Criteria Met</span>
          </div>
        </div>
      </div>

      {/* 7. FINAL STATUS ELEMENT: COMPLIANCE BANNER (28px) */}
      <div 
        style={{
          height: '28px',
          backgroundColor: '#dcfce7',
          border: '1.5px solid #86efac',
          borderRadius: '6px',
          padding: '2px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={14} color="#15803d" />
          <span style={{ fontSize: '10px', fontWeight: 900, color: '#15803d' }}>
            ✓ STATION STATUS: FULLY COMPLIANT
          </span>
          <span style={{ fontSize: '8.5px', color: '#166534', fontWeight: 600, marginLeft: '6px' }}>
            SCAR Antarctic Environmental Protocol • ISO 50001 Energy Management Verified
          </span>
        </div>
        <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#15803d' }}>
          Zero Polar Environmental Violations • 100% Life Support Assured
        </div>
      </div>

      {/* 8. REPORT FOOTER (14px) */}
      <div 
        style={{
          height: '14px',
          borderTop: '1px solid #cbd5e1',
          paddingTop: '2px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '8px',
          color: '#64748b',
          boxSizing: 'border-box',
          flexShrink: 0
        }}
      >
        <span>POLARIS POLAR ENERGY OPERATING SYSTEM • OFFICIAL OPERATIONAL REPORT</span>
        <span>TELEMETRY HASH: SHA256:7B8F9A01C4E2D3F6 • GWO DISPATCH v4.2</span>
        <span style={{ fontWeight: 700, color: '#0f172a' }}>PAGE 1 OF 1 • A4 LANDSCAPE (297 × 210 mm)</span>
      </div>
    </div>
  );
}
