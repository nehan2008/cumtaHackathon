import React from "react";
import {
  Bus,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Activity,
  Layers,
  Sparkles,
  Users,
  Tv,
  Home,
  CloudRain,
  Sun,
  Flame
} from "lucide-react";
import type { ChennaiWeather, WeatherCondition } from "../services/weather";

interface NavbarProps {
  currentHour: number;
  setCurrentHour: (h: number) => void;
  dayType: "weekday" | "weekend";
  setDayType: (d: "weekday" | "weekend") => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  weather: ChennaiWeather;
  onWeatherChange: (cond: WeatherCondition) => void;
  onNavigatePortal: (portal: "landing" | "passenger" | "display" | "control_room") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentHour,
  setCurrentHour,
  dayType,
  setDayType,
  isPlaying,
  setIsPlaying,
  activeTab,
  setActiveTab,
  weather,
  onWeatherChange,
  onNavigatePortal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-lg">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & CUMTA Badge */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigatePortal("landing")}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-950 cursor-pointer"
            title="Return to Main Landing Page"
          >
            <Bus className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigatePortal("landing")}
                className="text-lg font-bold tracking-tight text-white flex items-center gap-1 hover:text-emerald-400 transition"
              >
                Transit<span className="text-emerald-400">Pulse</span>
              </button>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Control Room
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-Powered Transit Operations • MTC Chennai & CUMTA
            </p>
          </div>
        </div>

        {/* Portal Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => onNavigatePortal("landing")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1"
            title="Landing Page"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Home</span>
          </button>
          <button
            onClick={() => onNavigatePortal("passenger")}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
            title="Switch to Public Passenger Portal"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Passenger Portal</span>
          </button>
          <button
            onClick={() => onNavigatePortal("display")}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
            title="Switch to Bus Stop Passenger Info Board"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span>Stop Display</span>
          </button>
        </div>

        {/* Weather Toggle Mini-Widget */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <div className="flex items-center gap-1.5">
            {weather.condition === "rain" ? (
              <CloudRain className="w-4 h-4 text-sky-400" />
            ) : weather.condition === "heat" ? (
              <Flame className="w-4 h-4 text-orange-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-mono font-bold text-white">{weather.temp}°C</span>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => onWeatherChange("clear")}
              title="Fair weather (1.0x baseline demand)"
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                weather.condition === "clear"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Fair
            </button>
            <button
              onClick={() => onWeatherChange("rain")}
              title="Heavy Rain (+26% boarding surge)"
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                weather.condition === "rain"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Rain
            </button>
            <button
              onClick={() => onWeatherChange("heat")}
              title="Heatwave (+14% surge / AC preference)"
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                weather.condition === "heat"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Heat
            </button>
          </div>
        </div>

        {/* Time Slider & Simulation Controls */}
        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-inner">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Hour:</span>
            <span className="text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {currentHour.toString().padStart(2, "0")}:00
            </span>
          </div>

          <input
            type="range"
            min={5}
            max={23}
            value={currentHour}
            onChange={(e) => setCurrentHour(Number(e.target.value))}
            className="w-24 sm:w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause Timeline" : "Auto-advance 24h cycle"}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setCurrentHour(8)}
            title="Reset to Morning Peak (08:00)"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Day Type Toggle */}
          <div className="hidden sm:flex border-l border-slate-800 pl-2 gap-1">
            <button
              onClick={() => setDayType("weekday")}
              className={`px-2 py-0.5 text-xs rounded transition font-medium ${
                dayType === "weekday"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Weekday
            </button>
            <button
              onClick={() => setDayType("weekend")}
              className={`px-2 py-0.5 text-xs rounded transition font-medium ${
                dayType === "weekend"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Weekend
            </button>
          </div>
        </div>
      </div>

      {/* Control Room View Sub-Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto text-xs font-medium border-t border-slate-800/80 py-1.5 scrollbar-none">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab("map")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "map"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Dual Map (Google/MapLibre)
        </button>

        <button
          onClick={() => setActiveTab("occupancy")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "occupancy"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          Bus Occupancy & Crowds
        </button>

        <button
          onClick={() => setActiveTab("communication")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "communication"
              ? "bg-slate-800 text-cyan-400 border border-slate-700 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Transport Comms Portal
        </button>

        <button
          onClick={() => setActiveTab("multimodal")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "multimodal"
              ? "bg-slate-800 text-teal-400 border border-slate-700 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Bus className="w-3.5 h-3.5 text-teal-400" />
          Multimodal Integration
        </button>

        <button
          onClick={() => setActiveTab("ticketing")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "ticketing"
              ? "bg-slate-800 text-amber-400 border border-slate-700 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Unified Ticketing
        </button>

        <button
          onClick={() => setActiveTab("ai_prediction")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "ai_prediction"
              ? "bg-slate-800 text-purple-400 border border-slate-700 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          AI Prediction Engine
        </button>

        <button
          onClick={() => setActiveTab("feedback")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "feedback"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          Passenger Feedback Desk
        </button>

        <button
          onClick={() => setActiveTab("corridors")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "corridors"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Corridors & Bottlenecks
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === "simulator"
              ? "bg-slate-800 text-amber-400 border border-slate-700 shadow"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          CUMTA Sandbox
        </button>
      </div>
    </header>
  );
};
