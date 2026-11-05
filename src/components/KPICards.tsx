import React from "react";
import { Users, AlertTriangle, Gauge, HeartHandshake, Zap, CloudRain, Flame } from "lucide-react";
import type { HourlyDemand, Corridor, OperationalAction } from "../types/api";
import type { ChennaiWeather } from "../services/weather";

interface KPICardsProps {
  currentDemand?: HourlyDemand;
  corridors: Corridor[];
  actions: OperationalAction[];
  dayType: "weekday" | "weekend";
  weather?: ChennaiWeather;
}

export const KPICards: React.FC<KPICardsProps> = ({
  currentDemand,
  corridors,
  actions,
  dayType,
  weather,
}) => {
  const weatherMult = weather?.demand_multiplier ?? 1.0;

  const rawBoardings =
    dayType === "weekday"
      ? currentDemand?.weekday_boardings ?? 180000
      : currentDemand?.weekend_boardings ?? 135000;

  const boardings = Math.round(rawBoardings * weatherMult);
  const capacity = currentDemand?.city_capacity ?? 200000;
  const pressure = Math.round((boardings / capacity) * 100);

  const criticalCorridors = corridors.filter((c) => {
    const adjustedFactor = c.overcrowding_factor * weatherMult;
    return adjustedFactor >= 1.25 || c.risk_level === "critical" || c.risk_level === "high";
  }).length;

  const pendingActions = actions.filter((a) => a.status === "recommended").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Boarding Volume */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">Boarding Rate (Hourly)</span>
          <Users className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-2">
            <span>{boardings.toLocaleString()}</span>
            {weatherMult > 1.0 && (
              <span className="text-[10px] font-mono text-sky-400 font-bold bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/50">
                +{Math.round((weatherMult - 1) * 100)}%
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">
              ETM Historical Tap-Ins
            </span>
            <span>• {currentDemand?.label ?? "08:00"}</span>
          </p>
        </div>
      </div>

      {/* 2. Network Pressure Index */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">Network Pressure</span>
          <Gauge className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black ${
                pressure > 95
                  ? "text-rose-400"
                  : pressure > 80
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {pressure}%
            </span>
            <span className="text-xs text-slate-400">of bus fleet cap</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pressure > 95
                  ? "bg-rose-500"
                  : pressure > 80
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, pressure)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. High Risk Corridors */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">Surge Corridors</span>
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-rose-400 tracking-tight">
            {criticalCorridors}{" "}
            <span className="text-xs font-normal text-slate-400">
              / {corridors.length} key trunks
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {weather?.condition === "rain"
              ? "Monsoon waterlogging on GST & OMR"
              : "Peak surge on OMR (570) & GST (21G)"}
          </p>
        </div>
      </div>

      {/* 4. Vidiyal Payanam Free Women Pass */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">Vidiyal Payanam Share</span>
          <HeartHandshake className="w-4 h-4 text-pink-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-pink-400 tracking-tight">
            45.1%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Zero-fare women passengers in ordinary MTC
          </p>
        </div>
      </div>

      {/* 5. Advisory Interventions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium">CUMTA Directives</span>
          <Zap className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-cyan-400 tracking-tight">
            {pendingActions}{" "}
            <span className="text-xs font-normal text-slate-400">Actionable</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Human approval required before dispatch
          </p>
        </div>
      </div>
    </div>
  );
};
