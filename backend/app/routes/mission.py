from fastapi import APIRouter
from ..services.data_loader import get_data_loader
from ..services.weather_service import get_weather_service

router = APIRouter(prefix="/api/mission", tags=["Mission Planning"])

@router.get("/plan")
def get_mission_plan():
    """Returns the 7-day operational plan with generator loading, risk levels, and recommendations."""
    loader = get_data_loader()
    return loader.weekly_operational_plan or []

@router.get("/summary")
def get_mission_summary():
    """Returns the commander-level mission decision summary."""
    loader = get_data_loader()
    return loader.mission_decision_summary or []
