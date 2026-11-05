import React, { useState } from "react";
import {
  X,
  Zap,
  Bus,
  Gauge,
  Clock,
  TrendingDown,
  Train,
  CheckCircle,
  Sparkles
} from "lucide-react";
import type { Corridor } from "../types/api";

interface ActionSimulatorModalProps {
  corridors: Corridor[];
  initialCorridorId?: string;
  onClose: () => void;
  onCommitDirective: (directive: any) => void;
}

export const ActionSimulatorModal: React.FC<ActionSimulatorModalProps> = ({
  corridors,
  initialCorridorId,
  onClose,
  onCommitDirective,
}) => {
  const [selectedCorridorId, setSelectedCorridorId] = useState(
    initialCorridorId || corridors[0]?.id || "corridor_omr"
  );

  const [interventionType, setInterventionType] = useState<string>("shuttle");
  const [extraBuses, setExtraBuses] = useState<number>(6);
  const [targetHeadway, setTargetHeadway] = useState<number>(6);
  const [syncWithTrain, setSyncWithTrain] = useState<boolean>(true);
  const [committed, setCommitted] = useState<boolean>(false);

  const currentCorridor =
    corridors.find((c) => c.id === selectedCorridorId) || corridors[0];

  // Algorithmic calculation of relief based on extra buses and target headway
  const baseOvercrowding = currentCorridor?.overcrowding_factor ?? 1.35;
  const reliefFactor = Math.min(0.45, (extraBuses * 0.045) + (syncWithTrain ? 0.05 : 0));
  const simulatedOvercrowding = Math.max(0.92, +(baseOvercrowding * (1 - reliefFactor)).toFixed(2));
  const queueReliefPct = Math.round(reliefFactor * 100);
  const waitTimeSavedMin = +(extraBuses * 0.85 + (12 - targetHeadway) * 0.4).toFixed(1);
  const commutersServed = Math.round((currentCorridor?.peak_hourly_boardings ?? 25000) * (extraBuses / 20) * 1.8);

  const handleCommit = () => {
    onCommitDirective({
      id: `SIM-DIR-${Date.now().toString().slice(-4)}`,
      corridor_name: currentCorridor?.name,
      intervention_type: interventionType,
      extra_buses: extraBuses,
      headway: targetHeadway,
      sync_train: syncWithTrain,
      queue_relief_pct: queueReliefPct,
      wait_time_saved: waitTimeSavedMin,
    });
    setCommitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                CUMTA Operational Intervention Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Test headway adjustments & shuttle injections with instant capacity prediction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-4 space-y-4">
          {/* Corridor Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Transit Trunk / Corridor:
            </label>
            <select
              value={selectedCorridorId}
              onChange={(e) => setSelectedCorridorId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {corridors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Routes: {c.primary_routes.join(", ")})
                </option>
              ))}
            </select>
          </div>

          {/* Intervention Type Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Intervention Strategy:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInterventionType("shuttle")}
                className={`p-2.5 rounded-xl border text-left transition ${
                  interventionType === "shuttle"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <p className="text-xs font-bold">Short-Loop Shuttle</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Point-to-point hub feeder
                </p>
              </button>

              <button
                type="button"
                onClick={() => setInterventionType("skip-stop")}
                className={`p-2.5 rounded-xl border text-left transition ${
                  interventionType === "skip-stop"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <p className="text-xs font-bold">Express Skip-Stop</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  High-capacity express
                </p>
              </button>

              <button
                type="button"
                onClick={() => setInterventionType("anti-bunching")}
                className={`p-2.5 rounded-xl border text-left transition ${
                  interventionType === "anti-bunching"
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <p className="text-xs font-bold">Headway Stagger</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Even headway control
                </p>
              </button>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            {/* 1. Standby Buses Allocated */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Standby Buses Injected:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {extraBuses} buses
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                step={2}
                value={extraBuses}
                onChange={(e) => setExtraBuses(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Drawn from nearest MTC depot standby fleet
              </span>
            </div>

            {/* 2. Target Headway */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Target Peak Headway:</span>
                <span className="text-amber-400 font-mono font-bold">
                  {targetHeadway} mins
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={12}
                step={1}
                value={targetHeadway}
                onChange={(e) => setTargetHeadway(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Current baseline: 12-15 minutes
              </span>
            </div>
          </div>

          {/* Multimodal Train Sync Checkbox */}
          <label className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={syncWithTrain}
              onChange={(e) => setSyncWithTrain(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 accent-emerald-500"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Train className="w-3.5 h-3.5 text-cyan-400" />
                Synchronize with Metro / Suburban Train Arrivals
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dispatch feeder buses synchronized to 4-minute Metro train headways at interchange hubs.
              </p>
            </div>
          </label>

          {/* Live Impact Forecast Box */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-inner">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
              <Zap className="w-4 h-4 fill-emerald-400" />
              Simulated Operational Impact:
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">
                  Overcrowding Factor
                </span>
                <div className="text-sm font-black mt-1">
                  <span className="line-through text-rose-400/80 mr-1.5">
                    {baseOvercrowding}x
                  </span>
                  <span className="text-emerald-400">
                    {simulatedOvercrowding}x
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">
                  Queue Relief
                </span>
                <p className="text-lg font-black text-emerald-400 mt-0.5">
                  -{queueReliefPct}%
                </p>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">
                  Wait Time Saved
                </span>
                <p className="text-lg font-black text-amber-400 mt-0.5">
                  -{waitTimeSavedMin}m
                </p>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">
                  Peak Commuters
                </span>
                <p className="text-lg font-black text-cyan-400 mt-0.5">
                  ~{commutersServed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleCommit}
            disabled={committed}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center gap-1.5"
          >
            {committed ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Directive Issued to Control Room!
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                Issue CUMTA Advisory Directive
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
