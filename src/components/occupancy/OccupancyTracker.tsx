import React, { useState } from "react";
import {
  type BusOccupancyRecord,
  type CrowdThresholds,
  DEFAULT_CROWD_THRESHOLDS,
  calculateCrowdLevel,
} from "../../types/occupancy";
import {
  Users,
  Bus,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
} from "lucide-react";

const INITIAL_BUS_FLEET: BusOccupancyRecord[] = [
  {
    busId: "TN-01-AN-2104",
    regNumber: "MTC-2104",
    routeNum: "570",
    corridorName: "OMR IT Expressway",
    currentStop: "Tidel Park",
    nextStop: "SRP Tools",
    maxCapacity: 80,
    currentPassengerCount: 75,
    source: "REPORTED",
    lastUpdated: "1 min ago",
    conductorId: "COND-4091 (R. Kumar)",
    notes: "High morning office peak boarding at Thiruvanmiyur",
  },
  {
    busId: "TN-01-AN-4412",
    regNumber: "MTC-4412",
    routeNum: "21G",
    corridorName: "GST Road / Inner Ring",
    currentStop: "Guindy Estate",
    nextStop: "Alandur Metro",
    maxCapacity: 80,
    currentPassengerCount: 80,
    source: "REPORTED",
    lastUpdated: "3 mins ago",
    conductorId: "COND-1823 (S. Murugan)",
    notes: "Bus running at full capacity, no standing room",
  },
  {
    busId: "TN-01-AN-3108",
    regNumber: "MTC-3108",
    routeNum: "70V",
    corridorName: "Koyambedu CMBT - Tambaram",
    currentStop: "Ashok Pillar",
    nextStop: "Ekkatuthangal",
    maxCapacity: 80,
    currentPassengerCount: 65,
    source: "ESTIMATED",
    lastUpdated: "5 mins ago",
    notes: "ETM corridor velocity estimation model applied",
  },
  {
    busId: "TN-01-AN-5510",
    regNumber: "MTC-5510",
    routeNum: "102",
    corridorName: "Broadway - Kelambakkam",
    currentStop: "Adyar Depot",
    nextStop: "Kandanchavadi",
    maxCapacity: 80,
    currentPassengerCount: 45,
    source: "REPORTED",
    lastUpdated: "2 mins ago",
    conductorId: "COND-6712 (K. Balan)",
    notes: "Moderate seated occupancy, seats available in rear",
  },
  {
    busId: "TN-01-AN-1901",
    regNumber: "MTC-1901",
    routeNum: "19B",
    corridorName: "Saidapet - Kelambakkam",
    currentStop: "Perungudi",
    nextStop: "Thoraipakkam",
    maxCapacity: 80,
    currentPassengerCount: 24,
    source: "SIMULATED",
    lastUpdated: "Just now",
    notes: "Benchmark synthetic sensor feed for CUMTA simulation",
  },
  {
    busId: "TN-01-AN-8820",
    regNumber: "MTC-8820",
    routeNum: "23C",
    corridorName: "Besant Nagar - Ayanavaram",
    currentStop: "LIC Mount Road",
    nextStop: "Government Estate",
    maxCapacity: 80,
    currentPassengerCount: 30,
    source: "REPORTED",
    lastUpdated: "6 mins ago",
    conductorId: "COND-3341 (M. Selvam)",
    notes: "Available passenger capacity",
  },
];

