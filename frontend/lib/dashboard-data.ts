// Polaris Microgrid Data Service & Fallbacks

export interface StationInfo {
  code: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
}

export const STATIONS: StationInfo[] = [
  {
    code: 'MAITRI',
    name: 'Maitri Research Station',
    location: 'Schirmacher Oasis, Queen Maud Land',
    latitude: -70.76,
    longitude: 11.73,
  },
  {
    code: 'BHARATI',
    name: 'Bharati Research Station',
    location: 'Larsemann Hills, East Antarctica',
    latitude: -69.41,
    longitude: 76.19,
  },
  {
    code: 'HIMADRI',
    name: 'Himadri Arctic Station',
    location: 'Ny-Ålesund, Svalbard, Norway',
    latitude: 78.92,
    longitude: 11.93,
  },
];

export const SYSTEM_KPIS = {
  station_load_kw: 312,
  renewable_kw: 146,
  solar_kw: 42,
  wind_kw: 104,
  battery_kw: 31,
  battery_soc_pct: 78,
  diesel_kw: 166,
  diesel_burn_rate_lph: 68,
  fuel_reserve_liters: 14500,
  fuel_buffer_days: 5.8,
  avoided_co2_kg_week: 650,
  gwo_fuel_saved_liters_week: 242.0,
  renewable_penetration_pct: 46.8,
};

export const MONTHLY_FUEL_DATA = [
  { Month: 1, MonthName: 'Jan', 'Baseline Fuel (L)': 52851, 'Optimized Fuel (L)': 52802, FuelSaved_L: 49.5, SavedPct: 0.09 },
  { Month: 2, MonthName: 'Feb', 'Baseline Fuel (L)': 48416, 'Optimized Fuel (L)': 48394, FuelSaved_L: 22.2, SavedPct: 0.05 },
  { Month: 3, MonthName: 'Mar', 'Baseline Fuel (L)': 53120, 'Optimized Fuel (L)': 53040, FuelSaved_L: 80.0, SavedPct: 0.15 },
  { Month: 4, MonthName: 'Apr', 'Baseline Fuel (L)': 54200, 'Optimized Fuel (L)': 54080, FuelSaved_L: 120.0, SavedPct: 0.22 },
  { Month: 5, MonthName: 'May', 'Baseline Fuel (L)': 56400, 'Optimized Fuel (L)': 56250, FuelSaved_L: 150.0, SavedPct: 0.27 },
  { Month: 6, MonthName: 'Jun', 'Baseline Fuel (L)': 58900, 'Optimized Fuel (L)': 58710, FuelSaved_L: 190.0, SavedPct: 0.32 },
  { Month: 7, MonthName: 'Jul', 'Baseline Fuel (L)': 59800, 'Optimized Fuel (L)': 59580, FuelSaved_L: 220.0, SavedPct: 0.37 },
  { Month: 8, MonthName: 'Aug', 'Baseline Fuel (L)': 58100, 'Optimized Fuel (L)': 57920, FuelSaved_L: 180.0, SavedPct: 0.31 },
  { Month: 9, MonthName: 'Sep', 'Baseline Fuel (L)': 54300, 'Optimized Fuel (L)': 54170, FuelSaved_L: 130.0, SavedPct: 0.24 },
  { Month: 10, MonthName: 'Oct', 'Baseline Fuel (L)': 51200, 'Optimized Fuel (L)': 51110, FuelSaved_L: 90.0, SavedPct: 0.18 },
  { Month: 11, MonthName: 'Nov', 'Baseline Fuel (L)': 49100, 'Optimized Fuel (L)': 49040, FuelSaved_L: 60.0, SavedPct: 0.12 },
  { Month: 12, MonthName: 'Dec', 'Baseline Fuel (L)': 50400, 'Optimized Fuel (L)': 50350, FuelSaved_L: 50.0, SavedPct: 0.10 },
];

export const FEATURE_IMPORTANCE = [
  { Feature: 'Heating Demand Index', Importance: 0.34 },
  { Feature: 'Outdoor Temp (°C)', Importance: 0.23 },
  { Feature: 'Wind Chill Factor', Importance: 0.18 },
  { Feature: 'Solar Irradiance (GHI)', Importance: 0.15 },
  { Feature: 'Seasonal Baseline', Importance: 0.10 },
];

export const SFC_CURVE = [
  { generator_loading_pct: 30, sfc_liters_per_kwh: 0.36 },
  { generator_loading_pct: 50, sfc_liters_per_kwh: 0.32 },
  { generator_loading_pct: 70, sfc_liters_per_kwh: 0.288 },
  { generator_loading_pct: 78, sfc_liters_per_kwh: 0.285 },
  { generator_loading_pct: 85, sfc_liters_per_kwh: 0.292 },
  { generator_loading_pct: 100, sfc_liters_per_kwh: 0.33 },
];

export const ALERTS_LIST = [
  {
    id: 1,
    time: '14:15',
    severity: 'Critical',
    message: 'Fuel level below 70%',
    action: 'Check fuel status',
    category: 'Fuel Reserve',
    actionTaken: false,
    resolved: false,
  },
  {
    id: 2,
    time: '12:00',
    severity: 'Warning',
    message: 'Wind generation decreasing (expected 42% drop)',
    action: 'Monitor & prepare',
    category: 'Wind Inflow',
    actionTaken: false,
    resolved: false,
  },
  {
    id: 3,
    time: '10:20',
    severity: 'Attention',
    message: 'High heating demand expected (19:00 - 22:00)',
    action: 'Keep battery reserve',
    category: 'Thermal Load',
    actionTaken: false,
    resolved: false,
  },
  {
    id: 4,
    time: '08:35',
    severity: 'Attention',
    message: 'Battery temperature slightly high (24°C)',
    action: 'Check ventilation',
    category: 'Battery Storage',
    actionTaken: false,
    resolved: false,
  },
];
