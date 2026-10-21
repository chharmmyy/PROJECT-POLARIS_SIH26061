from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from ..services.anomaly_service import get_anomaly_service

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])

class AnomalyEvalRequest(BaseModel):
    temp_c: float = -26.5
    wind_speed_ms: float = 16.2
    rh_pct: float = 85.0
    ghi_est_w_m2: float = 50.0
    renewable_kw: float = 8.0
    total_load_kw: float = 145.0

@router.get("/alerts")
def get_alerts(
    limit: int = Query(50, ge=1, le=500),
    severity: Optional[str] = Query(None, description="Critical, Warning, or Info"),
    alert_type: Optional[str] = Query(None, description="Filter by diagnosis category")
):
    """Returns AI-detected anomalies with explainable reasons."""
    svc = get_anomaly_service()
    return svc.get_alerts(limit=limit, severity=severity, alert_type=alert_type)

@router.get("/summary")
def get_anomaly_summary():
    """Returns anomaly statistics, detection rate, and category distributions."""
    svc = get_anomaly_service()
    return svc.get_summary()

@router.post("/evaluate")
def evaluate_anomaly(req: AnomalyEvalRequest):
    """Evaluates an operating condition using the trained Isolation Forest and diagnostic heuristics."""
    svc = get_anomaly_service()
    return svc.evaluate_point(
        temp_c=req.temp_c,
        wind_speed_ms=req.wind_speed_ms,
        rh_pct=req.rh_pct,
        ghi_est_w_m2=req.ghi_est_w_m2,
        renewable_kw=req.renewable_kw,
        total_load_kw=req.total_load_kw
    )
