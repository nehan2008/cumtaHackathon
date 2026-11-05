import React from "react";
import {
  Bus,
  Users,
  Tv,
  Activity,
  ArrowRight,
  ShieldCheck,
  CloudRain,
  Sun,
  Flame,
  Train,
  Sparkles,
  MapPin
} from "lucide-react";
import type { ChennaiWeather } from "../../services/weather";
import { TransitChatbot } from "../chatbot/TransitChatbot";


interface LandingPageProps {
  onSelectPortal: (portal: "passenger" | "display" | "control_room") => void;
  weather: ChennaiWeather;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectPortal,
  weather,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950">
              <Bus className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  Transit<span className="text-emerald-400">Pulse</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  CUMTA • MTC
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Unified Metropolitan Public Transport Operations & Passenger Platform
              </p>
            </div>
          </div>

          {/* Current Weather Pill */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            {weather.condition === "rain" ? (
              <CloudRain className="w-4 h-4 text-sky-400" />
            ) : weather.condition === "heat" ? (
              <Flame className="w-4 h-4 text-orange-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-slate-300 font-medium">Chennai:</span>
            <span className="text-emerald-400 font-mono font-bold">
              {weather.temp}°C
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            20-Hour CUMTA Hackathon • Theme 4 Transport Data
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Next-Generation Transit Intelligence for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Chennai
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Powered by 54M historical ETM ticket records, 2,717 geocoded stops, and real-time multimodal synchronization between MTC Bus, Chennai Metro, and Suburban Rail.
          </p>
        </div>

        {/* 3 Entry Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto w-full">
          {/* Option 1: Public Passenger */}
          <div
            onClick={() => onSelectPortal("passenger")}
            className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition duration-300">
                <Users className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  FOR COMMUTERS & RIDERS
                </span>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-emerald-300 transition">
                  Public Passenger Portal
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Search bus routes, view upcoming arrival times, check predicted crowd levels, find less crowded alternatives, and coordinate transfers to Chennai Metro.
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-400 space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Live Crowd Pressure Forecasts
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Vidiyal Payanam Women Free Route Tagging
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Metro & Suburban Rail Connection Guide
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition flex items-center gap-1.5">
                Enter Commuter Portal <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                PUBLIC
              </span>
            </div>
          </div>

          {/* Option 2: Bus Stop Display */}
          <div
            onClick={() => onSelectPortal("display")}
            className="group bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-amber-950/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition duration-300">
                <Tv className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                  AIRPORT-STYLE PASSENGER INFORMATION
                </span>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-amber-300 transition">
                  Bus Stop Digital Display (PID)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Full-screen electronic departure board for bus shelters and major multimodal terminals (Guindy, CMBT, Tambaram, Central).
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-400 space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Large, High-Contrast Typography
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Live ETA Countdowns (1s Refresh)
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Crowd Status & Rail Interchange Bays
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition flex items-center gap-1.5">
                Launch Digital Display <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                TERMINAL
              </span>
            </div>
          </div>

          {/* Option 3: Operations Control Room */}
          <div
            onClick={() => onSelectPortal("control_room")}
            className="group bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-cyan-950/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition duration-300">
                <Activity className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  FOR CUMTA & MTC OPERATORS
                </span>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-cyan-300 transition">
                  Operations Control Room
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Tactical authority dashboard. Analyze 54M ETM demand curves, monitor network pressure, track corridor bottlenecks, and simulate fleet interventions.
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-400 space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Interactive MapLibre Geospatial Network
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Weather Impact Multipliers (Monsoon / Heat)
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Advisory Interventions with Human Approval
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition flex items-center gap-1.5">
                Open Command Room <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                COMMAND
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Summary Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> Verified Data Pipeline
            </span>
            <span>54M ETM Records • 2,717 Stops • 1,348 MTC Routes</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>CUMTA Hackathon Theme 4</span>
            <span>•</span>
            <span>MTC Chennai</span>
            <span>•</span>
            <span>Chennai Metro Rail Limited</span>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant for Commuters */}
      <TransitChatbot />
    </div>
  );
};

