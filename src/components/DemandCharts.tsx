import React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { HourlyDemand, SystemStats } from "../types/api";

interface DemandChartsProps {
  hourly: HourlyDemand[];
  currentHour: number;
  systemStats?: SystemStats;
  dayType: "weekday" | "weekend";
}

export const DemandCharts: React.FC<DemandChartsProps> = ({
  hourly,
  currentHour,
  systemStats,
  dayType,
}) => {
  const fareData = systemStats?.fare_scheme_shares
    ? [
        {
          name: "Vidiyal Payanam (Women Free)",
          value: systemStats.fare_scheme_shares.vidiyal_payanam_women_free,
          color: "#ec4899", // Pink
        },
        {
          name: "Cash Ordinary/Express",
          value: systemStats.fare_scheme_shares.cash_ordinary_and_express,
          color: "#10b981", // Emerald
        },
        {
          name: "UPI Digital Ticketing",
          value: systemStats.fare_scheme_shares.upi_digital_payments,
          color: "#38bdf8", // Sky blue
        },
        {
          name: "NCMC National Card",
          value: systemStats.fare_scheme_shares.ncmc_contactless_card,
          color: "#a855f7", // Purple
        },
        {
          name: "Concessions & Students",
          value: systemStats.fare_scheme_shares.senior_citizen_and_concessions,
          color: "#f59e0b", // Amber
        },
      ]
    : [];

  const depotData = systemStats?.top_depots_by_demand ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. 24-Hour Passenger Boarding Profile */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Chennai Citywide Boarding Demand Curve (05:00 - 23:00)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Derived from 54M historical ETM ticket records (ETM tap-in proxy)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-1 bg-emerald-400 rounded"></span>
              {dayType === "weekday" ? "Weekday Active" : "Weekend Active"}
            </span>
            <span className="flex items-center gap-1.5 text-rose-400/80">
              <span className="w-3 h-1 bg-rose-400/80 rounded border-dashed border"></span>
              Fleet Capacity
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={hourly}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: any, name: any) => [
                  `${Number(value).toLocaleString()} boardings`,
                  name === "weekday_boardings"
                    ? "Weekday Volume"
                    : name === "weekend_boardings"
                    ? "Weekend Volume"
                    : "Fleet Capacity",
                ]}
              />
              <Area
                type="monotone"
                dataKey={
                  dayType === "weekday"
                    ? "weekday_boardings"
                    : "weekend_boardings"
                }
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#demandGrad)"
              />
              <Area
                type="step"
                dataKey="city_capacity"
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="transparent"
              />
              {/* Vertical Indicator for Current Hour */}
              <ReferenceLine
                x={`${currentHour.toString().padStart(2, "0")}:00`}
                stroke="#38bdf8"
                strokeWidth={2}
                label={{
                  value: "Selected Hour",
                  fill: "#38bdf8",
                  fontSize: 11,
                  position: "top",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Morning Peak: 08:00 - 10:30 (35k+ /hr)</span>
          <span>Evening Peak: 17:00 - 19:30 (16k+ /hr)</span>
        </div>
      </div>

      {/* 2. Fare Scheme & Ticketing Mode Share */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            Fare Scheme & Payment Mode
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Key policy impact: Vidiyal Payanam Free Women Bus Pass
          </p>
        </div>

        <div className="h-44 w-full my-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={fareData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
              >
                {fareData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: any) => [`${value}% share`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 text-xs">
          {fareData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate max-w-[170px]">{item.name}</span>
              </span>
              <span className="font-mono font-bold text-white">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Depots by Passenger Tap-ins */}
      <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Top MTC Bus Depots by Commuter Boarding Share
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tambaram, Poonamallee, Vadapalani, and Kilambakkam (KCBT) handle the highest load
            </p>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={depotData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(val: any) => [`${val}% of citywide volume`, "Share"]}
              />
              <Bar dataKey="volume_share" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
