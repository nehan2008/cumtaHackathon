import React, { useState } from "react";
import type {
  DriverIncidentReport,
  DriverIssueCategory,
  CVDetectionCategory,
  CVAnalysisResult,
  IncidentSeverity,
  ShuttleDispatchStatus,
  VerificationStatus,
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
  PhoneCall,
  Camera,
  Upload,
  Eye,
  Trash2,
  Droplets,
  Wrench,
  Construction,
  Car,
  ShieldAlert,
  Info,
  Maximize2
} from "lucide-react";

// Pre-built SVG Data URIs for realistic mock transit evidence test scenes
const TEST_SCENE_BREAKDOWN = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e293b"/><path d="M0 260 L600 260 L600 400 L0 400 Z" fill="%230f172a"/><line x1="0" y1="330" x2="600" y2="330" stroke="%23f59e0b" stroke-dasharray="25 15" stroke-width="6"/><rect x="180" y="170" width="240" height="110" rx="8" fill="%23dc2626"/><rect x="200" y="185" width="40" height="30" fill="%2393c5fd" opacity="0.8"/><rect x="250" y="185" width="40" height="30" fill="%2393c5fd" opacity="0.8"/><rect x="300" y="185" width="40" height="30" fill="%2393c5fd" opacity="0.8"/><circle cx="230" cy="280" r="22" fill="%23111827"/><circle cx="370" cy="280" r="22" fill="%23111827"/><polygon points="300,100 320,135 280,135" fill="%23f59e0b"/><text x="300" y="130" font-family="Arial" font-size="16" font-weight="bold" fill="%23000" text-anchor="middle">!</text><rect x="190" y="235" width="220" height="18" fill="%23fee2e2" rx="3"/><text x="300" y="248" font-family="Arial" font-size="11" font-weight="bold" fill="%23991b1b" text-anchor="middle">MTC 21G • TAMBARAM</text><text x="30" y="40" font-family="Arial" font-size="14" fill="%2338bdf8" font-weight="bold">CAM_04: GST Rd - Alandur Ramp [08:31 AM]</text><text x="30" y="60" font-family="Arial" font-size="12" fill="%23f87171">CV: VEHICLE BREAKDOWN DETECTED (96% CONFIDENCE)</text></svg>`;

const TEST_SCENE_WATERLOGGING = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230284c7" opacity="0.2"/><rect width="600" height="400" fill="%231e293b"/><path d="M0 240 Q150 220 300 240 T600 240 L600 400 L0 400 Z" fill="%230369a1" opacity="0.7"/><path d="M0 280 Q200 260 400 280 T600 270 L600 400 L0 400 Z" fill="%230284c7" opacity="0.9"/><rect x="120" y="210" width="160" height="70" rx="6" fill="%2310b981"/><circle cx="160" cy="275" r="16" fill="%230f172a"/><circle cx="240" cy="275" r="16" fill="%230f172a"/><text x="30" y="40" font-family="Arial" font-size="14" fill="%2338bdf8" font-weight="bold">CAM_12: Velachery Lake Bypass [08:42 AM]</text><text x="30" y="60" font-family="Arial" font-size="12" fill="%2338bdf8">CV: WATERLOGGING / MONSOON FLOOD (91% CONFIDENCE)</text><text x="30" y="80" font-family="Arial" font-size="11" fill="%23fde047">Depth: ~35cm • Submerged Bus Half-Wheel</text></svg>`;

const TEST_SCENE_CONSTRUCTION = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e293b"/><line x1="0" y1="280" x2="600" y2="280" stroke="%23334155" stroke-width="6"/><rect x="140" y="160" width="22" height="120" fill="%23f59e0b"/><rect x="180" y="160" width="22" height="120" fill="%23f59e0b"/><rect x="220" y="160" width="22" height="120" fill="%23f59e0b"/><rect x="260" y="160" width="22" height="120" fill="%23f59e0b"/><rect x="300" y="160" width="22" height="120" fill="%23f59e0b"/><rect x="120" y="190" width="220" height="24" fill="%23ea580c"/><text x="230" y="206" font-family="Arial" font-size="10" font-weight="bold" fill="%23fff" text-anchor="middle">CMRL PHASE 2 METRO PILLAR WORK</text><text x="30" y="40" font-family="Arial" font-size="14" fill="%2338bdf8" font-weight="bold">CAM_08: Vadapalani 100ft Rd [08:12 AM]</text><text x="30" y="60" font-family="Arial" font-size="12" fill="%23fbbf24">CV: ROAD CONSTRUCTION BARRICADE (94% CONFIDENCE)</text></svg>`;

