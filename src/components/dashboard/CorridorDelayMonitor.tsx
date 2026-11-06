import React from "react";
import type { DriverIncidentReport } from "../../types/communication";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldAlert,
  Flame,
  Activity
} from "lucide-react";

interface CorridorDelayMonitorProps {
  incidents: DriverIncidentReport[];
  onSelectCorridor?: (corridorId: string) => void;
}

interface CorridorStatusItem {
  id: string;
  name: string;
  code: string;
  primaryRoutes: string[];
  baseTravelTime: number; // minutes
  delayMin: number; // added delay
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "NORMAL";
  activeIncidentCount: number;
  statusLabel: string;
  bottleneckLocation: string;
  actionTaken: string;
}

export const CorridorDelayMonitor: React.FC<CorridorDelayMonitorProps> = ({
  incidents,
  onSelectCorridor,
}) => {
  // Aggregate real delay data across Chennai's 5 key corridors
  const corridorsData: CorridorStatusItem[] = [
    {
      id: "corridor_gst",
      name: "Grand Southern Trunk (GST Road)",
      code: "GST",
      primaryRoutes: ["21G", "500", "91", "E18"],
      baseTravelTime: 42,
      delayMin: incidents.some((i) => i.corridorId === "corridor_gst" && i.severity === "CRITICAL")
        ? 24
        : 8,
      severity: incidents.some((i) => i.corridorId === "corridor_gst" && i.severity === "CRITICAL")
        ? "CRITICAL"
        : "MEDIUM",
      activeIncidentCount: incidents.filter((i) => i.corridorId === "corridor_gst" && i.verificationStatus !== "RESOLVED").length,
      statusLabel: "Alandur Ramp Breakdown & Velachery Runoff",
      bottleneckLocation: "Kathipara Grade Separator to Airport",
      actionTaken: "2 standby rescue shuttles requested; GCTP warden clearing ramp",
    },
    {
      id: "corridor_omr",
      name: "Old Mahabalipuram Road (IT Expressway)",
      code: "OMR",
      primaryRoutes: ["570", "19B", "102"],
      baseTravelTime: 38,
      delayMin: 14,
      severity: "HIGH",
      activeIncidentCount: incidents.filter((i) => i.corridorId === "corridor_omr" && i.verificationStatus !== "RESOLVED").length,
      statusLabel: "Morning Tech-Park Commuter Crush Load",
      bottleneckLocation: "SRP Tools Junction & Tidel Park",
      actionTaken: "Passenger diversion active via Kasturibai MRTS & Feeder 19B",
    },
    {
      id: "corridor_irr",
      name: "Inner Ring Road (100 Feet Road)",
      code: "IRR",
      primaryRoutes: ["70V", "114", "66"],
      baseTravelTime: 35,
      delayMin: 12,
      severity: "MEDIUM",
      activeIncidentCount: incidents.filter((i) => i.corridorId === "corridor_irr" && i.verificationStatus !== "RESOLVED").length,
      statusLabel: "Metro Phase-2 Barrier Encroachment",
      bottleneckLocation: "Vadapalani Junction to Ashok Pillar",
      actionTaken: "Signal cycle extended +25s green phase toward CMBT Koyambedu",
    },
    {
      id: "corridor_anna_salai",
      name: "Anna Salai Arterial Trunk",
      code: "AS",
      primaryRoutes: ["A1", "18A", "23C"],
      baseTravelTime: 28,
      delayMin: 5,
      severity: "NORMAL",
      activeIncidentCount: 0,
      statusLabel: "Optimal Headway Flow",
      bottleneckLocation: "Thousand Lights / DMS Underground Metro",
      actionTaken: "Headways running on schedule (every 4-6 mins)",
    },
    {
      id: "corridor_phr",
      name: "Poonamallee High Road (PHR)",
      code: "PHR",
      primaryRoutes: ["101", "153", "54"],
      baseTravelTime: 45,
      delayMin: 7,
      severity: "NORMAL",
      activeIncidentCount: 0,
      statusLabel: "Moderate Dwell Pressure",
      bottleneckLocation: "Kilpauk Medical College / Aminjikarai",
      actionTaken: "Monitored via Chennai Smart City CCTV corridor feed",
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Chennai Corridor Headway & Delay Monitor
            </h2>
            <p className="text-[11px] text-slate-400">
              Live estimated travel time overhead, bottleneck nodes & operational interventions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            Peak Delay: +24m (GST)
          </span>
        </div>
      </div>

      {/* Corridor Delay Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {corridorsData.map((item) => {
          const isCritical = item.severity === "CRITICAL";
          const isHigh = item.severity === "HIGH";
          const isMedium = item.severity === "MEDIUM";

          return (
            <div
              key={item.id}
              onClick={() => onSelectCorridor?.(item.id)}
              className={`bg-slate-950/80 border rounded-xl p-3 flex flex-col justify-between text-xs transition cursor-pointer hover:border-slate-700 ${
                isCritical
                  ? "border-rose-500/50 bg-rose-950/10"
                  : isHigh
                  ? "border-orange-500/40 bg-orange-950/10"
                  : isMedium
                  ? "border-amber-500/40 bg-amber-950/10"
                  : "border-slate-800"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                    {item.code}
                  </span>

                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                      isCritical
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : isHigh
                        ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                        : isMedium
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>

                <div className="font-bold text-white text-xs mt-2 line-clamp-1" title={item.name}>
                  {item.name}
                </div>

                {/* Delay Metric */}
                <div className="flex items-baseline gap-2 mt-2">
                  <div className={`text-xl font-black font-mono ${
                    isCritical ? "text-rose-400" : isHigh ? "text-orange-400" : isMedium ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    +{item.delayMin} min
                  </div>
                  <span className="text-[10px] text-slate-500">
                    base {item.baseTravelTime}m
                  </span>
                </div>

                {/* Status label */}
                <div className="text-[11px] text-slate-300 font-medium mt-1 line-clamp-1" title={item.statusLabel}>
                  {item.statusLabel}
                </div>

                {/* Routes */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.primaryRoutes.map((r) => (
                    <span
                      key={r}
                      className="text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-400"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom detail */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Incidents:</span>
                  <span className="font-bold text-white font-mono">{item.activeIncidentCount} active</span>
                </div>
                <div className="text-[9px] text-slate-500 truncate" title={item.bottleneckLocation}>
                  📍 {item.bottleneckLocation}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
