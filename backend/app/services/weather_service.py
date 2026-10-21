import time
import requests
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from ..config import STATIONS
from .forecaster import get_forecaster
from .data_loader import get_data_loader

class WeatherService:
    _instance = None

    def __init__(self):
        self.cache = {}
        self.cache_ttl_sec = 1800  # 30 mins

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = WeatherService()
        return cls._instance

    def fetch_7day_forecast(self, station_name: str = "Maitri") -> Dict[str, Any]:
        """Fetches 7-day hourly weather and computes AI load + renewable forecasts."""
        now = time.time()
        if station_name in self.cache:
            entry = self.cache[station_name]
            if now - entry["timestamp"] < self.cache_ttl_sec:
                return entry["data"]

        station = STATIONS.get(station_name, STATIONS["Maitri"])
        lat = station["latitude"]
        lon = station["longitude"]

        df_weather = None
        source = "Live Open-Meteo Polar API"

        try:
            url = (
                f"https://api.open-meteo.com/v1/forecast?"
                f"latitude={lat}&longitude={lon}"
                f"&hourly=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,shortwave_radiation"
                f"&forecast_days=7&timezone=auto&wind_speed_unit=ms"
            )
            resp = requests.get(url, timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                hourly = data.get("hourly", {})
                if "time" in hourly and len(hourly["time"]) > 0:
                    df_weather = pd.DataFrame({
                        "timestamp": hourly["time"],
                        "temp_c": hourly["temperature_2m"],
                        "rh_pct": hourly["relative_humidity_2m"],
                        "pressure_hpa": hourly["surface_pressure"],
                        "wind_speed_ms": hourly["wind_speed_10m"],
                        "ghi_est_w_m2": hourly["shortwave_radiation"]
                    })
        except Exception as e:
            # Failed to reach live API
            pass

        if df_weather is None:
            # Fallback to simulated weekly data
            source = "Simulated Polar Meteorological Model (Offline Fallback)"
            timestamps = pd.date_range(start=pd.Timestamp.now().floor("h"), periods=168, freq="h")
            # Synthesize realistic polar conditions based on station
            t_mean = station["winter_avg_temp_c"] if pd.Timestamp.now().month in [5,6,7,8,9] else station["summer_avg_temp_c"]
            np.random.seed(42)
            temp = t_mean + np.sin(np.linspace(0, 7*2*np.pi, 168)) * 4.0 + np.random.normal(0, 1.5, 168)
            wind = np.clip(np.abs(np.random.normal(7.5, 4.0, 168)), 0.5, 28.0)
            rh = np.clip(np.random.normal(75.0, 10.0, 168), 30.0, 98.0)
            press = np.random.normal(980.0, 8.0, 168)
            hour_angles = np.linspace(0, 168, 168) % 24
            is_antarctic_summer = (lat < 0 and pd.Timestamp.now().month in [11, 12, 1, 2])
            ghi = np.where((hour_angles > 6) & (hour_angles < 18), np.sin((hour_angles - 6)/12 * np.pi) * (450 if is_antarctic_summer else 50), 0.0)
            ghi = np.clip(ghi, 0.0, None)

            df_weather = pd.DataFrame({
                "timestamp": [str(t) for t in timestamps],
                "temp_c": temp,
                "rh_pct": rh,
                "pressure_hpa": press,
                "wind_speed_ms": wind,
                "ghi_est_w_m2": ghi
            })

        # Process through Forecaster
        forecaster = get_forecaster()
        df_processed = forecaster.batch_predict(df_weather, station_name)

        # Microgrid generator loading & risk classification
        gen_cap = station["generator_capacity_kw"]
        df_processed["loading_pct"] = (df_processed["net_load_kw"] / gen_cap * 100.0).clip(0, 100)

        def classify_risk(row):
            loading = row["loading_pct"]
            if loading >= 80.0 or row["wind_speed_ms"] >= 20.0 or row["temp_c"] <= -25.0:
                return "High"
            elif loading >= 65.0 or row["wind_speed_ms"] >= 12.0:
                return "Moderate"
            else:
                return "Low"

        df_processed["risk_level"] = df_processed.apply(classify_risk, axis=1)

        def get_rec(row):
            risk = row["risk_level"]
            if risk == "High":
                if row["wind_speed_ms"] >= 20.0:
                    return "Secure outdoor operations & maximize wind"
                elif row["temp_c"] <= -25.0:
                    return "Reserve battery for critical heating"
                else:
                    return "Curtail non-critical loads"
            elif risk == "Moderate":
                if row["pv_output_kw"] >= 20.0:
                    return "Charge battery from solar"
                elif row["wind_output_kw"] >= 15.0:
                    return "Prioritize wind generation"
                else:
                    return "Operate in optimal generator zone"
            else:
                return "Normal station operation"

        df_processed["recommendation"] = df_processed.apply(get_rec, axis=1)

        # Convert hourly to dict records
        df_processed["timestamp_str"] = df_processed["timestamp"].astype(str)
        hourly_records = df_processed[[
            "timestamp_str", "temp_c", "wind_speed_ms", "rh_pct", "pressure_hpa",
            "ghi_est_w_m2", "pv_output_kw", "wind_output_kw", "renewable_kw",
            "predicted_load_kw", "net_load_kw", "loading_pct", "risk_level", "recommendation"
        ]].copy()

        # Rounding
        hourly_records = hourly_records.round(2).to_dict(orient="records")

        # Daily rollup (7 days)
        df_processed["date"] = pd.to_datetime(df_processed["timestamp"]).dt.date.astype(str)
        daily_group = df_processed.groupby("date").agg({
            "predicted_load_kw": "mean",
            "renewable_kw": "mean",
            "net_load_kw": "mean",
            "temp_c": "mean",
            "wind_speed_ms": "mean",
            "loading_pct": "mean",
            "risk_level": lambda s: s.value_counts().idxmax(),
            "recommendation": lambda s: s.value_counts().idxmax()
        }).reset_index()

        def mission_priority(risk):
            if risk == "High":
                return "Immediate Attention"
            elif risk == "Moderate":
                return "Monitor Conditions"
            return "Routine Operations"

        daily_group["mission_priority"] = daily_group["risk_level"].apply(mission_priority)
        daily_records = daily_group.round(2).to_dict(orient="records")

        result = {
            "station": station_name,
            "source": source,
            "hourly_forecast": hourly_records,
            "daily_summary": daily_records
        }

        self.cache[station_name] = {
            "timestamp": now,
            "data": result
        }
        return result

def get_weather_service() -> WeatherService:
    return WeatherService.get_instance()
