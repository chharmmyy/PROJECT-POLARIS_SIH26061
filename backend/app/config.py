import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
DATA_DIR = BASE_DIR
MODELS_DIR = BACKEND_DIR / "app" / "models"

# Research Stations
STATIONS = {
    "Maitri": {
        "name": "Maitri Research Station",
        "code": "MAITRI",
        "region": "Continental Antarctica",
        "location": "Schirmacher Oasis, Queen Maud Land",
        "latitude": -70.76,
        "longitude": 11.73,
        "elevation_m": 117,
        "established_year": 1989,
        "type": "Deployment & Validation",
        "pv_capacity_kw": 35.0,
        "pv_efficiency": 0.18,
        "wind_capacity_kw": 20.0,
        "generator_capacity_kw": 150.0,
        "battery_capacity_kwh": 250.0,
        "battery_max_power_kw": 40.0,
        "winter_avg_temp_c": -20.5,
        "summer_avg_temp_c": -2.1,
        "extreme_min_temp_c": -38.2,
        "status": "Active Operational"
    },
    "Bharati": {
        "name": "Bharati Research Station",
        "code": "BHARATI",
        "region": "East Antarctica",
        "location": "Larsemann Hills",
        "latitude": -69.40,
        "longitude": 76.19,
        "elevation_m": 35,
        "established_year": 2012,
        "type": "AI Baseline Training",
        "pv_capacity_kw": 40.0,
        "pv_efficiency": 0.19,
        "wind_capacity_kw": 30.0,
        "generator_capacity_kw": 200.0,
        "battery_capacity_kwh": 500.0,
        "battery_max_power_kw": 50.0,
        "winter_avg_temp_c": -17.8,
        "summer_avg_temp_c": 0.5,
        "extreme_min_temp_c": -32.5,
        "status": "Active Operational"
    },
    "Himadri": {
        "name": "Himadri Arctic Research Station",
        "code": "HIMADRI",
        "region": "Arctic (Svalbard)",
        "location": "Ny-Ålesund, Spitsbergen, Norway",
        "latitude": 78.92,
        "longitude": 11.93,
        "elevation_m": 15,
        "established_year": 2008,
        "type": "Arctic Cross-Validation",
        "pv_capacity_kw": 20.0,
        "pv_efficiency": 0.18,
        "wind_capacity_kw": 15.0,
        "generator_capacity_kw": 100.0,
        "battery_capacity_kwh": 200.0,
        "battery_max_power_kw": 30.0,
        "winter_avg_temp_c": -14.0,
        "summer_avg_temp_c": 5.0,
        "extreme_min_temp_c": -28.0,
        "status": "Active Operational"
    }
}

# Microgrid and Fuel Constraints
SFC_POINTS = {
    40: 0.360,
    50: 0.340,
    60: 0.320,
    70: 0.300,
    80: 0.285,
    90: 0.290,
    100: 0.300
}

DIESEL_CO2_FACTOR = 2.68  # kg CO2 per liter diesel
CRITICAL_LOAD_FRACTION = 0.60
INDOOR_TARGET_TEMP_C = 20.0
INITIAL_PLANNING_FUEL_RESERVE_L = 50_000.0

WIND_PARAMS = {
    "cut_in_ms": 3.0,
    "rated_ms": 12.0,
    "storm_ms": 30.0,
    "cut_out_survival_ms": 45.0
}
