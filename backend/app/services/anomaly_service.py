import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from ..config import MODELS_DIR, DATA_DIR

class AnomalyService:
    _instance = None

    def __init__(self):
        self.model = None
        self.alerts_cache = []
        self.load_model()
        self.load_alerts()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = AnomalyService()
        return cls._instance

    def load_model(self):
        model_path = MODELS_DIR / "iso_model.joblib"
        if model_path.exists():
            self.model = joblib.load(model_path)

    def load_alerts(self):
        alerts_path = DATA_DIR / "alerts.csv"
        if not alerts_path.exists():
            alerts_path = MODELS_DIR / "alerts.csv"
        if alerts_path.exists():
            df = pd.read_csv(alerts_path)
            self.alerts_cache = df.to_dict(orient="records")

    def get_alerts(self, limit: int = 100, severity: str = None, alert_type: str = None) -> List[Dict[str, Any]]:
        results = self.alerts_cache
        if severity:
            results = [a for a in results if str(a.get("Severity", "")).lower() == severity.lower()]
        if alert_type:
            results = [a for a in results if str(a.get("Alert", "")).lower() == alert_type.lower()]
        return results[:limit]

    def get_summary(self) -> Dict[str, Any]:
        total_alerts = len(self.alerts_cache)
        type_counts = {}
        severity_counts = {"Critical": 0, "Warning": 0, "Info": 0}

        for a in self.alerts_cache:
            atype = a.get("Alert", "Unknown")
            type_counts[atype] = type_counts.get(atype, 0) + 1
            sev = a.get("Severity", "Info")
            severity_counts[sev] = severity_counts.get(sev, 0) + 1

        return {
            "total_alerts": total_alerts,
            "anomaly_rate_pct": 2.0,
            "monitored_samples": 55520,
            "normal_samples": 54409,
            "type_distribution": [{"type": k, "count": v} for k, v in type_counts.items()],
            "severity_distribution": [{"severity": k, "count": v} for k, v in severity_counts.items()]
        }

    def evaluate_point(self, temp_c: float, wind_speed_ms: float, rh_pct: float, 
                       ghi_est_w_m2: float, renewable_kw: float, total_load_kw: float) -> Dict[str, Any]:
        """Evaluates an operational sample and explains the diagnosis."""
        features = pd.DataFrame([{
            "temp_c": temp_c,
            "wind_speed_ms": wind_speed_ms,
            "rh_pct": rh_pct,
            "ghi_est_w_m2": ghi_est_w_m2,
            "renewable_kw": renewable_kw,
            "total_load_kw": total_load_kw
        }])

        is_anomaly = False
        anomaly_score = 1
        if self.model is not None:
            anomaly_score = int(self.model.predict(features)[0])
            is_anomaly = (anomaly_score == -1)
        else:
            # Rule fallback
            if temp_c <= -25 or wind_speed_ms >= 14 or total_load_kw >= 140:
                is_anomaly = True

        diagnosis = "Normal"
        severity = "Normal"
        recommendation = "Maintain routine microgrid scheduling"

        if is_anomaly:
            if temp_c <= -25:
                diagnosis = "Extreme cold condition"
                severity = "Critical"
                recommendation = "Engage thermal auxiliary heaters and protect battery against deep discharge freeze"
            elif wind_speed_ms >= 14:
                diagnosis = "High wind event"
                severity = "Warning"
                recommendation = "Engage turbine pitch control and harvest surplus wind power into storage"
            elif total_load_kw >= 140:
                diagnosis = "Peak demand detected"
                severity = "Critical"
                recommendation = "Initiate demand-side management; curtail flexible laboratory heating"
            elif renewable_kw <= 10:
                diagnosis = "Low renewable availability"
                severity = "Warning"
                recommendation = "Pre-warm diesel generator and operate in optimal 70-85% loading envelope"
            else:
                diagnosis = "Abnormal energy pattern"
                severity = "Info"
                recommendation = "Inspect telemetry sensors for drift and calibrate metering channels"

        return {
            "is_anomaly": is_anomaly,
            "system_status": "Anomaly" if is_anomaly else "Normal",
            "anomaly_score": anomaly_score,
            "alert": diagnosis,
            "severity": severity,
            "recommendation": recommendation,
            "sensor_values": {
                "temp_c": temp_c,
                "wind_speed_ms": wind_speed_ms,
                "rh_pct": rh_pct,
                "ghi_est_w_m2": ghi_est_w_m2,
                "renewable_kw": renewable_kw,
                "total_load_kw": total_load_kw
            }
        }

def get_anomaly_service() -> AnomalyService:
    return AnomalyService.get_instance()
