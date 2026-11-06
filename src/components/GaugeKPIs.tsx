import React from "react";
import type { HourlyDemand, Corridor } from "../types/api";
import type { ChennaiWeather } from "../services/weather";

// ─── Odometer/Semicircular Gauge ─────────────────────────────────────────────
// Spans 0–100 on a 180° arc (left → right).
// Needle pivot is at the bottom-centre of the semicircle.

interface GaugeProps {
  value: number;      // 0–100
  label: string;
  unit?: string;
  low?: number;       // threshold: green → amber
  high?: number;      // threshold: amber → red
  critical?: number;  // threshold: red → critical-red
  dataSource: string;
  dataNote?: string;
}

const ARC_RADIUS = 70;
const CX = 90;
const CY = 90;

function polarToXY(deg: number, r: number) {
  // 0° = left (270° in standard), goes to 180° = right (90° in standard)
  const rad = ((deg - 180) * Math.PI) / 180;
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

function describeArc(startDeg: number, endDeg: number, r: number) {
  const start = polarToXY(endDeg, r);
  const end = polarToXY(startDeg, r);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function gaugeColor(value: number, low: number, high: number, critical: number) {
  if (value >= critical) return { stroke: "#ef4444", text: "text-rose-400", fill: "#ef4444" };
  if (value >= high)     return { stroke: "#f97316", text: "text-orange-400", fill: "#f97316" };
  if (value >= low)      return { stroke: "#f59e0b", text: "text-amber-400", fill: "#f59e0b" };
  return { stroke: "#10b981", text: "text-emerald-400", fill: "#10b981" };
}

function gaugeLabel(value: number, low: number, high: number, critical: number) {
  if (value >= critical) return "CRITICAL";
  if (value >= high)     return "HIGH";
  if (value >= low)      return "MODERATE";
  return "LOW";
}

const OdometerGauge: React.FC<GaugeProps> = ({
  value,
  label,
  unit = "%",
  low = 40,
  high = 70,
  critical = 90,
  dataSource,
  dataNote,
}) => {
  // Use a stable unique id for SVG filter to avoid cross-gauge collisions
  const filterId = React.useId().replace(/:/g, "");
  const clamped = Math.max(0, Math.min(100, value));
  // Needle angle: 0 value = 0° (far left), 100 value = 180° (far right)
  const needleDeg = (clamped / 100) * 180;
  const color = gaugeColor(clamped, low, high, critical);
  const statusLabel = gaugeLabel(clamped, low, high, critical);

  // Needle tip position
  const needleLength = 56;
  const needleTip = polarToXY(needleDeg, needleLength);
  const needleBase1 = polarToXY(needleDeg - 90, 7);
  const needleBase2 = polarToXY(needleDeg + 90, 7);

  // Zone arc segments: green (0-low), amber (low-high), orange (high-critical), red (critical-100)
  const zones = [
    { from: 0,        to: low,      color: "#10b981" },
    { from: low,      to: high,     color: "#f59e0b" },
    { from: high,     to: critical, color: "#f97316" },
    { from: critical, to: 100,      color: "#ef4444" },
  ];

  // Tick marks at 0, 25, 50, 75, 100
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col items-center">
      <div className="text-xs font-semibold text-slate-400 mb-1 text-center leading-tight">{label}</div>
      
      <div className="relative w-[180px] h-[106px]">
        <svg viewBox="0 0 180 106" className="w-full h-full overflow-visible">
          {/* Background arc track */}
          <path
            d={describeArc(0, 180, ARC_RADIUS)}
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Zone colored arcs */}
          {zones.map((zone, i) => {
            if (zone.from >= zone.to) return null;
            return (
              <path
                key={i}
                d={describeArc(zone.from * 1.8, zone.to * 1.8, ARC_RADIUS)}
                fill="none"
                stroke={zone.color}
                strokeWidth="14"
                strokeLinecap={i === 0 ? "round" : i === zones.length - 1 ? "round" : "butt"}
                opacity="0.25"
              />
            );
          })}

          {/* Active fill arc (from 0 to current value) */}
          {clamped > 0 && (
            <path
              d={describeArc(0, clamped * 1.8, ARC_RADIUS)}
              fill="none"
              stroke={color.stroke}
              strokeWidth="10"
              strokeLinecap="round"
              opacity="0.9"
            />
          )}

          {/* Tick marks */}
          {ticks.map((t) => {
            const outer = polarToXY(t * 1.8, ARC_RADIUS + 10);
            const inner = polarToXY(t * 1.8, ARC_RADIUS + 4);
            const labelPos = polarToXY(t * 1.8, ARC_RADIUS + 18);
            return (
              <g key={t}>
                <line
                  x1={inner.x} y1={inner.y}
                  x2={outer.x} y2={outer.y}
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="7"
                  fill="#64748b"
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* Needle shadow/glow */}
          <polygon
            points={`${CX},${CY} ${needleBase1.x},${needleBase1.y} ${needleTip.x},${needleTip.y} ${needleBase2.x},${needleBase2.y}`}
            fill={color.fill}
            opacity="0.15"
            filter={`url(#glow-${filterId})`}
          />

          {/* Needle */}
          <polygon
            points={`${CX},${CY} ${needleBase1.x},${needleBase1.y} ${needleTip.x},${needleTip.y} ${needleBase2.x},${needleBase2.y}`}
            fill={color.fill}
            stroke={color.stroke}
            strokeWidth="0.5"
          />

          {/* Needle pivot circle */}
          <circle cx={CX} cy={CY} r="6" fill="#0f172a" stroke={color.stroke} strokeWidth="2" />
          <circle cx={CX} cy={CY} r="3" fill={color.fill} />

          {/* Glow filter */}
          <defs>
            <filter id={`glow-${filterId}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Value text */}
          <text
            x={CX}
            y={CY - 22}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="16"
            fontWeight="900"
            fill={color.fill}
            fontFamily="monospace"
          >
            {Math.round(clamped)}{unit}
          </text>
        </svg>
      </div>

      {/* Status badge */}
      <div
        className={`mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider border ${
          statusLabel === "CRITICAL"
            ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
            : statusLabel === "HIGH"
            ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
            : statusLabel === "MODERATE"
            ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
            : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
        }`}
      >
        {statusLabel}
      </div>

      {/* Data source */}
      <div className="mt-1.5 text-center">
        <span className="text-[9px] text-slate-500 font-mono leading-tight block">{dataSource}</span>
        {dataNote && <span className="text-[9px] text-slate-600 leading-tight block">{dataNote}</span>}
      </div>
    </div>
  );
};

// ─── The Four KPI Gauges ──────────────────────────────────────────────────────

interface GaugeKPIsProps {
  currentDemand?: HourlyDemand;
  corridors: Corridor[];
  dayType: "weekday" | "weekend";
  weather?: ChennaiWeather;
}

export const GaugeKPIs: React.FC<GaugeKPIsProps> = ({
  currentDemand,
  corridors,
  dayType,
  weather,
}) => {
  const weatherMult = weather?.demand_multiplier ?? 1.0;

  // ── 1. Network Pressure ────────────────────────────────────────────────────
  // Formula: (boardings / city_capacity) × 100
  // Source: corridor_demand.json → hourly array
  // Valid range: 0–150+ (can exceed 100 during peak because
  //   boardings represent cumulative tap-ins per hour vs scheduled seat capacity)
  // We cap the displayed needle at 100 and show the raw % if > 100.
  const rawBoardings =
    dayType === "weekday"
      ? currentDemand?.weekday_boardings ?? 180000
      : currentDemand?.weekend_boardings ?? 135000;
  const boardings = Math.round(rawBoardings * weatherMult);
  const capacity = currentDemand?.city_capacity ?? 200000;
  const networkPressure = Math.round((boardings / capacity) * 100);
  // Gauge shows 0–100 scale; if >100 we clamp needle to 100
  const networkPressureDisplay = Math.min(networkPressure, 100);

  // ── 2. Corridor Bottleneck Index ───────────────────────────────────────────
  // Formula: (criticalOrHighCorridors / totalCorridors) × (avgRiskScore / 100) × 100
  // Source: corridor_demand.json → corridors array (risk_score field)
  // Valid range: 0–100
  const criticalCount = corridors.filter(c => c.risk_level === "critical" || c.risk_level === "high").length;
  const avgRiskScore = corridors.length > 0
    ? corridors.reduce((sum, c) => sum + c.risk_score, 0) / corridors.length
    : 0;
  // Weighted: proportion of risky corridors × avg risk score
  const bottleneckIndex = corridors.length > 0
    ? Math.round((criticalCount / corridors.length) * avgRiskScore)
    : 0;

  // ── 3. MTC Fleet Utilization ───────────────────────────────────────────────
  // Formula: (total_buses_allocated_across_corridors / 1,348_total_routes_fleet) × 100
  // Source: corridor_demand.json corridors → bus_fleet_allocated
  //   system_stats.json → total_mtc_routes_mapped (1348 routes)
  // The depot fleet sizes from system_stats sum to ~960 buses across top depots
  // MTC Chennai operates ~3,500 buses total (official fleet as of 2024–25)
  // We use sum of allocated buses / estimated total active fleet (3500)
  const totalAllocatedBuses = corridors.reduce((sum, c) => sum + c.bus_fleet_allocated, 0);
  const TOTAL_MTC_FLEET = 3500; // MTC Chennai official fleet size (approximate)
  const fleetUtilization = Math.round((totalAllocatedBuses / TOTAL_MTC_FLEET) * 100);

  // ── 4. Weather Surge Pressure ──────────────────────────────────────────────
  // Formula: (weatherMultiplier - 1) / 0.3 × 100
  //   Rain adds +26% → multiplier 1.26, so surge = 26/30 × 100 ≈ 87%
  //   Heat adds +14% → multiplier 1.14, so surge = 14/30 × 100 ≈ 47%
  //   Fair = 1.0x  → surge = 0%
  // Source: services/weather.ts → WEATHER_PROFILES demand_multiplier
  const MAX_WEATHER_SURGE = 0.30; // 30% = max expected surge
  const weatherSurge = Math.round(Math.max(0, (weatherMult - 1) / MAX_WEATHER_SURGE) * 100);
  const weatherSurgeDisplay = Math.min(weatherSurge, 100);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <OdometerGauge
        value={networkPressureDisplay}
        label="Network Pressure"
        unit="%"
        low={40}
        high={70}
        critical={90}
        dataSource="ETM tap-in boardings ÷ fleet capacity"
        dataNote={networkPressure > 100 ? `Raw: ${networkPressure}% (over capacity)` : undefined}
      />
      <OdometerGauge
        value={bottleneckIndex}
        label="Corridor Bottleneck Index"
        unit="%"
        low={30}
        high={55}
        critical={75}
        dataSource={`${criticalCount}/${corridors.length} corridors critical/high`}
        dataNote={`Avg risk score: ${Math.round(avgRiskScore)}/100`}
      />
      <OdometerGauge
        value={fleetUtilization}
        label="MTC Fleet Utilization"
        unit="%"
        low={30}
        high={55}
        critical={80}
        dataSource={`${totalAllocatedBuses} buses deployed / 3,500 fleet`}
        dataNote="Key corridor allocations only"
      />
      <OdometerGauge
        value={weatherSurgeDisplay}
        label="Weather Surge Pressure"
        unit="%"
        low={20}
        high={50}
        critical={80}
        dataSource={`${weather?.condition ?? "clear"} weather · ${weatherMult}x multiplier`}
        dataNote={weatherMult <= 1.0 ? "No weather surge active" : undefined}
      />
    </div>
  );
};
