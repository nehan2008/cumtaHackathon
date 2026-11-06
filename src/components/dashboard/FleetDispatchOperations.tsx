import React from "react";
import type { DriverIncidentReport } from "../../types/communication";
import {
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Zap,
  Building2,
  Check,
  X,
  Compass
} from "lucide-react";

interface FleetDispatchOperationsProps {
  incidents: DriverIncidentReport[];
  onApproveShuttle: (incidentId: string) => void;
  onRejectShuttle: (incidentId: string) => void;
  onNavigateToPortal: () => void;
}

export const FleetDispatchOperations: React.FC<FleetDispatchOperationsProps> = ({
  incidents,
  onApproveShuttle,
  onRejectShuttle,
  onNavigateToPortal,
}) => {
  const pendingShuttles = incidents.filter((i) => i.dispatchStatus === "SHUTTLE_RECOMMENDED");
  const approvedCount = incidents.filter((i) => i.dispatchStatus === "SHUTTLE_APPROVED").length;
  const rejectedCount = incidents.filter((i) => i.dispatchStatus === "SHUTTLE_REJECTED").length;

  // Real Chennai MTC Depots & Standby Fleet Status
  const standbyDepots = [
    { name: "Guindy Central Depot", available: 4, corridor: "GST Trunk / Kathipara", eta: "8 min" },
    { name: "Adyar / Thiruvanmiyur", available: 3, corridor: "OMR IT Express", eta: "12 min" },
    { name: "Koyambedu CMBT Depot", available: 5, corridor: "Inner Ring Road", eta: "10 min" },
    { name: "T. Nagar / Broadway", available: 2, corridor: "Anna Salai Arterial", eta: "15 min" },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            Fleet & Dispatch Operations
          </h2>
          <p className="text-[11px] text-slate-400">
            Standby fleet inventory, relief dispatches & official human sign-offs
          </p>
        </div>
        <button
          onClick={onNavigateToPortal}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
        >
          <span>Control Desk</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Standby Depot Quick Status */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-3 shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            Standby Rescue Fleet Depots
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">14 Buses Ready</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {standbyDepots.map((depot) => (
            <div
              key={depot.name}
              className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium truncate" title={depot.name}>
                  {depot.name}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                  {depot.available}
                </span>
              </div>
              <div className="text-slate-500 flex items-center justify-between mt-1 text-[9px]">
                <span>ETA: {depot.eta}</span>
                <span className="truncate max-w-[70px]">{depot.corridor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action / Dispatch Counter Pills */}
      <div className="grid grid-cols-2 gap-2 mb-3 shrink-0 text-xs">
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Approved Dispatches</div>
            <div className="text-base font-black text-emerald-400 font-mono">{approvedCount} Deployed</div>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-400 opacity-80" />
        </div>

        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Pending Sign-Off</div>
            <div className="text-base font-black text-amber-300 font-mono">
              {pendingShuttles.length} Actionable
            </div>
          </div>
          <Clock className="w-5 h-5 text-amber-400 opacity-80" />
        </div>
      </div>

      {/* Pending Human Approval List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          Pending Human Official Directives
        </div>

        {pendingShuttles.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/60 p-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5 opacity-60" />
            <div className="font-semibold text-slate-400">All Directives Addressed</div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              No outstanding shuttle requests awaiting official human sign-off.
            </p>
          </div>
        ) : (
          pendingShuttles.map((inc) => (
            <div
              key={inc.id}
              className="bg-slate-950/90 border border-amber-500/50 rounded-xl p-3 text-xs space-y-2 shadow-lg shadow-amber-950/10"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-amber-300">
                  Route {inc.routeNum} • {inc.busId}
                </span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                  Official Sign-off Required
                </span>
              </div>

              <p className="text-slate-300 text-[11px] leading-snug">
                {inc.shuttleRecommendation?.reason || inc.description}
              </p>

              <div className="bg-amber-950/30 border border-amber-500/30 rounded-lg p-2 text-[10px] flex items-center justify-between text-amber-200">
                <span>
                  Deploy: <strong>{inc.shuttleRecommendation?.numShuttles || 1} Rescue Shuttle</strong>
                </span>
                <span className="text-slate-400 text-[9px]">
                  from {inc.shuttleRecommendation?.suggestedDepot || "Guindy Depot"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onApproveShuttle(inc.id)}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 transition shadow-sm"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Sign & Authorize
                </button>

                <button
                  onClick={() => onRejectShuttle(inc.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 font-semibold text-[11px] border border-slate-700 transition"
                >
                  <X className="w-3.5 h-3.5" />
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
