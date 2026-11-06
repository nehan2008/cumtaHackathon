import React from "react";
import {
  Zap,
  Clock,
  Bus,
  CheckCircle2,
  AlertCircle,
  Train,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  FileCheck
} from "lucide-react";
import type { OperationalAction } from "../types/api";

interface OperationalActionsProps {
  actions: OperationalAction[];
  onDeployAction: (actionId: string) => void;
  onOpenSimulatorForAction: (corridorId: string) => void;
}

export const OperationalActions: React.FC<OperationalActionsProps> = ({
  actions,
  onDeployAction,
  onOpenSimulatorForAction,
}) => {
  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            Demand-Responsive Fleet Directives
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Recommends additional buses & service gap coverage when demand exceeds capacity. All directives require human operator approval.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-slate-800 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Human Approval Gate Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {actions.map((act) => {
          const isCritical = act.priority === "critical";
          const isDeployed = act.status === "deployed";

          return (
            <div
              key={act.id}
              className={`bg-slate-900/90 border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition ${
                isDeployed
                  ? "border-emerald-500/50 bg-emerald-950/10"
                  : isCritical
                  ? "border-rose-500/30"
                  : "border-slate-800"
              }`}
            >
              <div>
                {/* Header Tag & Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        act.priority === "critical"
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                          : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      }`}
                    >
                      {act.priority}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {act.time_window}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {act.id}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white mt-2 leading-snug">
                  {act.title}
                </h3>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                  {act.corridor_name}
                </p>

                {/* Trigger & Details */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 font-medium">Trigger Assessment:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">
                      {act.trigger_reason}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-400">Headway Impact:</span>
                      <p className="font-semibold text-emerald-300 text-[11px]">
                        {act.headway_improvement}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Relief Forecast:</span>
                      <p className="font-semibold text-amber-300 text-[11px]">
                        {act.estimated_congestion_relief}
                      </p>
                    </div>
                  </div>

                  {/* Limited stop coverage confirmation */}
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-900/40">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    <span>Parallel Local Service Coverage Confirmed (No Stranded Commuters)</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-cyan-300 bg-cyan-950/30 p-2 rounded-lg border border-cyan-800/40">
                    <Train className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" />
                    <span>{act.metro_sync}</span>
                  </div>
                </div>
              </div>

              {/* Actions & Approval Gate */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => onOpenSimulatorForAction(act.corridor_id)}
                  className="text-xs text-slate-400 hover:text-white underline-offset-4 hover:underline flex items-center gap-1"
                >
                  Adjust Parameters
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => onDeployAction(act.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                    isDeployed
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50"
                  }`}
                >
                  {isDeployed ? (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      Approved & Dispatched
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Approve & Dispatch Fleet
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
