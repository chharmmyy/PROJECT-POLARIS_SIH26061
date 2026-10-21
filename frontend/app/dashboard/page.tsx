"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import StatusTicker from '@/components/dashboard/StatusTicker';
import OverviewPage from '@/components/dashboard/OverviewPage';
import EnergyAnalyticsPage from '@/components/dashboard/EnergyAnalyticsPage';
import ForecastsOptimizerPage from '@/components/dashboard/ForecastsOptimizerPage';
import AlertsAnomalyPage from '@/components/dashboard/AlertsAnomalyPage';
import ReportsSettingsPage from '@/components/dashboard/ReportsSettingsPage';
import AtmosphericSnow from '@/components/dashboard/AtmosphericSnow';
import { fetchStations } from '@/lib/api';

function DashboardContent() {
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromQuery || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [themeToast, setThemeToast] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState('Maitri');
  const [stations, setStations] = useState([
    { code: 'MAITRI', name: 'Maitri Research Station' },
    { code: 'BHARATI', name: 'Bharati Station' },
    { code: 'HIMADRI', name: 'Himadri Arctic Station' }
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('polaris_dark_mode');
      if (saved !== null) {
        setDarkMode(saved === 'true');
      }
    } catch {}
  }, []);

  const handleToggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('polaris_dark_mode', String(next));
      } catch {}
      setThemeToast(next ? 'Polar Night Mode (Deep Obsidian)' : 'Polar Day Mode (Maritime Blue)');
      setTimeout(() => setThemeToast(null), 2400);
      return next;
    });
  };

  useEffect(() => {
    if (tabFromQuery) {
      setActiveTab(tabFromQuery);
    }
  }, [tabFromQuery]);

  useEffect(() => {
    async function getStations() {
      try {
        const sts = await fetchStations();
        if (sts && sts.length > 0) setStations(sts);
      } catch {
        // default stations retained
      }
    }
    getStations();
  }, []);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  const currentStationData = (stations && stations.find(s => 
    s.code === selectedStation || s.name?.toLowerCase().includes(selectedStation?.toLowerCase())
  )) || {
    code: 'MAITRI',
    name: 'Maitri Research Station',
    location: 'Continental Antarctica',
    latitude: -70.76,
    longitude: 11.73
  };

  return (
    <div className={`h-screen w-full flex flex-col font-sans transition-colors duration-700 text-white selection:bg-cyan-500 selection:text-white overflow-hidden relative ${
      darkMode 
        ? 'bg-gradient-to-br from-[#020617] via-[#071328] via-[#0a1835] to-[#020814]' 
        : 'bg-gradient-to-br from-[#091e42] via-[#0f2e5c] via-[#1a4b8c] to-[#0a2347]'
    }`}>
      
      {/* Background Falling Snow Canvas Layer */}
      <AtmosphericSnow />

      {/* Theme Feedback Toast */}
      {themeToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-slate-900/95 border border-cyan-400/50 shadow-2xl text-xs font-bold text-cyan-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>{themeToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <div className="relative z-30">
        <Navbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          onToggleTheme={handleToggleTheme}
          stations={stations}
          selectedStation={selectedStation}
          onSelectStation={(st: string) => setSelectedStation(st)}
          alertCount={3}
          temp={-18}
          windSpeed={12}
          onNavigateTab={handleSelectTab}
        />
      </div>

      {/* Real-Time Telemetry Ticker Bar */}
      <div className="relative z-20">
        <StatusTicker 
          station={selectedStation}
          temp={-18}
          windSpeed={12}
          fuelSaved={242}
          renewablePct={47}
        />
      </div>

      {/* Main Workspace (Sidebar + Dashboard) */}
      <div className="flex-1 flex w-full overflow-hidden min-h-0 relative z-10">
        
        {/* Mobile Drawer Overlay (< lg) */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex"
            onClick={() => setSidebarOpen(false)}
          >
            <div 
              className="h-full w-72 max-w-[85vw] animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar 
                activeTab={activeTab}
                onSelectTab={handleSelectTab}
                alertCount={3}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Desktop Inline Left Sidebar (>= lg) */}
        {sidebarOpen && (
          <div className="hidden lg:flex h-full shrink-0">
            <Sidebar 
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              alertCount={3}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Dashboard Viewport: Single Master Scroll Container with generous bottom buffer */}
        <main className="flex-1 h-full p-2 sm:p-2.5 lg:p-3 bg-transparent flex flex-col min-h-0 overflow-y-auto scrollbar-thin">
          <div className="w-full max-w-none flex flex-col pb-24">
            {/* 1. Overview */}
            {(activeTab === 'overview' || activeTab === 'dashboard') && (
              <OverviewPage 
                selectedStation={selectedStation}
                onNavigateTab={handleSelectTab}
              />
            )}

            {/* 2. Analytics */}
            {activeTab === 'analytics' && (
              <EnergyAnalyticsPage station={selectedStation} initialSubTab="overview" />
            )}

            {/* 3. Forecast */}
            {activeTab === 'forecast' && (
              <ForecastsOptimizerPage stationData={currentStationData} initialTab="forecasts" />
            )}

            {/* 4. Optimization */}
            {activeTab === 'optimization' && (
              <ForecastsOptimizerPage stationData={currentStationData} initialTab="optimizer" />
            )}

            {/* 5. Renewables */}
            {activeTab === 'renewables' && (
              <EnergyAnalyticsPage station={selectedStation} initialSubTab="renewables" />
            )}

            {/* 6. Storage & Dispatch */}
            {(activeTab === 'battery_storage' || activeTab === 'battery_gen' || activeTab === 'dispatch') && (
              <EnergyAnalyticsPage station={selectedStation} initialSubTab="battery_gen" />
            )}

            {/* 7. Polaris System Settings (Station Data • User Management • Operational Reports) */}
            {activeTab === 'settings' && (
              <ReportsSettingsPage station={selectedStation} />
            )}
          </div>
        </main>

      </div>

    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#091e42]" />}>
      <DashboardContent />
    </Suspense>
  );
}
