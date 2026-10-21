"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Snowflake, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  PanelLeft, 
  ChevronDown, 
  Compass, 
  Wind, 
  LogOut, 
  Home, 
  Shield,
  FileText,
  Check
} from 'lucide-react';

export interface StationItem {
  code: string;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface NavbarProps {
  onToggleSidebar?: () => void;
  darkMode?: boolean;
  onToggleTheme?: () => void;
  stations?: StationItem[];
  selectedStation?: string;
  onSelectStation?: (st: string) => void;
  alertCount?: number;
  temp?: number;
  windSpeed?: number;
  onNavigateTab?: (tab: string) => void;
}

export default function Navbar({
  onToggleSidebar,
  darkMode = false,
  onToggleTheme,
  stations = [],
  selectedStation = 'Maitri',
  onSelectStation,
  alertCount = 3,
  temp = -18,
  windSpeed = 12,
  onNavigateTab
}: NavbarProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Katabatic Wind Warning',
      time: '4m ago',
      severity: 'WARNING',
      severityColor: 'text-amber-300 bg-amber-500/20 border-amber-400/30',
      message: 'Gusts 18.2 m/s recorded on ice sheet. Pitch feathering active on WT-1.',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Diesel Generator SFC Variance',
      time: '18m ago',
      severity: 'CRITICAL',
      severityColor: 'text-rose-300 bg-rose-500/20 border-rose-400/30',
      message: 'G-1 SFC elevated at 0.34 L/kWh. GWO optimization rebalancing active generator loading.',
      read: false
    },
    {
      id: 'notif-3',
      title: 'BESS Sub-Zero Thermal Guard',
      time: '1h ago',
      severity: 'ADVISORY',
      severityColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-400/30',
      message: 'Trace heating (+3.5 kW) scheduled for 19:00 to prevent cell degradation.',
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSignOut = () => {
    try {
      localStorage.removeItem('polaris_user');
    } catch {}
    router.push('/');
  };

  return (
    <header className="h-14 sm:h-16 bg-white/10 backdrop-blur-2xl border-b border-white/20 px-3 sm:px-6 flex items-center justify-between shrink-0 select-none z-30 shadow-[0_4px_30px_rgba(0,0,0,0.15)] text-white">
      
      {/* Left: Polaris Brand Logo, Sidebar Toggle & Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-2xl min-w-0">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group" title="Return to Polaris Home">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white shadow-sm shadow-sky-400/30 group-hover:bg-sky-400/40 transition">
            <Snowflake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight leading-none drop-shadow-sm">
              POLARIS <span className="text-cyan-300 font-extrabold">AI</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-blue-200 tracking-wider">
              POLAR ENERGY OS
            </span>
          </div>
        </Link>

        {/* Sidebar Toggle Button */}
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 rounded-xl border border-white/25 bg-white/10 text-blue-100 hover:text-white hover:bg-white/20 transition cursor-pointer shrink-0 backdrop-blur-md"
          title="Toggle Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Station Selector Dropdown */}
        <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/25 bg-white/12 text-[11px] sm:text-xs font-semibold text-white hover:bg-white/20 transition shrink-0 backdrop-blur-md shadow-xs">
          <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300 shrink-0" />
          <select 
            value={selectedStation}
            onChange={(e) => onSelectStation && onSelectStation(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-0.5 max-w-[100px] sm:max-w-none truncate"
          >
            {stations && stations.length > 0 ? (
              stations.map((st) => (
                <option key={st.code || st.name} value={st.name ? st.name.split(' ')[0] : st.code} className="bg-[#0e2752] text-white">
                  {st.name || st.code}
                </option>
              ))
            ) : (
              <>
                <option value="Maitri" className="bg-[#0e2752] text-white">Maitri Station</option>
                <option value="Bharati" className="bg-[#0e2752] text-white">Bharati Station</option>
                <option value="Himadri" className="bg-[#0e2752] text-white">Himadri Station</option>
              </>
            )}
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs hidden xl:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-blue-200" />
          </div>
          <input 
            type="text"
            placeholder="Search telemetry, load, anomalies..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white/12 border border-white/25 rounded-full text-white placeholder-blue-200/70 focus:outline-none focus:bg-white/20 focus:border-cyan-300 transition backdrop-blur-md"
          />
        </div>

      </div>

      {/* Right: Weather Pill, Theme, Notifications & Profile Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        
        {/* Polar Weather Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/12 border border-white/25 text-white text-xs font-semibold backdrop-blur-md shadow-xs">
          <Wind className="w-3.5 h-3.5 text-cyan-300" />
          <span>{temp}°C</span>
          <span className="text-blue-300">&bull;</span>
          <span>{windSpeed} m/s</span>
          <span className="text-blue-300">&bull;</span>
          <span className="text-amber-300 font-bold">Katabatic Winds</span>
        </div>

        {/* Home Link Button */}
        <Link 
          href="/"
          className="w-9 h-9 rounded-full border border-white/25 bg-white/10 flex items-center justify-center text-blue-100 hover:text-cyan-300 hover:bg-white/20 transition cursor-pointer backdrop-blur-md"
          title="Return to Marketing Home"
        >
          <Home className="w-4 h-4" />
        </Link>

        {/* Theme Toggle Button */}
        <button 
          onClick={onToggleTheme}
          className={`w-9 h-9 rounded-full border transition cursor-pointer backdrop-blur-md flex items-center justify-center ${
            darkMode 
              ? 'border-cyan-400/40 bg-cyan-950/40 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:bg-cyan-900/50' 
              : 'border-white/25 bg-white/10 text-blue-100 hover:text-white hover:bg-white/20'
          }`}
          title={darkMode ? "Switch to Polar Day Mode (Maritime Blue)" : "Switch to Polar Night Mode (Deep Obsidian)"}
        >
          {darkMode ? (
            <Moon className="w-4 h-4 text-cyan-300 transition-transform duration-300 hover:-rotate-12" />
          ) : (
            <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 hover:rotate-45" />
          )}
        </button>

        {/* Notifications Bell with Interactive Flyout Popover */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              if (profileOpen) setProfileOpen(false);
            }}
            className={`relative w-9 h-9 rounded-full border transition cursor-pointer backdrop-blur-md flex items-center justify-center ${
              notificationsOpen 
                ? 'border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.4)]' 
                : 'border-white/25 bg-white/10 text-blue-100 hover:text-white hover:bg-white/20'
            }`}
            title="System Alerts & Telemetry Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.9)]"></span>
            )}
          </button>

          {/* Notifications Dropdown Flyout */}
          {notificationsOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-[#0c2452]/95 border border-white/25 shadow-2xl py-3 px-3.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-2xl text-white">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-cyan-300">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-none">System Alerts &amp; Telemetry</h3>
                    <span className="text-[9.5px] text-blue-200/80 mt-0.5 block">{unreadCount} active event{unreadCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-[10px] font-bold text-cyan-300 hover:text-cyan-200 transition px-2 py-0.5 rounded-md hover:bg-white/10 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Alerts List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/20">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-2 rounded-xl border transition text-left ${
                      notif.read 
                        ? 'bg-slate-950/40 border-white/5 opacity-60' 
                        : 'bg-slate-950/80 border-sky-400/25 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                          )}
                          <span className="text-[11px] font-bold text-white truncate">
                            {notif.title}
                          </span>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider ${notif.severityColor}`}>
                            {notif.severity}
                          </span>
                          <span className="text-[8.5px] text-slate-400 font-mono ml-auto shrink-0">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-snug">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.read && (
                        <button
                          onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 hover:bg-emerald-500/25 transition shrink-0 cursor-pointer"
                          title="Acknowledge alert"
                        >
                          Ack ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-2.5 mt-2 border-t border-white/15 flex items-center justify-between">
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    if (onNavigateTab) onNavigateTab('analytics');
                  }}
                  className="w-full py-1.5 rounded-xl bg-gradient-to-r from-sky-500/30 to-blue-600/30 hover:from-sky-500/50 hover:to-blue-600/50 border border-sky-400/40 text-cyan-200 hover:text-white text-xs font-bold transition text-center cursor-pointer shadow-xs"
                >
                  View Full Logs &amp; Analytics →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-1 cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-cyan-200 text-[#071938] flex items-center justify-center text-xs font-black shadow-md">
              AD
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-none">Polar Admin</span>
              <span className="text-[10px] text-blue-200 mt-0.5">{selectedStation} Expedition</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 top-11 w-56 rounded-2xl bg-[#0c2452]/95 border border-white/25 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-2xl text-white">
              <div className="px-4 py-2 border-b border-white/15">
                <p className="text-xs font-bold text-white">Admin User</p>
                <p className="text-[11px] text-blue-200 truncate">admin@polaris.polar</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-300/40">
                  <Shield className="w-3 h-3 text-cyan-300" /> Station Supervisor
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 text-xs text-blue-100 hover:bg-white/15 hover:text-cyan-200 transition"
                  onClick={() => setProfileOpen(false)}
                >
                  <Home className="w-4 h-4 text-cyan-300" />
                  <span>Polaris Landing Home</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-300 hover:bg-rose-500/20 transition cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
