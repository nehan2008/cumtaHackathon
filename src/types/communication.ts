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

export type DriverIssueCategory =
  | "VEHICLE_BREAKDOWN"
  | "HEAVY_TRAFFIC"
  | "ROAD_BLOCKAGE"
  | "ACCIDENT_OBSTRUCTION"
  | "PASSENGER_CROWDING"
  | "BUS_DELAYED"
  | "OTHER_OPERATIONAL";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ShuttleDispatchStatus =
  | "PENDING_REVIEW"
  | "SHUTTLE_RECOMMENDED"
  | "SHUTTLE_APPROVED"
  | "SHUTTLE_REJECTED"
  | "RESOLVED_NO_SHUTTLE";

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
  
  // Shuttle Evaluation (AI / Rules Engine recommendation)
  shuttleRecommendation?: {
    recommended: boolean;
    reason: string;
    suggestedDepot: string;
    numShuttles: number;
    alternativeCovered: string;
  };

  // Official Human Decision
  dispatchStatus: ShuttleDispatchStatus;
  officialReview?: {
    officerName: string;
    officerBadge: string;
    decision: "APPROVED" | "REJECTED";
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
