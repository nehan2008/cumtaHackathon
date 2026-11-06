import React, { useEffect, useState } from "react";
import { LandingPage } from "./components/landing/LandingPage";
import { PassengerPortal } from "./components/passenger/PassengerPortal";
import { BusStopDisplay } from "./components/display/BusStopDisplay";
import { Navbar } from "./components/Navbar";
import { KPICards } from "./components/KPICards";
import { GaugeKPIs } from "./components/GaugeKPIs";
import { MapLibreView } from "./components/MapLibreView";
import { DemandCharts } from "./components/DemandCharts";
import { CorridorAnalytics } from "./components/CorridorAnalytics";
import { OperationalActions } from "./components/OperationalActions";
import { ActionSimulatorModal } from "./components/ActionSimulatorModal";
import { OccupancyTracker } from "./components/occupancy/OccupancyTracker";
import { CommunicationPortal } from "./components/communication/CommunicationPortal";
import { PassengerFeedback } from "./components/feedback/PassengerFeedback";
import { MultimodalPlanner } from "./components/multimodal/MultimodalPlanner";
import { UnifiedTicketing } from "./components/ticketing/UnifiedTicketing";
import { AIPredictionModule } from "./components/analytics/AIPredictionModule";
import { TransitChatbot } from "./components/chatbot/TransitChatbot";


import {
  getBusStops,
  getRoutesGeoJSON,
  getMetroStations,
  getSuburbanStations,
  getDemandData,
  getOperationalActions,
  getSystemStats,
} from "./services/api";

import {
  type ChennaiWeather,
  type WeatherCondition,
  WEATHER_PROFILES,
  getChennaiWeather,
} from "./services/weather";

import type {
  BusStop,
  TransitRouteFeature,
  MetroStation,
  SuburbanStation,
  HourlyDemand,
  Corridor,
  OperationalAction,
  SystemStats,
} from "./types/api";

import {
  Zap,
  Info,
  Layers,
  ArrowRight,
  Bus,
  Home,
  Tv,
  Users,
  Activity,
  CloudRain,
  Sun,
  Flame
} from "lucide-react";

export type PortalType = "landing" | "passenger" | "display" | "control_room";

