# 🌌 PROJECT POLARIS (SIH 26061)
### Autonomous Microgrid Telemetry, AI Forecasting & Dispatch Optimization Suite

POLARIS is an advanced polar energy management platform engineered to orchestrate and optimize isolated microgrids at Arctic and Antarctic research stations (**Maitri**, **Bharati**, and **Himadri**). It integrates renewable generation (solar PV, polar wind turbines), battery storage (BESS), and diesel generator dispatch with AI-driven load forecasting and Grey Wolf Optimization (GWO).

---

## 📁 Project Architecture & Directory Structure

The project has been organized into dedicated, modular directories:

```text
polaris-web/
├── frontend/                     # Modern Next.js 15 Web Application & Dashboard
│   ├── app/                      # Next.js App Router (Dashboard, Analytics, Marketing, API routes)
│   │   ├── (marketing)/          # Landing page & mission showcase
│   │   ├── dashboard/            # Mission Control Dashboard
│   │   ├── analytics/            # Microgrid analytics & telemetry
│   │   └── api/                  # PostgreSQL backed Next.js route handlers
│   ├── components/               # Reusable React components
│   │   ├── dashboard/            # Overview, Analytics, Forecasts/GWO, Sidebar, Navbar
│   │   ├── polaris/              # 3D interactive hero, interactive network twin
│   │   └── ui/                   # High-contrast UI components
│   ├── lib/                      # Utilities, API client, PostgreSQL connection pool
│   ├── public/                   # Static icons, models, and assets
│   ├── package.json              # Frontend dependencies (React 19, Three.js, Lucide, Tailwind)
│   └── tsconfig.json             # TypeScript config
│
├── backend/                      # Python FastAPI ML & Optimization Service
│   ├── app/
│   │   ├── main.py               # FastAPI application entrypoint
│   │   ├── config.py             # Configuration & environment settings
│   │   ├── routes/               # API endpoints (anomalies, forecast, mission, optimization, telemetry)
│   │   ├── services/             # Core algorithms (GWO optimizer, forecasters, data loaders)
│   │   └── models/               # Pre-trained ML weights (Random Forest, Isolation Forest)
│   ├── train_models.py           # ML Model training pipeline
│   └── requirements.txt          # Python dependencies (FastAPI, scikit-learn, joblib, uvicorn)
│
├── data/                         # Master Canonical Datasets
│   ├── maitri_simulated.csv      # Maitri Antarctic Station telemetry
│   ├── bharati_simulated.csv     # Bharati Antarctic Station telemetry
│   ├── himadri_simulated.csv     # Himadri Arctic Station telemetry
│   ├── alerts.csv                # Polar grid fault & anomaly records
│   ├── historical_dashboard.csv  # Operational metrics & telemetry
│   ├── monthly_fuel.csv          # Fuel consumption and savings history
│   ├── feature_importance.csv    # ML predictor weightings
│   ├── executive_summary.csv     # High-level mission KPI metrics
│   ├── mission_decision_summary.csv # AI dispatch recommendations
│   └── weekly_operational_plan.csv  # 7-day optimized generation schedule
│
├── notebooks/                    # Data Science & Research Jupyter Notebooks
│   └── PROJECT_POLARIS_SIH.ipynb # SIH ML research, exploratory analysis & modeling notebook
│
├── scripts/                      # Migration and Build Scripts
│   ├── migrate-and-seed.mjs      # Seeds polar datasets into remote/local PostgreSQL
│   └── patch-html2canvas.js      # PDF/Canvas export utility
│
├── package.json                  # Root orchestration scripts
└── README.md                     # Documentation
```

---

## 🚀 Getting Started

### 1. Launching the Frontend Application (Next.js)

You can launch the web application directly from the root directory:

```bash
npm run dev
```

*(Alternatively, you can navigate into `frontend` and run `npm run dev`)*

The dashboard will be accessible at:
- **Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Landing Page**: [http://localhost:3000](http://localhost:3000)

### 2. Launching the Python Backend (FastAPI)

To run the Python ML & Optimization microservice:

```bash
# Install Python dependencies (in a virtual environment)
pip install -r backend/requirements.txt

# Run the FastAPI server
npm run backend:dev
# Or directly:
python -m uvicorn app.main:app --reload --app-dir backend --port 8000
```

### 3. Database Migration & Seeding

To seed or refresh the PostgreSQL telemetry database with the datasets from `data/`:

```bash
npm run seed
```

---

## ⚡ Core Features

- **Multi-Station Polar Telemetry**: Real-time monitoring across Antarctic (Maitri, Bharati) and Arctic (Himadri) bases.
- **Grey Wolf Optimizer (GWO)**: Multi-objective meta-heuristic dispatch balancing battery degradation, fuel minimization, and carbon reduction.
- **AI Load & Renewable Forecasting**: Random Forest regressors for extreme sub-zero weather forecasting.
- **Automated Anomaly Detection**: Isolation Forests identifying thermal runaway, generator phase imbalances, and frequency oscillations.
- **Responsive Layout**: Designed for high-res command displays and compact field laptops with unified scrolling.
