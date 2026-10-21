"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Settings, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Save, 
  RefreshCw,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  MapPin,
  Compass,
  Globe,
  Radio,
  Trash2,
  X,
  Search,
  Check,
  Activity,
  Zap,
  BatteryCharging,
  Wind,
  Sun,
  Flame,
  Gauge,
  TrendingDown,
  Clock,
  CheckCircle,
  Sliders,
  Lock,
  Thermometer,
  Edit3,
  Key,
  Satellite,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import PolarisA4ReportTemplate from './PolarisA4ReportTemplate';

// Robust mathematical normalization of modern CSS color functions (lab, oklab, lch, oklch)
// to standard sRGB / RGBA so PDF renderers never encounter unsupported color functions.
function convertModernColorString(str) {
  if (!str || typeof str !== 'string') return str;
  if (!/(?:lab|oklab|lch|oklch)\(/i.test(str)) return str;

  function labToRgb(l, a, b) {
    const y = (l + 16) / 116;
    const x = a / 500 + y;
    const z = y - b / 200;
    const fn = (v) => (v * v * v > 0.008856 ? v * v * v : (v - 16 / 116) / 7.787);
    const X = 0.95047 * fn(x);
    const Y = 1.00000 * fn(y);
    const Z = 1.08883 * fn(z);
    let r = X * 3.2406 + Y * -1.5372 + Z * -0.4986;
    let g = X * -0.9689 + Y * 1.8758 + Z * 0.0415;
    let bl = X * 0.0557 + Y * -0.2040 + Z * 1.0570;
    const compand = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055);
    r = Math.min(255, Math.max(0, Math.round(compand(r) * 255)));
    g = Math.min(255, Math.max(0, Math.round(compand(g) * 255)));
    bl = Math.min(255, Math.max(0, Math.round(compand(bl) * 255)));
    return [r, g, bl];
  }

  function oklabToRgb(L, a, b) {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    const compand = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055);
    r = Math.min(255, Math.max(0, Math.round(compand(r) * 255)));
    g = Math.min(255, Math.max(0, Math.round(compand(g) * 255)));
    bl = Math.min(255, Math.max(0, Math.round(compand(bl) * 255)));
    return [r, g, bl];
  }

  return str.replace(/(lab|oklab|lch|oklch)\(([^)]+)\)/gi, (match, fnName, args) => {
    try {
      const type = fnName.toLowerCase();
      let parts = args.trim().split(/[\s,]+/);
      let slashIdx = parts.indexOf('/');
      let alpha = 1;
      if (slashIdx !== -1) {
        let alphaStr = parts[slashIdx + 1];
        if (alphaStr) {
          alpha = alphaStr.endsWith('%') ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr);
        }
        parts = parts.slice(0, slashIdx);
      }
      let c1 = parts[0] ? parseFloat(parts[0].replace('%', '')) : 0;
      let c2 = parts[1] ? parseFloat(parts[1].replace('%', '')) : 0;
      let c3 = parts[2] ? parseFloat(parts[2].replace('%', '')) : 0;

      let rgb;
      if (type === 'lab') {
        rgb = labToRgb(c1, c2, c3);
      } else if (type === 'oklab') {
        let L = parts[0] && parts[0].endsWith('%') ? c1 / 100 : c1;
        rgb = oklabToRgb(L, c2, c3);
      } else if (type === 'lch') {
        let hRad = (c3 * Math.PI) / 180;
        let a = c2 * Math.cos(hRad);
        let b = c2 * Math.sin(hRad);
        rgb = labToRgb(c1, a, b);
      } else if (type === 'oklch') {
        let L = parts[0] && parts[0].endsWith('%') ? c1 / 100 : c1;
        let hRad = (c3 * Math.PI) / 180;
        let a = c2 * Math.cos(hRad);
        let b = c2 * Math.sin(hRad);
        rgb = oklabToRgb(L, a, b);
      } else {
        rgb = [0, 0, 0];
      }

      if (alpha < 1 && alpha >= 0) {
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
      }
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    } catch {
      return 'rgb(0, 0, 0)';
    }
  });
}