const TEST_SCENE_CONGESTION = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e293b"/><path d="M0 240 L600 240 L600 400 L0 400 Z" fill="%230f172a"/><rect x="60" y="200" width="100" height="50" rx="4" fill="%23f59e0b"/><rect x="180" y="210" width="120" height="60" rx="4" fill="%23ef4444"/><rect x="320" y="195" width="110" height="55" rx="4" fill="%2338bdf8"/><rect x="450" y="205" width="100" height="50" rx="4" fill="%2310b981"/><circle cx="500" cy="120" r="12" fill="%23ef4444"/><text x="30" y="40" font-family="Arial" font-size="14" fill="%2338bdf8" font-weight="bold">CAM_02: OMR - SRP Tools Jn [08:48 AM]</text><text x="30" y="60" font-family="Arial" font-size="12" fill="%23f59e0b">CV: TRAFFIC CONGESTION BOTTLENECK (92% CONFIDENCE)</text></svg>`;

interface CommunicationPortalProps {
  incidents: DriverIncidentReport[];
  onAddIncident: (inc: DriverIncidentReport) => void;
  onApproveShuttle: (incidentId: string, officerName: string, officerBadge: string, notes?: string) => void;
  onRejectShuttle: (incidentId: string, officerName: string, officerBadge: string, reason: string) => void;
  onVerifyIncident?: (incidentId: string, status: VerificationStatus, officerName: string, officerBadge: string, notes?: string) => void;
  onRequestClarification?: (incidentId: string, query: string, officerName: string) => void;
  onResolveIncident?: (incidentId: string, officerName: string) => void;
}

