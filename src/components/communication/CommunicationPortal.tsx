import React, { useState } from "react";
import type {
  DriverIncidentReport,
  DriverIssueCategory,
  IncidentSeverity,
  ShuttleDispatchStatus,
} from "../../types/communication";
import {
  AlertTriangle,
  Bus,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  XCircle,
  Activity,
  MapPin,
  FileText,
  User,
  History,
  Check,
  X,
  Truck,
  Sparkles,
  AlertCircle,
  HelpCircle,
  PhoneCall
} from "lucide-react";

interface CommunicationPortalProps {
  incidents: DriverIncidentReport[];
  onAddIncident: (inc: DriverIncidentReport) => void;
  onApproveShuttle: (incidentId: string, officerName: string, officerBadge: string, notes?: string) => void;
  onRejectShuttle: (incidentId: string, officerName: string, officerBadge: string, reason: string) => void;
}

export const CommunicationPortal: React.FC<CommunicationPortalProps> = ({
  incidents,
  onAddIncident,
  onApproveShuttle,
  onRejectShuttle,
}) => {
  const [activeTab, setActiveTab] = useState<"driver_report" | "control_room">("control_room");

  // Driver Form State
  const [busId, setBusId] = useState("TN-01-AN-4412");
  const [routeNum, setRouteNum] = useState("21G");
  const [location, setLocation] = useState("Alandur Metro Flyover Base");
  const [category, setCategory] = useState<DriverIssueCategory>("VEHICLE_BREAKDOWN");
  const [severity, setSeverity] = useState<IncidentSeverity>("CRITICAL");
  const [description, setDescription] = useState("");
  const [supportingInfo, setSupportingInfo] = useState("");
  const [driverName, setDriverName] = useState("V. Chandran");
  const [driverId, setDriverId] = useState("MTC-DRV-8824");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessId, setSubmitSuccessId] = useState<string | null>(null);

  // Control Room Review Modal State
  const [selectedIncident, setSelectedIncident] = useState<DriverIncidentReport | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [officerName, setOfficerName] = useState("R. Sundaram (Traffic Ops Chief)");
  const [officerBadge, setOfficerBadge] = useState("CUMTA-CTRL-01");
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");

  // Map route to default corridor
  const getCorridorForRoute = (r: string): string => {
    if (r === "570" || r === "19B" || r === "102") return "corridor_omr";
    if (r === "21G" || r === "500" || r === "91" || r === "E18") return "corridor_gst";
    if (r === "70V" || r === "114" || r === "66") return "corridor_irr";
    if (r === "A1" || r === "18A" || r === "23C") return "corridor_anna_salai";
    return "corridor_phr";
  };

  // Submit Driver Report
  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !description.trim()) return;

    setIsSubmitting(true);
    const generatedId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // AI Shuttle Need Evaluation
    const corridor = getCorridorForRoute(routeNum);
    const needsShuttle = category === "VEHICLE_BREAKDOWN" || (severity === "CRITICAL" && category === "PASSENGER_CROWDING");

    let shuttleRecommendation = undefined;
    let initialStatus: ShuttleDispatchStatus = "PENDING_REVIEW";

    if (needsShuttle) {
      shuttleRecommendation = {
        recommended: true,
        reason: `${category === "VEHICLE_BREAKDOWN" ? "Vehicle breakdown" : "Severe crush load"} on high-demand route ${routeNum}. Existing scheduled headway insufficient to absorb roadside commuter crowd.`,
        suggestedDepot: corridor === "corridor_omr" ? "Adyar / Thiruvanmiyur Depot" : "Guindy Central Depot",
        numShuttles: category === "VEHICLE_BREAKDOWN" ? 2 : 1,
        alternativeCovered: "Parallel feeder lines notified. Standby rescue shuttle deployment recommended subject to human operator confirmation.",
      };
      initialStatus = "SHUTTLE_RECOMMENDED";
    } else {
      shuttleRecommendation = {
        recommended: false,
        reason: "Regular traffic slowdown or non-critical issue. Existing scheduled headways and parallel transit can cover commuter demand.",
        suggestedDepot: "Standby Depot",
        numShuttles: 0,
        alternativeCovered: "Parallel transit options and traffic liaison active. No supplementary deadhead shuttle required.",
      };
      initialStatus = "RESOLVED_NO_SHUTTLE";
    }

    const newReport: DriverIncidentReport = {
      id: generatedId,
      busId: busId.trim() || "TN-01-AN-0000",
      routeNum: routeNum.trim() || "MTC",
      corridorId: corridor,
      location: location.trim() || "Chennai Transit Network",
      category,
      severity,
      description: description.trim(),
      supportingInfo: supportingInfo.trim() || undefined,
      driverName: driverName.trim() || "MTC Bus Pilot",
      driverId: driverId.trim() || "DRV-0000",
      timestamp: timeStr,
      shuttleRecommendation,
      dispatchStatus: initialStatus,
      auditTrail: [
        {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: timeStr,
          action: "Incident Reported by Bus Pilot",
          actor: `${driverName} (${driverId})`,
          details: `Category: ${category} · Severity: ${severity} · Bus: ${busId}`,
        },
        ...(shuttleRecommendation?.recommended
          ? [
              {
                id: `AUD-SYS-${Date.now().toString().slice(-4)}`,
                timestamp: timeStr,
                action: "AI Shuttle Recommendation Generated",
                actor: "CUMTA AI Telemetry Engine",
                details: "Evaluated passenger impact: Recommended standby shuttle dispatch. Awaiting Official Approval.",
              },
            ]
          : []),
      ],
    };

    setTimeout(() => {
      onAddIncident(newReport);
      setIsSubmitting(false);
      setSubmitSuccessId(generatedId);
      setDescription("");
      setSupportingInfo("");
    }, 400);
  };

  const handleApprove = () => {
    if (!selectedIncident) return;
    onApproveShuttle(selectedIncident.id, officerName, officerBadge, approvalNotes);
    setReviewAction(null);
    setSelectedIncident(null);
  };

  const handleReject = () => {
    if (!selectedIncident || !rejectionReason.trim()) return;
    onRejectShuttle(selectedIncident.id, officerName, officerBadge, rejectionReason);
    setReviewAction(null);
    setSelectedIncident(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Workflow Banner */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Transport Communications & Shuttle Dispatch Portal
              </h2>
              <p className="text-xs text-slate-400">
                Operational Workflow: <span className="text-emerald-400 font-semibold">Bus Driver Issue Report</span> → <span className="text-cyan-400 font-semibold">Control Room Alert</span> → <span className="text-amber-400 font-semibold">Human Official Sign-Off</span> → <span className="text-purple-400 font-semibold">Shuttle Dispatch</span>
              </p>
            </div>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("control_room")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition ${
              activeTab === "control_room"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Control Room Desk</span>
            <span className="ml-1 bg-slate-900 px-1.5 py-0.2 rounded-full text-[10px] text-cyan-300 font-mono">
              {incidents.filter((i) => i.dispatchStatus === "SHUTTLE_RECOMMENDED").length} pending
            </span>
          </button>

          <button
            onClick={() => setActiveTab("driver_report")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition ${
              activeTab === "driver_report"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>Bus Driver / Pilot Interface</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW 1: BUS DRIVER REPORTING INTERFACE (MOBILE-FRIENDLY)             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "driver_report" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Driver Input Form */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bus className="w-4 h-4 text-emerald-400" />
                  MTC Bus Driver Incident & Disruption Log
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Report vehicle breakdowns, critical crowding, traffic jams, or obstructions directly to CUMTA Control.
                </p>
              </div>
              <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                Driver Telemetry Active
              </span>
            </div>

            {submitSuccessId && (
              <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3.5 flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-emerald-300">
                    Incident Report Logged Successfully! ({submitSuccessId})
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    Transmitted to CUMTA Control Room and correlated with corridor analytics. Standby review is in progress.
                  </p>
                  <button
                    onClick={() => setSubmitSuccessId(null)}
                    className="text-[11px] text-emerald-400 underline mt-1 font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleDriverSubmit} className="space-y-4 text-xs">
              {/* Row 1: Bus Fleet ID & Route Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Bus Registration / Fleet ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={busId}
                    onChange={(e) => setBusId(e.target.value)}
                    placeholder="e.g. TN-01-AN-4412"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Route Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={routeNum}
                    onChange={(e) => setRouteNum(e.target.value)}
                    placeholder="e.g. 21G, 570, 70V"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Location / Current Stop */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Current Location / Nearest Bus Stop *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Alandur Metro Base / SRP Tools Jn"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Category & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Issue Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DriverIssueCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="VEHICLE_BREAKDOWN">Vehicle breakdown (Mechanical / Engine)</option>
                    <option value="HEAVY_TRAFFIC">Heavy traffic / Route gridlock</option>
                    <option value="ROAD_BLOCKAGE">Road blockage / Construction detour</option>
                    <option value="ACCIDENT_OBSTRUCTION">Accident or obstruction</option>
                    <option value="PASSENGER_CROWDING">Unexpected passenger crush load</option>
                    <option value="BUS_DELAYED">Bus severely delayed (&gt;20 min)</option>
                    <option value="OTHER_OPERATIONAL">Other operational issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Severity Level *
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as IncidentSeverity[]).map((sev) => (
                      <button
                        type="button"
                        key={sev}
                        onClick={() => setSeverity(sev)}
                        className={`py-1.5 rounded-lg font-bold text-[11px] border transition ${
                          severity === sev
                            ? sev === "CRITICAL"
                              ? "bg-rose-500/30 text-rose-300 border-rose-500 shadow-sm"
                              : sev === "HIGH"
                              ? "bg-orange-500/30 text-orange-300 border-orange-500 shadow-sm"
                              : sev === "MEDIUM"
                              ? "bg-amber-500/30 text-amber-300 border-amber-500 shadow-sm"
                              : "bg-emerald-500/30 text-emerald-300 border-emerald-500 shadow-sm"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Issue Description & Passenger Impact *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe vehicle condition, number of passengers on board / stranded, road obstacles..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Row 5: Supporting Info & Pilot Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Staff / Badge ID
                  </label>
                  <input
                    type="text"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Additional Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={supportingInfo}
                    onChange={(e) => setSupportingInfo(e.target.value)}
                    placeholder="Weather, detour taken..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button with double-click protection */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                    isSubmitting
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-950/60"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Transmitting Report to Control Room...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Incident Report to CUMTA Control
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Driver's Active Submissions */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Live Incident Status Stream
              </h3>

              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {incidents.map((inc) => {
                  const isCritical = inc.severity === "CRITICAL";
                  const isApproved = inc.dispatchStatus === "SHUTTLE_APPROVED";
                  const isRecommended = inc.dispatchStatus === "SHUTTLE_RECOMMENDED";
                  const isRejected = inc.dispatchStatus === "SHUTTLE_REJECTED";

                  return (
                    <div
                      key={inc.id}
                      className={`p-3 rounded-xl border text-xs transition ${
                        isApproved
                          ? "bg-emerald-950/20 border-emerald-500/40"
                          : isRecommended
                          ? "bg-amber-950/20 border-amber-500/40"
                          : isRejected
                          ? "bg-slate-950/60 border-slate-800"
                          : "bg-slate-950/80 border-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white text-[11px] bg-slate-800 px-2 py-0.5 rounded">
                            {inc.routeNum}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            {inc.busId}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">
                          {inc.timestamp}
                        </span>
                      </div>

                      <p className="text-slate-300 text-[11px] mt-1.5 font-medium leading-snug">
                        {inc.description}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 truncate max-w-[150px]">
                          {inc.location}
                        </span>

                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full border ${
                            isApproved
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : isRecommended
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : isRejected
                              ? "bg-slate-800 text-slate-400 border-slate-700"
                              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          }`}
                        >
                          {isApproved
                            ? "Shuttle Dispatched"
                            : isRecommended
                            ? "Shuttle Awaiting Approval"
                            : isRejected
                            ? "Shuttle Rejected"
                            : "Monitoring"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW 2: CONTROL ROOM DISPATCH DESK & OFFICIAL APPROVAL GATE         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "control_room" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Total Active Incidents</span>
                <div className="text-xl font-black text-white">{incidents.length}</div>
              </div>
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-semibold">Shuttle Recommendations</span>
                <div className="text-xl font-black text-amber-300">
                  {incidents.filter((i) => i.dispatchStatus === "SHUTTLE_RECOMMENDED").length} Pending
                </div>
              </div>
              <Truck className="w-5 h-5 text-amber-400" />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-400 font-semibold">Approved Relief Dispatches</span>
                <div className="text-xl font-black text-emerald-400">
                  {incidents.filter((i) => i.dispatchStatus === "SHUTTLE_APPROVED").length} Deployed
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Incidents Queue */}
          <div className="space-y-3">
            {incidents.map((inc) => {
              const isRecommended = inc.dispatchStatus === "SHUTTLE_RECOMMENDED";
              const isApproved = inc.dispatchStatus === "SHUTTLE_APPROVED";
              const isRejected = inc.dispatchStatus === "SHUTTLE_REJECTED";

              return (
                <div
                  key={inc.id}
                  className={`bg-slate-900/95 border rounded-2xl p-4 shadow-xl space-y-3 transition ${
                    isRecommended
                      ? "border-amber-500/50 shadow-amber-950/20"
                      : isApproved
                      ? "border-emerald-500/50 shadow-emerald-950/20"
                      : "border-slate-800"
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {inc.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          inc.severity === "CRITICAL"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : inc.severity === "HIGH"
                            ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                        <Bus className="w-3.5 h-3.5 text-emerald-400" />
                        Route {inc.routeNum} ({inc.busId})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {inc.timestamp}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isApproved
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : isRecommended
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : isRejected
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {isApproved
                          ? "Approved / Dispatched"
                          : isRecommended
                          ? "Requires Official Sign-off"
                          : isRejected
                          ? "Dispatch Rejected"
                          : "Resolved / No Shuttle"}
                      </span>
                    </div>
                  </div>

                  {/* Incident Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                    <div className="lg:col-span-7 space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-slate-200 font-medium">{inc.location}</span>
                        <span className="text-slate-500 font-mono">({inc.corridorId.replace("corridor_", "").toUpperCase()} Trunk)</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed text-xs pl-5">
                        {inc.description}
                      </p>
                      {inc.supportingInfo && (
                        <div className="text-[11px] text-slate-400 pl-5">
                          <span className="text-slate-500">Pilot Note:</span> {inc.supportingInfo}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 pl-5 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Reported by: {inc.driverName} ({inc.driverId})
                      </div>
                    </div>

                    {/* AI Assessment & Recommendation */}
                    <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          AI Shuttle Requirement Evaluation
                        </span>
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          Human Sign-Off Required
                        </span>
                      </div>

                      {inc.shuttleRecommendation ? (
                        <div className="space-y-1.5 text-[11px]">
                          <p className="text-slate-300 leading-snug">
                            {inc.shuttleRecommendation.reason}
                          </p>
                          <div className="text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <span>Alternative:</span>
                            <span className="text-slate-300 truncate max-w-[200px]" title={inc.shuttleRecommendation.alternativeCovered}>
                              {inc.shuttleRecommendation.alternativeCovered}
                            </span>
                          </div>
                          {inc.shuttleRecommendation.recommended && (
                            <div className="bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg text-amber-200 flex items-center justify-between">
                              <span className="font-semibold">
                                Recommended: {inc.shuttleRecommendation.numShuttles} Relief Bus from {inc.shuttleRecommendation.suggestedDepot}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-[11px]">
                          Evaluating corridor headway and depot standby capacity...
                        </p>
                      )}

                      {/* Official Decision Display if Reviewed */}
                      {inc.officialReview && (
                        <div className="pt-2 border-t border-slate-800/80 text-[11px]">
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-slate-400">Official Decision:</span>
                            <span className={inc.officialReview.decision === "APPROVED" ? "text-emerald-400" : "text-rose-400"}>
                              {inc.officialReview.decision} by {inc.officialReview.officerName}
                            </span>
                          </div>
                          {inc.officialReview.rejectionReason && (
                            <div className="text-rose-300 text-[10px] mt-1 bg-rose-950/30 p-1.5 rounded border border-rose-900/50">
                              Rejection Reason: {inc.officialReview.rejectionReason}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">
                            Signed: {inc.officialReview.reviewTimestamp} ({inc.officialReview.officerBadge})
                          </div>
                        </div>
                      )}

                      {/* Action Buttons for Pending Incident */}
                      {isRecommended && (
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedIncident(inc);
                              setReviewAction("approve");
                            }}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition shadow-md shadow-emerald-950"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            Approve Dispatch
                          </button>

                          <button
                            onClick={() => {
                              setSelectedIncident(inc);
                              setReviewAction("reject");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 font-semibold text-xs border border-slate-700 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audit Trail Drawer */}
                  <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center gap-1 mb-1">
                      <History className="w-3 h-3 text-cyan-400" />
                      Verification Audit Trail
                    </span>
                    <div className="space-y-1">
                      {inc.auditTrail.map((aud) => (
                        <div key={aud.id} className="flex items-baseline gap-2">
                          <span className="font-mono text-slate-500">{aud.timestamp}</span>
                          <span className="text-emerald-400 font-medium">[{aud.actor}]</span>
                          <span className="text-slate-300">{aud.action}</span>
                          {aud.details && <span className="text-slate-500 italic">— {aud.details}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* OFFICIAL REVIEW MODAL (APPROVAL / REJECTION MANDATORY GATE)         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {selectedIncident && reviewAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {reviewAction === "approve" ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <h3 className="text-sm font-bold text-white">
                  {reviewAction === "approve"
                    ? "Official Authorization: Approve Shuttle Deployment"
                    : "Official Decision: Reject Shuttle Recommendation"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedIncident(null);
                  setReviewAction(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-400">Incident ID: {selectedIncident.id}</span>
                <span className="text-emerald-400 font-bold">Route {selectedIncident.routeNum}</span>
              </div>
              <p className="text-slate-200">{selectedIncident.description}</p>
              <div className="text-[11px] text-slate-400">
                Location: <span className="text-slate-300">{selectedIncident.location}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Authorized Official Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    CUMTA / MTC Badge ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={officerBadge}
                    onChange={(e) => setOfficerBadge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {reviewAction === "reject" ? (
                <div>
                  <label className="block text-rose-300 font-semibold mb-1">
                    Mandatory Reason for Rejection *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide operational justification (e.g. Existing Suburban Railway frequency sufficient, standby buses scheduled within 6 mins...)"
                    className="w-full bg-slate-950 border border-rose-900/60 rounded-xl p-3 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Dispatch Order Directives (Optional)
                  </label>
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Deploy 2 low-floor AC shuttles from Guindy depot; divert via Anna Salai ramp"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedIncident(null);
                  setReviewAction(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </button>

              {reviewAction === "approve" ? (
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Confirm Official Approval & Dispatch
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!rejectionReason.trim()}
                  onClick={handleReject}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg ${
                    !rejectionReason.trim()
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Confirm Rejection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
