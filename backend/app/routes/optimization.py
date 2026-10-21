from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ..config import SFC_POINTS
from ..services.data_loader import get_data_loader
from ..services.optimizer import get_optimizer
from ..services.weather_service import get_weather_service

router = APIRouter(prefix="/api/optimization", tags=["Optimization"])

class GWOSimulationRequest(BaseModel):
    station_name: Optional[str] = "Maitri"
    battery_capacity_kwh: Optional[float] = 250.0
    battery_max_power_kw: Optional[float] = 40.0
    initial_soc: Optional[float] = 0.60
    generator_capacity_kw: Optional[float] = 150.0
    wolves_count: Optional[int] = 20
    iterations: Optional[int] = 30
    custom_hours: Optional[List[Dict[str, Any]]] = None

@router.get("/monthly-fuel")
def get_monthly_fuel():
    """Returns monthly baseline vs GWO-optimized fuel consumption comparison."""
    loader = get_data_loader()
    return loader.monthly_fuel or []

@router.get("/sfc-curve")
def get_sfc_curve():
    """Returns the Specific Fuel Consumption (SFC) benchmark points."""
    return [
        {"generator_loading_pct": k, "sfc_liters_per_kwh": v}
        for k, v in SFC_POINTS.items()
    ]

@router.post("/simulate-gwo")
def run_gwo_simulation(req: GWOSimulationRequest):
    """Runs on-demand Grey Wolf Optimization and BESS dispatch simulation."""
    optimizer = get_optimizer()

    records = req.custom_hours
    if not records:
        # Pull 7-day hourly forecast from weather service
        weather_svc = get_weather_service()
        forecast_res = weather_svc.fetch_7day_forecast(req.station_name or "Maitri")
        records = forecast_res.get("hourly_forecast", [])[:72]  # Default to 72 hours for fast responsive UI

    result = optimizer.simulate_dispatch(
        hourly_records=records,
        battery_capacity_kwh=req.battery_capacity_kwh or 250.0,
        battery_max_power_kw=req.battery_max_power_kw or 40.0,
        initial_soc=req.initial_soc or 0.60,
        generator_capacity_kw=req.generator_capacity_kw or 150.0,
        wolves=req.wolves_count or 20,
        iterations=req.iterations or 25
    )

    return result
