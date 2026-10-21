from fastapi import APIRouter, Query
from ..services.data_loader import get_data_loader

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])

@router.get("/historical")
def get_historical_telemetry(limit: int = Query(365, ge=10, le=5000)):
    """Returns aggregated daily historical telemetry (loads, renewables, temperatures, anomalies)."""
    loader = get_data_loader()
    data = loader.historical_dashboard or []
    return data[-limit:]

@router.get("/station-sample")
def get_station_sample(
    station: str = Query("Bharati", description="Station name (Bharati, Maitri, Himadri)"),
    limit: int = Query(72, ge=12, le=336)
):
    """Returns high-resolution telemetry sample for the specified polar station."""
    loader = get_data_loader()
    return loader.get_station_telemetry_sample(station_name=station, limit=limit)
