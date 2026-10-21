import os
import time
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def main():
    print("=== Training Polaris AI Models ===")
    t0 = time.time()
    
    csv_path = "bharati_simulated.csv"
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Missing {csv_path}")

    print("Loading Bharati operational dataset...")
    df = pd.read_csv(csv_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    # Standardize / interpolate
    df["wind_speed_ms"] = df["wind_speed_ms"].interpolate(limit_direction="both")
    df["rh_pct"] = df["rh_pct"].interpolate(limit_direction="both").ffill().bfill()
    df["pressure_hpa"] = df["pressure_hpa"].interpolate(limit_direction="both").ffill().bfill()
    if "ghi_est_w_m2" not in df.columns and "ghi_w_m2" in df.columns:
        df["ghi_est_w_m2"] = df["ghi_w_m2"]

    # Temporal & Heating features
    df["hour"] = df["timestamp"].dt.hour
    df["month"] = df["timestamp"].dt.month
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)
    df["heating_index"] = np.clip(20.0 - df["temp_c"], 0, None)

    FEATURES = [
        "temp_c",
        "wind_speed_ms",
        "rh_pct",
        "pressure_hpa",
        "ghi_est_w_m2",
        "hour_sin",
        "hour_cos",
        "month_sin",
        "month_cos",
        "heating_index"
    ]
    TARGET = "total_load_kw"

    clean_mask = df[FEATURES + [TARGET]].notna().all(axis=1)
    df_clean = df[clean_mask].copy()

    X = df_clean[FEATURES]
    y = df_clean[TARGET]

    print(f"Dataset ready: {X.shape[0]} samples. Training Random Forest Forecaster...")
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=16,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X, y)

    y_pred = rf_model.predict(X)
    mae = mean_absolute_error(y, y_pred)
    r2 = r2_score(y, y_pred)
    print(f"Random Forest trained in {time.time()-t0:.2f}s | MAE: {mae:.2f} kW | R2: {r2:.4f}")

    # Isolation Forest for Anomaly Detection
    print("Training Isolation Forest Anomaly Detector...")
    t_iso = time.time()
    
    if "renewable_kw" not in df_clean.columns:
        if "renewable_output_kw" in df_clean.columns:
            df_clean["renewable_kw"] = df_clean["renewable_output_kw"]
        else:
            df_clean["renewable_kw"] = df_clean.get("pv_output_kw", 0) + df_clean.get("wind_output_kw", 0)

    anomaly_features = [
        "temp_c",
        "wind_speed_ms",
        "rh_pct",
        "ghi_est_w_m2",
        "renewable_kw",
        "total_load_kw"
    ]

    iso_model = IsolationForest(
        n_estimators=100,
        contamination=0.02,
        random_state=42,
        n_jobs=-1
    )
    df_clean["anomaly_score"] = iso_model.fit_predict(df_clean[anomaly_features])
    df_clean["system_status"] = df_clean["anomaly_score"].map({1: "Normal", -1: "Anomaly"})
    print(f"Isolation Forest trained in {time.time()-t_iso:.2f}s")

    # Generate explainable alerts
    ai_alerts = df_clean[df_clean["system_status"] == "Anomaly"].copy()

    def explain_anomaly(row):
        if row["temp_c"] <= -25:
            return "Extreme cold condition"
        elif row["wind_speed_ms"] >= 14:
            return "High wind event"
        elif row["total_load_kw"] >= 140:
            return "Peak demand detected"
        elif row["renewable_kw"] <= 10:
            return "Low renewable availability"
        else:
            return "Abnormal energy pattern"

    ai_alerts["Alert"] = ai_alerts.apply(explain_anomaly, axis=1)
    
    def severity(row):
        if row["Alert"] in ["Extreme cold condition", "Peak demand detected"]:
            return "Critical"
        elif row["Alert"] in ["High wind event", "Low renewable availability"]:
            return "Warning"
        return "Info"

    ai_alerts["Severity"] = ai_alerts.apply(severity, axis=1)

    alert_cols = [
        "timestamp", "temp_c", "wind_speed_ms", "renewable_kw",
        "total_load_kw", "Alert", "Severity"
    ]
    ai_alerts = ai_alerts[alert_cols].sort_values("timestamp", ascending=False)
    
    # Save alerts
    ai_alerts.to_csv("alerts.csv", index=False)
    ai_alerts.to_csv("backend/app/models/alerts.csv", index=False)
    print(f"Saved {len(ai_alerts)} alerts to alerts.csv")

    # Save models
    os.makedirs("backend/app/models", exist_ok=True)
    joblib.dump(rf_model, "backend/app/models/rf_model.joblib")
    joblib.dump(iso_model, "backend/app/models/iso_model.joblib")
    
    # Also save metadata
    metadata = {
        "features": FEATURES,
        "anomaly_features": anomaly_features,
        "mae": float(mae),
        "r2": float(r2),
        "total_samples": int(len(df_clean)),
        "anomaly_count": int(len(ai_alerts)),
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    joblib.dump(metadata, "backend/app/models/model_metadata.joblib")
    print("Models and metadata persisted successfully in backend/app/models/")

if __name__ == "__main__":
    main()
