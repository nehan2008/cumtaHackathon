import React, { useState } from "react";
import type { DriverIncidentReport } from "../../types/communication";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Truck,
  Camera,
  AlertCircle,
  FileText,
  User,
  ChevronRight
} from "lucide-react";

interface IncidentTimelineProps {
  incidents: DriverIncidentReport[];
  onNavigateToPortal: () => void;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  incidents,
  onNavigateToPortal,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    incidents[0]?.id || ""
  );

  const activeIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  if (!activeIncident) return null;

  // Determine which steps are complete based on incident status
  const isApproved = activeIncident.dispatchStatus === "SHUTTLE_APPROVED";
  const isRejected = activeIncident.dispatchStatus === "SHUTTLE_REJECTED";
  const isResolved = activeIncident.dispatchStatus === "RESOLVED_NO_SHUTTLE" || activeIncident.verificationStatus === "RESOLVED";
  const isConfirmed = activeIncident.verificationStatus === "CONFIRMED";
  const isRecommended = activeIncident.dispatchStatus === "SHUTTLE_RECOMMENDED";

  const steps = [
    {
      step: 1,
      title: "Evidence Captured",
      subtitle: `${activeIncident.driverName} (${activeIncident.driverId})`,
      time: activeIncident.evidenceTimestamp || activeIncident.timestamp,
      status: "completed",
      icon: <Camera className="w-4 h-4 text-emerald-400" />,
      detail: activeIncident.evidenceUrl
        ? "Photo evidence captured safely while vehicle stationary"
        : "Direct telemetry text report logged",
    },
    {
      step: 2,
      title: "AI Vision Analysis",
      subtitle: activeIncident.cvAnalysis
        ? `${activeIncident.cvAnalysis.confidence}% Conf: ${activeIncident.cvAnalysis.categoryLabel}`
        : "Deterministic Telemetry Engine",
      time: activeIncident.timestamp,
      status: "completed",
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      detail: activeIncident.cvAnalysis?.description || "Headway pressure analyzed",
    },
    {
      step: 3,
      title: "Control Alerted",
      subtitle: "Corridor Match: " + activeIncident.corridorId.replace("corridor_", "").toUpperCase(),
      time: activeIncident.timestamp,
      status: "completed",
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      detail: activeIncident.shuttleRecommendation?.reason || "Disruption queued for review",
    },
    {
      step: 4,
      title: "Official Review",
      subtitle: activeIncident.officialReview
        ? `${activeIncident.officialReview.decision} by ${activeIncident.officialReview.officerName}`
        : isConfirmed
        ? "Verified by Traffic Ops"
        : "Awaiting Human Sign-Off",
      time: activeIncident.officialReview?.reviewTimestamp || "In Review",
      status: activeIncident.officialReview || isConfirmed ? "completed" : "active",
      icon: <ShieldCheck className="w-4 h-4 text-purple-400" />,
      detail: activeIncident.officialReview?.notes || "CUMTA mandatory human approval gate",
    },
    {
      step: 5,
      title: "Action / Dispatch",
      subtitle: isApproved
        ? "Shuttle Dispatched"
        : isRejected
        ? "Recommendation Declined"
        : isResolved
        ? "Resolved via Alternatives"
        : "Pending Authorization",
      time: isApproved || isRejected || isResolved ? "Active" : "Pending",
      status: isApproved || isRejected || isResolved ? "completed" : "pending",
      icon: <Truck className="w-4 h-4 text-emerald-400" />,
      detail: isApproved
        ? `Relief bus deployed from ${activeIncident.shuttleRecommendation?.suggestedDepot || "Standby Depot"}`
        : isRejected
        ? activeIncident.officialReview?.rejectionReason || "Parallel transit alternatives utilized"
        : "Awaiting official deployment order",
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Header & Incident Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Operational Incident Lifecycle & Decision Pipeline
            </h2>
            <p className="text-[11px] text-slate-400">
              End-to-end traceability: Driver capture → AI CV analysis → Control alert → Human sign-off → Dispatch
            </p>
          </div>
        </div>

        {/* Incident Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {incidents.slice(0, 4).map((inc) => (
            <button
              key={inc.id}
              onClick={() => setSelectedIncidentId(inc.id)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition ${
                selectedIncidentId === inc.id
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {inc.routeNum} • {inc.id.replace("INC-2026-", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((st, idx) => {
          const isDone = st.status === "completed";
          const isActive = st.status === "active";

          return (
            <div
              key={st.step}
              className={`bg-slate-950/80 border rounded-xl p-3 flex flex-col justify-between text-xs transition relative ${
                isActive
                  ? "border-amber-500/60 bg-amber-950/20 ring-1 ring-amber-500/40"
                  : isDone
                  ? "border-emerald-500/40 bg-emerald-950/10"
                  : "border-slate-800/80 opacity-60"
              }`}
            >
              <div>
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        isDone
                          ? "bg-emerald-500 text-slate-950"
                          : isActive
                          ? "bg-amber-400 text-slate-950 animate-pulse"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {st.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Step {st.step}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-slate-500">{st.time}</span>
                </div>

                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  {st.icon}
                  <span>{st.title}</span>
                </div>

                <div className="text-[11px] font-medium text-slate-300 mt-1 line-clamp-1">
                  {st.subtitle}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/70 text-[10px] text-slate-400 leading-snug">
                {st.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Incident Summary Strip */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-white bg-slate-800 px-2 py-1 rounded">
            Route {activeIncident.routeNum} ({activeIncident.busId})
          </span>
          <span className="text-slate-300">
            📍 {activeIncident.location}
          </span>
          <span className="text-slate-400 hidden sm:inline">
            — {activeIncident.description}
          </span>
        </div>

        <button
          onClick={onNavigateToPortal}
          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 text-[11px] bg-cyan-950/30 px-3 py-1 rounded-lg border border-cyan-500/30 transition"
        >
          <span>Open in Dispatch Portal</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
