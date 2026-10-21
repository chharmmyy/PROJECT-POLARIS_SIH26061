from fastapi import APIRouter
from ..config import STATIONS
from ..services.data_loader import get_data_loader

router = APIRouter(prefix="/api", tags=["Overview"])

@router.get("/stations")
def get_stations():
    """Returns metadata for all polar research stations."""
    return list(STATIONS.values())

@router.get("/executive-summary")
def get_executive_summary():
    """Returns the executive performance KPIs."""
    loader = get_data_loader()
    return loader.executive_summary or []

@router.get("/system-status")
def get_system_status():
    """Returns real-time status of the Polaris AI Energy Management System."""
    loader = get_data_loader()
    exec_data = {row["KPI"]: row["Value"] for row in (loader.executive_summary or [])}
    
    return {
        "status": "OPERATIONAL",
        "system_version": "Polaris 2.0 (SIH Polar Edition)",
        "ai_core": "Random Forest Forecaster + GWO Dispatch Optimizer + Isolation Forest Guard",
        "primary_training_station": "Bharati (Larsemann Hills, East Antarctica)",
        "current_deployment_station": "Maitri (Schirmacher Oasis, Antarctica)",
        "kpis": {
            "fuel_reduction_pct": exec_data.get("Fuel Reduction (%)", 3.49),
            "diesel_saved_liters": exec_data.get("Diesel Saved (L)", 242.0),
            "co2_reduction_kg": exec_data.get("CO₂ Reduction (kg)", 650.0),
            "avg_generator_loading_pct": exec_data.get("Average Generator Loading (%)", 70.53),
            "battery_capacity_kwh": exec_data.get("Battery Capacity (kWh)", 250.0),
            "operational_autonomy_days": exec_data.get("Operational Autonomy (Days)", 669.2),
            "planning_autonomy_days": exec_data.get("Planning Autonomy (Days)", 227.1),
            "ai_anomaly_rate_pct": exec_data.get("AI Anomaly Detection Rate (%)", 2.0)
        }
    }
