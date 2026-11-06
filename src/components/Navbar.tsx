import React, { useState, useRef, useEffect } from "react";
import {
  Bus,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Activity,
  Sparkles,
  Users,
  Tv,
  Home,
  CloudRain,
  Sun,
  Flame,
  Info,
  Radio,
  X,
  Lock,
  LogOut
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
  onSignOut?: () => void;
  operatorName?: string;
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
  onSignOut,
  operatorName,
}) => {
  const [weatherPopoverOpen, setWeatherPopoverOpen] = useState(false);
  const weatherContainerRef = useRef<HTMLDivElement>(null);

  // Close weather popover on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        weatherContainerRef.current &&
        !weatherContainerRef.current.contains(e.target as Node)
      ) {
        setWeatherPopoverOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setWeatherPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-lg">
      {/* Top Banner */}
      <div className="w-full max-w-[1680px] mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        {/* Brand & CUMTA Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => onNavigatePortal("landing")}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-950 cursor-pointer shrink-0"
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
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                Control Room
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-Powered Transit Operations • MTC Chennai & CUMTA
            </p>
          </div>
        </div>

        {/* Portal Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => onNavigatePortal("landing")}
            className="px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 shrink-0"
            title="Landing Page"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => onNavigatePortal("passenger")}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-slate-800 transition flex items-center gap-1.5 font-medium shrink-0"
            title="Switch to Public Passenger Portal"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Passenger Portal</span>
          </button>
          <button
            onClick={() => onNavigatePortal("display")}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition flex items-center gap-1.5 font-medium shrink-0"
            title="Switch to Bus Stop Passenger Info Board"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span>Stop Display</span>
          </button>
        </div>

        {/* Lock Console / Sign Out Button */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-rose-950/50 text-rose-300 hover:text-rose-200 border border-rose-900/40 transition flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer shadow-inner"
            title="Sign Out & Lock Control Room Console"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden xl:inline">{operatorName || "Sign Out"}</span>
            <span className="xl:hidden">Sign Out</span>
          </button>
        )}

        {/* Compact Hoverable & Clickable Chennai Weather Info Popover Icon */}
        <div
          ref={weatherContainerRef}
          className="relative shrink-0"
          onMouseEnter={() => setWeatherPopoverOpen(true)}
          onMouseLeave={() => setWeatherPopoverOpen(false)}
        >
          <button
            type="button"
            onClick={() => setWeatherPopoverOpen((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-xs flex items-center gap-1.5 transition cursor-pointer shadow-inner"
            title="Click or hover to inspect Chennai Weather & Transit Demand Impact"
            aria-label="Chennai Weather Information"
          >
            {weather.condition === "rain" ? (
              <CloudRain className="w-4 h-4 text-sky-400" />
            ) : weather.condition === "heat" ? (
              <Flame className="w-4 h-4 text-orange-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-mono font-bold text-white text-xs">{weather.temp}°C</span>
            <span className="font-mono text-[10px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-800">
              {weather.demand_multiplier}x
            </span>
            <Info className="w-3 h-3 text-slate-400" />
          </button>

          {/* Interactive Popover Tooltip */}
          {weatherPopoverOpen && (
            <div className="absolute top-full mt-2 right-0 sm:left-1/2 sm:-translate-x-1/2 z-50 w-76 sm:w-80 bg-slate-900/98 border border-slate-700/90 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  {weather.condition === "rain" ? (
                    <CloudRain className="w-4 h-4 text-sky-400" />
                  ) : weather.condition === "heat" ? (
                    <Flame className="w-4 h-4 text-orange-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                  <span className="font-bold text-white">Chennai Weather Telemetry</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  {weather.temp}°C
                </span>
              </div>

              {/* Data metrics */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Condition:</span>
                  <span className="font-semibold text-white capitalize">
                    {weather.condition === "rain"
                      ? "Monsoon Rain"
                      : weather.condition === "heat"
                      ? "Heatwave"
                      : "Fair Weather"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Demand Multiplier:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {weather.demand_multiplier}x baseline
                  </span>
                </div>
              </div>

              {/* Operational impact explanation */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Transit Operational Impact:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  {weather.condition === "rain"
                    ? "Heavy monsoon rain causes +26% boarding surge as commuters shift from 2-wheelers to MTC buses. Metro feeder shuttles and standby fleet on alert."
                    : weather.condition === "heat"
                    ? "Intense heatwave causes +14% surge. Strong commuter preference for Deluxe AC buses (570, 70V). Depot hydration and air-conditioning units monitored."
                    : "Normal transit operating conditions. Standard MTC headways and scheduled timetables maintained across all corridors."}
                </p>
              </div>

              {/* Weather Scenario Simulation Selector */}
              <div className="space-y-1.5 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Simulate Operational Weather Scenario:
                </span>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => onWeatherChange("clear")}
                    className={`py-1 px-1.5 rounded-lg font-bold border transition ${
                      weather.condition === "clear"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    Fair (1.0x)
                  </button>
                  <button
                    type="button"
                    onClick={() => onWeatherChange("rain")}
                    className={`py-1 px-1.5 rounded-lg font-bold border transition ${
                      weather.condition === "rain"
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    Rain (+26%)
                  </button>
                  <button
                    type="button"
                    onClick={() => onWeatherChange("heat")}
                    className={`py-1 px-1.5 rounded-lg font-bold border transition ${
                      weather.condition === "heat"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    Heat (+14%)
                  </button>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 text-center font-mono pt-1">
                Data source: Live Open-Meteo & IMD Chennai API
              </div>
            </div>
          )}
        </div>

        {/* Time Slider & Simulation Controls */}
        <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-inner shrink-0">
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
            className="w-20 sm:w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
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

      {/* Control Room View Sub-Tabs - Multi-row responsive wrapping without Dual Map tab */}
      <div className="w-full max-w-[1680px] mx-auto px-3 sm:px-6 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-medium border-t border-slate-800/80 py-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
            activeTab === "overview"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab("occupancy")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
            activeTab === "occupancy"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          Bus Occupancy & Crowds
        </button>

        <button
          onClick={() => setActiveTab("communication")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
            activeTab === "communication"
              ? "bg-slate-800 text-cyan-400 border border-slate-700 shadow font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          Transport Comms & Dispatch
        </button>

        <button
          onClick={() => setActiveTab("multimodal")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
            activeTab === "multimodal"
              ? "bg-slate-800 text-teal-400 border border-slate-700 shadow font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Bus className="w-3.5 h-3.5 text-teal-400" />
          Multimodal Integration
        </button>

        <button
          onClick={() => setActiveTab("ticketing")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
            activeTab === "ticketing"
              ? "bg-slate-800 text-amber-400 border border-slate-700 shadow font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Unified Ticketing
        </button>

        <button
          onClick={() => setActiveTab("ai_prediction")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
            activeTab === "ai_prediction"
              ? "bg-slate-800 text-purple-400 border border-slate-700 shadow font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          AI Prediction Engine
        </button>

        <button
          onClick={() => setActiveTab("feedback")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
            activeTab === "feedback"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          Passenger Feedback Desk
        </button>

        <button
          onClick={() => setActiveTab("corridors")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
            activeTab === "corridors"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Corridors & Bottlenecks
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
            activeTab === "simulator"
              ? "bg-slate-800 text-amber-400 border border-slate-700 shadow font-semibold"
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