export default function App() {
  const [currentPortal, setCurrentPortal] = useState<PortalType>("landing");
  const [weather, setWeather] = useState<ChennaiWeather>(WEATHER_PROFILES.clear);

  const [currentHour, setCurrentHour] = useState<number>(8); // Default: Morning Peak 08:00
  const [dayType, setDayType] = useState<"weekday" | "weekend">("weekday");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Datasets
  const [stops, setStops] = useState<BusStop[]>([]);
  const [routesGeoJSON, setRoutesGeoJSON] = useState<{
    type: string;
    features: TransitRouteFeature[];
  } | null>(null);
  const [metroStations, setMetroStations] = useState<MetroStation[]>([]);
  const [suburbanStations, setSuburbanStations] = useState<SuburbanStation[]>([]);
  const [hourlyDemand, setHourlyDemand] = useState<HourlyDemand[]>([]);
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [actions, setActions] = useState<OperationalAction[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

  // Simulator Modal State
  const [simulatorOpen, setSimulatorOpen] = useState<boolean>(false);
  const [simulatorCorridorId, setSimulatorCorridorId] = useState<string>("corridor_omr");

  // Audit Log of Deployed Directives
  const [auditLog, setAuditLog] = useState<any[]>([
    {
      id: "LOG-INIT",
      time: "08:15",
      text: "System initialized with 54M historical ETM ticket records & Chennai GIS layers.",
    },
  ]);

  // Load Data & Weather on Mount
  useEffect(() => {
    getBusStops().then(setStops);
    getRoutesGeoJSON().then(setRoutesGeoJSON as any);
    getMetroStations().then(setMetroStations);
    getSuburbanStations().then(setSuburbanStations);
    getDemandData().then((res) => {
      setHourlyDemand(res.hourly);
      setCorridors(res.corridors);
    });
    getOperationalActions().then(setActions);
    getSystemStats().then(setSystemStats);

    // Weather check
    getChennaiWeather().then(setWeather);
  }, []);

  // Auto-play timeline simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentHour((prev) => (prev >= 23 ? 5 : prev + 1));
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentDemand = hourlyDemand.find((h) => h.hour === currentHour);

  // Weather switch handler
  const handleWeatherChange = (cond: WeatherCondition) => {
    setWeather(WEATHER_PROFILES[cond]);
    setAuditLog((prev) => [
      {
        id: `LOG-WX-${Date.now().toString().slice(-4)}`,
        time: `${currentHour.toString().padStart(2, "0")}:00`,
        text: `Weather Condition set to "${cond.toUpperCase()}": Demand multiplier adjusted to ${WEATHER_PROFILES[cond].demand_multiplier}x.`,
      },
      ...prev,
    ]);
  };

  // Handler for deploying an advisory
  const handleDeployAction = (actionId: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: "deployed" } : a))
    );
    const target = actions.find((a) => a.id === actionId);
    setAuditLog((prev) => [
      {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        time: `${currentHour.toString().padStart(2, "0")}:00`,
        text: `Human Approved Directive: ${target?.title ?? actionId} (${target?.depot ?? "Standby Fleet"})`,
      },
      ...prev,
    ]);
  };

  // Handler from Simulator
  const handleCommitDirective = (dir: any) => {
    setAuditLog((prev) => [
      {
        id: dir.id,
        time: `${currentHour.toString().padStart(2, "0")}:00`,
        text: `Custom Advisory Approved for ${dir.corridor_name}: +${dir.extra_buses} buses, ${dir.headway}m headway. (-${dir.queue_relief_pct}% queue relief)`,
      },
      ...prev,
    ]);
  };

  const openSimulatorForCorridor = (corridorId: string) => {
    setSimulatorCorridorId(corridorId);
    setSimulatorOpen(true);
  };

  // 1. Landing Page Portal
  if (currentPortal === "landing") {
    return (
      <LandingPage
        onSelectPortal={setCurrentPortal}
        weather={weather}
      />
    );
  }

  // 2. Bus Stop Display (Airport-Style FIDS / PID)
  if (currentPortal === "display") {
    return (
      <BusStopDisplay
        stops={stops}
        weather={weather}
        onExit={() => setCurrentPortal("landing")}
      />
    );
  }

  // 3. Public Passenger Portal
  if (currentPortal === "passenger") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-emerald-500 selection:text-slate-950">
        {/* Passenger Header */}
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                onClick={() => setCurrentPortal("landing")}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-950 cursor-pointer"
                title="Return to Main Landing Page"
              >
                <Bus className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white">
                    Transit<span className="text-emerald-400">Pulse</span> Commuter
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Public Portal
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Live bus schedules, crowd forecasts & multimodal rail connections
                </p>
              </div>
            </div>

            {/* Switch to Other Portals */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPortal("display")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700 transition flex items-center gap-1.5"
              >
                <Tv className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Bus Stop Display</span>
              </button>
              <button
                onClick={() => setCurrentPortal("control_room")}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 transition flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Control Room</span>
              </button>
              <button
                onClick={() => setCurrentPortal("landing")}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="Return to Landing Page"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          <PassengerPortal
            stops={stops}
            routesGeoJSON={routesGeoJSON}
            corridors={corridors}
            weather={weather}
            currentHour={currentHour}
            onOpenControlRoom={() => setCurrentPortal("control_room")}
            onOpenPID={() => setCurrentPortal("display")}
          />
        </main>
      </div>
    );
  }

  // 4. Operations Control Room (Preserving all existing features & dark palette)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation with Portal Switcher & Weather Controls */}
      <Navbar
        currentHour={currentHour}
        setCurrentHour={setCurrentHour}
        dayType={dayType}
        setDayType={setDayType}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        weather={weather}
        onWeatherChange={handleWeatherChange}
        onNavigatePortal={setCurrentPortal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* KPI Banner */}
        <KPICards
          currentDemand={currentDemand}
          corridors={corridors}
          actions={actions}
          dayType={dayType}
          weather={weather}
        />

        {/* Gauge KPIs – Overview tab only */}
        {activeTab === "overview" && (
          <GaugeKPIs
            currentDemand={currentDemand}
            corridors={corridors}
            dayType={dayType}
            weather={weather}
          />
        )}

        {/* Tab 1: Overview (Control Room Main View) */}
        {activeTab === "overview" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Split: Interactive Map + Action Directives */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
              {/* Map Canvas (8 cols on desktop) */}
              <div className="xl:col-span-8 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Chennai Multimodal Network Visualizer
                  </h2>
                  <button
                    onClick={() => setActiveTab("map")}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    Expand Map View <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <MapLibreView
                  stops={stops}
                  routesGeoJSON={routesGeoJSON}
                  metroStations={metroStations}
                  suburbanStations={suburbanStations}
                  activeWeather={weather}
                  onWeatherChange={setWeather}
                  onSelectRoute={(rt) => {
                    const matched = corridors.find((c) =>
                      c.primary_routes.includes(rt)
                    );
                    if (matched) setSimulatorCorridorId(matched.id);
                  }}
                />
              </div>

              {/* Action Directives & Audit Trail (4 cols on desktop) */}
              <div className="xl:col-span-4 space-y-3">
                <OperationalActions
                  actions={actions}
                  onDeployAction={handleDeployAction}
                  onOpenSimulatorForAction={openSimulatorForCorridor}
                />

                {/* Live Operations Audit Log */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    CUMTA Dispatch Advisory Log
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {auditLog.map((log) => (
                      <div
                        key={log.id}
                        className="text-xs bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 flex items-start gap-2"
                      >
                        <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">
                          {log.time}
                        </span>
                        <p className="text-slate-300 leading-snug flex-1">
                          {log.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Charts & Analytical Distributions */}
            <DemandCharts
              hourly={hourlyDemand}
              currentHour={currentHour}
              systemStats={systemStats || undefined}
              dayType={dayType}
            />

            {/* Corridor Snapshot */}
            <CorridorAnalytics
              corridors={corridors}
              onOpenSimulator={openSimulatorForCorridor}
            />
          </div>
        )}

        {/* Tab 2: Geospatial Map View */}
        {activeTab === "map" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Full-Screen Chennai Metropolitan Geospatial Transport Network
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  2,717 Geocoded Stops (GCC, Tambaram, Avadi) • 1,348 MTC Bus Routes • 33 Metro Stations • 70 Suburban Stations
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openSimulatorForCorridor("corridor_omr")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Test Corridor Intervention
                </button>
              </div>
            </div>

            <MapLibreView
              stops={stops}
              routesGeoJSON={routesGeoJSON}
              metroStations={metroStations}
              suburbanStations={suburbanStations}
              activeWeather={weather}
              onWeatherChange={setWeather}
            />
          </div>
        )}

        {/* Tab: Bus Occupancy & Crowds */}
        {activeTab === "occupancy" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <OccupancyTracker />
          </div>
        )}

        {/* Tab: Transport Communication Portal */}
        {activeTab === "communication" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <CommunicationPortal />
          </div>
        )}

        {/* Tab: Multimodal Transport Integration */}
        {activeTab === "multimodal" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <MultimodalPlanner />
          </div>
        )}

        {/* Tab: Unified Ticketing & Fare Calculation */}
        {activeTab === "ticketing" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <UnifiedTicketing />
          </div>
        )}

        {/* Tab: AI Demand Prediction Engine */}
        {activeTab === "ai_prediction" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <AIPredictionModule />
          </div>
        )}

        {/* Tab: Passenger Feedback System */}
        {activeTab === "feedback" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <PassengerFeedback mode="control_room" />
          </div>
        )}

        {/* Tab 3: Corridors & Capacity Analysis */}
        {activeTab === "corridors" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <CorridorAnalytics
              corridors={corridors}
              onOpenSimulator={openSimulatorForCorridor}
            />
          </div>
        )}


        {/* Tab 4: Simulator & Policy Sandbox */}
        {activeTab === "simulator" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  CUMTA Policy & Fleet Dispatch Sandbox
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Simulate operational interventions, adjust peak vehicle allocations, and coordinate multimodal transfers between MTC, Chennai Metro, and Suburban Rail.
                </p>
              </div>
              <button
                onClick={() => setSimulatorOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                <Zap className="w-4 h-4 fill-current" />
                Launch Interactive Simulator
              </button>
            </div>

            <OperationalActions
              actions={actions}
              onDeployAction={handleDeployAction}
              onOpenSimulatorForAction={openSimulatorForCorridor}
            />

            {/* Audit Trail */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-3">
                Session Dispatch History & Operational Directives
              </h3>
              <div className="space-y-2">
                {auditLog.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-bold">
                        {log.time}
                      </span>
                      <span className="text-slate-200">{log.text}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      CUMTA-ADVISORY
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data & Methodology Disclaimer Note */}
        <footer className="mt-8 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              <strong>Methodology Notice:</strong> Boarding indicators represent ETM transaction tap-ins and predicted corridor pressure. They are not physical onboard occupancy sensors.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Organiser: CUMTA</span>
            <span>MTC Chennai</span>
            <span>Theme 4: Public Transport</span>
          </div>
        </footer>
      </main>

      {/* Action Simulator Modal */}
      {simulatorOpen && (
        <ActionSimulatorModal
          corridors={corridors}
          initialCorridorId={simulatorCorridorId}
          onClose={() => setSimulatorOpen(false)}
          onCommitDirective={handleCommitDirective}
        />
      )}

      {/* Floating TransitPulse AI Assistant */}
      <TransitChatbot />
    </div>
  );
}

