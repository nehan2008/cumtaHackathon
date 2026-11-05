export type FeedbackCategory =
  | "OVERCROWDING"
  | "BUS_DELAY"
  | "MISSED_STOP"
  | "STAFF_BEHAVIOR"
  | "CLEANLINESS"
  | "SUGGESTION";

export type FeedbackStatus = "NEW" | "UNDER_REVIEW" | "RESOLVED" | "FLAGGED_FOR_ACTION";

export interface PassengerFeedbackItem {
  id: string;
  commuterName: string;
  contact?: string;
  rating: number; // 1 to 5
  category: FeedbackCategory;
  routeNum: string;
  stopName: string;
  comments: string;
  timestamp: string;
  status: FeedbackStatus;
  sentiment: "positive" | "neutral" | "negative";
  depotAssigned?: string;
}
