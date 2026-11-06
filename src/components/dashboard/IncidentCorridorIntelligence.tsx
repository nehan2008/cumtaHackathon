import React from "react";
import type { DriverIncidentReport } from "../../types/communication";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Flame,
  Layers,
  MapPin,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Droplets,
  Wrench,
  Construction,
  Car
} from "lucide-react";

interface IncidentCorridorIntelligenceProps {
  incidents: DriverIncidentReport[];
  onViewIncidentEvidence: (inc: DriverIncidentReport) => void;
  onNavigateToPortal: () => void;
  onSelectRoute?: (routeNum: string) => void;
}

export const IncidentCorridorIntelligence: React.FC<IncidentCorridorIntelligenceProps> = ({
  incidents,
  onViewIncidentEvidence,
  onNavigateToPortal,
  onSelectRoute,
}) => {
  const unverifiedCount = incidents.filter((i) => i.verificationStatus === "UNVERIFIED").length;
  const confirmedCount = incidents.filter((i) => i.verificationStatus === "CONFIRMED").length;
  const criticalCount = incidents.filter((i) => i.severity === "CRITICAL" || i.severity === "HIGH").length;

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "WATERLOGGING":
        return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      case "ROAD_CONSTRUCTION":
        return <Construction className="w-3.5 h-3.5 text-amber-400" />;
      case "VEHICLE_BREAKDOWN":
        return <Wrench className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Car className="w-3.5 h-3.5 text-orange-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Live Incident & Corridor Intelligence
          </h2>
          <p className="text-[11px] text-slate-400">
            Real-time CV detections, driver telemetry & corridor hazard alerts
          </p>
        </div>
        <button
          onClick={onNavigateToPortal}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
        >
          <span>All Dispatches</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-3 gap-2 mb-3 shrink-0">
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 text-center">
          <div className="text-[10px] text-slate-400 font-medium">Unverified (CV)</div>
          <div className="text-base font-black text-amber-400 font-mono">{unverifiedCount}</div>
        </div>
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 text-center">
          <div className="text-[10px] text-slate-400 font-medium">Confirmed</div>
          <div className="text-base font-black text-emerald-400 font-mono">{confirmedCount}</div>
        </div>
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2 text-center">
          <div className="text-[10px] text-slate-400 font-medium">Critical / High</div>
          <div className="text-base font-black text-rose-400 font-mono">{criticalCount}</div>
        </div>
      </div>

      {/* Scrollable Incidents List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {incidents.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No active incidents reported. All Chennai corridors moving smoothly.
          </div>
        ) : (
          incidents.map((inc) => {
            const isUnverified = inc.verificationStatus === "UNVERIFIED";
            const isConfirmed = inc.verificationStatus === "CONFIRMED";
            const isResolved = inc.verificationStatus === "RESOLVED";

            return (
              <div
                key={inc.id}
                className={`bg-slate-950/80 border rounded-xl p-3 text-xs transition space-y-2 ${
                  isUnverified
                    ? "border-amber-500/40 bg-amber-950/10"
                    : isConfirmed
                    ? "border-emerald-500/40 bg-emerald-950/10"
                    : "border-slate-800"
                }`}
              >
                {/* Top Row: Route, ID & Verification Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectRoute?.(inc.routeNum)}
                      className="font-mono font-bold text-white text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded transition"
                      title="Click to view corridor"
                    >
                      Route {inc.routeNum}
                    </button>
                    <span className="font-mono text-slate-500 text-[10px]">{inc.id}</span>
                  </div>

                  <span
                    className={`font-semibold text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      isUnverified
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                        : isConfirmed
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {isUnverified ? (
                      <>
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        AI OBSERVATION
                      </>
                    ) : isConfirmed ? (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        CONFIRMED
                      </>
                    ) : (
                      "RESOLVED"
                    )}
                  </span>
                </div>

                {/* Location & Category */}
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded bg-slate-800 text-slate-300 shrink-0 mt-0.5">
                    {getCategoryIcon(inc.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-[11px] truncate">
                      {inc.location}
                    </div>
                    <p className="text-slate-300 text-[10px] leading-snug line-clamp-2 mt-0.5">
                      {inc.description}
                    </p>
                  </div>
                </div>

                {/* CV Tag & Delay Metrics */}
                {inc.cvAnalysis && (
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="font-semibold text-cyan-300">
                        {inc.cvAnalysis.categoryLabel}
                      </span>
                      <span className="text-slate-500 font-mono">({inc.cvAnalysis.confidence}% conf)</span>
                    </div>

                    <div className="font-mono text-amber-400 font-bold">
                      {inc.cvAnalysis.potentialDelayImpact}
                    </div>
                  </div>
                )}

                {/* Bottom Row: Evidence thumbnail & Action button */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                  <span className="text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    {inc.timestamp}
                  </span>

                  {inc.evidenceUrl && (
                    <button
                      onClick={() => onViewIncidentEvidence(inc)}
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 bg-cyan-950/40 hover:bg-cyan-900/40 px-2 py-0.5 rounded border border-cyan-500/30 transition"
                    >
                      <Eye className="w-2.5 h-2.5" />
                      <span>Inspect Evidence</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