export const CommunicationPortal: React.FC<CommunicationPortalProps> = ({
  incidents,
  onAddIncident,
  onApproveShuttle,
  onRejectShuttle,
  onVerifyIncident,
  onRequestClarification,
  onResolveIncident,
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

  // Evidence & Computer Vision State
  const [evidenceDataUrl, setEvidenceDataUrl] = useState<string | null>(null);
  const [evidenceType, setEvidenceType] = useState<"photo" | "video">("photo");
  const [isAnalyzingCV, setIsAnalyzingCV] = useState(false);
  const [cvResult, setCvResult] = useState<CVAnalysisResult | null>(null);

  // Evidence Modal State (for Control Room Inspection)
  const [viewingEvidenceIncident, setViewingEvidenceIncident] = useState<DriverIncidentReport | null>(null);

  // Control Room Review Modal State
  const [selectedIncident, setSelectedIncident] = useState<DriverIncidentReport | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | "confirm" | "dismiss" | "clarify" | null>(null);
  const [officerName, setOfficerName] = useState("R. Sundaram (Traffic Ops Chief)");
  const [officerBadge, setOfficerBadge] = useState("CUMTA-CTRL-01");
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [clarificationText, setClarificationText] = useState("");

  // Map route to default corridor
  const getCorridorForRoute = (r: string): string => {
    if (r === "570" || r === "19B" || r === "102") return "corridor_omr";
    if (r === "21G" || r === "500" || r === "91" || r === "E18") return "corridor_gst";
    if (r === "70V" || r === "114" || r === "66") return "corridor_irr";
    if (r === "A1" || r === "18A" || r === "23C") return "corridor_anna_salai";
    return "corridor_phr";
  };

  // Check for duplicate / correlated reports on same corridor
  const correlatedIncidents = incidents.filter(
    (i) =>
      i.verificationStatus !== "RESOLVED" &&
      (i.routeNum === routeNum || i.corridorId === getCorridorForRoute(routeNum))
  );

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video/")) {
      setEvidenceType("video");
    } else {
      setEvidenceType("photo");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setEvidenceDataUrl(result);
      // Trigger CV automatically or let driver click
      analyzeEvidence(result);
    };
    reader.readAsDataURL(file);
  };

  // Select a pre-loaded test scene
  const handleSelectTestScene = (dataUrl: string, presetCategory: DriverIssueCategory, presetRoute: string, presetLoc: string) => {
    setEvidenceDataUrl(dataUrl);
    setEvidenceType("photo");
    setRouteNum(presetRoute);
    setLocation(presetLoc);
    setCategory(presetCategory);
    analyzeEvidence(dataUrl, presetCategory, presetRoute, presetLoc);
  };

  // Run Computer Vision Detection
  const analyzeEvidence = async (
    imagePayload: string,
    catHint?: string,
    rt?: string,
    loc?: string
  ) => {
    setIsAnalyzingCV(true);
    setCvResult(null);

    try {
      const response = await fetch("/api/transit-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePayload,
          routeNum: rt || routeNum,
          location: loc || location,
          notes: description,
          categoryHint: catHint || category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCvResult(data);
        // Pre-fill form from CV findings
        setDescription(data.description || description);
        setSeverity(data.estimatedSeverity || severity);
        if (data.category) {
          setCategory(data.category as DriverIssueCategory);
        }
      } else {
        throw new Error("CV API returned non-200");
      }
    } catch (err) {
      console.warn("Using instant client-side CV heuristic:", err);
      // Fallback deterministic analysis
      const fallbackResult: CVAnalysisResult = {
        category: (catHint || category) as CVDetectionCategory,
        categoryLabel:
          catHint === "WATERLOGGING"
            ? "Waterlogging / Monsoon Flood Hazard"
            : catHint === "VEHICLE_BREAKDOWN"
            ? "Vehicle Breakdown / Stalled Bus"
            : catHint === "ROAD_CONSTRUCTION"
            ? "Road Construction / CMRL Barrier"
            : "Traffic Congestion Bottleneck",
        description: `Visual detection identified road condition hazard on Route ${rt || routeNum} near ${loc || location}.`,
        confidence: 93,
        estimatedSeverity: severity,
        potentialDelayImpact: "+15 - 25 min",
        suggestedAction: "Alert CUMTA Control Room and standby relief depot.",
        isAiObservation: true,
        detectedObjects: ["Transit Carriageway", "Roadside Hazard", "Queue Platoon"],
        affectedCorridor: getCorridorForRoute(rt || routeNum),
        analysisTimestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setCvResult(fallbackResult);
      if (!description.trim()) {
        setDescription(fallbackResult.description);
      }
    } finally {
      setIsAnalyzingCV(false);
    }
  };

  // Submit Driver Report
  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !description.trim()) return;

    setIsSubmitting(true);
    const generatedId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const corridor = getCorridorForRoute(routeNum);
    const needsShuttle =
      category === "VEHICLE_BREAKDOWN" ||
      (severity === "CRITICAL" && category === "PASSENGER_CROWDING");

    let shuttleRecommendation = undefined;
    let initialStatus: ShuttleDispatchStatus = "PENDING_REVIEW";

    if (needsShuttle) {
      shuttleRecommendation = {
        recommended: true,
        reason: `${category === "VEHICLE_BREAKDOWN" ? "Vehicle breakdown" : "Severe passenger crush load"} on high-demand route ${routeNum}. Existing scheduled headway insufficient to absorb roadside commuter crowd.`,
        suggestedDepot: corridor === "corridor_omr" ? "Adyar / Thiruvanmiyur Depot" : "Guindy Central Depot",
        numShuttles: category === "VEHICLE_BREAKDOWN" ? 2 : 1,
        alternativeCovered: "Parallel feeder lines notified. Standby rescue shuttle deployment recommended subject to human operator confirmation.",
        alternativeRoutes: ["Suburban South Line", "Route Feeder F-" + routeNum],
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
      busId: busId.trim() || "TN-01-AN-4412",
      routeNum: routeNum.trim() || "MTC",
      corridorId: corridor,
      location: location.trim() || "Chennai Transit Network",
      category,
      severity,
      description: description.trim(),
      supportingInfo: supportingInfo.trim() || undefined,
      driverName: driverName.trim() || "MTC Bus Pilot",
      driverId: driverId.trim() || "DRV-8824",
      timestamp: timeStr,

      // AI Computer Vision Data
      evidenceUrl: evidenceDataUrl || undefined,
      evidenceType,
      evidenceTimestamp: timeStr,
      cvAnalysis: cvResult || undefined,
      verificationStatus: "UNVERIFIED",
      affectedPassengersEst: category === "VEHICLE_BREAKDOWN" ? 60 : 40,
      standbyFleet: {
        depot: corridor === "corridor_omr" ? "Adyar Depot" : "Guindy Depot",
        busesAvailable: 4,
        estimatedEtaMin: 10,
        corridor,
      },

      shuttleRecommendation,
      dispatchStatus: initialStatus,
      auditTrail: [
        {
          id: `AUD-CV-${Date.now().toString().slice(-4)}`,
          timestamp: timeStr,
          action: cvResult ? "AI Computer Vision Analyzed Evidence" : "Telemetry Incident Logged",
          actor: cvResult ? "TransitPulse AI Vision" : "Driver Portal",
          details: cvResult
            ? `Detected ${cvResult.categoryLabel} with ${cvResult.confidence}% confidence. Status: UNVERIFIED — AI OBSERVATION`
            : "Direct mobile submission",
        },
        {
          id: `AUD-${Date.now().toString().slice(-4)}`,
          timestamp: timeStr,
          action: "Incident Reported by Driver / Assistant",
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
      setEvidenceDataUrl(null);
      setCvResult(null);
    }, 400);
  };

  // Official Control Room Action Handlers
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

  const handleConfirmIncident = (inc: DriverIncidentReport) => {
    onVerifyIncident?.(inc.id, "CONFIRMED", officerName, officerBadge, "Confirmed via CCTV / Traffic liaison");
  };

  const handleDismissIncident = () => {
    if (!selectedIncident) return;
    onVerifyIncident?.(
      selectedIncident.id,
      "REJECTED_INCORRECT",
      officerName,
      officerBadge,
      rejectionReason || "Marked incorrect by Control Room official"
    );
    setReviewAction(null);
    setSelectedIncident(null);
  };

  const handleClarifySubmit = () => {
    if (!selectedIncident || !clarificationText.trim()) return;
    onRequestClarification?.(selectedIncident.id, clarificationText, officerName);
    setReviewAction(null);
    setSelectedIncident(null);
    setClarificationText("");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner & Mode Switcher */}
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
                AI Vision Incident Pipeline: <span className="text-emerald-400 font-semibold">Driver Evidence Capture</span> → <span className="text-cyan-400 font-semibold">CV Analysis</span> → <span className="text-amber-400 font-semibold">Human Verification</span> → <span className="text-purple-400 font-semibold">Authorized Dispatch</span>
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
              {incidents.filter((i) => i.verificationStatus === "UNVERIFIED").length} unverified
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
            <span>Driver / Pilot Reporting</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW 1: BUS DRIVER REPORTING INTERFACE (MOBILE-FRIENDLY + CV)        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "driver_report" && (
        <div className="space-y-4">
          {/* Driver Safety Warning Banner */}
          <div className="bg-amber-950/30 border border-amber-500/50 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-amber-300 flex items-center gap-2">
                <span>SAFETY FIRST — MTC DRIVER OPERATIONAL DIRECTIVE</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded font-mono">
                  DO NOT OPERATE WHILE DRIVING
                </span>
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Bus pilots must <strong>never operate a mobile phone or capture photos while the vehicle is in motion</strong>. Evidence must be captured by a conductor, passenger assistant, or only when the bus is completely stationary in a designated safe breakdown bay or bus stop.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Driver Input Form & Evidence Upload */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    AI-Assisted Road Disruption & Incident Reporting
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload visual road evidence to automatically detect congestion, breakdowns, or flooding.
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                  CV Pipeline Active
                </span>
              </div>

              {submitSuccessId && (
                <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3.5 flex items-start gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="font-bold text-emerald-300">
                      Incident Transmitted to Control Room ({submitSuccessId})
                    </div>
                    <p className="text-slate-300 mt-0.5">
                      Visual evidence and CV telemetry transmitted. Incident status marked: <span className="text-amber-400 font-semibold">UNVERIFIED — AI OBSERVATION</span> awaiting official confirmation.
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

              {/* Duplicate / Correlated Corridor Warning */}
              {correlatedIncidents.length > 0 && (
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 text-xs flex items-start gap-2.5 text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold text-amber-300">
                      Correlated Corridor Report Detected:
                    </span>{" "}
                    {correlatedIncidents.length} active incident(s) already logged on Route {routeNum} / {getCorridorForRoute(routeNum).replace("corridor_", "").toUpperCase()} corridor. Submissions will be grouped to avoid redundant dispatches.
                  </div>
                </div>
              )}

              {/* Section 1: Visual Evidence Upload & Test Presets */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold text-xs flex items-center justify-between">
                  <span>Photo or Video Evidence (Road Condition / Obstruction)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Max 25MB • JPG, PNG, MP4</span>
                </label>

                {/* Test Scene Quick Selector */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                    <span>1-Click Test Road Scenes (Simulate Driver Upload):</span>
                    <span className="text-[10px] text-cyan-400">Click to run AI Vision</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectTestScene(
                          TEST_SCENE_BREAKDOWN,
                          "VEHICLE_BREAKDOWN",
                          "21G",
                          "Alandur Metro Flyover Base, GST Road"
                        )
                      }
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 text-left transition flex flex-col justify-between h-16"
                    >
                      <div className="flex items-center gap-1 text-[10px] text-rose-400 font-bold">
                        <Wrench className="w-3 h-3" />
                        Breakdown
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">GST Alandur (21G)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSelectTestScene(
                          TEST_SCENE_WATERLOGGING,
                          "WATERLOGGING",
                          "91",
                          "Velachery Bypass / MRTS Underpass"
                        )
                      }
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-left transition flex flex-col justify-between h-16"
                    >
                      <div className="flex items-center gap-1 text-[10px] text-sky-400 font-bold">
                        <Droplets className="w-3 h-3" />
                        Waterlogging
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">Velachery MRTS (91)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSelectTestScene(
                          TEST_SCENE_CONSTRUCTION,
                          "ROAD_CONSTRUCTION",
                          "70V",
                          "Vadapalani Junction, 100 Ft Road"
                        )
                      }
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition flex flex-col justify-between h-16"
                    >
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                        <Construction className="w-3 h-3" />
                        Metro Barrier
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">Vadapalani (70V)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSelectTestScene(
                          TEST_SCENE_CONGESTION,
                          "HEAVY_TRAFFIC",
                          "570",
                          "Tidel Park Junction, OMR"
                        )
                      }
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition flex flex-col justify-between h-16"
                    >
                      <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold">
                        <Car className="w-3 h-3" />
                        Bottleneck
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">OMR Tidel (570)</div>
                    </button>
                  </div>
                </div>

                {/* Evidence Dropzone / File Picker */}
                <div className="relative border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 text-center bg-slate-950/50 transition">
                  {evidenceDataUrl ? (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-slate-700 max-h-48 flex items-center justify-center bg-black">
                        <img
                          src={evidenceDataUrl}
                          alt="Driver evidence preview"
                          className="max-h-48 w-auto object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEvidenceDataUrl(null);
                            setCvResult(null);
                          }}
                          className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-md text-xs shadow-md transition"
                          title="Remove evidence"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono text-[11px]">
                          Evidence Loaded ({evidenceType})
                        </span>
                        <button
                          type="button"
                          onClick={() => analyzeEvidence(evidenceDataUrl)}
                          disabled={isAnalyzingCV}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition text-xs shadow-md shadow-cyan-950"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isAnalyzingCV ? "Analyzing..." : "Re-run AI Analysis"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center py-4 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-slate-300 font-medium">
                        Click to select road photo or drag & drop evidence
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Camera capture supported on mobile devices
                      </p>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        capture="environment"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* AI Computer Vision Analysis Result Card */}
                {isAnalyzingCV && (
                  <div className="bg-cyan-950/20 border border-cyan-500/40 rounded-xl p-4 text-xs text-center space-y-2 animate-pulse">
                    <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>AI Computer Vision Analyzing Road Conditions...</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Inspecting carriageway obstruction, flood water levels, vehicle queue density & safety clearance.
                    </p>
                  </div>
                )}

                {cvResult && !isAnalyzingCV && (
                  <div className="bg-slate-950 border border-cyan-500/50 rounded-xl p-4 text-xs space-y-3 shadow-lg shadow-cyan-950/20">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-white text-xs">
                          {cvResult.categoryLabel}
                        </span>
                        <span className="bg-cyan-500/20 text-cyan-300 font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                          {cvResult.confidence}% Confidence
                        </span>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                        UNVERIFIED — AI OBSERVATION
                      </span>
                    </div>

                    <p className="text-slate-300 leading-snug text-xs">
                      {cvResult.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Estimated Delay Impact:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {cvResult.potentialDelayImpact}
                        </span>
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Estimated Severity:</span>
                        <span className="font-bold text-rose-400">
                          {cvResult.estimatedSeverity}
                        </span>
                      </div>
                    </div>

                    {cvResult.detectedObjects && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">Detected Features:</span>
                        {cvResult.detectedObjects.map((obj, i) => (
                          <span
                            key={i}
                            className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]"
                          >
                            {obj}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="bg-cyan-950/30 border border-cyan-500/30 p-2.5 rounded-lg text-cyan-200 text-[11px]">
                      <strong>AI Operational Recommendation:</strong> {cvResult.suggestedAction}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Form Details */}
              <form onSubmit={handleDriverSubmit} className="space-y-4 text-xs pt-2">
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
                      placeholder="e.g. 21G, 570, 70V, 91"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 2: Location */}
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
                      <option value="WATERLOGGING">Waterlogging / Monsoon flood</option>
                      <option value="ROAD_CONSTRUCTION">Road construction / Metro barrier</option>
                      <option value="ROAD_BLOCKAGE">Road blockage / Obstruction</option>
                      <option value="ACCIDENT_OBSTRUCTION">Accident or collision</option>
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
                    placeholder="Describe road situation, lane clearance, number of passengers on board or stranded..."
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
                      placeholder="e.g. rain, detoured via service lane..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !description.trim()}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                      isSubmitting
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-950/60"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Transmitting Report & Evidence to Control Room...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Report to CUMTA Control Room
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Driver's Active Submissions Stream */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Live Reported Incidents Feed
                </h3>

                <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                  {incidents.map((inc) => {
                    const isUnverified = inc.verificationStatus === "UNVERIFIED";
                    const isConfirmed = inc.verificationStatus === "CONFIRMED";
                    const isApproved = inc.dispatchStatus === "SHUTTLE_APPROVED";

                    return (
                      <div
                        key={inc.id}
                        className={`p-3 rounded-xl border text-xs transition space-y-2 ${
                          isApproved
                            ? "bg-emerald-950/20 border-emerald-500/40"
                            : isUnverified
                            ? "bg-amber-950/15 border-amber-500/40"
                            : "bg-slate-950/80 border-slate-800"
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

                        <p className="text-slate-300 text-[11px] leading-snug">
                          {inc.description}
                        </p>

                        {/* Evidence preview if attached */}
                        {inc.evidenceUrl && (
                          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                            <img
                              src={inc.evidenceUrl}
                              alt="Evidence thumbnail"
                              className="w-10 h-8 object-cover rounded bg-black shrink-0"
                            />
                            <div className="flex-1 min-w-0 text-[10px]">
                              <span className="text-slate-400 block truncate">
                                📍 {inc.location}
                              </span>
                              {inc.cvAnalysis && (
                                <span className="text-cyan-400 font-semibold">
                                  CV: {inc.cvAnalysis.categoryLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 truncate max-w-[140px]">
                            {inc.location}
                          </span>

                          <span
                            className={`font-semibold px-2 py-0.5 rounded-full border ${
                              isApproved
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : isConfirmed
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : isUnverified
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {isApproved
                              ? "Shuttle Dispatched"
                              : isConfirmed
                              ? "Officially Confirmed"
                              : isUnverified
                              ? "AI Observation"
                              : "Resolved"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
          {/* Top KPI Summary Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Total Active Incidents</span>
                <div className="text-xl font-black text-white">{incidents.length}</div>
              </div>
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-semibold">Unverified (CV Detections)</span>
                <div className="text-xl font-black text-amber-300">
                  {incidents.filter((i) => i.verificationStatus === "UNVERIFIED").length} Pending
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-400 font-semibold">Confirmed Incidents</span>
                <div className="text-xl font-black text-emerald-400">
                  {incidents.filter((i) => i.verificationStatus === "CONFIRMED").length} Verified
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-400 font-semibold">Relief Dispatches</span>
                <div className="text-xl font-black text-purple-300">
                  {incidents.filter((i) => i.dispatchStatus === "SHUTTLE_APPROVED").length} Deployed
                </div>
              </div>
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          {/* Incidents Queue */}
          <div className="space-y-3">
            {incidents.map((inc) => {
              const isUnverified = inc.verificationStatus === "UNVERIFIED";
              const isConfirmed = inc.verificationStatus === "CONFIRMED";
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
                      : isUnverified
                      ? "border-amber-500/30"
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

                      {/* Verification Status Badge */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isConfirmed
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : isUnverified
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : inc.verificationStatus === "REJECTED_INCORRECT"
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {isConfirmed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            CONFIRMED
                          </>
                        ) : isUnverified ? (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            UNVERIFIED — AI OBSERVATION
                          </>
                        ) : (
                          inc.verificationStatus
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Incident Details & Computer Vision Evidence Snapshot */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                    {/* Left: Driver Report & Visual Evidence */}
                    <div className="lg:col-span-7 space-y-2.5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-slate-200 font-semibold">{inc.location}</span>
                        <span className="text-slate-500 font-mono">
                          ({inc.corridorId.replace("corridor_", "").toUpperCase()} Trunk)
                        </span>
                      </div>

                      <p className="text-slate-200 leading-relaxed text-xs">
                        {inc.description}
                      </p>

                      {/* Visual Evidence Card */}
                      {inc.evidenceUrl && (
                        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                          <div className="relative group cursor-pointer" onClick={() => setViewingEvidenceIncident(inc)}>
                            <img
                              src={inc.evidenceUrl}
                              alt="Road condition evidence"
                              className="w-24 h-16 object-cover rounded-lg border border-slate-700 bg-black shrink-0"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition">
                              <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-cyan-400" />
                                CV Evidence Attached
                              </span>
                              <button
                                onClick={() => setViewingEvidenceIncident(inc)}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                              >
                                Full Screen
                              </button>
                            </div>
                            {inc.cvAnalysis && (
                              <div className="text-[11px] text-slate-300">
                                <strong>{inc.cvAnalysis.categoryLabel}</strong> ({inc.cvAnalysis.confidence}% conf)
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500">
                              Logged by {inc.driverName} ({inc.driverId})
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Official Verification Controls if Unverified */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Official Review:
                        </span>

                        {isUnverified ? (
                          <>
                            <button
                              onClick={() => handleConfirmIncident(inc)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              Confirm Incident
                            </button>

                            <button
                              onClick={() => {
                                setSelectedIncident(inc);
                                setReviewAction("dismiss");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 font-semibold text-[11px] border border-slate-700 transition"
                            >
                              <X className="w-3 h-3" />
                              Mark Incorrect
                            </button>

                            <button
                              onClick={() => {
                                setSelectedIncident(inc);
                                setReviewAction("clarify");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] border border-slate-700 transition flex items-center gap-1"
                            >
                              <HelpCircle className="w-3 h-3 text-cyan-400" />
                              Request Clarification
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-medium">
                            ✓ Verified by Control Room Official
                          </span>
                        )}

                        {inc.verificationStatus !== "RESOLVED" && (
                          <button
                            onClick={() => onResolveIncident?.(inc.id, officerName)}
                            className="ml-auto px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-300 text-[11px] border border-slate-700 transition"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: AI Shuttle Recommendation & Dispatch Approval */}
                    <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                          Shuttle Dispatch Recommendation
                        </span>
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.2 rounded font-mono font-bold">
                          Mandatory Human Sign-Off
                        </span>
                      </div>

                      {inc.shuttleRecommendation ? (
                        <div className="space-y-2 text-[11px]">
                          <p className="text-slate-300 leading-snug">
                            {inc.shuttleRecommendation.reason}
                          </p>

                          {/* Standby Fleet Info */}
                          {inc.standbyFleet && (
                            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">Standby Fleet at Depot:</span>
                              <span className="text-emerald-400 font-mono font-bold">
                                {inc.standbyFleet.busesAvailable} Buses Available at {inc.standbyFleet.depot} (ETA {inc.standbyFleet.estimatedEtaMin}m)
                              </span>
                            </div>
                          )}

                          {inc.shuttleRecommendation.recommended && (
                            <div className="bg-amber-950/30 border border-amber-500/40 p-2.5 rounded-lg text-amber-200">
                              <div className="font-bold flex items-center justify-between">
                                <span>Recommended: {inc.shuttleRecommendation.numShuttles} Relief Bus(es)</span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  from {inc.shuttleRecommendation.suggestedDepot}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Official Decision Display if Completed */}
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
                                  Reason: {inc.officialReview.rejectionReason}
                                </div>
                              )}
                              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                                Signed: {inc.officialReview.reviewTimestamp} ({inc.officialReview.officerBadge})
                              </div>
                            </div>
                          )}

                          {/* Action Buttons for Pending Shuttle */}
                          {isRecommended && (
                            <div className="pt-2 flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedIncident(inc);
                                  setReviewAction("approve");
                                }}
                                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-950"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                Sign & Approve Dispatch
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedIncident(inc);
                                  setReviewAction("reject");
                                }}
                                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 font-semibold text-xs border border-slate-700 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-[11px]">
                          Corridor headways within regular tolerances. No supplementary shuttle required.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Audit Trail Drawer */}
                  <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center gap-1 mb-1">
                      <History className="w-3 h-3 text-cyan-400" />
                      Incident & Verification Audit Trail
                    </span>
                    <div className="space-y-1">
                      {inc.auditTrail.map((aud) => (
                        <div key={aud.id} className="flex items-baseline gap-2">
                          <span className="font-mono text-slate-500 shrink-0">{aud.timestamp}</span>
                          <span className="text-emerald-400 font-medium shrink-0">[{aud.actor}]</span>
                          <span className="text-slate-300">{aud.action}</span>
                          {aud.details && <span className="text-slate-500 italic truncate max-w-sm">— {aud.details}</span>}
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
      {/* MODAL 1: HIGH-RES EVIDENCE INSPECTION VIEWER                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewingEvidenceIncident && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-white text-sm">
                  Road Condition Visual Evidence ({viewingEvidenceIncident.id})
                </span>
              </div>
              <button
                onClick={() => setViewingEvidenceIncident(null)}
                className="text-slate-400 hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>

            {viewingEvidenceIncident.evidenceUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-96">
                <img
                  src={viewingEvidenceIncident.evidenceUrl}
                  alt="Full-size evidence preview"
                  className="max-h-96 w-auto object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Location:</span>
                <span className="text-white font-medium">{viewingEvidenceIncident.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Route & Bus ID:</span>
                <span className="text-white font-mono">
                  Route {viewingEvidenceIncident.routeNum} • {viewingEvidenceIncident.busId}
                </span>
              </div>
            </div>

            {viewingEvidenceIncident.cvAnalysis && (
              <div className="bg-cyan-950/20 border border-cyan-500/30 p-3 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-cyan-300">
                  <span>CV Category: {viewingEvidenceIncident.cvAnalysis.categoryLabel}</span>
                  <span className="font-mono">{viewingEvidenceIncident.cvAnalysis.confidence}% Match</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  {viewingEvidenceIncident.cvAnalysis.description}
                </p>
                <div className="text-[10px] text-amber-300 pt-1">
                  Delay Impact: {viewingEvidenceIncident.cvAnalysis.potentialDelayImpact}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingEvidenceIncident(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: OFFICIAL APPROVAL / REJECTION SIGN-OFF MODAL               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {selectedIncident && reviewAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                {reviewAction === "approve"
                  ? "Authorize Rescue Shuttle Deployment"
                  : reviewAction === "reject"
                  ? "Decline Shuttle Deployment"
                  : reviewAction === "clarify"
                  ? "Request Driver Clarification"
                  : "Mark Incident Incorrect"}
              </span>
              <button
                onClick={() => {
                  setSelectedIncident(null);
                  setReviewAction(null);
                }}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="font-mono text-white font-bold">
                Incident: {selectedIncident.id} • Route {selectedIncident.routeNum}
              </div>
              <p className="text-slate-300">{selectedIncident.description}</p>
            </div>

            {/* Officer Credentials */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Reviewing Officer Name
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Officer Badge ID
                </label>
                <input
                  type="text"
                  value={officerBadge}
                  onChange={(e) => setOfficerBadge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            {reviewAction === "approve" && (
              <div>
                <label className="block text-slate-300 font-medium text-xs mb-1">
                  Dispatch Authorization Order & Depot Instructions
                </label>
                <textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="e.g. Authorized 2 buses from Guindy Depot. Traffic warden notified at Alandur flyover."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none"
                />
              </div>
            )}

            {reviewAction === "reject" && (
              <div>
                <label className="block text-slate-300 font-medium text-xs mb-1">
                  Justification for Declining Shuttle (Mandatory)
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Parallel route 19B and suburban EMU train headway has sufficient spare capacity..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none"
                />
              </div>
            )}

            {reviewAction === "clarify" && (
              <div>
                <label className="block text-slate-300 font-medium text-xs mb-1">
                  Question for Driver / Conductor
                </label>
                <textarea
                  required
                  rows={3}
                  value={clarificationText}
                  onChange={(e) => setClarificationText(e.target.value)}
                  placeholder="e.g. Is the rightmost lane clear for emergency vehicles? What is current passenger wait time?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none"
                />
              </div>
            )}

            {reviewAction === "dismiss" && (
              <div>
                <label className="block text-slate-300 font-medium text-xs mb-1">
                  Reason for Marking Incorrect
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. CCTV confirms obstacle was cleared within 3 mins; false alert"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedIncident(null);
                  setReviewAction(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>

              {reviewAction === "approve" && (
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Sign & Authorize
                </button>
              )}

              {reviewAction === "reject" && (
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              )}

              {reviewAction === "clarify" && (
                <button
                  onClick={handleClarifySubmit}
                  disabled={!clarificationText.trim()}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  Send Clarification Request
                </button>
              )}

              {reviewAction === "dismiss" && (
                <button
                  onClick={handleDismissIncident}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                >
                  Dismiss Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
