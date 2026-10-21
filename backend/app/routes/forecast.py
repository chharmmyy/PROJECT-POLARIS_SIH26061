from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from ..services.data_loader import get_data_loader
from ..services.forecaster import get_forecaster
from ..services.weather_service import get_weather_service

router = APIRouter(prefix="/api/forecast", tags=["Forecasting"])

class WhatIfRequest(BaseModel):
    station_name: Optional[str] = "Maitri"
    temp_c: float = -15.0
    wind_speed_ms: float = 8.5
    rh_pct: float = 75.0
    pressure_hpa: float = 985.0
    ghi_est_w_m2: float = 250.0
    hour: int = 12
    month: int = 1

@router.get("/feature-importance")
def get_feature_importance():
    """Returns Random Forest feature importance rankings."""
    loader = get_data_loader()
    return loader.feature_importance or []

@router.get("/weekly")
def get_weekly_forecast(station: str = Query("Maitri", description="Station name (Maitri, Bharati, Himadri)")):
    """Returns the 7-day hourly load & renewable forecast along with daily summary."""
    weather_svc = get_weather_service()
    return weather_svc.fetch_7day_forecast(station)

@router.post("/what-if")
def simulate_what_if(req: WhatIfRequest):
    """Simulates load prediction and renewable output under custom user-specified polar conditions."""
    forecaster = get_forecaster()
    predicted_load = forecaster.predict_load(
        temp_c=req.temp_c,
        wind_speed_ms=req.wind_speed_ms,
        rh_pct=req.rh_pct,
        pressure_hpa=req.pressure_hpa,
        ghi_est_w_m2=req.ghi_est_w_m2,
        hour=req.hour,
        month=req.month
    )

    pv_power = forecaster.calculate_pv_power(req.ghi_est_w_m2)
    wind_power = forecaster.calculate_wind_power(req.wind_speed_ms)
    total_renewable = round(pv_power + wind_power, 2)
    net_load = round(max(0.0, predicted_load - total_renewable), 2)
    renewable_share = round((total_renewable / predicted_load * 100.0) if predicted_load > 0 else 0.0, 1)

    return {
        "inputs": req.dict(),
        "predictions": {
            "predicted_load_kw": predicted_load,
            "pv_power_kw": round(pv_power, 2),
            "wind_power_kw": round(wind_power, 2),
            "total_renewable_kw": total_renewable,
            "net_load_kw": net_load,
            "renewable_penetration_pct": renewable_share,
            "heating_demand_index": round(max(0.0, 20.0 - req.temp_c), 2)
        }
    }
