"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  BarChart2, 
  TrendingUp, 
  Sliders, 
  Wind, 
  BatteryCharging, 
  Settings
} from 'lucide-react';

export interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  alertCount?: number;
  onClose?: () => void;
}

export default function Sidebar({
  activeTab = 'overview',
  onSelectTab,
  alertCount = 3,
  onClose
}: SidebarProps) {
  const mainNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'optimization', label: 'Optimization', icon: Sliders },
    { id: 'renewables', label: 'Renewables', icon: Wind },
    { id: 'battery_storage', label: 'Storage & Dispatch', icon: BatteryCharging },
  ];

  const bottomNav = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: string) => {
    if (onSelectTab) onSelectTab(id);
    if (onClose && window.innerWidth < 1024) onClose();
  };

  return (
    <aside className="w-60 bg-[#091e42]/90 lg:bg-white/10 backdrop-blur-2xl border-r border-white/20 flex flex-col h-full shrink-0 select-none pt-4 pb-4 px-3 shadow-[4px_0_30px_rgba(0,0,0,0.3)] text-white relative z-40 overflow-hidden">
      {/* Upper Navigation Area */}
      <div className="flex-1 min-h-0 flex flex-col space-y-4 overflow-y-auto scrollbar-none pr-0.5">
        
        {/* Mobile Close Button */}
        <div className="flex lg:hidden items-center justify-between px-2 pb-2 border-b border-white/15 shrink-0">
          <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">Menu</span>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 text-xs font-bold px-2.5 py-1"
          >
            ✕ Close
          </button>
        </div>

        {/* Primary Navigation Items */}
        <nav className="space-y-1.5 flex-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'overview' && activeTab === 'dashboard');
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-400/35 to-cyan-300/20 text-cyan-200 border border-sky-300/50 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                    : 'text-blue-100/80 hover:text-white hover:bg-white/15'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300' : 'text-blue-200'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>

      {/* Settings Footer - Pinned to bottom with mt-auto, subtle horizontal divider, and adequate bottom padding */}
      <div className="mt-auto pt-3 border-t border-white/15 shrink-0 relative z-30">
        <button
          key="settings"
          onClick={() => handleItemClick('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer relative z-30 ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-sky-400/35 to-cyan-300/20 text-cyan-200 border border-sky-300/50 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
              : 'text-blue-100/80 hover:text-white hover:bg-white/15'
          }`}
        >
          <Settings className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-cyan-300' : 'text-blue-200'}`} />
          <span className="truncate">Settings</span>
        </button>
      </div>
    </aside>
  );
}
