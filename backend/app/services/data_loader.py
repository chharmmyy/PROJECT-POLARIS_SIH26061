import os
import pandas as pd
import numpy as np
from pathlib import Path
from ..config import DATA_DIR, STATIONS

class DataLoader:
    _instance = None

    def __init__(self):
        self.executive_summary = None
        self.feature_importance = None
        self.monthly_fuel = None
        self.historical_dashboard = None
        self.weekly_operational_plan = None
        self.mission_decision_summary = None
        self.alerts = None
        self.telemetry_samples = {}
        self.load_all()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = DataLoader()
        return cls._instance

    def load_all(self):
        # Executive summary
        exec_path = DATA_DIR / "executive_summary.csv"
        if exec_path.exists():
            self.executive_summary = pd.read_csv(exec_path).to_dict(orient="records")

        # Feature importance
        fi_path = DATA_DIR / "feature_importance.csv"
        if fi_path.exists():
            self.feature_importance = pd.read_csv(fi_path).to_dict(orient="records")

        # Monthly fuel
        mf_path = DATA_DIR / "monthly_fuel.csv"
        if mf_path.exists():
            df_mf = pd.read_csv(mf_path)
            month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            df_mf["MonthName"] = [month_names[int(m)-1] if 1 <= int(m) <= 12 else str(m) for m in df_mf["Month"]]
            df_mf["FuelSaved_L"] = df_mf["Baseline Fuel (L)"] - df_mf["Optimized Fuel (L)"]
            df_mf["FuelSavedPct"] = (df_mf["FuelSaved_L"] / df_mf["Baseline Fuel (L)"]) * 100
            df_mf["CO2Avoided_kg"] = df_mf["FuelSaved_L"] * 2.68
            self.monthly_fuel = df_mf.to_dict(orient="records")

        # Historical dashboard
        hist_path = DATA_DIR / "historical_dashboard.csv"
        if hist_path.exists():
            df_h = pd.read_csv(hist_path)
            # Sample or provide last 365 days / downsampled if large
            self.historical_dashboard = df_h.to_dict(orient="records")

        # Weekly operational plan
        wop_path = DATA_DIR / "weekly_operational_plan.csv"
        if wop_path.exists():
            self.weekly_operational_plan = pd.read_csv(wop_path).to_dict(orient="records")

        # Mission decision summary
        mds_path = DATA_DIR / "mission_decision_summary.csv"
        if mds_path.exists():
            self.mission_decision_summary = pd.read_csv(mds_path).to_dict(orient="records")

        # Alerts
        alerts_path = DATA_DIR / "alerts.csv"
        if not alerts_path.exists():
            alerts_path = DATA_DIR / "backend" / "app" / "models" / "alerts.csv"
        if alerts_path.exists():
            df_alerts = pd.read_csv(alerts_path)
            self.alerts = df_alerts.to_dict(orient="records")

    def get_station_telemetry_sample(self, station_name="Bharati", limit=168):
        """Returns the most recent `limit` hourly rows from simulated CSV."""
        if station_name in self.telemetry_samples:
            return self.telemetry_samples[station_name]

        filename = f"{station_name.lower()}_simulated.csv"
        csv_file = DATA_DIR / filename
        if not csv_file.exists():
            return []

        df = pd.read_csv(csv_file)
        # Select important columns
        cols = [c for c in [
            "timestamp", "temp_c", "wind_speed_ms", "rh_pct", "pressure_hpa",
            "ghi_est_w_m2", "ghi_w_m2", "pv_output_kw", "wind_output_kw",
            "renewable_output_kw", "heating_load_kw", "occupancy_load_kw",
            "total_load_kw", "net_load_kw", "diesel_required_kw", "diesel_liters"
        ] if c in df.columns]

        sample_df = df[cols].tail(limit).copy()
        sample_df = sample_df.fillna(0)
        data = sample_df.to_dict(orient="records")
        self.telemetry_samples[station_name] = data
        return data

def get_data_loader() -> DataLoader:
    return DataLoader.get_instance()