export const OccupancyTracker: React.FC = () => {
  const [buses, setBuses] = useState<BusOccupancyRecord[]>(INITIAL_BUS_FLEET);
  const [thresholds, setThresholds] = useState<CrowdThresholds>(DEFAULT_CROWD_THRESHOLDS);
  const [showConfig, setShowConfig] = useState(false);
  const [filterCorridor, setFilterCorridor] = useState<string>("all");
  const [selectedBusForUpdate, setSelectedBusForUpdate] = useState<BusOccupancyRecord | null>(null);
  const [newCount, setNewCount] = useState<number>(0);
  const [conductorPin, setConductorPin] = useState<string>("");
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const filteredBuses = buses.filter(
    (b) => filterCorridor === "all" || b.corridorName.toLowerCase().includes(filterCorridor.toLowerCase())
  );

  const handleOpenConductorUpdate = (bus: BusOccupancyRecord) => {
    setSelectedBusForUpdate(bus);
    setNewCount(bus.currentPassengerCount);
    setConductorPin("");
    setUpdateSuccess(null);
  };

  const handleSaveCount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusForUpdate) return;

    setBuses((prev) =>
      prev.map((b) =>
        b.busId === selectedBusForUpdate.busId
          ? {
              ...b,
              currentPassengerCount: newCount,
              source: "REPORTED",
              lastUpdated: "Just now (Conductor Verified)",
              conductorId: conductorPin ? `COND-AUTH (${conductorPin})` : b.conductorId || "COND-VERIFIED",
            }
          : b
      )
    );

    setUpdateSuccess(`Updated Bus ${selectedBusForUpdate.regNumber} to ${newCount}/${selectedBusForUpdate.maxCapacity} passengers.`);
    setTimeout(() => {
      setSelectedBusForUpdate(null);
      setUpdateSuccess(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Bus Passenger Occupancy & Crowd Classification
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Configurable passenger threshold monitor for Chennai Metropolitan bus fleet. Displays verified conductor reports, statistical estimation, and simulated streams with strict data transparency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center gap-2 shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{showConfig ? "Hide Threshold Settings" : "Configure Thresholds"}</span>
            </button>
          </div>
        </div>

        {/* Configurable Thresholds Sandbox Drawer */}
        {showConfig && (
          <div className="mt-5 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Crowd Classification Thresholds (Basis: Bus Capacity = 80 Passengers)
              </span>
              <button
                onClick={() => setThresholds(DEFAULT_CROWD_THRESHOLDS)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3 h-3" /> Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
                <span className="font-semibold text-emerald-400 block mb-1">AVAILABLE</span>
                <span className="text-[11px] text-slate-400">0 to</span>
                <input
                  type="number"
                  value={thresholds.availableMax}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, availableMax: Number(e.target.value) })
                  }
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-sky-500/30">
                <span className="font-semibold text-sky-400 block mb-1">MODERATE</span>
                <span className="text-[11px] text-slate-400">{thresholds.availableMax + 1} to</span>
                <input
                  type="number"
                  value={thresholds.moderateMax}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, moderateMax: Number(e.target.value) })
                  }
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30">
                <span className="font-semibold text-amber-400 block mb-1">CROWDED</span>
                <span className="text-[11px] text-slate-400">{thresholds.moderateMax + 1} to</span>
                <input
                  type="number"
                  value={thresholds.crowdedMax}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, crowdedMax: Number(e.target.value) })
                  }
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/30">
                <span className="font-semibold text-rose-400 block mb-1">VERY CROWDED</span>
                <span className="text-[11px] text-slate-400">{thresholds.crowdedMax + 1} to</span>
                <input
                  type="number"
                  value={thresholds.veryCrowdedMax}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, veryCrowdedMax: Number(e.target.value) })
                  }
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-purple-500/30">
                <span className="font-semibold text-purple-400 block mb-1">FULL</span>
                <span className="text-[11px] text-slate-400">At Capacity</span>
                <input
                  type="number"
                  value={thresholds.fullMin}
                  onChange={(e) =>
                    setThresholds({ ...thresholds, fullMin: Number(e.target.value) })
                  }
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Corridor Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold mr-1">Corridor Filter:</span>
        {["all", "OMR", "GST Road", "Koyambedu", "Broadway"].map((c) => (
          <button
            key={c}
            onClick={() => setFilterCorridor(c)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
              filterCorridor === c
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-950"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {c === "all" ? "All Corridors" : c}
          </button>
        ))}
      </div>

      {/* Bus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuses.map((bus) => {
          const crowd = calculateCrowdLevel(bus.currentPassengerCount, thresholds, bus.maxCapacity);

          return (
            <div
              key={bus.busId}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between"
            >
              <div>
                {/* Header: Route, Reg, Status Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-12 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-base">
                      {bus.routeNum}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                        <Bus className="w-3.5 h-3.5 text-emerald-400" />
                        {bus.regNumber}
                      </h3>
                      <p className="text-[11px] text-slate-400">{bus.corridorName}</p>
                    </div>
                  </div>

                  {/* Crowd Classification Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${crowd.bgClass} ${crowd.colorClass} ${crowd.borderClass}`}
                  >
                    <span>{crowd.level}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Occupancy:{" "}
                      <span className="font-bold text-white font-mono">
                        {bus.currentPassengerCount} / {bus.maxCapacity}
                      </span>
                    </span>
                    <span className={`font-mono font-bold ${crowd.colorClass}`}>
                      {crowd.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        crowd.level === "FULL"
                          ? "bg-purple-500"
                          : crowd.level === "VERY CROWDED"
                          ? "bg-rose-500"
                          : crowd.level === "CROWDED"
                          ? "bg-amber-500"
                          : crowd.level === "MODERATE"
                          ? "bg-sky-400"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${crowd.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>
                      Remaining Seats/Room:{" "}
                      <strong className="text-white font-mono">{crowd.remainingCapacity}</strong>
                    </span>
                    <span className="text-slate-500">Max: {bus.maxCapacity} pax</span>
                  </div>
                </div>

                {/* Current & Next Stop */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1 my-3">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Current Stop:</span>
                    <span className="font-medium text-emerald-300">{bus.currentStop}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Next Stop:</span>
                    <span className="font-medium text-slate-200">{bus.nextStop}</span>
                  </div>
                </div>

                {/* Data Source Transparency Tag */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-3 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] ${
                        bus.source === "REPORTED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : bus.source === "ESTIMATED"
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {bus.source === "REPORTED"
                        ? "CONDUCTOR VERIFIED"
                        : bus.source === "ESTIMATED"
                        ? "MODEL ESTIMATE"
                        : "SIMULATED DATA"}
                    </span>
                  </div>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {bus.lastUpdated}
                  </span>
                </div>
              </div>

              {/* Action Button: Authorized Conductor Update */}
              <button
                onClick={() => handleOpenConductorUpdate(bus)}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 hover:text-emerald-300 border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Update Passenger Count (Conductor)
              </button>
            </div>
          );
        })}
      </div>

      {/* Conductor Update Modal */}
      {selectedBusForUpdate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">
                  Conductor Live Passenger Count
                </h3>
              </div>
              <button
                onClick={() => setSelectedBusForUpdate(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Bus Registration:</span>
                <span className="font-bold text-white">{selectedBusForUpdate.regNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MTC Route:</span>
                <span className="font-bold text-emerald-400">{selectedBusForUpdate.routeNum}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bus Capacity Limit:</span>
                <span className="font-bold text-slate-200">{selectedBusForUpdate.maxCapacity} Passengers</span>
              </div>
            </div>

            {updateSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {updateSuccess}
              </div>
            )}

            <form onSubmit={handleSaveCount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Verified Passenger Count Onboard:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNewCount((c) => Math.max(0, c - 5))}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center border border-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max={selectedBusForUpdate.maxCapacity}
                    value={newCount}
                    onChange={(e) => setNewCount(Math.min(selectedBusForUpdate.maxCapacity, Math.max(0, Number(e.target.value))))}
                    className="flex-1 text-center font-mono text-2xl font-bold bg-slate-950 border border-slate-700 rounded-xl py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setNewCount((c) => Math.min(selectedBusForUpdate.maxCapacity, c + 5))}
                    className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center border border-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real-time Preview of Crowd Classification */}
              {(() => {
                const preview = calculateCrowdLevel(newCount, thresholds, selectedBusForUpdate.maxCapacity);
                return (
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${preview.bgClass} ${preview.borderClass}`}>
                    <span className="text-slate-300">
                      Resulting Level: <strong className={preview.colorClass}>{preview.level}</strong>
                    </span>
                    <span className="font-mono text-slate-300">
                      {newCount}/{selectedBusForUpdate.maxCapacity} ({preview.percentage}%)
                    </span>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Conductor Staff ID / Auth PIN:
                </label>
                <input
                  type="text"
                  placeholder="e.g. COND-4091"
                  value={conductorPin}
                  onChange={(e) => setConductorPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBusForUpdate(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-slate-950 shadow-md shadow-emerald-950/50 transition"
                >
                  Confirm Live Count
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Methodology & Data Integrity Disclaimer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>ETM Data Integrity Rule:</strong> Electronic Ticket Machine (ETM) records reflect ticket tap-ins and revenue stages, not real-time physical onboard occupancy. TransitPulse marks verified conductor updates as <em>REPORTED</em>, algorithmic projections as <em>ESTIMATED</em>, and test feeds as <em>SIMULATED</em>.
        </p>
      </div>
    </div>
  );
};
