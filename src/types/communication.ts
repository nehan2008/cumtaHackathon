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
