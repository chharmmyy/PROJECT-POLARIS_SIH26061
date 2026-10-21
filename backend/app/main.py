from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import overview, forecast, optimization, anomalies, mission, telemetry
from .services.data_loader import get_data_loader
from .services.forecaster import get_forecaster
from .services.anomaly_service import get_anomaly_service
from .services.optimizer import get_optimizer

app = FastAPI(
    title="Project Polaris API - AI-Driven Polar Energy Management System",
    description="Backend microservices for load forecasting, renewable integration, battery dispatch, and GWO fuel optimization at Antarctic & Arctic research stations.",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(overview.router)
app.include_router(forecast.router)
app.include_router(optimization.router)
app.include_router(anomalies.router)
app.include_router(mission.router)
app.include_router(telemetry.router)

@app.on_event("startup")
def startup_event():
    print("Initializing Polaris AI Services...")
    get_data_loader()
    get_forecaster()
    get_anomaly_service()
    get_optimizer()
    print("Polaris AI System Online and Ready.")

@app.get("/")
def root():
    return {
        "system": "Project Polaris AI Smart Energy Management System",
        "description": "Smart India Hackathon (SIH) - AI-Driven Microgrid for Polar Research Stations",
        "status": "RUNNING",
        "docs_url": "/docs",
        "stations_supported": ["Maitri (Antarctica)", "Bharati (Antarctica)", "Himadri (Arctic)"]
    }
