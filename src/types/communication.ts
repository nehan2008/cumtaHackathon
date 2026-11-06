export type PortalRole = "driver" | "conductor" | "police" | "control_room";

export type MessageCategory =
  | "OPERATIONAL_UPDATE"
  | "BREAKDOWN_DELAY"
  | "CONGESTION_OBSTRUCTION"
  | "OVERCROWDING_ALERT"
  | "CONTROL_DIRECTIVE"
  | "EMERGENCY_DISRUPTION";

export type UrgencyLevel = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export interface TransportMessage {
  id: string;
  senderRole: PortalRole;
  senderName: string;
  senderBadge: string;
  category: MessageCategory;
  urgency: UrgencyLevel;
  routeNum?: string;
  busNumber?: string;
  location?: string;
  content: string;
  timestamp: string;
  acknowledgedByControl: boolean;
  actionTaken?: string;
}

// ─── Driver Incident Reporting & Shuttle Dispatch Types ──────────────────────

export type CVDetectionCategory =
  | "ROAD_OBSTRUCTION"
  | "TRAFFIC_CONGESTION"
  | "ROAD_CONSTRUCTION"
  | "LANE_BLOCKAGE"
  | "ACCIDENT"
  | "WATERLOGGING"
  | "DAMAGED_ROAD"
  | "VEHICLE_BREAKDOWN"
  | "OTHER";

export type DriverIssueCategory =
  | "VEHICLE_BREAKDOWN"
  | "HEAVY_TRAFFIC"
  | "ROAD_BLOCKAGE"
  | "ACCIDENT_OBSTRUCTION"
  | "PASSENGER_CROWDING"
  | "BUS_DELAYED"
  | "WATERLOGGING"
  | "ROAD_CONSTRUCTION"
  | "OTHER_OPERATIONAL";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type VerificationStatus =
  | "UNVERIFIED"
  | "CONFIRMED"
  | "REJECTED_INCORRECT"
  | "MORE_INFO_REQUESTED"
  | "RESOLVED";

export type ShuttleDispatchStatus =
  | "PENDING_REVIEW"
  | "SHUTTLE_RECOMMENDED"
  | "SHUTTLE_APPROVED"
  | "SHUTTLE_REJECTED"
  | "RESOLVED_NO_SHUTTLE";

export interface CVAnalysisResult {
  category: CVDetectionCategory;
  categoryLabel: string;
  description: string;
  confidence: number; // e.g. 94%
  estimatedSeverity: IncidentSeverity;
  potentialDelayImpact: string; // e.g. "+18 - 25 min"
  suggestedAction: string;
  isAiObservation: boolean;
  detectedObjects?: string[];
  affectedCorridor?: string;
  analysisTimestamp?: string;
}

export interface StandbyFleetInfo {
  depot: string;
  busesAvailable: number;
  estimatedEtaMin: number;
  corridor: string;
}

export interface DriverIncidentReport {
  id: string;
  busId: string;
  routeNum: string;
  corridorId: string;
  location: string;
  category: DriverIssueCategory;
  description: string;
  severity: IncidentSeverity;
  supportingInfo?: string;
  driverName: string;
  driverId: string;
  timestamp: string;

  // AI Computer Vision Evidence & Detection
  evidenceUrl?: string;
  evidenceType?: "photo" | "video";
  evidenceTimestamp?: string;
  cvAnalysis?: CVAnalysisResult;

  // Verification Lifecycle
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  clarificationRequest?: string;
  clarificationResponse?: string;

  // Duplicate Correlation & Clustering
  duplicateGroupId?: string;
  duplicateCount?: number;

  // Operational Context
  affectedPassengersEst?: number;
  standbyFleet?: StandbyFleetInfo;
  
  // Shuttle Evaluation (AI / Rules Engine recommendation)
  shuttleRecommendation?: {
    recommended: boolean;
    reason: string;
    suggestedDepot: string;
    numShuttles: number;
    alternativeCovered: string;
    alternativeRoutes?: string[];
  };

  // Official Human Decision
  dispatchStatus: ShuttleDispatchStatus;
  officialReview?: {
    officerName: string;
    officerBadge: string;
    decision: "APPROVED" | "REJECTED" | "CONFIRMED" | "DISMISSED";
    rejectionReason?: string;
    reviewTimestamp: string;
    notes?: string;
  };

  auditTrail: {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    details?: string;
  }[];
}
