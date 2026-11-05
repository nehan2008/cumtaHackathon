import React from "react";
import {
  AlertCircle,
  Route,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin
} from "lucide-react";
import type { Corridor } from "../types/api";

interface CorridorAnalyticsProps {
  corridors: Corridor[];
  onOpenSimulator: (corridorId: string) => void;
  onFocusCorridorOnMap?: (corridorId: string) => void;
}

export const CorridorAnalytics: React.FC<CorridorAnalyticsProps> = ({
  corridors,
  onOpenSimulator,
  onFocusCorridorOnMap,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Route className="w-5 h-5 text-emerald-400" />
            Chennai Key Transit Corridors & Capacity Pressure
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Continuous bottleneck detection and crowding index derived from historical ETM volume vs MTC scheduled fleet.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Critical (&gt;1.3x Cap)
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            High Load
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Stable
          </span>
        </div>
      </div>

      {/* Corridor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {corridors.map((c) => {
          const isCritical = c.risk_level === "critical";
          const isHigh = c.risk_level === "high";

          return (
            <div
              key={c.id}
              className={`bg-slate-900/90 border rounded-2xl p-4 flex flex-col justify-between shadow-xl transition-all duration-200 hover:border-slate-600 ${
                isCritical
                  ? "border-rose-500/40 hover:shadow-rose-950/20"
                  : isHigh
                  ? "border-amber-500/30 hover:shadow-amber-950/20"
                  : "border-slate-800"
              }`}
            >
              <div>
                {/* Top Badge & Risk Score */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                        : isHigh
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    }`}
                  >
                    {c.risk_level} risk
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Risk Score</span>
                    <span className="ml-1.5 font-mono font-black text-sm text-white">
                      {c.risk_score}/100
                    </span>
                  </div>
                </div>

                {/* Corridor Name */}
                <h3 className="text-base font-bold text-white mt-2">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="text-slate-300">{c.from_hub}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500 inline" />
                  <span className="text-slate-300">{c.to_hub}</span>
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400">Peak Demand:</span>
                    <p className="font-mono font-bold text-emerald-400 text-sm">
                      {c.peak_hourly_boardings.toLocaleString()} /hr
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Overcrowding:</span>
                    <p
                      className={`font-mono font-bold text-sm ${
                        c.overcrowding_factor > 1.3
                          ? "text-rose-400"
                          : "text-amber-400"
                      }`}
                    >
                      {c.overcrowding_factor}x factor
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Fleet Allocated:</span>
                    <p className="font-mono font-semibold text-slate-200">
                      {c.bus_fleet_allocated} buses
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Women Free Share:</span>
                    <p className="font-mono font-semibold text-pink-400">
                      {c.vidiyal_payanam_share}%
                    </p>
                  </div>
                </div>

                {/* Primary Routes */}
                <div className="mt-3">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Primary MTC Routes:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {c.primary_routes.map((rt) => (
                      <span
                        key={rt}
                        className="text-xs font-mono font-bold bg-slate-800 text-emerald-300 px-2 py-0.5 rounded border border-slate-700"
                      >
                        {rt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottlenecks */}
                <div className="mt-3 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    Key Bottlenecks:
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    {c.key_bottlenecks.join(" • ")}
                  </p>
                </div>

                {/* Parallel Rail Mode */}
                <div className="mt-2 text-[11px] text-slate-400">
                  <span className="text-slate-500">Multimodal parallel:</span>{" "}
                  <span className="text-cyan-400/90">{c.metro_parallel}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenSimulator(c.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Simulate CUMTA Intervention
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