export default function ReportsSettingsPage({ station = 'Maitri' }) {
  // Settings Navigation Section: 'station' | 'users' | 'reports'
  const [settingsNav, setSettingsNav] = useState('station');
  
  // Reports Period State: 'daily' | 'weekly' | 'monthly'
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState('2026-09-27');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Dedicated PDF Programmatic Generation State
  const pdfReportRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadedReportName, setDownloadedReportName] = useState(null);
  const [reportError, setReportError] = useState(null);

  const normalizeStationName = (st) => {
    if (!st || typeof st !== 'string') return 'Maitri';
    const lower = st.toLowerCase();
    if (lower.includes('bharati')) return 'Bharati';
    if (lower.includes('himadri')) return 'Himadri';
    return 'Maitri';
  };

  // Settings State: 'station' (Station Data) and 'users' (User Management)
  const [configuredStation, setConfiguredStation] = useState(
    normalizeStationName(station)
  );

  // Dynamic Multi-Horizon Report Datasets (Daily, Weekly, Monthly)
  const REPORT_DATASETS = {
    daily: {
      periodTitle: 'Daily Operational Report',
      periodLabel: '24-Hour Operational Cycle',
      dateRange: 'Sep 27, 2026 (00:00–23:59 UTC)',
      consumedKwh: '7,420',
      consumedValue: 7420,
      renewableKwh: '4,120',
      renewableValue: 4120,
      renewablePct: 55.5,
      dieselLiters: '1,840',
      co2Tons: '4.8',
      co2AvoidedKg: '4,760',
      targetKwh: '7,800',
      peakRenewableKw: '146',
      avgLoadKw: '309.2',
      heatingLoadKw: '142.0',
      solarKwh: '1,008',
      solarPct: 24.5,
      windKwh: '3,112',
      windPct: 75.5,
      dieselGenKwh: '3,300',
      genRuntimeHours: '12.4',
      batteryThroughput: '17.4',
      baselineFuel: '6,631',
      optimizedFuel: '4,855',
      fuelSavedL: '1,776',
      fuelSavedPct: '26.8%',
      sourceBreakdown: [
        { source: 'Solar', kwh: 1008, pct: 13.6, color: '#f59e0b' },
        { source: 'Wind', kwh: 3112, pct: 41.9, color: '#06b6d4' },
        { source: 'Diesel', kwh: 3300, pct: 44.5, color: '#f43f5e' },
      ],
      chartTitle: '24-HOUR HOURLY ENERGY & LOAD PROFILE',
      chartSubtitle: 'Sep 27, 2026 • 00:00 – 23:00 UTC (Hourly Telemetry)',
      chartData: [
        { label: '00:00', Consumed: 290, Renewable: 180, Diesel: 110 },
        { label: '03:00', Consumed: 305, Renewable: 210, Diesel: 95 },
        { label: '06:00', Consumed: 320, Renewable: 195, Diesel: 125 },
        { label: '09:00', Consumed: 340, Renewable: 220, Diesel: 120 },
        { label: '12:00', Consumed: 335, Renewable: 240, Diesel: 95 },
        { label: '15:00', Consumed: 315, Renewable: 215, Diesel: 100 },
        { label: '18:00', Consumed: 310, Renewable: 175, Diesel: 135 },
        { label: '21:00', Consumed: 295, Renewable: 160, Diesel: 135 },
      ],
      chartFooterYield: 'Daily Total Yield: 4,120 kWh',
      chartFooterBaseline: 'Renewable Share: 55.5%',
    },
    weekly: {
      periodTitle: 'Weekly Operational Report',
      periodLabel: '7-Day Operational Cycle',
      dateRange: 'Sep 21 – Sep 27, 2026 (Rolling 7-Day Audit)',
      consumedKwh: '51,940',
      consumedValue: 51940,
      renewableKwh: '28,680',
      renewableValue: 28680,
      renewablePct: 55.2,
      dieselLiters: '12,880',
      co2Tons: '33.8',
      co2AvoidedKg: '33,320',
      targetKwh: '54,600',
      peakRenewableKw: '168',
      avgLoadKw: '309.2',
      heatingLoadKw: '142.0',
      solarKwh: '7,056',
      solarPct: 24.6,
      windKwh: '21,624',
      windPct: 75.4,
      dieselGenKwh: '23,260',
      genRuntimeHours: '86.8',
      batteryThroughput: '121.8',
      baselineFuel: '46,417',
      optimizedFuel: '33,985',
      fuelSavedL: '12,432',
      fuelSavedPct: '26.8%',
      sourceBreakdown: [
        { source: 'Solar', kwh: 7056, pct: 13.6, color: '#f59e0b' },
        { source: 'Wind', kwh: 21624, pct: 41.6, color: '#06b6d4' },
        { source: 'Diesel', kwh: 23260, pct: 44.8, color: '#f43f5e' },
      ],
      chartTitle: '7-DAY DAILY ENERGY & COMPLIANCE TREND',
      chartSubtitle: 'Sep 21 – Sep 27, 2026 (Multi-Day Continuous Logging)',
      chartData: [
        { label: 'Sep 21', Consumed: 7120, Renewable: 3840, Diesel: 1780 },
        { label: 'Sep 22', Consumed: 7350, Renewable: 3950, Diesel: 1820 },
        { label: 'Sep 23', Consumed: 7600, Renewable: 4200, Diesel: 1850 },
        { label: 'Sep 24', Consumed: 7280, Renewable: 4100, Diesel: 1810 },
        { label: 'Sep 25', Consumed: 7490, Renewable: 4300, Diesel: 1790 },
        { label: 'Sep 26', Consumed: 7550, Renewable: 4050, Diesel: 1890 },
        { label: 'Sep 27', Consumed: 7420, Renewable: 4120, Diesel: 1840 },
      ],
      chartFooterYield: '7-Day Total Yield: 28,680 kWh',
      chartFooterBaseline: 'Renewable Baseline: 54.8%',
    },
    monthly: {
      periodTitle: 'Monthly Operational Report',
      periodLabel: '30-Day Operational Cycle',
      dateRange: 'September 2026 (Month 9 Full Audit Cycle)',
      consumedKwh: '222,600',
      consumedValue: 222600,
      renewableKwh: '123,600',
      renewableValue: 123600,
      renewablePct: 55.5,
      dieselLiters: '53,486',
      co2Tons: '144.4',
      co2AvoidedKg: '52,130',
      targetKwh: '234,000',
      peakRenewableKw: '185',
      avgLoadKw: '309.2',
      heatingLoadKw: '142.0',
      solarKwh: '30,240',
      solarPct: 24.5,
      windKwh: '93,360',
      windPct: 75.5,
      dieselGenKwh: '99,000',
      genRuntimeHours: '372.0',
      batteryThroughput: '522.0',
      baselineFuel: '72,940',
      optimizedFuel: '53,486',
      fuelSavedL: '19,454',
      fuelSavedPct: '26.7%',
      sourceBreakdown: [
        { source: 'Solar', kwh: 30240, pct: 13.6, color: '#f59e0b' },
        { source: 'Wind', kwh: 93360, pct: 41.9, color: '#06b6d4' },
        { source: 'Diesel', kwh: 99000, pct: 44.5, color: '#f43f5e' },
      ],
      chartTitle: '30-DAY / 4-WEEK MONTHLY ENERGY TREND',
      chartSubtitle: 'September 2026 • 4 Multi-Week Operational Slices',
      chartData: [
        { label: 'Week 1', Consumed: 51200, Renewable: 28400, Diesel: 12400 },
        { label: 'Week 2', Consumed: 52100, Renewable: 29100, Diesel: 12600 },
        { label: 'Week 3', Consumed: 54300, Renewable: 30200, Diesel: 13100 },
        { label: 'Week 4', Consumed: 53800, Renewable: 29800, Diesel: 12900 },
      ],
      chartFooterYield: 'Monthly Total Yield: 123,600 kWh',
      chartFooterBaseline: 'Monthly Average Renewable: 55.5%',
    }
  };

  const activePeriod = REPORT_DATASETS[reportType] || REPORT_DATASETS.daily;

  // Handle period toggle with immediate feedback
  const handlePeriodChange = (period) => {
    setReportType(period);
    showToast(`Switched report horizon to ${period.toUpperCase()} (${REPORT_DATASETS[period].periodLabel}).`);
  };

  // Station Configurations for Settings (Fully populated specifications)
  const DEFAULT_STATIONS_DATA = {
    Maitri: {
      name: 'Maitri Research Station',
      code: 'MAITRI',
      location: '70.76°S, 11.73°E',
      region: 'Schirmacher Oasis, Queen Maud Land',
      elevation: '117 m a.s.l.',
      climate: 'Antarctic Continental Ice Shelf Margin',
      timeZone: 'Indian Ocean (GMT +5)',
      forecastHorizon: '24 Hours',
      summerCrew: 65,
      winterCrew: 25,
      solarCapacityKw: 120,
      windCapacityKw: 200,
      batteryCapacityKwh: 500,
      dieselCapacityKva: 375,
      fuelCapacityL: 45000,
      gridFrequency: '50.0 Hz',
      dispatchMode: 'Autonomous GWO',
      telemetryProtocol: 'MQTT-SN / SAT',
      satelliteUplink: 'GSAT-14 & Inmarsat',
      tempUnit: '°C (Celsius)',
      powerUnit: 'kW (Kilowatts)',
      energyUnit: 'kWh',
      fuelUnit: 'L (Liters)',
      temp: -18,
      windSpeed: 12
    },
    Bharati: {
      name: 'Bharati Research Station',
      code: 'BHARATI',
      location: '69.41°S, 76.19°E',
      region: 'Larsemann Hills, East Antarctica',
      elevation: '35 m a.s.l.',
      climate: 'Polar Coastal High-Wind Marine',
      timeZone: 'East Antarctica (GMT +6)',
      forecastHorizon: '24 Hours',
      summerCrew: 72,
      winterCrew: 22,
      solarCapacityKw: 160,
      windCapacityKw: 250,
      batteryCapacityKwh: 750,
      dieselCapacityKva: 480,
      fuelCapacityL: 60000,
      gridFrequency: '50.0 Hz',
      dispatchMode: 'Autonomous GWO',
      telemetryProtocol: 'MQTT-SN / SAT',
      satelliteUplink: 'Ku-Band Polar Gateway',
      tempUnit: '°C (Celsius)',
      powerUnit: 'kW (Kilowatts)',
      energyUnit: 'kWh',
      fuelUnit: 'L (Liters)',
      temp: -22,
      windSpeed: 16
    },
    Himadri: {
      name: 'Himadri Research Station',
      code: 'HIMADRI',
      location: '78.92°N, 11.93°E',
      region: 'Ny-Ålesund, Spitsbergen, Svalbard, Norway',
      elevation: '15 m a.s.l.',
      climate: 'High Arctic Permafrost Tundra',
      timeZone: 'Central European (GMT +1)',
      forecastHorizon: '24 Hours',
      summerCrew: 40,
      winterCrew: 12,
      solarCapacityKw: 80,
      windCapacityKw: 120,
      batteryCapacityKwh: 350,
      dieselCapacityKva: 200,
      fuelCapacityL: 25000,
      gridFrequency: '50.0 Hz',
      dispatchMode: 'Autonomous GWO',
      telemetryProtocol: 'MQTT-SN / SAT',
      satelliteUplink: 'Svalbard Fiber & Iridium',
      tempUnit: '°C (Celsius)',
      powerUnit: 'kW (Kilowatts)',
      energyUnit: 'kWh',
      fuelUnit: 'L (Liters)',
      temp: -12,
      windSpeed: 9
    }
  };

  const [stationsConfig, setStationsConfig] = useState(DEFAULT_STATIONS_DATA);
  const [savedStationsConfig, setSavedStationsConfig] = useState(DEFAULT_STATIONS_DATA);

  useEffect(() => {
    setConfiguredStation(normalizeStationName(station));
  }, [station]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('polaris_station_configs');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = {
          Maitri: { ...DEFAULT_STATIONS_DATA.Maitri, ...(parsed.Maitri || {}) },
          Bharati: { ...DEFAULT_STATIONS_DATA.Bharati, ...(parsed.Bharati || {}) },
          Himadri: { ...DEFAULT_STATIONS_DATA.Himadri, ...(parsed.Himadri || {}) }
        };
        setStationsConfig(merged);
        setSavedStationsConfig(merged);
      }
    } catch {}
  }, []);

  const activeStationKey = normalizeStationName(configuredStation);
  const currentStationConfig = stationsConfig[activeStationKey] || DEFAULT_STATIONS_DATA[activeStationKey] || DEFAULT_STATIONS_DATA.Maitri;

  const updateStationField = (field, value) => {
    setStationsConfig(prev => {
      const activeObj = prev[activeStationKey] || DEFAULT_STATIONS_DATA[activeStationKey];
      return {
        ...prev,
        [activeStationKey]: {
          ...activeObj,
          [field]: value
        }
      };
    });
  };

  const handleSelectStation = (newStation) => {
    const key = normalizeStationName(newStation);
    setConfiguredStation(key);
  };

  // Available Polar System Permissions
  const POLAR_SYSTEM_PERMISSIONS = [
    { id: 'GWO Dispatch', label: 'GWO Dispatch', desc: 'Grey Wolf algorithmic dispatch control' },
    { id: 'BESS Dispatch Control', label: 'BESS Dispatch Control', desc: 'LiFePO₄ storage charging & inverter control' },
    { id: 'Emergency Override', label: 'Emergency Override', desc: 'Station blackstart & life-support bypass' },
    { id: 'Telemetry Access', label: 'Telemetry Access', desc: 'Real-time microgrid sensor streaming' },
    { id: 'Fuel Logistics', label: 'Fuel Logistics', desc: 'Diesel reserve telemetry & logistics tracking' },
    { id: 'Station Configuration', label: 'Station Configuration', desc: 'Microgrid bus settings & rating limits' }
  ];

  // User Management State (Preserving all 5 personnel with mission-control access specifications)
  const DEFAULT_USERS = [
    {
      id: 'usr-1',
      name: 'Dr. Rajesh Sharma',
      email: 'admin@polaris.polar',
      role: 'Station Director & Lead Scientist',
      station: 'Maitri',
      stationFull: 'Maitri Research Station',
      clearance: 'Level 4 (Full Dispatch & Emergency Override)',
      accessLevel: 4,
      accessLevelName: 'Level 4',
      accessLevelDesc: 'Full Dispatch & Emergency Override',
      status: 'Active',
      lastActive: 'Just now',
      uplink: 'GSAT-14',
      twoFactor: 'Enabled',
      hardwareToken: 'Verified',
      sessionTimeout: '30 Minutes',
      permissions: [
        'GWO Dispatch',
        'BESS Dispatch Control',
        'Emergency Override',
        'Telemetry Access',
        'Fuel Logistics',
        'Station Configuration'
      ]
    },
    {
      id: 'usr-2',
      name: 'Elena Rostova',
      email: 'e.rostova@polaris.polar',
      role: 'Chief Microgrid & Electrical Engineer',
      station: 'Bharati',
      stationFull: 'Bharati Station',
      clearance: 'Level 3 (GWO & BESS Dispatch Control)',
      accessLevel: 3,
      accessLevelName: 'Level 3',
      accessLevelDesc: 'GWO & BESS Dispatch Control',
      status: 'Active',
      lastActive: '14m ago',
      uplink: 'Ku-Band Polar Gateway',
      twoFactor: 'Enabled',
      hardwareToken: 'Verified',
      sessionTimeout: '30 Minutes',
      permissions: [
        'GWO Dispatch',
        'BESS Dispatch Control',
        'Telemetry Access',
        'Station Configuration'
      ]
    },
    {
      id: 'usr-3',
      name: 'Capt. K. Vignesh',
      email: 'vignesh.k@polaris.polar',
      role: 'Telemetry & Logistics Specialist',
      station: 'Maitri',
      stationFull: 'Maitri Research Station',
      clearance: 'Level 2 (Telemetry & Fuel Logistics)',
      accessLevel: 2,
      accessLevelName: 'Level 2',
      accessLevelDesc: 'Telemetry & Fuel Logistics',
      status: 'Active',
      lastActive: '42m ago',
      uplink: 'Inmarsat Uplink',
      twoFactor: 'Enabled',
      hardwareToken: 'Verified',
      sessionTimeout: '30 Minutes',
      permissions: [
        'Telemetry Access',
        'Fuel Logistics'
      ]
    },
    {
      id: 'usr-4',
      name: 'Dr. Sunita Patel',
      email: 's.patel@polaris.polar',
      role: 'Atmospheric Scientist & Meteorologist',
      station: 'Himadri',
      stationFull: 'Himadri Arctic Station',
      clearance: 'Level 2 (Weather & Solar Irradiance)',
      accessLevel: 2,
      accessLevelName: 'Level 2',
      accessLevelDesc: 'Weather & Solar Irradiance',
      status: 'Active',
      lastActive: '3h ago',
      uplink: 'Svalbard Fiber',
      twoFactor: 'Enabled',
      hardwareToken: 'Verified',
      sessionTimeout: '30 Minutes',
      permissions: [
        'Telemetry Access',
        'Station Configuration'
      ]
    },
    {
      id: 'usr-5',
      name: 'Sarah Jenkins',
      email: 's.jenkins@polaris.polar',
      role: 'Environmental & Audit Inspector',
      station: 'All Stations',
      stationFull: 'All Stations (National Command)',
      clearance: 'Level 1 (Read-Only Audit & Reporting)',
      accessLevel: 1,
      accessLevelName: 'Level 1',
      accessLevelDesc: 'Read-only Audit & Reporting',
      status: 'Suspended',
      lastActive: '2d ago',
      uplink: 'GSAT-14',
      twoFactor: 'Enabled',
      hardwareToken: 'Verified',
      sessionTimeout: '30 Minutes',
      permissions: [
        'Telemetry Access'
      ]
    }
  ];

  const [users, setUsers] = useState(DEFAULT_USERS);
  const [selectedUserId, setSelectedUserId] = useState('usr-1');
  const [userSearch, setUserSearch] = useState('');
  const [userStationFilter, setUserStationFilter] = useState('All');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Microgrid Operations Engineer',
    station: 'Maitri',
    accessLevel: 2,
    status: 'Active',
    permissions: ['Telemetry Access', 'BESS Dispatch Control']
  });

  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('polaris_users_registry');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Hydrate with default permissions & security metrics if missing
          const hydrated = parsed.map(u => {
            const def = DEFAULT_USERS.find(d => d.id === u.id) || {};
            return {
              ...def,
              ...u,
              accessLevel: u.accessLevel || def.accessLevel || 2,
              accessLevelName: u.accessLevelName || def.accessLevelName || `Level ${u.accessLevel || 2}`,
              accessLevelDesc: u.accessLevelDesc || def.accessLevelDesc || 'Standard Telemetry & Operations',
              twoFactor: u.twoFactor || 'Enabled',
              hardwareToken: u.hardwareToken || 'Verified',
              uplink: u.uplink || 'GSAT-14',
              sessionTimeout: u.sessionTimeout || '30 Minutes',
              permissions: Array.isArray(u.permissions) && u.permissions.length > 0 
                ? u.permissions 
                : (def.permissions || ['Telemetry Access'])
            };
          });
          setUsers(hydrated);
        }
      }
    } catch {}
  }, []);

  const saveUsersToStorage = (updatedUsers) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem('polaris_users_registry', JSON.stringify(updatedUsers));
    } catch {}
  };

  const getStationFullName = (st) => {
    if (st === 'Maitri') return 'Maitri Research Station';
    if (st === 'Bharati') return 'Bharati Station';
    if (st === 'Himadri') return 'Himadri Arctic Station';
    return 'All Stations (National Command)';
  };

  const getAccessLevelMeta = (level) => {
    const lvl = Number(level) || 1;
    switch(lvl) {
      case 4:
        return {
          name: 'Level 4',
          desc: 'Full Dispatch & Emergency Override',
          clearance: 'Level 4 (Full Dispatch & Emergency Override)'
        };
      case 3:
        return {
          name: 'Level 3',
          desc: 'GWO & BESS Dispatch Control',
          clearance: 'Level 3 (GWO & BESS Dispatch Control)'
        };
      case 2:
        return {
          name: 'Level 2',
          desc: 'Telemetry & Fuel Logistics',
          clearance: 'Level 2 (Telemetry & Fuel Logistics)'
        };
      case 1:
      default:
        return {
          name: 'Level 1',
          desc: 'Read-only Audit & Reporting',
          clearance: 'Level 1 (Read-Only Audit & Reporting)'
        };
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) {
      showToast('Please provide both user name and email address.');
      return;
    }
    const meta = getAccessLevelMeta(newUser.accessLevel);
    const created = {
      id: `usr-${Date.now()}`,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      station: newUser.station,
      stationFull: getStationFullName(newUser.station),
      accessLevel: Number(newUser.accessLevel),
      accessLevelName: meta.name,
      accessLevelDesc: meta.desc,
      clearance: meta.clearance,
      status: newUser.status || 'Active',
      lastActive: 'Just now',
      uplink: 'GSAT-14',
      twoFactor: 'Enabled',
      hardwareToken: 'Verified',
      sessionTimeout: '30 Minutes',
      permissions: newUser.permissions && newUser.permissions.length > 0 ? newUser.permissions : ['Telemetry Access']
    };
    const updated = [created, ...users];
    saveUsersToStorage(updated);
    setSelectedUserId(created.id);
    setShowAddUserModal(false);
    setNewUser({
      name: '',
      email: '',
      role: 'Microgrid Operations Engineer',
      station: 'Maitri',
      accessLevel: 2,
      status: 'Active',
      permissions: ['Telemetry Access', 'BESS Dispatch Control']
    });
    showToast(`Added operator "${created.name}" to polar access registry.`);
  };

  const handleOpenEditUser = () => {
    const cur = users.find(u => u.id === selectedUserId) || users[0];
    if (!cur) return;
    setEditingUser({
      ...cur,
      permissions: cur.permissions ? [...cur.permissions] : ['Telemetry Access']
    });
    setShowEditUserModal(true);
  };

  const handleSaveEditUser = (e) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name.trim() || !editingUser.email.trim()) {
      showToast('Please provide both user name and email address.');
      return;
    }
    const meta = getAccessLevelMeta(editingUser.accessLevel);
    const updated = users.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          ...editingUser,
          name: editingUser.name.trim(),
          email: editingUser.email.trim(),
          stationFull: getStationFullName(editingUser.station),
          accessLevel: Number(editingUser.accessLevel),
          accessLevelName: meta.name,
          accessLevelDesc: meta.desc,
          clearance: meta.clearance,
          permissions: editingUser.permissions || []
        };
      }
      return u;
    });
    saveUsersToStorage(updated);
    setShowEditUserModal(false);
    showToast(`Updated operator profile for ${editingUser.name}.`);
  };

  const toggleNewUserPermission = (permId) => {
    const current = newUser.permissions || [];
    if (current.includes(permId)) {
      setNewUser({ ...newUser, permissions: current.filter(p => p !== permId) });
    } else {
      setNewUser({ ...newUser, permissions: [...current, permId] });
    }
  };

  const toggleEditingUserPermission = (permId) => {
    if (!editingUser) return;
    const current = editingUser.permissions || [];
    if (current.includes(permId)) {
      setEditingUser({ ...editingUser, permissions: current.filter(p => p !== permId) });
    } else {
      setEditingUser({ ...editingUser, permissions: [...current, permId] });
    }
  };

  const handleToggleUserStatus = (id) => {
    const updated = users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveUsersToStorage(updated);
    const target = updated.find(u => u.id === id);
    showToast(`${target?.name}: access status set to ${target?.status?.toUpperCase()}.`);
  };

  const handleDeleteUser = (id, name) => {
    const updated = users.filter(u => u.id !== id);
    saveUsersToStorage(updated);
    if (selectedUserId === id) {
      if (updated.length > 0) {
        setSelectedUserId(updated[0].id);
      }
    }
    showToast(`Revoked access credentials for ${name}.`);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      showToast(`Regenerated ${activePeriod.periodTitle} for ${selectedDate}.`);
    }, 450);
  };

  // Dedicated Programmatic PDF Generation Workflow (A4 Landscape, No window.print())
  const handleGeneratePDFReport = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setReportError(null);

    try {
      // 1. Dynamic imports with robust ESM / CJS constructor resolution
      const [jspdfModule, h2cModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      const jsPDF = jspdfModule.jsPDF || (typeof jspdfModule.default === 'function' ? jspdfModule.default : jspdfModule.default?.jsPDF);
      if (!jsPDF) {
        throw new Error('Could not resolve jsPDF constructor');
      }

      const html2canvas = typeof h2cModule.default === 'function' ? h2cModule.default : h2cModule;
      if (!html2canvas) {
        throw new Error('Could not resolve html2canvas renderer');
      }

      // 2. Allow Polaris-native loading overlay to render and DOM layout to settle
      await new Promise(resolve => setTimeout(resolve, 600));

      const element = pdfReportRef.current;
      if (!element) {
        throw new Error('Report template element not found in DOM');
      }

      // 3. Render element to high-DPI canvas with full color normalization
      // Save original prototypes and methods
      const origWindowGetComputedStyle = typeof window !== 'undefined' ? window.getComputedStyle : null;
      const origProtoGetPropertyValue = typeof CSSStyleDeclaration !== 'undefined' ? CSSStyleDeclaration.prototype.getPropertyValue : null;
      const origProtoSetProperty = typeof CSSStyleDeclaration !== 'undefined' ? CSSStyleDeclaration.prototype.setProperty : null;

      if (origProtoGetPropertyValue) {
        CSSStyleDeclaration.prototype.getPropertyValue = function(prop) {
          const val = origProtoGetPropertyValue.call(this, prop);
          return convertModernColorString(val);
        };
      }

      if (origProtoSetProperty) {
        CSSStyleDeclaration.prototype.setProperty = function(prop, val, priority) {
          return origProtoSetProperty.call(this, prop, convertModernColorString(val), priority);
        };
      }

      if (origWindowGetComputedStyle) {
        window.getComputedStyle = function(el, pseudo) {
          const style = origWindowGetComputedStyle.call(this, el, pseudo);
          return new Proxy(style, {
            get(target, prop) {
              if (prop === 'getPropertyValue') {
                return function(name) {
                  return convertModernColorString(target.getPropertyValue(name));
                };
              }
              const val = target[prop];
              if (typeof val === 'string') {
                return convertModernColorString(val);
              }
              if (typeof val === 'function') {
                return val.bind(target);
              }
              return val;
            }
          });
        };
      }

      let canvas;
      try {
        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 1122,
          height: 794,
          windowWidth: 1122,
          windowHeight: 794,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          ignoreElements: (child) => {
            // Prevent cloning external stylesheets from Tailwind v4 into the PDF canvas iframe
            if (child.tagName === 'STYLE' || child.tagName === 'LINK') return true;
            return false;
          },
          onclone: (clonedDoc) => {
            // 1. Strip any stylesheets that bypassed ignoreElements
            const stylesheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            stylesheets.forEach(s => s.remove());

            // 2. Add minimal clean base style with high-quality font antialiasing and strict sizing
            const cleanStyle = clonedDoc.createElement('style');
            cleanStyle.textContent = `
              * { 
                box-sizing: border-box !important; 
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
                letter-spacing: normal !important;
              }
              body, html { 
                margin: 0 !important; 
                padding: 0 !important; 
                background-color: #ffffff !important; 
                color: #0f172a !important; 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              }
              #polaris-printable-report {
                width: 1122px !important;
                height: 794px !important;
                min-width: 1122px !important;
                min-height: 794px !important;
                max-width: 1122px !important;
                max-height: 794px !important;
                overflow: hidden !important;
              }
            `;
            clonedDoc.head.appendChild(cleanStyle);

            // 3. Normalize all inline styles and presentation attributes across the cloned DOM
            const allElements = clonedDoc.querySelectorAll('*');
            for (let i = 0; i < allElements.length; i++) {
              const node = allElements[i];
              const styleAttr = node.getAttribute('style');
              if (styleAttr && /(?:lab|oklab|lch|oklch)\(/i.test(styleAttr)) {
                node.setAttribute('style', convertModernColorString(styleAttr));
              }
              ['fill', 'stroke', 'color', 'background', 'border-color'].forEach(attr => {
                const val = node.getAttribute(attr);
                if (val && /(?:lab|oklab|lch|oklch)\(/i.test(val)) {
                  node.setAttribute(attr, convertModernColorString(val));
                }
              });
            }

            // 4. Patch getComputedStyle & CSSStyleDeclaration on cloned iframe window
            if (clonedDoc.defaultView) {
              const iframeWin = clonedDoc.defaultView;
              if (iframeWin.CSSStyleDeclaration && iframeWin.CSSStyleDeclaration.prototype) {
                const origIframeGetPropertyValue = iframeWin.CSSStyleDeclaration.prototype.getPropertyValue;
                iframeWin.CSSStyleDeclaration.prototype.getPropertyValue = function(prop) {
                  return convertModernColorString(origIframeGetPropertyValue.call(this, prop));
                };
                const origIframeSetProperty = iframeWin.CSSStyleDeclaration.prototype.setProperty;
                iframeWin.CSSStyleDeclaration.prototype.setProperty = function(prop, val, priority) {
                  return origIframeSetProperty.call(this, prop, convertModernColorString(val), priority);
                };
              }

              if (iframeWin.getComputedStyle) {
                const origClonedGetComputedStyle = iframeWin.getComputedStyle;
                iframeWin.getComputedStyle = function(el, pseudo) {
                  const style = origClonedGetComputedStyle.call(this, el, pseudo);
                  return new Proxy(style, {
                    get(target, prop) {
                      if (prop === 'getPropertyValue') {
                        return function(name) {
                          return convertModernColorString(target.getPropertyValue(name));
                        };
                      }
                      const value = target[prop];
                      if (typeof value === 'string') {
                        return convertModernColorString(value);
                      }
                      if (typeof value === 'function') {
                        return value.bind(target);
                      }
                      return value;
                    }
                  });
                };
              }
            }
          }
        });
      } finally {
        if (origWindowGetComputedStyle) {
          window.getComputedStyle = origWindowGetComputedStyle;
        }
        if (origProtoGetPropertyValue) {
          CSSStyleDeclaration.prototype.getPropertyValue = origProtoGetPropertyValue;
        }
        if (origProtoSetProperty) {
          CSSStyleDeclaration.prototype.setProperty = origProtoSetProperty;
        }
      }

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Rendered report canvas is empty or invalid');
      }

      // 4. Initialize A4 landscape PDF (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'SLOW');

      const dateStr = selectedDate || new Date().toISOString().split('T')[0];
      const stationStr = (configuredStation || currentStationConfig?.name || 'Maitri').replace(/\s+/g, '_');
      const filename = `Polaris_${stationStr}_Operational_Report_${dateStr}.pdf`;

      // 5. Automatic browser download with blob fallback
      try {
        pdf.save(filename);
      } catch (saveErr) {
        console.warn('Direct pdf.save failed, executing fallback blob download:', saveErr);
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1500);
      }

      setIsGeneratingPdf(false);
      setDownloadedReportName(filename);
      setTimeout(() => {
        setDownloadedReportName(null);
      }, 5000);
    } catch (err) {
      console.error('Technical error during Polaris PDF generation:', err);
      setIsGeneratingPdf(false);
      setReportError(err?.message || 'Unable to generate the PDF. Please try again.');
      setTimeout(() => {
        setReportError(null);
      }, 6000);
    }
  };

  // Global event listener for navbar / external triggers
  useEffect(() => {
    const handleGlobalReportDownload = () => {
      handleGeneratePDFReport();
    };
    window.addEventListener('polaris:download-report', handleGlobalReportDownload);
    return () => {
      window.removeEventListener('polaris:download-report', handleGlobalReportDownload);
    };
  }, [configuredStation, selectedDate, reportType, activePeriod]);

  const handleSaveSettings = () => {
    if (settingsNav === 'station') {
      const activeObj = stationsConfig[activeStationKey] || DEFAULT_STATIONS_DATA[activeStationKey];
      const savedObj = savedStationsConfig[activeStationKey] || DEFAULT_STATIONS_DATA[activeStationKey];

      // Validate required fields
      if (!activeObj.name?.trim()) {
        showToast('Station Name cannot be empty.');
        return;
      }
      if (!activeObj.location?.trim()) {
        showToast('Geographic Coordinates cannot be empty.');
        return;
      }

      // Check if any changes were made
      const isChanged = JSON.stringify(activeObj) !== JSON.stringify(savedObj);
      if (!isChanged) {
        showToast('No changes to save.');
        return;
      }

      try {
        localStorage.setItem('polaris_station_configs', JSON.stringify(stationsConfig));
        setSavedStationsConfig(JSON.parse(JSON.stringify(stationsConfig)));
      } catch {}
      showToast('✓ STATION CONFIGURATION SAVED');
    } else {
      try {
        localStorage.setItem('polaris_users_registry', JSON.stringify(users));
      } catch {}
      showToast('✓ USER ACCESS REGISTRY SAVED');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase());
    const matchesStation = userStationFilter === 'All' || u.station === userStationFilter || u.station === 'All Stations';
    return matchesSearch && matchesStation;
  });

  const selectedUser = users.find(u => u.id === selectedUserId) || filteredUsers[0] || users[0] || null;

  return (
    <div className="flex flex-col gap-3 w-full text-slate-100 font-sans print:bg-white print:text-slate-900 print:overflow-visible relative z-20">
      
      {/* Toast Notification (General) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-2.5 rounded-lg bg-slate-900 border border-sky-400 text-sky-200 text-xs font-mono shadow-2xl flex items-center gap-2 animate-bounce print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Polaris-Native Report Generation Loading State */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b1f3f] border border-cyan-400/50 rounded-2xl p-6 sm:p-7 shadow-[0_0_60px_rgba(6,182,212,0.35)] max-w-md w-full mx-4 text-center font-mono text-white relative overflow-hidden">
            {/* Glow Orbs */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
            
            {/* Animated Icon */}
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mx-auto mb-3.5 text-cyan-300 shadow-inner">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            </div>

            <div className="text-sm font-black tracking-wider uppercase text-cyan-300 mb-1.5">
              GENERATING OPERATIONAL REPORT
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
              Preparing station telemetry &bull; energy performance &bull; renewable contribution &bull; GWO dispatch
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-700/50">
              <div className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 animate-pulse w-full" />
            </div>

            <div className="text-[10px] text-slate-400 mt-3 font-mono">
              A4 Landscape Document &bull; {currentStationConfig.name}
            </div>
          </div>
        </div>
      )}

      {/* Subtle Toast: Report Downloaded */}
      {downloadedReportName && (
        <div className="fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-slate-900/95 border border-emerald-400/60 text-white font-mono shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 backdrop-blur-md">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-emerald-300 flex items-center gap-1">
              <span>✓ REPORT DOWNLOADED</span>
            </div>
            <div className="text-[11px] text-slate-300 font-sans mt-0.5">
              {downloadedReportName}
            </div>
          </div>
        </div>
      )}

      {/* Polaris-Native Error Toast (Shown on bottom-right, keeping Settings navigation untouched) */}
      {reportError && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900/95 border border-rose-500/60 text-white font-mono shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 backdrop-blur-md">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <X className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-rose-300">
              REPORT GENERATION FAILED
            </div>
            <div className="text-[11px] text-slate-300 font-sans mt-0.5">
              {reportError}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated A4 Landscape Report Container for High-DPI PDF Rendering */}
      <div 
        style={{
          position: 'fixed',
          left: isGeneratingPdf ? '0px' : '-9999px',
          top: isGeneratingPdf ? '0px' : '-9999px',
          width: '1122px',
          height: '794px',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: isGeneratingPdf ? 40 : -100,
          opacity: isGeneratingPdf ? 1 : 0
        }}
      >
        <div ref={pdfReportRef} style={{ width: '1122px', height: '794px', backgroundColor: '#ffffff' }}>
          <PolarisA4ReportTemplate 
            stationConfig={currentStationConfig}
            activePeriod={activePeriod}
            selectedDate={selectedDate}
            reportType={reportType}
          />
        </div>
      </div>

      {/* TOP SYSTEM SETTINGS HEADER BAR */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        
        {/* System Settings Identity Heading */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm xl:text-base tracking-wider text-white font-mono">
                POLARIS // SYSTEM SETTINGS
              </span>
              <span className="text-[9px] xl:text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">
                SYSTEM ACTIVE
              </span>
            </div>
            <p className="text-[10px] xl:text-xs text-slate-400 font-sans">
              Station configuration &bull; Access control &bull; Reporting
            </p>
          </div>
        </div>

        {/* System Uplink & Network Meta */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>UTC 2026-09-27 &bull; ANTARCTIC GRID</span>
          </div>
        </div>

      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: LEFT (CONFIGURATION SECTIONS) + RIGHT (ACTIVE SECTION VIEW) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-2 xl:gap-3 flex-1 min-h-0 w-full ${
        settingsNav === 'reports' ? 'overflow-hidden h-full' : 'overflow-y-auto lg:overflow-hidden h-full'
      }`}>
        
        {/* LEFT COLUMN: CONFIGURATION SECTIONS */}
        <div className="lg:col-span-3 polar-card p-2.5 sm:p-3 xl:p-3.5 font-mono text-xs flex flex-col shrink-0 h-auto justify-start self-start">
          <div className="space-y-2">
            <span className="text-[9px] xl:text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-1 py-0.5">
              CONFIGURATION SECTIONS
            </span>

            {[
              { 
                id: 'station', 
                label: 'Station Data', 
                desc: 'Station identity, telemetry & parameters', 
                icon: MapPin 
              },
              { 
                id: 'users', 
                label: 'User Management', 
                desc: 'Users, roles & access permissions', 
                icon: Users 
              },
              { 
                id: 'reports', 
                label: 'Operational Reports', 
                desc: 'Generate and download station reports', 
                icon: FileText 
              },
            ].map(item => {
              const Icon = item.icon;
              const isSelected = settingsNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSettingsNav(item.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between border group ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-200 border-sky-400/50 font-bold shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'bg-slate-950/40 text-slate-400 hover:text-white hover:bg-slate-900/80 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800/60 text-slate-400 group-hover:text-white'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs xl:text-sm truncate ${isSelected ? 'text-white font-bold' : 'text-slate-300'}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-sans">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm ml-2 shrink-0 ${isSelected ? 'text-sky-400 font-bold' : 'text-slate-600 group-hover:text-slate-400'}`}>
                    &rsaquo;
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT PANE */}
        <div className={`lg:col-span-9 polar-card flex flex-col justify-between min-h-0 h-full overflow-hidden w-full self-stretch ${
          settingsNav === 'reports' ? 'p-1.5 sm:p-2 xl:p-2.5' : 'p-2.5 sm:p-3 xl:p-3.5'
        }`}>
          
          {settingsNav === 'reports' ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              
              {/* Reports Control Bar */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 shrink-0 mb-1 xl:mb-1.5 font-mono">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white">
                        POLARIS // OPERATIONAL REPORT
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">
                        AUDIT COMPLIANT
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans">
                      {currentStationConfig.name} &bull; {activePeriod.periodLabel} &bull; {activePeriod.dateRange}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {/* Horizon Switcher */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] shadow-inner">
                    {['daily', 'weekly', 'monthly'].map((t) => {
                      const isCurrent = reportType === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handlePeriodChange(t)}
                          className={`px-2.5 py-1 rounded-md font-bold capitalize transition-all duration-150 cursor-pointer ${
                            isCurrent 
                              ? 'bg-sky-400 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.6)] font-black' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>

                  {/* Date Input */}
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-200 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
                    />
                  </div>

                  {/* Refresh */}
                  <button
                    type="button"
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer border border-slate-700 flex items-center gap-1.5 text-[11px]"
                    title="Regenerate Report"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${generatingReport ? 'animate-spin text-sky-400' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>

                  <div className="h-5 w-px bg-slate-800 mx-0.5"></div>

                  {/* Download Operational Report PDF Button */}
                  <button
                    type="button"
                    onClick={handleGeneratePDFReport}
                    disabled={isGeneratingPdf}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-black transition cursor-pointer shadow-[0_0_14px_rgba(56,189,248,0.45)] flex items-center gap-1.5 text-xs active:scale-95 disabled:opacity-50"
                    title="Download Polaris Operational Report as PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                    <span>Download Operational Report &darr;</span>
                  </button>
                </div>
              </div>

              {/* One-page Designed Executive Operational Report Preview Container */}
              <div className="flex-1 min-h-0 w-full flex flex-col gap-1 xl:gap-1.5 overflow-hidden justify-between">
          
          {/* Print Metadata Bar (Shown only in print) */}
          <div className="hidden print:flex justify-between items-center text-[10px] text-slate-600 border-b pb-1 font-mono">
            <span>STATION: {currentStationConfig.name} ({currentStationConfig.code})</span>
            <span>PERIOD: {activePeriod.periodLabel.toUpperCase()} ({activePeriod.dateRange})</span>
            <span>DISPATCH: AUTONOMOUS GWO ACTIVE</span>
          </div>

          {/* ROW 1: SECTION 1 (STATION OVERVIEW) + SECTION 2 (TOP PERFORMANCE SUMMARY) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 xl:gap-1.5 flex-1 min-h-0 overflow-hidden">
            
            {/* SECTION 1 — STATION OVERVIEW */}
            <div className="lg:col-span-5 p-1.5 sm:p-2 xl:p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 font-mono flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
              <div className="flex-1 min-h-0 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-0.5 mb-1 shrink-0 print:border-slate-300">
                  <span className="text-[9.5px] xl:text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
                    STATION OVERVIEW
                  </span>
                  <span className="text-[8.5px] xl:text-[9.5px] text-slate-400">{currentStationConfig.location}</span>
                </div>
                
                <ul className="text-[9px] xl:text-[10px] text-slate-300 space-y-0.5 xl:space-y-1 leading-tight xl:leading-snug print:text-slate-800">
                  <li className="flex items-start gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-0.5 shrink-0"></span>
                    <span>
                      <strong className="text-white print:text-black">Autonomous Polar Environment: </strong>
                      {currentStationConfig.code} operates under harsh conditions (-70°C to -10°C, 35 m/s katabatic winds) relying on a self-contained microgrid with zero external grid connection.
                    </span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 shrink-0"></span>
                    <span>
                      <strong className="text-white print:text-black">Renewable-First Strategy: </strong>
                      Prioritizes bifacial solar PV and cold-climate wind turbines backed by a 500 kWh insulated thermal BESS to minimize diesel reliance.
                    </span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-0.5 shrink-0"></span>
                    <span>
                      <strong className="text-white print:text-black">AI & GWO Optimization: </strong>
                      Machine-learning load forecasts and Grey Wolf Optimizer (GWO) dispatch gensets at optimal SFC points while guaranteeing 100% life-support uptime.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-0.5 pt-0.5 border-t border-slate-800/80 flex items-center justify-between text-[8px] xl:text-[9px] text-slate-400 shrink-0 print:border-slate-300">
                <span>Elevation: {currentStationConfig.elevation}</span>
                <span className="text-sky-300">Uplink: {currentStationConfig.satelliteUplink.split('(')[0]}</span>
              </div>
            </div>

            {/* SECTION 2 — TOP PERFORMANCE SUMMARY (HORIZONTAL KPI STRIP - DYNAMIC) */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-1 xl:gap-1.5 font-mono h-full min-h-0">
              
              <div className="p-1.5 xl:p-2 rounded-xl bg-slate-900/85 border border-slate-800 flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
                <span className="text-[8px] xl:text-[9px] text-slate-400 uppercase font-semibold">ENERGY CONSUMED</span>
                <div className="my-auto py-0.5">
                  <div className="text-lg sm:text-xl xl:text-2xl font-black text-white leading-none print:text-black transition-all">
                    {activePeriod.consumedKwh}
                  </div>
                  <div className="text-[8px] xl:text-[9px] text-sky-400 font-semibold mt-0.5">kWh Total Load</div>
                </div>
                <div className="text-[7.5px] xl:text-[8.5px] text-slate-500 pt-0.5 border-t border-slate-800/60 print:border-slate-300 leading-tight">
                  Target: &le; {activePeriod.targetKwh} kWh
                </div>
              </div>

              <div className="p-1.5 xl:p-2 rounded-xl bg-slate-900/85 border border-emerald-500/30 flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
                <span className="text-[8px] xl:text-[9px] text-slate-400 uppercase font-semibold">RENEWABLE GENERATED</span>
                <div className="my-auto py-0.5">
                  <div className="text-lg sm:text-xl xl:text-2xl font-black text-emerald-400 leading-none transition-all">
                    {activePeriod.renewableKwh}
                  </div>
                  <div className="text-[8px] xl:text-[9px] text-emerald-300 font-semibold mt-0.5">
                    kWh ({activePeriod.renewablePct}% Share)
                  </div>
                </div>
                <div className="text-[7.5px] xl:text-[8.5px] text-slate-500 pt-0.5 border-t border-slate-800/60 print:border-slate-300 leading-tight">
                  Peak: {activePeriod.peakRenewableKw} kW Green
                </div>
              </div>

              <div className="p-1.5 xl:p-2 rounded-xl bg-slate-900/85 border border-rose-500/30 flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
                <span className="text-[8px] xl:text-[9px] text-slate-400 uppercase font-semibold">DIESEL CONSUMED</span>
                <div className="my-auto py-0.5">
                  <div className="text-lg sm:text-xl xl:text-2xl font-black text-rose-300 leading-none transition-all">
                    {activePeriod.dieselLiters}
                  </div>
                  <div className="text-[8px] xl:text-[9px] text-slate-400 font-semibold mt-0.5">Liters Fuel</div>
                </div>
                <div className="text-[7.5px] xl:text-[8.5px] text-slate-500 pt-0.5 border-t border-slate-800/60 print:border-slate-300 leading-tight">
                  Saved: {activePeriod.fuelSavedL} L (GWO)
                </div>
              </div>

              <div className="p-1.5 xl:p-2 rounded-xl bg-slate-900/85 border border-teal-500/30 flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
                <span className="text-[8px] xl:text-[9px] text-slate-400 uppercase font-semibold">CO₂ EMISSIONS</span>
                <div className="my-auto py-0.5">
                  <div className="text-lg sm:text-xl xl:text-2xl font-black text-teal-300 leading-none transition-all">
                    {activePeriod.co2Tons}
                  </div>
                  <div className="text-[8px] xl:text-[9px] text-slate-400 font-semibold mt-0.5">Tons Output</div>
                </div>
                <div className="text-[7.5px] xl:text-[8.5px] text-slate-500 pt-0.5 border-t border-slate-800/60 print:border-slate-300 leading-tight">
                  Avoided: {activePeriod.co2AvoidedKg} kg CO₂
                </div>
              </div>

            </div>

          </div>

          {/* ROW 2: SECTION 3 (STATION SYSTEM OVERVIEW TABLE) + SECTION 4 (ENERGY PERFORMANCE) + SECTION 5 (RENEWABLE PERFORMANCE) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 xl:gap-1.5 flex-1 min-h-0 overflow-hidden">
            
            {/* SECTION 3 — STATION SYSTEM OVERVIEW (TABLE) */}
            <div className="lg:col-span-6 p-1.5 sm:p-2 xl:p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 font-mono flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
              <div className="flex-1 min-h-0 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-0.5 mb-0.5 shrink-0 print:border-slate-300">
                  <span className="text-[9.5px] xl:text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
                    STATION SYSTEM OVERVIEW
                  </span>
                  <span className="text-[8.5px] xl:text-[9.5px] text-slate-400">Microgrid Rating & Asset State</span>
                </div>

                <div className="overflow-x-auto my-auto">
                  <table className="w-full text-left text-[8.5px] xl:text-[10px]">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 text-[8px] xl:text-[9px] uppercase print:border-slate-300">
                        <th className="pb-0.5 font-semibold">System</th>
                        <th className="pb-0.5 font-semibold">Capacity / Rating</th>
                        <th className="pb-0.5 font-semibold">Current Output</th>
                        <th className="pb-0.5 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                      <tr>
                        <td className="py-0.5 xl:py-1 font-bold text-white print:text-black flex items-center gap-1.5">
                          <Sun className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-amber-400 shrink-0" />
                          <span>Solar PV</span>
                        </td>
                        <td className="py-0.5 xl:py-1 text-slate-300 print:text-slate-700">120 kW Bifacial Array</td>
                        <td className="py-0.5 xl:py-1 text-amber-300 font-semibold">{activePeriod.solarKwh} kWh Yield</td>
                        <td className="py-0.5 xl:py-1 text-right">
                          <span className="px-1.5 py-0.2 rounded text-[7.5px] xl:text-[8.5px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Online
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 xl:py-1 font-bold text-white print:text-black flex items-center gap-1.5">
                          <Wind className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-cyan-400 shrink-0" />
                          <span>Wind Array</span>
                        </td>
                        <td className="py-0.5 xl:py-1 text-slate-300 print:text-slate-700">200 kW (4x 50 kW)</td>
                        <td className="py-0.5 xl:py-1 text-cyan-300 font-semibold">{activePeriod.windKwh} kWh Yield</td>
                        <td className="py-0.5 xl:py-1 text-right">
                          <span className="px-1.5 py-0.2 rounded text-[7.5px] xl:text-[8.5px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 xl:py-1 font-bold text-white print:text-black flex items-center gap-1.5">
                          <BatteryCharging className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-emerald-400 shrink-0" />
                          <span>LiFePO₄ Storage</span>
                        </td>
                        <td className="py-0.5 xl:py-1 text-slate-300 print:text-slate-700">500 kWh Thermal BESS</td>
                        <td className="py-0.5 xl:py-1 text-emerald-300 font-semibold">78% SOC ({activePeriod.batteryThroughput} Cycles)</td>
                        <td className="py-0.5 xl:py-1 text-right">
                          <span className="px-1.5 py-0.2 rounded text-[7.5px] xl:text-[8.5px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                            Standby
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 xl:py-1 font-bold text-white print:text-black flex items-center gap-1.5">
                          <Flame className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-rose-400 shrink-0" />
                          <span>Diesel Genset</span>
                        </td>
                        <td className="py-0.5 xl:py-1 text-slate-300 print:text-slate-700">3x 125 kVA Volvo Arctic</td>
                        <td className="py-0.5 xl:py-1 text-rose-300 font-semibold">{activePeriod.dieselLiters} L Consumed</td>
                        <td className="py-0.5 xl:py-1 text-right">
                          <span className="px-1.5 py-0.2 rounded text-[7.5px] xl:text-[8.5px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Available
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 xl:py-1 font-bold text-white print:text-black flex items-center gap-1.5">
                          <Zap className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-purple-400 shrink-0" />
                          <span>Grid Bus</span>
                        </td>
                        <td className="py-0.5 xl:py-1 text-slate-300 print:text-slate-700">415V 3-Phase / 50 Hz</td>
                        <td className="py-0.5 xl:py-1 text-purple-300 font-semibold">50.01 Hz Synchronous</td>
                        <td className="py-0.5 xl:py-1 text-right">
                          <span className="px-1.5 py-0.2 rounded text-[7.5px] xl:text-[8.5px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                            Locked
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-0.5 border-t border-slate-800 text-[8px] xl:text-[9px] text-slate-400 flex justify-between shrink-0 print:border-slate-300">
                <span>Installed: 695 kVA/kW</span>
                <span className="text-emerald-400">All 5 Subsystems Operational</span>
              </div>
            </div>

            {/* SECTION 4 — ENERGY PERFORMANCE */}
            <div className="lg:col-span-3 p-1.5 sm:p-2 xl:p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 font-mono flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
              <div className="flex-1 min-h-0 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-0.5 mb-0.5 shrink-0 print:border-slate-300">
                  <span className="text-[9.5px] xl:text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
                    ENERGY PERFORMANCE
                  </span>
                  <span className="text-[8.5px] xl:text-[9.5px] text-emerald-400 font-bold">{activePeriod.renewablePct}% RE</span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[8px] xl:text-[9px] my-0.5">
                  <div className="p-1 xl:p-1.5 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[7.5px] xl:text-[8px] text-slate-400 block">Total Generated:</span>
                    <span className="font-bold text-white text-[8.5px] xl:text-[9.5px]">{activePeriod.consumedKwh} kWh</span>
                  </div>
                  <div className="p-1 xl:p-1.5 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[7.5px] xl:text-[8px] text-slate-400 block">Station Load:</span>
                    <span className="font-bold text-sky-300 text-[8.5px] xl:text-[9.5px]">{activePeriod.avgLoadKw} kW Avg</span>
                  </div>
                  <div className="p-1 xl:p-1.5 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[7.5px] xl:text-[8px] text-slate-400 block">Clean Yield:</span>
                    <span className="font-bold text-emerald-400 text-[8.5px] xl:text-[9.5px]">{activePeriod.renewableKwh} kWh</span>
                  </div>
                  <div className="p-1 xl:p-1.5 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-[7.5px] xl:text-[8px] text-slate-400 block">Thermal Demand:</span>
                    <span className="font-bold text-cyan-300 text-[8.5px] xl:text-[9.5px]">{activePeriod.heatingLoadKw} kW</span>
                  </div>
                </div>

                {/* Compact Mini Chart: Energy Generation by Source (DYNAMIC) */}
                <div className="pt-0.5 border-t border-slate-800/80 flex-1 flex flex-col justify-center min-h-[36px] xl:min-h-[48px]">
                  <span className="text-[7.5px] xl:text-[8.5px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Energy Generation by Source (kWh)
                  </span>
                  <div className="h-8 xl:h-11 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activePeriod.sourceBreakdown} layout="vertical" margin={{ top: 0, right: 25, left: -25, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="source" type="category" tick={{ fontSize: 8.5, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#091e42', borderColor: '#334155', borderRadius: '4px', fontSize: '9px' }}
                          formatter={(val) => [`${val.toLocaleString()} kWh`, 'Output']}
                        />
                        <Bar dataKey="kwh" radius={[0, 4, 4, 0]}>
                          {activePeriod.sourceBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="text-[7.5px] xl:text-[8.5px] text-slate-400 flex justify-between pt-0.5 border-t border-slate-800/60 shrink-0 print:border-slate-300">
                <span>Solar: {activePeriod.solarPct}%</span>
                <span>Wind: {activePeriod.windPct}%</span>
                <span>Diesel: {(100 - activePeriod.renewablePct).toFixed(1)}%</span>
              </div>
            </div>

            {/* SECTION 5 — RENEWABLE PERFORMANCE */}
            <div className="lg:col-span-3 p-1.5 sm:p-2 xl:p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 font-mono flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
              <div className="flex-1 min-h-0 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-0.5 mb-0.5 shrink-0 print:border-slate-300">
                  <span className="text-[9.5px] xl:text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                    <Wind className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
                    RENEWABLE PERFORMANCE
                  </span>
                  <span className="text-[8.5px] xl:text-[9.5px] text-slate-400">{activePeriod.renewableKwh} kWh</span>
                </div>

                <div className="space-y-0.5 text-[8.5px] xl:text-[9.5px] my-0.5">
                  <div className="flex justify-between items-center p-1 xl:p-1.5 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 text-[8px] xl:text-[9px] flex items-center gap-1">
                      <Sun className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-amber-400" /> Solar:
                    </span>
                    <span className="font-bold text-amber-300">{activePeriod.solarKwh} kWh ({activePeriod.solarPct}%)</span>
                  </div>

                  <div className="flex justify-between items-center p-1 xl:p-1.5 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 text-[8px] xl:text-[9px] flex items-center gap-1">
                      <Wind className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-cyan-400" /> Wind:
                    </span>
                    <span className="font-bold text-cyan-300">{activePeriod.windKwh} kWh ({activePeriod.windPct}%)</span>
                  </div>

                  <div className="flex justify-between items-center p-1 xl:p-1.5 rounded bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-400 text-[8px] xl:text-[9px]">Peak Output:</span>
                    <span className="font-bold text-emerald-400">{activePeriod.peakRenewableKw} kW Real-Time</span>
                  </div>
                </div>

                {/* Solar vs Wind Split Visual Bar */}
                <div className="pt-0.5 border-t border-slate-800/80 my-auto">
                  <span className="text-[8px] xl:text-[9px] text-slate-400 uppercase font-semibold block mb-0.5">
                    Solar vs Wind Contribution
                  </span>
                  <div className="w-full h-2 xl:h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-300" 
                      style={{ width: `${activePeriod.solarPct}%` }} 
                      title={`Solar: ${activePeriod.solarPct}%`}
                    />
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-300" 
                      style={{ width: `${activePeriod.windPct}%` }} 
                      title={`Wind: ${activePeriod.windPct}%`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-[7.5px] xl:text-[8.5px] text-slate-400 pt-0.5 border-t border-slate-800/60 shrink-0 print:border-slate-300">
                <span className="text-amber-300 font-semibold">● Solar ({activePeriod.solarKwh} kWh)</span>
                <span className="text-cyan-300 font-semibold">● Wind ({activePeriod.windKwh} kWh)</span>
              </div>
            </div>

          </div>

          {/* ROW 3: SECTION 6 (SYSTEM RELIABILITY & OPERATIONS) + SECTION 7 (STORAGE & GWO DISPATCH) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 xl:gap-1.5 flex-1 min-h-0 overflow-hidden">
            
            {/* SECTION 6 — SYSTEM RELIABILITY & OPERATIONS */}
            <div className="lg:col-span-5 p-1.5 sm:p-2 xl:p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 font-mono flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
              <div className="flex-1 min-h-0 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-0.5 mb-0.5 shrink-0 print:border-slate-300">
                  <span className="text-[9.5px] xl:text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                    <Gauge className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
                    SYSTEM RELIABILITY & OPERATIONS
                  </span>
                  <span className="text-[8.5px] xl:text-[9.5px] text-emerald-400 font-semibold">100% RELIABLE</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 xl:gap-1.5 text-[8.5px] xl:text-[10px] my-auto">
                  <div className="p-1 xl:p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[7.5px] xl:text-[8px] text-slate-400 block uppercase leading-tight">Critical Load</span>
                    <span className="text-xs xl:text-sm font-black text-emerald-400 leading-tight">100.0%</span>
                    <span className="text-[7px] xl:text-[7.5px] text-slate-500 block leading-tight">Life-Support</span>
                  </div>

                  <div className="p-1 xl:p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[7.5px] xl:text-[8px] text-slate-400 block uppercase leading-tight">Generator Run</span>
                    <span className="text-xs xl:text-sm font-black text-amber-300 leading-tight">{activePeriod.genRuntimeHours}h</span>
                    <span className="text-[7px] xl:text-[7.5px] text-slate-500 block leading-tight">1 Unit Active</span>
                  </div>

                  <div className="p-1 xl:p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[7.5px] xl:text-[8px] text-slate-400 block uppercase leading-tight">Load Deficit</span>
                    <span className="text-xs xl:text-sm font-black text-emerald-400 leading-tight">0.0 kW</span>
                    <span className="text-[7px] xl:text-[7.5px] text-slate-500 block leading-tight">Zero Shedding</span>
                  </div>

                  <div className="p-1 xl:p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[7.5px] xl:text-[8px] text-slate-400 block uppercase leading-tight">Curtailment</span>
                    <span className="text-xs xl:text-sm font-black text-emerald-400 leading-tight">0.0%</span>
                    <span className="text-[7px] xl:text-[7.5px] text-slate-500 block leading-tight">100% Captured</span>
                  </div>

                  <div className="p-1 xl:p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[7.5px] xl:text-[8px] text-slate-400 block uppercase leading-tight">Cut-Out Events</span>
                    <span className="text-xs xl:text-sm font-black text-emerald-400 leading-tight">0 Incidents</span>
                    <span className="text-[7px] xl:text-[7.5px] text-slate-500 block leading-tight">Safe Envelope</span>
                  </div>

                  <div className="p-1 xl:p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                    <span className="text-[7.5px] xl:text-[8px] text-slate-400 block uppercase leading-tight">Grid Frequency</span>
                    <span className="text-xs xl:text-sm font-black text-purple-300 leading-tight">50.01 Hz</span>
                    <span className="text-[7px] xl:text-[7.5px] text-slate-500 block leading-tight">&plusmn;0.03 Locked</span>
                  </div>
                </div>
              </div>

              <div className="pt-0.5 border-t border-slate-800/80 text-[8px] xl:text-[9px] text-slate-400 flex justify-between shrink-0 print:border-slate-300">
                <span>Protection: Level 1 Armed</span>
                <span className="text-emerald-400">Zero Fault Interruptions</span>
              </div>
            </div>

            {/* SECTION 7 — STORAGE / GWO DISPATCH */}
            <div className="lg:col-span-7 p-1.5 sm:p-2 xl:p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 font-mono flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
              <div className="flex-1 min-h-0 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-0.5 mb-0.5 shrink-0 print:border-slate-300">
                  <span className="text-[9.5px] xl:text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                    <TrendingDown className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-emerald-400" />
                    STORAGE / GWO DISPATCH
                  </span>
                  <span className="text-[8.5px] xl:text-[9.5px] text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                    SAVED: {activePeriod.fuelSavedL} L ({activePeriod.fuelSavedPct})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 xl:gap-1.5 text-[8.5px] xl:text-[9.5px] my-0.5">
                  
                  {/* Battery Sub-Block */}
                  <div className="p-1 xl:p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-0.5">
                    <span className="text-[8px] xl:text-[9px] font-bold text-cyan-300 uppercase block border-b border-slate-800/60 pb-0.5">
                      LiFePO₄ Battery Storage
                    </span>
                    <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 leading-tight">
                      <div>
                        <span className="text-[7px] xl:text-[8px] text-slate-400 block">Current SOC:</span>
                        <span className="font-bold text-emerald-400 text-[8px] xl:text-[9px]">78.0% Active</span>
                      </div>
                      <div>
                        <span className="text-[7px] xl:text-[8px] text-slate-400 block">Usable:</span>
                        <span className="font-bold text-white text-[8px] xl:text-[9px]">390 / 500 kWh</span>
                      </div>
                      <div>
                        <span className="text-[7px] xl:text-[8px] text-slate-400 block">Throughput:</span>
                        <span className="font-bold text-sky-300 text-[8px] xl:text-[9px]">{activePeriod.batteryThroughput} kWh</span>
                      </div>
                      <div>
                        <span className="text-[7px] xl:text-[8px] text-slate-400 block">Round-Trip:</span>
                        <span className="font-bold text-teal-300 text-[8px] xl:text-[9px]">94.2%</span>
                      </div>
                    </div>
                  </div>

                  {/* GWO Optimization Sub-Block */}
                  <div className="p-1 xl:p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-0.5">
                    <span className="text-[8px] xl:text-[9px] font-bold text-emerald-300 uppercase block border-b border-slate-800/60 pb-0.5">
                      GWO Algorithmic Dispatch
                    </span>
                    <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 leading-tight">
                      <div>
                        <span className="text-[7px] xl:text-[8px] text-slate-400 block">Baseline Fuel:</span>
                        <span className="font-bold text-slate-300 text-[8px] xl:text-[9px]">{activePeriod.baselineFuel} L</span>
                      </div>
                      <div>
                        <span className="text-[7px] xl:text-[8px] text-slate-400 block">Optimized Fuel:</span>
                        <span className="font-bold text-emerald-400 text-[8px] xl:text-[9px]">{activePeriod.optimizedFuel} L</span>
                      </div>
                      <div>
                        <span className="text-[7px] xl:text-[8px] text-slate-400 block">Fuel Saved:</span>
                        <span className="font-bold text-emerald-400 text-[8px] xl:text-[9px]">{activePeriod.fuelSavedL} L</span>
                      </div>
                      <div>
                        <span className="text-[7px] xl:text-[8px] text-slate-400 block">CO₂ Reduced:</span>
                        <span className="font-bold text-teal-300 text-[8px] xl:text-[9px]">{activePeriod.co2AvoidedKg} kg</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Compact Horizontal Bar Comparison: Baseline vs Optimized Fuel */}
                <div className="pt-0.5 border-t border-slate-800/80 my-0.5">
                  <div className="flex justify-between text-[7.5px] xl:text-[8.5px] text-slate-400 font-semibold mb-0.5 leading-tight">
                    <span>Baseline vs Optimized Fuel Comparison</span>
                    <span className="text-emerald-400 font-bold">-{activePeriod.fuelSavedL} L (-{activePeriod.fuelSavedPct})</span>
                  </div>
                  
                  <div className="space-y-0.5 text-[7.5px] xl:text-[8.5px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-14 text-slate-400 shrink-0">Baseline:</span>
                      <div className="flex-1 h-1.5 xl:h-2 rounded bg-slate-950 border border-slate-800 overflow-hidden">
                        <div className="h-full bg-rose-500/70 w-full"></div>
                      </div>
                      <span className="w-16 text-right text-rose-300 font-bold">{activePeriod.baselineFuel} L</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-14 text-emerald-400 shrink-0 font-semibold">Optimized:</span>
                      <div className="flex-1 h-1.5 xl:h-2 rounded bg-slate-950 border border-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-400 w-[73.2%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      </div>
                      <span className="w-16 text-right text-emerald-300 font-bold">{activePeriod.optimizedFuel} L</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-0.5 border-t border-slate-800/60 text-[7.5px] xl:text-[8.5px] text-slate-400 flex justify-between shrink-0 print:border-slate-300">
                <span>Optimizer: Grey Wolf Metaheuristic</span>
                <span className="text-emerald-400">Genset Sweet-Spot: 78%</span>
              </div>
            </div>

          </div>

          {/* ROW 4: SECTION 8 (7-DAY / PERIOD HISTORICAL TREND) + SECTION 9 (OPERATIONAL STATUS / COMPLIANCE) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 xl:gap-1.5 flex-1 min-h-0 overflow-hidden">
            
            {/* SECTION 8 — HISTORICAL PERFORMANCE (DYNAMIC FOR DAILY / WEEKLY / MONTHLY) */}
            <div className="lg:col-span-7 p-1.5 sm:p-2 xl:p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 font-mono flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
              <div className="flex-1 min-h-0 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-800 pb-0.5 mb-0.5 shrink-0 print:border-slate-300">
                  <span className="text-[9.5px] xl:text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
                    {activePeriod.chartTitle}
                  </span>
                  <span className="text-[8.5px] xl:text-[9.5px] text-slate-400">{activePeriod.chartSubtitle}</span>
                </div>

                {/* Adaptive Dynamic Chart Container */}
                <div className="flex-1 min-h-[55px] xl:min-h-[80px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activePeriod.chartData} margin={{ top: 2, right: 8, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="repCons" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="repRen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" opacity={0.6} />
                      <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 8.5 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 8.5 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#091e42', borderColor: '#334155', borderRadius: '4px', fontSize: '9px' }} />
                      <Area type="monotone" dataKey="Consumed" stroke="#38bdf8" strokeWidth={1.5} fill="url(#repCons)" name="Consumed (kWh)" />
                      <Area type="monotone" dataKey="Renewable" stroke="#10b981" strokeWidth={1.5} fill="url(#repRen)" name="Renewable (kWh)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-0.5 border-t border-slate-800/80 text-[7.5px] xl:text-[8.5px] text-slate-400 flex justify-between shrink-0 print:border-slate-300">
                <span>{activePeriod.chartFooterYield}</span>
                <span className="text-emerald-400 font-semibold">{activePeriod.chartFooterBaseline}</span>
                <span className="text-sky-300 font-semibold">Zero Critical Outages</span>
              </div>
            </div>

            {/* SECTION 9 — EXECUTIVE SUMMARY / COMPLIANCE */}
            <div className="lg:col-span-5 p-1.5 sm:p-2 xl:p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 font-mono flex flex-col justify-between h-full overflow-hidden print:bg-white print:border-slate-400">
              <div className="flex-1 min-h-0 flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-0.5 mb-0.5 shrink-0 print:border-slate-300">
                  <span className="text-[9.5px] xl:text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-emerald-400" />
                    OPERATIONAL STATUS
                  </span>
                  <span className="text-[8.5px] xl:text-[9.5px] text-emerald-300 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                    CERTIFIED AUDIT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[8.5px] xl:text-[9.5px] leading-tight my-auto">
                  <div className="p-1 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block text-[7px] xl:text-[8px]">Compliance:</span>
                    <span className="font-bold text-emerald-400 text-[8px] xl:text-[9px]">Fully Compliant</span>
                  </div>
                  <div className="p-1 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block text-[7px] xl:text-[8px]">Critical Load:</span>
                    <span className="font-bold text-emerald-400 text-[8px] xl:text-[9px]">100% Guaranteed</span>
                  </div>
                  <div className="p-1 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block text-[7px] xl:text-[8px]">Curtailment:</span>
                    <span className="font-bold text-emerald-400 text-[8px] xl:text-[9px]">0% (All Captured)</span>
                  </div>
                  <div className="p-1 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block text-[7px] xl:text-[8px]">Cut-Out Events:</span>
                    <span className="font-bold text-emerald-400 text-[8px] xl:text-[9px]">0 Incidents</span>
                  </div>
                  <div className="p-1 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block text-[7px] xl:text-[8px]">Diesel Dispatch:</span>
                    <span className="font-bold text-amber-300 text-[8px] xl:text-[9px]">Optimized ({activePeriod.fuelSavedL} L Saved)</span>
                  </div>
                  <div className="p-1 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-slate-400 block text-[7px] xl:text-[8px]">Grid Status:</span>
                    <span className="font-bold text-sky-300 text-[8px] xl:text-[9px]">Synchronized Bus</span>
                  </div>
                </div>

                {/* Final Prominent Status Indicator */}
                <div className="p-1 xl:p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-center text-[10px] xl:text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 shadow-sm shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>STATION STATUS: FULLY COMPLIANT</span>
                </div>
              </div>

              <div className="pt-0.5 border-t border-slate-800/60 text-[7.5px] xl:text-[8.5px] text-slate-500 flex justify-between shrink-0 print:border-slate-300">
                <span>ISO 50001 / SCAR Treaty Protocol</span>
                <span>POL-REP-2026-0927</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    ) : (
      <div className="flex flex-col flex-1 min-h-0 justify-between overflow-hidden w-full">
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 pr-1 sm:pr-1.5 space-y-3 xl:space-y-3.5">
          
          {/* SECTION 1: POLARIS STATION CONFIGURATION CONSOLE */}
          {settingsNav === 'station' && (
            <div className="space-y-3 xl:space-y-3.5 font-mono">
              
              {/* COMPACT STATION IDENTITY & STATUS HEADER */}
              <div className="rounded-xl bg-gradient-to-r from-sky-950/50 via-slate-900/80 to-slate-950/90 border border-sky-500/35 p-3 sm:p-3.5 shadow-md">
                {/* Top Row: Station Identity + Functional Station Selector */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/35 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
                      <MapPin className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-black tracking-wider text-white uppercase">
                          {currentStationConfig.name.toUpperCase()}
                        </h2>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold uppercase tracking-normal">
                          ACTIVE NODE &bull; {currentStationConfig.code}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-sans">
                        Polaris Microgrid &bull; Station Configuration &amp; Telemetry Console
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compact Telemetry & Metadata Strip */}
                <div className="pt-2 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-xs">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/35 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>System Active</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-cyan-300 font-bold">{currentStationConfig.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-slate-300">
                    <span className="text-slate-400">Elev:</span>
                    <span className="text-slate-200 font-bold">{currentStationConfig.elevation}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-slate-300">
                    <Lock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Encrypted SSL</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-slate-300">
                    <Radio className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{currentStationConfig.telemetryProtocol || 'MQTT-SN / SAT'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-amber-300 font-bold">{currentStationConfig.gridFrequency || '50.0 Hz'}</span>
                    <span className="text-slate-400 text-[9.5px]">Sync</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-slate-300">
                    <Thermometer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-cyan-300 font-bold">{currentStationConfig.temp}&deg;C</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-slate-300">
                    <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-sky-300 font-bold">{currentStationConfig.windSpeed} m/s</span>
                  </div>
                </div>
              </div>

              {/* SECTION 1 — STATION PROFILE (FUNCTIONAL SETTINGS FORM) */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/60 p-3 sm:p-3.5 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-sky-400" />
                    <span className="text-xs xl:text-sm font-black uppercase text-white tracking-wider">
                      STATION PROFILE
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-sans">
                    Geographic parameters, terrain &amp; forecast horizon
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 xl:gap-3">
                  {/* Field 1: Station Name */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Station Name
                    </label>
                    <input
                      type="text"
                      value={currentStationConfig.name}
                      onChange={(e) => updateStationField('name', e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-sky-400 focus:bg-slate-900 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-white font-mono transition outline-none"
                      placeholder="e.g. Maitri Research Station"
                    />
                  </div>

                  {/* Field 2: Region & Terrain */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Region &amp; Terrain
                    </label>
                    <input
                      type="text"
                      value={currentStationConfig.region}
                      onChange={(e) => updateStationField('region', e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-sky-400 focus:bg-slate-900 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-white font-mono transition outline-none"
                      placeholder="e.g. Schirmacher Oasis, Queen Maud Land"
                    />
                  </div>

                  {/* Field 3: Geographic Coordinates */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Geographic Coordinates
                    </label>
                    <input
                      type="text"
                      value={currentStationConfig.location}
                      onChange={(e) => updateStationField('location', e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-cyan-400 focus:bg-slate-900 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-cyan-300 font-mono font-bold transition outline-none"
                      placeholder="e.g. 70.76°S, 11.73°E"
                    />
                  </div>

                  {/* Field 4: Climate Classification */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Climate Classification
                    </label>
                    <input
                      type="text"
                      value={currentStationConfig.climate}
                      onChange={(e) => updateStationField('climate', e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-teal-400 focus:bg-slate-900 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-white font-mono transition outline-none"
                      placeholder="e.g. Antarctic Continental Ice Shelf Margin"
                    />
                  </div>

                  {/* Field 5: Station Time Zone */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Station Time Zone
                    </label>
                    <input
                      type="text"
                      value={currentStationConfig.timeZone}
                      onChange={(e) => updateStationField('timeZone', e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-amber-400 focus:bg-slate-900 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-amber-200 font-mono transition outline-none"
                      placeholder="e.g. Indian Ocean (GMT +5)"
                    />
                  </div>

                  {/* Field 6: Forecast Horizon */}
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Forecast Horizon
                    </label>
                    <select
                      value={currentStationConfig.forecastHorizon}
                      onChange={(e) => updateStationField('forecastHorizon', e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-sky-400 focus:bg-slate-900 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-sky-300 font-mono font-bold transition outline-none cursor-pointer"
                    >
                      <option value="24 Hours" className="bg-slate-900 text-white">24 Hours</option>
                      <option value="48 Hours" className="bg-slate-900 text-white">48 Hours</option>
                      <option value="168 Hours (7 Days)" className="bg-slate-900 text-white">168 Hours (7 Days)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2 — INSTALLED MICROGRID CAPACITY (READ-ONLY SYSTEM SPECIFICATIONS) */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/60 p-3 sm:p-3.5 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs xl:text-sm font-black uppercase text-white tracking-wider">
                      INSTALLED MICROGRID CAPACITY
                    </span>
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-mono uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    READ-ONLY SPECIFICATIONS
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-2.5 xl:gap-3">
                  {/* Solar PV — Subtle Yellow */}
                  <div className="h-22 sm:h-24 p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-amber-950/20 to-slate-950/80 border border-amber-500/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-amber-400/90">
                      <span className="text-[10px] font-bold tracking-wider flex items-center gap-1.5 uppercase">
                        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        Solar PV
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-amber-300 tracking-tight">
                        {currentStationConfig.solarCapacityKw}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-amber-400/80">kW</span>
                    </div>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-400 truncate tracking-wide">Bifacial arrays</span>
                  </div>

                  {/* Wind Turbines — Subtle Cyan */}
                  <div className="h-22 sm:h-24 p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-cyan-950/20 to-slate-950/80 border border-cyan-500/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-cyan-400/90">
                      <span className="text-[10px] font-bold tracking-wider flex items-center gap-1.5 uppercase">
                        <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        Wind Turbines
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-cyan-300 tracking-tight">
                        {currentStationConfig.windCapacityKw}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-cyan-400/80">kW</span>
                    </div>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-400 truncate tracking-wide">Cold-hardened</span>
                  </div>

                  {/* Battery BESS — Subtle Purple */}
                  <div className="h-22 sm:h-24 p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-purple-950/20 to-slate-950/80 border border-purple-500/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-purple-400/90">
                      <span className="text-[10px] font-bold tracking-wider flex items-center gap-1.5 uppercase">
                        <BatteryCharging className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        Battery BESS
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-purple-300 tracking-tight">
                        {currentStationConfig.batteryCapacityKwh}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-purple-400/80">kWh</span>
                    </div>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-400 truncate tracking-wide">LiFePO4 pack</span>
                  </div>

                  {/* Gensets — Subtle Red/Rose */}
                  <div className="h-22 sm:h-24 p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-rose-950/20 to-slate-950/80 border border-rose-500/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-rose-400/90">
                      <span className="text-[10px] font-bold tracking-wider flex items-center gap-1.5 uppercase">
                        <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        Gensets
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-rose-300 tracking-tight">
                        {currentStationConfig.dieselCapacityKva}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-rose-400/80">kVA</span>
                    </div>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-400 truncate tracking-wide">3x Arctic units</span>
                  </div>

                  {/* Fuel Capacity — Subtle Orange */}
                  <div className="h-22 sm:h-24 p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-orange-950/20 to-slate-950/80 border border-orange-500/30 flex flex-col justify-between col-span-2 sm:col-span-1 xl:col-span-1">
                    <div className="flex items-center justify-between text-orange-400/90">
                      <span className="text-[10px] font-bold tracking-wider flex items-center gap-1.5 uppercase">
                        <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        Fuel Capacity
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-orange-300 tracking-tight">
                        {currentStationConfig.fuelCapacityL.toLocaleString()}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-orange-400/80">L</span>
                    </div>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-400 truncate tracking-wide">ATF Arctic blend</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3 — SYSTEM CONFIGURATION (INTERACTIVE UNITS & OPERATIONAL PARAMETERS) */}
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/60 p-3 sm:p-3.5 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-teal-400" />
                    <span className="text-xs xl:text-sm font-black uppercase text-white tracking-wider">
                      SYSTEM CONFIGURATION
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-sans">
                    System units &amp; operational telemetry standards
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5 xl:gap-3.5">
                  {/* PANEL 1: SYSTEM UNITS (EDITABLE DROPDOWNS) */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                      <span className="text-[11px] font-bold uppercase text-teal-400 tracking-wider">
                        SYSTEM UNITS
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-mono">EDITABLE</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-xs">
                      {/* Temperature Unit */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Temperature</label>
                        <select
                          value={currentStationConfig.tempUnit || '°C (Celsius)'}
                          onChange={(e) => updateStationField('tempUnit', e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono font-bold cursor-pointer outline-none"
                        >
                          <option value="°C (Celsius)" className="bg-slate-900 text-white">°C (Celsius)</option>
                          <option value="°F (Fahrenheit)" className="bg-slate-900 text-white">°F (Fahrenheit)</option>
                          <option value="K (Kelvin)" className="bg-slate-900 text-white">K (Kelvin)</option>
                        </select>
                      </div>

                      {/* Power Unit */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Power</label>
                        <select
                          value={currentStationConfig.powerUnit || 'kW (Kilowatts)'}
                          onChange={(e) => updateStationField('powerUnit', e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-sky-300 font-mono font-bold cursor-pointer outline-none"
                        >
                          <option value="kW (Kilowatts)" className="bg-slate-900 text-white">kW (Kilowatts)</option>
                          <option value="MW (Megawatts)" className="bg-slate-900 text-white">MW (Megawatts)</option>
                          <option value="W (Watts)" className="bg-slate-900 text-white">W (Watts)</option>
                        </select>
                      </div>

                      {/* Energy Unit */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Energy</label>
                        <select
                          value={currentStationConfig.energyUnit || 'kWh'}
                          onChange={(e) => updateStationField('energyUnit', e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-mono font-bold cursor-pointer outline-none"
                        >
                          <option value="kWh" className="bg-slate-900 text-white">kWh</option>
                          <option value="MWh" className="bg-slate-900 text-white">MWh</option>
                          <option value="GJ (Gigajoules)" className="bg-slate-900 text-white">GJ (Gigajoules)</option>
                        </select>
                      </div>

                      {/* Fuel Unit */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Fuel</label>
                        <select
                          value={currentStationConfig.fuelUnit || 'L (Liters)'}
                          onChange={(e) => updateStationField('fuelUnit', e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-teal-400 rounded-lg px-2.5 py-1.5 text-xs text-orange-300 font-mono font-bold cursor-pointer outline-none"
                        >
                          <option value="L (Liters)" className="bg-slate-900 text-white">L (Liters)</option>
                          <option value="gal (Gallons)" className="bg-slate-900 text-white">gal (Gallons)</option>
                          <option value="m³ (Cubic Meters)" className="bg-slate-900 text-white">m³ (Cubic Meters)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* PANEL 2: OPERATIONAL PARAMETERS (DISTINGUISHING EDITABLE VS READ-ONLY) */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                      <span className="text-[11px] font-bold uppercase text-sky-400 tracking-wider">
                        OPERATIONAL PARAMETERS
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-mono">HYBRID CONFIG</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-xs">
                      {/* Dispatch Mode (EDITABLE) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-slate-400 font-semibold">Dispatch Mode</label>
                          <span className="text-[8.5px] text-emerald-400 font-mono">EDITABLE</span>
                        </div>
                        <select
                          value={currentStationConfig.dispatchMode || 'Autonomous GWO'}
                          onChange={(e) => updateStationField('dispatchMode', e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-mono font-bold cursor-pointer outline-none"
                        >
                          <option value="Autonomous GWO" className="bg-slate-900 text-white">Autonomous GWO</option>
                          <option value="Constrained Peak-Shave" className="bg-slate-900 text-white">Constrained Peak-Shave</option>
                          <option value="Diesel Minimization" className="bg-slate-900 text-white">Diesel Minimization</option>
                        </select>
                      </div>

                      {/* Forecast Horizon (EDITABLE) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-slate-400 font-semibold">Forecast Horizon</label>
                          <span className="text-[8.5px] text-sky-400 font-mono">EDITABLE</span>
                        </div>
                        <select
                          value={currentStationConfig.forecastHorizon || '24 Hours'}
                          onChange={(e) => updateStationField('forecastHorizon', e.target.value)}
                          className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-sky-400 rounded-lg px-2.5 py-1.5 text-xs text-sky-300 font-mono font-bold cursor-pointer outline-none"
                        >
                          <option value="24 Hours" className="bg-slate-900 text-white">24 Hours</option>
                          <option value="48 Hours" className="bg-slate-900 text-white">48 Hours</option>
                          <option value="168 Hours (7 Days)" className="bg-slate-900 text-white">168 Hours (7 Days)</option>
                        </select>
                      </div>

                      {/* Grid Frequency (READ-ONLY) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-slate-400 font-semibold">Grid Frequency</label>
                          <span className="text-[8.5px] text-slate-500 font-mono">READ-ONLY</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-cyan-300 font-mono font-bold text-xs flex items-center justify-between">
                          <span>{currentStationConfig.gridFrequency || '50.0 Hz'}</span>
                          <span className="text-[9.5px] text-slate-500 font-normal">Synchronized Bus</span>
                        </div>
                      </div>

                      {/* Telemetry Protocol (READ-ONLY) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-slate-400 font-semibold">Telemetry Protocol</label>
                          <span className="text-[8.5px] text-slate-500 font-mono">READ-ONLY</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-teal-300 font-mono font-bold text-xs flex items-center justify-between">
                          <span>{currentStationConfig.telemetryProtocol || 'MQTT-SN / SAT'}</span>
                          <span className="text-[9.5px] text-slate-500 font-normal">Broker Active</span>
                        </div>
                      </div>

                      {/* Satellite Gateway (READ-ONLY) */}
                      <div className="space-y-1 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-slate-400 font-semibold">Satellite Gateway</label>
                          <span className="text-[8.5px] text-slate-500 font-mono">READ-ONLY</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-amber-300 font-mono font-bold text-xs flex items-center justify-between">
                          <span className="truncate">{currentStationConfig.satelliteUplink || 'GSAT-14 & Inmarsat'}</span>
                          <span className="text-[9.5px] text-slate-500 font-normal shrink-0 ml-2">Polar SAT Uplink</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

              {/* SECTION 2: USER MANAGEMENT & ACCESS CONTROL (MISSION CONTROL CONSOLE) */}
              {settingsNav === 'users' && (
                <div className="flex-1 min-h-0 flex flex-col font-mono space-y-2.5 overflow-hidden">
                  
                  {/* Console Header */}
                  <div className="border-b border-slate-800 pb-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
                    <div>
                      <h3 className="font-bold text-white text-xs sm:text-sm xl:text-base flex items-center gap-2">
                        <Users className="w-4 h-4 text-sky-400" />
                        <span>POLARIS // USER MANAGEMENT &amp; ACCESS CONTROL</span>
                      </h3>
                      <p className="text-[10px] xl:text-xs text-slate-400 font-sans">
                        Station personnel clearance, operator roles &amp; active satellite sessions
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs xl:text-sm transition cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.25)]"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Add Operator</span>
                    </button>
                  </div>

                  {/* Main Console Layout: Left Selector (~30%) & Right Selected Profile (~70%) */}
                  <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2.5 xl:gap-3 overflow-hidden">
                    
                    {/* LEFT PANEL: OPERATOR SELECTOR (COMPACT) */}
                    <div className="w-full lg:w-72 xl:w-80 shrink-0 bg-slate-950/70 border border-slate-800/90 rounded-xl p-2.5 flex flex-col min-h-0 max-h-[220px] lg:max-h-full">
                      
                      {/* Left Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                          <span className="font-bold text-xs text-white uppercase tracking-wider">OPERATORS</span>
                        </div>
                        <span className="text-[10px] text-sky-400 font-bold px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800/60">
                          {filteredUsers.length} Active
                        </span>
                      </div>

                      {/* Compact Search & Station Filter */}
                      <div className="space-y-1.5 mb-2 shrink-0">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text"
                            placeholder="Search operators..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-400"
                          />
                        </div>
                        <select
                          value={userStationFilter}
                          onChange={(e) => setUserStationFilter(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-sky-400 cursor-pointer"
                        >
                          <option value="All">All Polar Stations</option>
                          <option value="Maitri">Maitri Station</option>
                          <option value="Bharati">Bharati Station</option>
                          <option value="Himadri">Himadri Station</option>
                        </select>
                      </div>

                      {/* Operator Rows */}
                      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar min-h-0">
                        {filteredUsers.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            No operators found.
                          </div>
                        ) : (
                          filteredUsers.map((user) => {
                            const isSelected = selectedUser?.id === user.id;
                            const isUserActive = user.status === 'Active';
                            const initials = user.name
                              .split(' ')
                              .map(n => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase();

                            return (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => setSelectedUserId(user.id)}
                                className={`w-full text-left p-2 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2.5 ${
                                  isSelected
                                    ? 'bg-sky-500/15 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.2)] border-l-4 border-l-sky-400'
                                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700/80'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="relative shrink-0">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${
                                      isSelected
                                        ? 'bg-gradient-to-tr from-sky-400 to-cyan-200 text-slate-950 font-black'
                                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                                    }`}>
                                      {initials}
                                    </div>
                                    <span 
                                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                                        isUserActive ? 'bg-emerald-400' : 'bg-rose-500'
                                      }`}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                      {user.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                      <span>{user.station}</span>
                                      <span>&bull;</span>
                                      <span className={isUserActive ? 'text-emerald-400' : 'text-rose-400'}>
                                        {isUserActive ? 'Active' : 'Suspended'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-600'}`} />
                              </button>
                            );
                          })
                        )}
                      </div>

                    </div>

                    {/* RIGHT PANEL: DETAILED SELECTED OPERATOR PROFILE (PRIMARY) */}
                    {selectedUser ? (
                      <div className="flex-1 min-w-0 bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between overflow-y-auto space-y-3 custom-scrollbar">
                        
                        <div className="space-y-3">
                          {/* 1. OPERATOR HEADER */}
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-300 text-slate-950 flex items-center justify-center font-black text-base shadow-md ring-2 ring-sky-400/40">
                                  {selectedUser.name
                                    .split(' ')
                                    .map(n => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                                </div>
                                <span 
                                  className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                                    selectedUser.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                                  }`}
                                  title={selectedUser.status === 'Active' ? 'Active Session' : 'Suspended'}
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-white text-sm sm:text-base tracking-tight truncate">
                                    {selectedUser.name}
                                  </h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1.5 ${
                                    selectedUser.status === 'Active' 
                                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                                      : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${selectedUser.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                                    <span>{selectedUser.status === 'Active' ? '● ACTIVE' : '● SUSPENDED'}</span>
                                  </span>
                                </div>
                                <div className="text-xs text-sky-300 font-semibold mt-0.5">
                                  {selectedUser.role}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                                  <span>{selectedUser.email}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                              <span className="text-[9.5px] text-slate-400 uppercase tracking-wider font-semibold">Assigned Station</span>
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/70 border border-sky-800/80 text-sky-200 font-bold text-xs shadow-sm">
                                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                                <span>{selectedUser.stationFull || getStationFullName(selectedUser.station)}</span>
                              </div>
                            </div>
                          </div>

                          {/* 2. ACCESS LEVEL */}
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                              <div className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                                  ACCESS LEVEL
                                </span>
                              </div>
                              <span className="text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60">
                                {selectedUser.accessLevelName || `Level ${selectedUser.accessLevel || 2}`}
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                                  <span className="text-amber-400 font-black">{selectedUser.accessLevelName || `Level ${selectedUser.accessLevel || 2}`}</span>
                                  <span className="text-slate-400">&bull;</span>
                                  <span>{selectedUser.accessLevelDesc || selectedUser.clearance}</span>
                                </div>
                                <div className="text-[10.5px] text-slate-400 mt-0.5">
                                  Polar Station Command &amp; Autonomous Microgrid Dispatch Authorization
                                </div>
                              </div>

                              {/* 4-Segment Clearance Meter */}
                              <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800 shrink-0">
                                {[1, 2, 3, 4].map(lvl => {
                                  const isAuthorized = (selectedUser.accessLevel || 2) >= lvl;
                                  return (
                                    <div 
                                      key={lvl}
                                      className={`px-2 py-1 rounded text-[9.5px] font-extrabold flex items-center gap-1 ${
                                        isAuthorized
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                          : 'bg-slate-900/80 text-slate-600 border border-slate-800'
                                      }`}
                                      title={`Level ${lvl} Authorization`}
                                    >
                                      {isAuthorized ? <Check className="w-2.5 h-2.5 text-amber-400" /> : <Lock className="w-2.5 h-2.5 text-slate-600" />}
                                      <span>L{lvl}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* 3. ROLE & PERMISSIONS */}
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                                  ROLE &amp; PERMISSIONS
                                </span>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-mono">
                                {(selectedUser.permissions || []).length} Active Permissions
                              </span>
                            </div>

                            {/* Clean Permission Chips */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {(selectedUser.permissions && selectedUser.permissions.length > 0) ? (
                                selectedUser.permissions.map((perm) => (
                                  <div 
                                    key={perm}
                                    className="p-2 rounded-lg bg-slate-950/80 border border-emerald-900/40 text-slate-200 flex items-center gap-2 text-xs hover:border-emerald-500/40 transition"
                                  >
                                    <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center shrink-0">
                                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                                    </div>
                                    <span className="font-semibold text-[11px] truncate text-slate-100">{perm}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-full p-2.5 rounded-lg bg-slate-950 text-slate-400 text-xs text-center">
                                  No operational dispatch permissions assigned (Read-only station access).
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 4. SECURITY & AUTHENTICATION */}
                          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                              <div className="flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-sky-400" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                                  SECURITY &amp; AUTHENTICATION
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Protocol v4.2 Polar Sec
                              </span>
                            </div>

                            {/* 4 Security Metric Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                  <span>2FA</span>
                                </div>
                                <div className="text-xs font-bold text-emerald-300 mt-1">
                                  {selectedUser.twoFactor || 'Enabled'}
                                </div>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                                  <Key className="w-3 h-3 text-sky-400" />
                                  <span>Hardware Token</span>
                                </div>
                                <div className="text-xs font-bold text-sky-300 mt-1">
                                  {selectedUser.hardwareToken || 'Verified'}
                                </div>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                                  <Satellite className="w-3 h-3 text-cyan-400" />
                                  <span>Satellite Uplink</span>
                                </div>
                                <div className="text-xs font-bold text-cyan-300 mt-1 truncate">
                                  {selectedUser.uplink || 'GSAT-14'}
                                </div>
                              </div>

                              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>Session Timeout</span>
                                </div>
                                <div className="text-xs font-bold text-amber-300 mt-1">
                                  {selectedUser.sessionTimeout || '30 Minutes'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 5. ACTIONS TOOLBAR (BOTTOM / RIGHT) */}
                        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>Last active: <strong className="text-slate-300">{selectedUser.lastActive}</strong></span>
                            <span>&bull;</span>
                            <span>ID: <code className="text-sky-300">{selectedUser.id}</code></span>
                          </div>

                          <div className="flex items-center gap-2 ml-auto">
                            <button
                              type="button"
                              onClick={handleOpenEditUser}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                              <span>Edit Operator</span>
                            </button>

                            {selectedUser.status === 'Active' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(selectedUser.id)}
                                className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-700/80 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <UserX className="w-3.5 h-3.5 text-rose-400" />
                                <span>Suspend Access</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(selectedUser.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-700/80 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Activate Access</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(selectedUser.id, selectedUser.name)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                              title="Revoke Credentials & Remove Operator"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="flex-1 bg-slate-950/80 border border-slate-800/90 rounded-xl p-8 flex items-center justify-center text-slate-400 text-xs">
                        Select an operator from the left panel to inspect access profile.
                      </div>
                    )}

                  </div>

                  {/* TERTIARY SECURITY STRIP (COMPACT FOOTER - REQUIREMENT 12) */}
                  <div className="shrink-0 pt-1">
                    <div className="px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] xl:text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-300 font-bold tracking-wider">POLAR AUTHENTICATION:</span>
                        <span>2FA Hardware Tokens &bull; GSAT-14 Satellite Uplink</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sky-400">
                        <Clock className="w-3 h-3 text-sky-400" />
                        <span>Session Timeout: 30 min</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Bottom Status Bar */}
            <div className="pt-2 sm:pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0 font-mono text-xs">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10.5px] sm:text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Active Link: Encrypted SSL</span>
                </div>
                <div className="h-3 w-px bg-slate-800 hidden sm:block"></div>
                <div className="hidden sm:flex items-center gap-1">
                  <span className="text-slate-500">Uplink Protocol: </span>
                  <span className="text-sky-300">MQTT-SN / SAT</span>
                </div>
                {settingsNav === 'users' && (
                  <>
                    <div className="h-3 w-px bg-slate-800 hidden md:block"></div>
                    <div className="text-slate-500 hidden md:block">
                      Active Operators: <span className="text-white">{users.length}</span>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-1.5 sm:py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs sm:text-sm transition cursor-pointer shadow-md flex items-center gap-2 ml-auto sm:ml-0"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>

      {/* Modal 1: Add New Operator */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#09172e] border border-sky-400/40 rounded-xl p-4 sm:p-5 w-full max-w-lg shadow-2xl text-white font-mono space-y-3.5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-400" />
                <h4 className="font-bold text-sm text-white">Add Polar Station Operator</h4>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Full Name:</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Dr. Anand Verma"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Email Address:</label>
                  <input 
                    type="email"
                    required
                    placeholder="e.g. a.verma@polaris.polar"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Assigned Station:</label>
                  <select
                    value={newUser.station}
                    onChange={(e) => setNewUser({ ...newUser, station: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Maitri">Maitri Research Station</option>
                    <option value="Bharati">Bharati Station</option>
                    <option value="Himadri">Himadri Arctic Station</option>
                    <option value="All Stations">All Stations (National Command)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Operational Role:</label>
                  <input
                    type="text"
                    required
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    placeholder="e.g. Microgrid Operations Engineer"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Access Level:</label>
                  <select
                    value={newUser.accessLevel}
                    onChange={(e) => setNewUser({ ...newUser, accessLevel: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none cursor-pointer"
                  >
                    <option value={4}>Level 4 — Full Dispatch &amp; Override</option>
                    <option value={3}>Level 3 — GWO &amp; BESS Dispatch</option>
                    <option value={2}>Level 2 — Telemetry &amp; Fuel Logistics</option>
                    <option value={1}>Level 1 — Read-only Audit &amp; Reporting</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Status:</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Permissions Checkbox Grid */}
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-400 block text-[11px] font-semibold">Permissions:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {POLAR_SYSTEM_PERMISSIONS.map((perm) => {
                    const isChecked = (newUser.permissions || []).includes(perm.id);
                    return (
                      <button
                        type="button"
                        key={perm.id}
                        onClick={() => toggleNewUserPermission(perm.id)}
                        className={`text-left p-2 rounded-lg border text-xs flex items-center gap-2 transition cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                          isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{perm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Create Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Operator Profile */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#09172e] border border-sky-400/40 rounded-xl p-4 sm:p-5 w-full max-w-lg shadow-2xl text-white font-mono space-y-3.5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-400" />
                <h4 className="font-bold text-sm text-white">Edit Operator Profile &bull; {editingUser.name}</h4>
              </div>
              <button 
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Full Name:</label>
                  <input 
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Email Address:</label>
                  <input 
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Assigned Station:</label>
                  <select
                    value={editingUser.station}
                    onChange={(e) => setEditingUser({ ...editingUser, station: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Maitri">Maitri Research Station</option>
                    <option value="Bharati">Bharati Station</option>
                    <option value="Himadri">Himadri Arctic Station</option>
                    <option value="All Stations">All Stations (National Command)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Operational Role:</label>
                  <input
                    type="text"
                    required
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Access Level:</label>
                  <select
                    value={editingUser.accessLevel || 2}
                    onChange={(e) => setEditingUser({ ...editingUser, accessLevel: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none cursor-pointer"
                  >
                    <option value={4}>Level 4 — Full Dispatch &amp; Override</option>
                    <option value={3}>Level 3 — GWO &amp; BESS Dispatch</option>
                    <option value={2}>Level 2 — Telemetry &amp; Fuel Logistics</option>
                    <option value={1}>Level 1 — Read-only Audit &amp; Reporting</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px] font-semibold">Status:</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-sky-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Permissions Checkbox Grid */}
              <div className="space-y-1.5 pt-1">
                <label className="text-slate-400 block text-[11px] font-semibold">Permissions:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {POLAR_SYSTEM_PERMISSIONS.map((perm) => {
                    const isChecked = (editingUser.permissions || []).includes(perm.id);
                    return (
                      <button
                        type="button"
                        key={perm.id}
                        onClick={() => toggleEditingUserPermission(perm.id)}
                        className={`text-left p-2 rounded-lg border text-xs flex items-center gap-2 transition cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                          isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                        }`}>
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{perm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
