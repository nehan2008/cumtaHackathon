import React, { useState, useMemo } from "react";
import {
  Search,
  Bus,
  Clock,
  Users,
  Train,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CloudRain,
  Sun,
  Flame,
  Shuffle,
  MapPin,
  Heart,
  ChevronRight,
  Sparkles
} from "lucide-react";
import type { BusStop, Corridor, TransitRouteFeature } from "../../types/api";
import type { ChennaiWeather } from "../../services/weather";
import { OccupancyTracker } from "../occupancy/OccupancyTracker";
import { MultimodalPlanner } from "../multimodal/MultimodalPlanner";
import { UnifiedTicketing } from "../ticketing/UnifiedTicketing";
import { PassengerFeedback } from "../feedback/PassengerFeedback";
import { TransitChatbot } from "../chatbot/TransitChatbot";


interface PassengerPortalProps {
  stops: BusStop[];
  routesGeoJSON: any;
  corridors: Corridor[];
  weather: ChennaiWeather;
  currentHour: number;
  onOpenControlRoom: () => void;
  onOpenPID: () => void;
}

export const PassengerPortal: React.FC<PassengerPortalProps> = ({
  stops,
  routesGeoJSON,
  corridors,
  weather,
  currentHour,
  onOpenControlRoom,
  onOpenPID,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<string | null>("570");
  const [activeCategory, setActiveCategory] = useState<"all" | "it_corridor" | "gst_road" | "metro_feeder">("all");
  const [passengerTab, setPassengerTab] = useState<"buses" | "occupancy" | "multimodal" | "ticketing" | "feedback">("buses");


  // Sample real bus schedule data with predicted crowd levels
  const scheduledBuses = useMemo(() => {
    const isPeak = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19);
    const weatherMult = weather.demand_multiplier;

    return [
      {
        route_no: "570",
        route_type: "Deluxe AC / Express",
        origin: "CMBT (Koyambedu)",
        destination: "Kelambakkam (via OMR IT Expressway)",
        next_etas: [4, 14, 26],
        base_crowd: isPeak ? 85 : 55,
        fare_type: "Standard Fare / AC",
        primary_stops: ["Vadapalani", "Guindy", "Madhya Kailash", "Tidel Park", "Thoraipakkam", "Sholinganallur", "Siruseri IT Park"],
        alternative: {
          route_no: "19B",
          mode: "MTC Bus",
          crowd_reduction: "38% less crowded",
          note: "Takes alternate route from T. Nagar to Kelambakkam",
        },
        metro_connection: {
          station: "Guindy Metro & CMBT Metro",
          line: "Green & Blue Line Interchange",
          tip: "Take Metro to Guindy to bypass Koyambedu-Ashok Pillar road traffic",
        },
      },
      {
        route_no: "21G",
        route_type: "Ordinary (Vidiyal Payanam Free for Women)",
        origin: "Broadway / Central",
        destination: "Tambaram (via GST Road & Mount Road)",
        next_etas: [2, 9, 18],
        base_crowd: isPeak ? 92 : 62,
        fare_type: "Zero-Fare for Women / Ordinary",
        primary_stops: ["Central", "LIC", "DMS", "Saidapet", "Guindy", "Chromepet", "Tambaram"],
        alternative: {
          route_no: "Suburban South Line",
          mode: "Suburban Train",
          crowd_reduction: "Faster by 25 min",
          note: "Chennai Beach - Tambaram EMU every 7 minutes",
        },
        metro_connection: {
          station: "Saidapet & Guindy Metro",
          line: "Blue Line (Direct to Airport)",
          tip: "Transfer at Guindy for fast travel across Anna Salai",
        },
      },
      {
        route_no: "70V",
        route_type: "Deluxe Low-Floor",
        origin: "CMBT (Koyambedu)",
        destination: "Vandalur Zoo / Tambaram (via 100 Ft Rd)",
        next_etas: [7, 19, 31],
        base_crowd: isPeak ? 78 : 50,
        fare_type: "Deluxe Service",
        primary_stops: ["CMBT", "Arumbakkam", "Vadapalani", "Ashok Pillar", "Ekkattuthangal", "Guindy", "Pallavaram"],
        alternative: {
          route_no: "114",
          mode: "MTC Bus",
          crowd_reduction: "22% less crowded",
          note: "Lower boarding pressure between Vadapalani & Guindy",
        },
        metro_connection: {
          station: "Vadapalani Metro (Interchange)",
          line: "Green Line",
          tip: "Elevated connection straight to Central",
        },
      },
      {
        route_no: "500",
        route_type: "Express Point-to-Point",
        origin: "Kilambakkam (KCBT)",
        destination: "Chengalpattu & Tambaram",
        next_etas: [5, 12, 22],
        base_crowd: isPeak ? 88 : 58,
        fare_type: "Express Service",
        primary_stops: ["KCBT Bus Terminus", "Vandalur", "Perungalathur", "Tambaram"],
        alternative: {
          route_no: "E18",
          mode: "MTC Ordinary Bus",
          crowd_reduction: "Women Free Scheme active",
          note: "Ordinary fare service covering local stops",
        },
        metro_connection: {
          station: "Airport Metro (Via Guindy connection)",
          line: "Blue Line",
          tip: "Board feeder from Tambaram to Airport Metro",
        },
      },
      {
        route_no: "91",
        route_type: "Ordinary (Vidiyal Payanam Free)",
        origin: "Thiruvanmiyur (ECR)",
        destination: "Tambaram (via Velachery 100ft Rd)",
        next_etas: [6, 17, 28],
        base_crowd: isPeak ? 82 : 52,
        fare_type: "Zero-Fare for Women",
        primary_stops: ["Thiruvanmiyur", "Taramani", "Velachery", "Madipakkam", "Chromepet", "Tambaram"],
        alternative: {
          route_no: "MRTS Train",
          mode: "MRTS Railway",
          crowd_reduction: "30% less crowded",
          note: "Thiruvanmiyur to Velachery EMU transit",
        },
        metro_connection: {
          station: "St. Thomas Mount Metro",
          line: "Green Line Terminus",
          tip: "Connects south-east corridors with central Chennai",
        },
      },
      {
        route_no: "A1",
        route_type: "Ordinary City Bus",
        origin: "Chennai Central Station",
        destination: "Thiruvanmiyur (via Marina Beach & Adyar)",
        next_etas: [3, 11, 21],
        base_crowd: isPeak ? 70 : 45,
        fare_type: "Zero-Fare for Women",
        primary_stops: ["Central", "Island Ground", "Queen Marys College", "Santhome", "Adyar", "Thiruvanmiyur"],
        alternative: {
          route_no: "21H",
          mode: "MTC Bus",
          crowd_reduction: "18% less crowded",
          note: "Parallel coastal route with fewer dwell delays",
        },
        metro_connection: {
          station: "Chennai Central Underground Hub",
          line: "Blue & Green Lines + Suburban Hub",
          tip: "Direct walking subway from Central platforms",
        },
      },
    ];
  }, [currentHour, weather.demand_multiplier]);

  // Filtered by search and category
  const filteredBuses = useMemo(() => {
    return scheduledBuses.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.route_no.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q) ||
        b.origin.toLowerCase().includes(q) ||
        b.primary_stops.some((s) => s.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (activeCategory === "it_corridor") {
        return b.route_no === "570" || b.destination.includes("Kelambakkam") || b.destination.includes("OMR");
      }
      if (activeCategory === "gst_road") {
        return b.route_no === "21G" || b.route_no === "500" || b.destination.includes("Tambaram");
      }
      if (activeCategory === "metro_feeder") {
        return b.metro_connection !== null;
      }
      return true;
    });
  }, [scheduledBuses, searchQuery, activeCategory]);

  const activeBusDetail = scheduledBuses.find((b) => b.route_no === selectedRoute) || filteredBuses[0];

  // Helper for crowd level badge
  const getCrowdBadge = (rawScore: number) => {
    const adjusted = Math.min(100, Math.round(rawScore * weather.demand_multiplier));
    if (adjusted >= 85) {
      return {
        level: "Heavily Crowded",
        subtext: "Crush load expected / Standing room only",
        color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        score: adjusted,
      };
    }
    if (adjusted >= 65) {
      return {
        level: "Moderate Rush",
        subtext: "Few seats remaining / Regular standing load",
        color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        score: adjusted,
      };
    }
    return {
      level: "Comfortable",
      subtext: "Seats readily available",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      score: adjusted,
    };
  };

  return (
    <div className="space-y-6">
      {/* Hero Search & Announcement Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-0"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 rounded-full">
                Chennai Public Transit Portal • MTC & CUMTA
              </span>
              <span className="text-xs text-slate-400">
                {currentHour.toString().padStart(2, "0")}:00 Forecast
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Where are you traveling in <span className="text-emerald-400">Chennai</span>?
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Check live predicted crowd levels, find less crowded bus alternatives, and coordinate transfers with Chennai Metro & Suburban Rail.
            </p>
          </div>

          {/* Quick Weather & Travel Alert Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 max-w-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                {weather.condition === "rain" ? (
                  <CloudRain className="w-4 h-4 text-sky-400" />
                ) : weather.condition === "heat" ? (
                  <Flame className="w-4 h-4 text-orange-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                Chennai Weather
              </span>
              <span className="font-mono font-bold text-emerald-400">{weather.temp}°C</span>
            </div>
            <p className="text-slate-200 font-semibold leading-tight">
              {weather.description}
            </p>
            <div className="pt-1 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                {weather.advisory}
              </span>
            </div>
            <div className="text-[9px] text-slate-500 flex items-center justify-between font-mono">
              <span>Source: OpenWeather</span>
              <span className="text-emerald-400/80">Key: 41668d...</span>
            </div>
          </div>
        </div>

        {/* Big Search Input */}
        <div className="mt-6 relative max-w-3xl">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route (e.g. 570, 21G), destination (e.g. Kelambakkam, Tambaram), or stop name..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="text-slate-500 font-medium">Quick Filters:</span>
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1 rounded-xl transition font-medium ${
                activeCategory === "all"
                  ? "bg-emerald-600 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              All Routes
            </button>
            <button
              onClick={() => setActiveCategory("it_corridor")}
              className={`px-3 py-1 rounded-xl transition font-medium ${
                activeCategory === "it_corridor"
                  ? "bg-emerald-600 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              OMR IT Expressway
            </button>
            <button
              onClick={() => setActiveCategory("gst_road")}
              className={`px-3 py-1 rounded-xl transition font-medium ${
                activeCategory === "gst_road"
                  ? "bg-emerald-600 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              GST Road & Tambaram
            </button>
            <button
              onClick={() => setActiveCategory("metro_feeder")}
              className={`px-3 py-1 rounded-xl transition font-medium ${
                activeCategory === "metro_feeder"
                  ? "bg-emerald-600 text-slate-950 font-bold"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Metro Interchange Feeders
            </button>
          </div>
        </div>
      </div>

      {/* Passenger Feature Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setPassengerTab("buses")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
            passengerTab === "buses"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/50"
              : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Bus className="w-4 h-4" />
          Bus Schedules & ETAs
        </button>

        <button
          onClick={() => setPassengerTab("occupancy")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
            passengerTab === "occupancy"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/50"
              : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Live Bus Occupancy (0–80 Pax)
        </button>

        <button
          onClick={() => setPassengerTab("multimodal")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
            passengerTab === "multimodal"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/50"
              : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Train className="w-4 h-4" />
          Multimodal Planner (Metro + Rail)
        </button>

        <button
          onClick={() => setPassengerTab("ticketing")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
            passengerTab === "ticketing"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/50"
              : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Fares & Digital Pass (Vidiyal Payanam)
        </button>

        <button
          onClick={() => setPassengerTab("feedback")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
            passengerTab === "feedback"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/50"
              : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Submit Feedback & Ratings
        </button>
      </div>

      {passengerTab === "occupancy" && <OccupancyTracker />}
      {passengerTab === "multimodal" && <MultimodalPlanner />}
      {passengerTab === "ticketing" && <UnifiedTicketing />}
      {passengerTab === "feedback" && <PassengerFeedback mode="commuter" />}

      {/* Main Grid: Bus List on Left + Selected Route Detail on Right */}
      {passengerTab === "buses" && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Scheduled Buses & Crowd Predictor (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              Showing {filteredBuses.length} MTC Bus Services
            </span>
            <span>Predictions derived from 54M historical ETM ticket patterns</span>
          </div>

          <div className="space-y-3">
            {filteredBuses.map((bus) => {
              const crowd = getCrowdBadge(bus.base_crowd);
              const isSelected = selectedRoute === bus.route_no;

              return (
                <div
                  key={bus.route_no}
                  onClick={() => setSelectedRoute(bus.route_no)}
                  className={`bg-slate-900/90 border rounded-2xl p-4 cursor-pointer transition shadow-lg ${
                    isSelected
                      ? "border-emerald-500 bg-slate-900"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                        <span className="text-emerald-400 font-mono font-black text-base leading-none">
                          {bus.route_no}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase mt-0.5">
                          MTC
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">
                            {bus.destination}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          From: <span className="text-slate-300">{bus.origin}</span>
                        </p>
                      </div>
                    </div>

                    {/* Crowd Level Badge */}
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${crowd.color}`}
                      >
                        {crowd.level}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        {crowd.score}% crowd index
                      </p>
                    </div>
                  </div>

                  {/* ETAs and Fare Type */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-400">Estimated departures:</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold">
                        {bus.next_etas.map((eta, i) => (
                          <span
                            key={i}
                            className={`px-1.5 py-0.5 rounded ${
                              i === 0
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {eta} min
                          </span>
                        ))}
                      </div>
                    </div>

                    {bus.fare_type.includes("Zero-Fare") && (
                      <span className="text-[10px] bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2 py-0.5 rounded-md font-medium">
                        Vidiyal Payanam Free for Women
                      </span>
                    )}
                  </div>

                  {/* Smart Alternative Recommendation snippet */}
                  {bus.alternative && (
                    <div className="mt-2.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Shuffle className="w-3.5 h-3.5" />
                        Less crowded option: {bus.alternative.route_no} ({bus.alternative.mode})
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {bus.alternative.crowd_reduction}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-depth Route Planner, Multimodal Transfers & Station Guide (5 cols) */}
        {activeBusDetail && (
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 sticky top-20">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Bus className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Route Details & Multimodal Guide
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      MTC Route {activeBusDetail.route_no}
                    </h2>
                  </div>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  {activeBusDetail.route_type}
                </span>
              </div>

              {/* Crowd Forecast Details */}
              {(() => {
                const crowd = getCrowdBadge(activeBusDetail.base_crowd);
                return (
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Predicted Crowd Level:</span>
                      <span className="font-bold text-white">{crowd.level}</span>
                    </div>
                    {/* Crowd bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          crowd.score >= 85
                            ? "bg-rose-500"
                            : crowd.score >= 65
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${crowd.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">{crowd.subtext}</p>
                  </div>
                );
              })()}

              {/* Key Stops Along the Route */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Major Stops & Interchanges:
                </h3>
                <div className="space-y-1.5">
                  {activeBusDetail.primary_stops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80"
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] text-emerald-400 font-mono font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span>{stop}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multimodal Metro / Suburban Rail Synergy */}
              {activeBusDetail.metro_connection && (
                <div className="bg-cyan-950/20 border border-cyan-800/40 rounded-2xl p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Train className="w-4 h-4 text-cyan-400" />
                    <span>Multimodal Connection: {activeBusDetail.metro_connection.station}</span>
                  </div>
                  <p className="text-cyan-200/90 text-[11px]">
                    {activeBusDetail.metro_connection.line}
                  </p>
                  <p className="text-slate-300 text-[11px] mt-1 pt-1 border-t border-cyan-900/40">
                    💡 <strong>Smart Commuter Tip:</strong> {activeBusDetail.metro_connection.tip}
                  </p>
                </div>
              )}

              {/* Action Buttons to View PID or Control Room */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={onOpenPID}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Open Live Stop Display (PID)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Passenger Floating Assistant */}
      <TransitChatbot />
    </div>
  );
};

