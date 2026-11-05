"""
TransitPulse - CUMTA Control Room Analytical Backend
FastAPI + DuckDB + Scikit-Learn
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from typing import Optional, List

app = FastAPI(
    title="TransitPulse Backend",
    description="Operational analytics and predictive passenger demand platform for CUMTA / MTC Chennai",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data")

def load_json(filename: str):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@app.get("/")
def root():
    return {
        "status": "online",
        "platform": "TransitPulse (CUMTA)",
        "datasets_active": [
            "54M Historical ETM Records",
            "2,720 Geocoded Bus Stops",
            "1,348 MTC Bus Routes",
            "Chennai Metro Rail Network",
            "Chennai Suburban Rail Network"
        ]
    }

@app.get("/api/corridors/demand")
def get_corridor_demand(hour: Optional[int] = Query(None, ge=5, le=23), day_type: str = "weekday"):
    data = load_json("corridor_demand.json")
    if hour is not None:
        hourly_filtered = [h for h in data.get("hourly", []) if h.get("hour") == hour]
        return {
            "hour": hour,
            "day_type": day_type,
            "hourly_metric": hourly_filtered[0] if hourly_filtered else None,
            "corridors": data.get("corridors", [])
        }
    return data

@app.get("/api/actions/recommend")
def get_operational_actions(priority: Optional[str] = None):
    actions = load_json("operational_actions.json")
    if priority:
        actions = [a for a in actions if a.get("priority") == priority]
    return actions

@app.get("/api/system/stats")
def get_system_stats():
    return load_json("system_stats.json")

@app.get("/api/geo/stops")
def get_stops(zone: Optional[str] = None):
    stops = load_json("chennai_stops.json")
    if zone:
        stops = [s for s in stops if zone.lower() in s.get("zone", "").lower()]
    return stops

@app.get("/api/geo/routes")
def get_routes():
    return load_json("chennai_routes.json")

@app.get("/api/geo/metro")
def get_metro():
    return load_json("chennai_metro.json")

@app.get("/api/geo/suburban")
def get_suburban():
    return load_json("chennai_suburban.json")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
