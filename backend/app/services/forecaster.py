import os
import joblib
import numpy as np
import pandas as pd
from ..config import MODELS_DIR, STATIONS, WIND_PARAMS

class ForecasterService:
    _instance = None

    def __init__(self):
        self.model = None
        self.metadata = None
        self.load_model()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ForecasterService()
        return cls._instance

    def load_model(self):
        model_path = MODELS_DIR / "rf_model.joblib"
        meta_path = MODELS_DIR / "model_metadata.joblib"
        if model_path.exists():
            self.model = joblib.load(model_path)
        if meta_path.exists():
            self.metadata = joblib.load(meta_path)

    @staticmethod
    def calculate_pv_power(ghi_w_m2: float, pv_capacity_kw: float = 35.0, pv_efficiency: float = 0.18) -> float:
        """Solar PV output model."""
        if ghi_w_m2 <= 0:
            return 0.0
        power = (ghi_w_m2 / 1000.0) * pv_capacity_kw * pv_efficiency
        return float(np.clip(power, 0.0, pv_capacity_kw))

    @staticmethod
    def calculate_wind_power(speed_ms: float, wind_capacity_kw: float = 20.0) -> float:
        """Antarctic wind turbine power curve with cut-in, rated, and blizzard survival regions."""
        cut_in = WIND_PARAMS["cut_in_ms"]
        rated = WIND_PARAMS["rated_ms"]
        storm = WIND_PARAMS["storm_ms"]
        cut_out = WIND_PARAMS["cut_out_survival_ms"]

        if speed_ms < cut_in:
            return 0.0
        elif speed_ms < rated:
            return float(wind_capacity_kw * ((speed_ms - cut_in) / (rated - cut_in)) ** 3)
        elif speed_ms <= storm:
            return float(wind_capacity_kw)
        elif speed_ms <= cut_out:
            # Storm derating region (30-45 m/s)
            reduction = (speed_ms - storm) / (cut_out - storm)
            return float(wind_capacity_kw * (1.0 - 0.5 * reduction))
        else:
            # Blizzard survival shutdown
            return 0.0

    def predict_load(self, temp_c: float, wind_speed_ms: float, rh_pct: float, 
                     pressure_hpa: float, ghi_est_w_m2: float, hour: int, month: int) -> float:
        """Predict electrical demand (kW) using the trained Random Forest model."""
        hour_sin = np.sin(2 * np.pi * hour / 24)
        hour_cos = np.cos(2 * np.pi * hour / 24)
        month_sin = np.sin(2 * np.pi * month / 12)
        month_cos = np.cos(2 * np.pi * month / 12)
        heating_index = max(0.0, 20.0 - temp_c)

        features = pd.DataFrame([{
            "temp_c": temp_c,
            "wind_speed_ms": wind_speed_ms,
            "rh_pct": rh_pct,
            "pressure_hpa": pressure_hpa,
            "ghi_est_w_m2": ghi_est_w_m2,
            "hour_sin": hour_sin,
            "hour_cos": hour_cos,
            "month_sin": month_sin,
            "month_cos": month_cos,
            "heating_index": heating_index
        }])

        if self.model is not None:
            pred = self.model.predict(features)[0]
            return float(round(pred, 2))
        else:
            # Fallback thermodynamic physics model
            base_load = 55.0
            thermal = heating_index * 2.2
            wind_chill = (wind_speed_ms / 10.0) * 3.5
            return float(round(base_load + thermal + wind_chill, 2))

    def batch_predict(self, df_weather: pd.DataFrame, station_name: str = "Maitri") -> pd.DataFrame:
        """Runs predictions and renewable modeling on a DataFrame with timestamp, temp_c, wind_speed_ms, etc."""
        station = STATIONS.get(station_name, STATIONS["Maitri"])
        pv_cap = station["pv_capacity_kw"]
        pv_eff = station["pv_efficiency"]
        wind_cap = station["wind_capacity_kw"]

        df = df_weather.copy()
        if "timestamp" in df.columns:
            df["dt"] = pd.to_datetime(df["timestamp"])
            df["hour"] = df["dt"].dt.hour
            df["month"] = df["dt"].dt.month
        
        df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
        df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
        df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
        df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)
        df["heating_index"] = (20.0 - df["temp_c"]).clip(lower=0)

        if "ghi_est_w_m2" not in df.columns and "ghi_w_m2" in df.columns:
            df["ghi_est_w_m2"] = df["ghi_w_m2"]

        features = [
            "temp_c", "wind_speed_ms", "rh_pct", "pressure_hpa", "ghi_est_w_m2",
            "hour_sin", "hour_cos", "month_sin", "month_cos", "heating_index"
        ]

        if self.model is not None:
            df["predicted_load_kw"] = self.model.predict(df[features])
        else:
            df["predicted_load_kw"] = 55.0 + df["heating_index"] * 2.2 + (df["wind_speed_ms"] / 10.0) * 3.5

        # Solar PV & Wind modeling
        df["pv_output_kw"] = [self.calculate_pv_power(g, pv_cap, pv_eff) for g in df["ghi_est_w_m2"]]
        df["wind_output_kw"] = [self.calculate_wind_power(w, wind_cap) for w in df["wind_speed_ms"]]
        df["renewable_kw"] = df["pv_output_kw"] + df["wind_output_kw"]
        df["net_load_kw"] = (df["predicted_load_kw"] - df["renewable_kw"]).clip(lower=0)

        return df

def get_forecaster() -> ForecasterService:
    return ForecasterService.get_instance()
