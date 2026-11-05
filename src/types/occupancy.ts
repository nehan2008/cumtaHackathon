export type CrowdLevel = "AVAILABLE" | "MODERATE" | "CROWDED" | "VERY CROWDED" | "FULL";

export type OccupancyDataSource = "REPORTED" | "ESTIMATED" | "SIMULATED";

export interface CrowdThresholds {
  availableMax: number;   // default: 31
  moderateMax: number;    // default: 59
  crowdedMax: number;     // default: 71
  veryCrowdedMax: number; // default: 79
  fullMin: number;        // default: 80
}

export const DEFAULT_CROWD_THRESHOLDS: CrowdThresholds = {
  availableMax: 31,
  moderateMax: 59,
  crowdedMax: 71,
  veryCrowdedMax: 79,
  fullMin: 80,
};

export interface BusOccupancyRecord {
  busId: string;
  regNumber: string;
  routeNum: string;
  corridorName: string;
  currentStop: string;
  nextStop: string;
  maxCapacity: number; // default 80
  currentPassengerCount: number;
  source: OccupancyDataSource;
  lastUpdated: string;
  conductorId?: string;
  notes?: string;
}

export function calculateCrowdLevel(
  count: number,
  thresholds: CrowdThresholds = DEFAULT_CROWD_THRESHOLDS,
  maxCapacity = 80
): {
  level: CrowdLevel;
  percentage: number;
  remainingCapacity: number;
  colorClass: string;
  bgClass: string;
  borderClass: string;
} {
  const normalizedCount = Math.max(0, count);
  // Scale thresholds proportionally if capacity differs from 80
  const scale = maxCapacity / 80;
  const avail = thresholds.availableMax * scale;
  const mod = thresholds.moderateMax * scale;
  const crowd = thresholds.crowdedMax * scale;
  const veryCrowd = thresholds.veryCrowdedMax * scale;

  let level: CrowdLevel = "AVAILABLE";
  let colorClass = "text-emerald-400";
  let bgClass = "bg-emerald-500/10";
  let borderClass = "border-emerald-500/30";

  if (normalizedCount >= maxCapacity || normalizedCount >= veryCrowd + 1) {
    if (normalizedCount >= maxCapacity) {
      level = "FULL";
      colorClass = "text-purple-400";
      bgClass = "bg-purple-500/20";
      borderClass = "border-purple-500/40";
    } else {
      level = "VERY CROWDED";
      colorClass = "text-rose-400";
      bgClass = "bg-rose-500/20";
      borderClass = "border-rose-500/40";
    }
  } else if (normalizedCount > mod) {
    level = "CROWDED";
    colorClass = "text-amber-400";
    bgClass = "bg-amber-500/20";
    borderClass = "border-amber-500/40";
  } else if (normalizedCount > avail) {
    level = "MODERATE";
    colorClass = "text-sky-400";
    bgClass = "bg-sky-500/15";
    borderClass = "border-sky-500/30";
  }

  const percentage = Math.min(100, Math.round((normalizedCount / maxCapacity) * 100));
  const remainingCapacity = Math.max(0, maxCapacity - normalizedCount);

  return {
    level,
    percentage,
    remainingCapacity,
    colorClass,
    bgClass,
    borderClass,
  };
}
