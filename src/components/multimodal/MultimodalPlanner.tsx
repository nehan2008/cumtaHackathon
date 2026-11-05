import React, { useState } from "react";
import {
  type InterchangeHub,
  type MultimodalTripPlan,
  type TransitMode,
} from "../../types/multimodal";
import {
  Train,
  Bus,
  ArrowRight,
  Clock,
  IndianRupee,
  MapPin,
  Leaf,
  Layers,
  Sparkles,
  CheckCircle2,
  Navigation,
} from "lucide-react";

const CHENNAI_INTERCHANGE_HUBS: InterchangeHub[] = [
  {
    id: "hub-guindy",
    name: "Guindy Multimodal Interchange",
    tamilName: "கிண்டி சந்திப்பு",
    modes: ["MTC_BUS", "CHENNAI_METRO", "SUBURBAN_RAIL"],
    metroLine: "Blue Line",
    suburbanCorridor: "Chennai Beach - Tambaram - Chengalpattu",
    busBaysCount: 18,
    dailyFootfall: 145000,
    averageTransferTimeMin: 4,
    amenities: ["Sheltered Walkway", "NCMC Card Gates", "Escalators", "Prepaid Auto Bay"],
    lat: 13.007,
    lng: 80.213,
  },
  {
    id: "hub-central",
    name: "Chennai Central / Puratchi Thalaivar Dr. M.G.R.",
    tamilName: "சென்னை சென்ட்ரல்",
    modes: ["MTC_BUS", "CHENNAI_METRO", "SUBURBAN_RAIL"],
    metroLine: "Both Lines",
    suburbanCorridor: "Moore Market Complex & Suburban Central",
    busBaysCount: 32,
    dailyFootfall: 380000,
    averageTransferTimeMin: 6,
    amenities: ["Underground Subways", "Travelators", "Cloakrooms", "Wheelchair Access"],
    lat: 13.0827,
    lng: 80.2707,
  },
  {
    id: "hub-cmbt",
    name: "Puratchi Thalaivar Dr. MGR Bus Terminus (CMBT Koyambedu)",
    tamilName: "கோயம்பேடு பேருந்து நிலையம்",
    modes: ["MTC_BUS", "CHENNAI_METRO"],
    metroLine: "Green Line",
    busBaysCount: 64,
    dailyFootfall: 210000,
    averageTransferTimeMin: 5,
    amenities: ["Direct Elevated Metro Link", "24/7 Ticketing", "Rest Lounges"],
    lat: 13.067,
    lng: 80.203,
  },
  {
    id: "hub-tambaram",
    name: "Tambaram South Terminal & Station",
    tamilName: "தாம்பரம் சந்திப்பு",
    modes: ["MTC_BUS", "SUBURBAN_RAIL"],
    suburbanCorridor: "Main Southern Suburban Trunk Line",
    busBaysCount: 28,
    dailyFootfall: 240000,
    averageTransferTimeMin: 5,
    amenities: ["Bus-Rail Skywalk", "Cycle Parking", "Digital PIS Boards"],
    lat: 12.924,
    lng: 80.128,
  },
  {
    id: "hub-airport",
    name: "Chennai International Airport T1/T2",
    tamilName: "சென்னை விமான நிலையம்",
    modes: ["MTC_BUS", "CHENNAI_METRO", "SUBURBAN_RAIL"],
    metroLine: "Blue Line",
    suburbanCorridor: "Tirusulam Suburban Station (Subway link)",
    busBaysCount: 10,
    dailyFootfall: 75000,
    averageTransferTimeMin: 7,
    amenities: ["Air-conditioned Tube", "Luggage Carts", "Trolley Escalators"],
    lat: 12.981,
    lng: 80.164,
  },
];

const PRE_CALCULATED_TRIPS: MultimodalTripPlan[] = [
  {
    id: "trip-1",
    title: "OMR IT Corridor to Chennai Central via Guindy Hub",
    totalDurationMin: 44,
    totalFareInr: 45,
    totalDistanceKm: 18.5,
    interchangeHubs: ["Guindy Multimodal Interchange"],
    co2SavedKg: 2.8,
    segments: [
      {
        mode: "MTC_BUS",
        lineOrRoute: "Route 570 (Feeder Express)",
        fromStationOrStop: "Thoraipakkam (OMR)",
        toStationOrStop: "Guindy Multimodal Interchange",
        durationMin: 22,
        fareInr: 15,
        distanceKm: 8.5,
        crowdLevel: "MODERATE",
      },
      {
        mode: "CHENNAI_METRO",
        lineOrRoute: "Blue Line (Direct to Central)",
        fromStationOrStop: "Guindy Metro",
        toStationOrStop: "Puratchi Thalaivar Dr. M.G.R. Central",
        durationMin: 18,
        fareInr: 30,
        distanceKm: 10.0,
        crowdLevel: "AVAILABLE",
      },
    ],
  },
  {
    id: "trip-2",
    title: "Tambaram to Tidel Park (IT Park Corridor)",
    totalDurationMin: 38,
    totalFareInr: 20,
    totalDistanceKm: 16.2,
    interchangeHubs: ["Guindy / Velachery MRTS Link"],
    co2SavedKg: 2.4,
    segments: [
      {
        mode: "SUBURBAN_RAIL",
        lineOrRoute: "Southern Railway EMU (Fast Local)",
        fromStationOrStop: "Tambaram Station",
        toStationOrStop: "Guindy Railway Station",
        durationMin: 20,
        fareInr: 5,
        distanceKm: 11.2,
        crowdLevel: "CROWDED",
      },
      {
        mode: "MTC_BUS",
        lineOrRoute: "MTC Route 19B (Electric Feeder)",
        fromStationOrStop: "Guindy Bus Bay 4",
        toStationOrStop: "Tidel Park / Thiruvanmiyur",
        durationMin: 15,
        fareInr: 15,
        distanceKm: 5.0,
        crowdLevel: "MODERATE",
      },
    ],
  },
  {
    id: "trip-3",
    title: "Koyambedu CMBT to Airport via Green & Blue Metro Lines",
    totalDurationMin: 32,
    totalFareInr: 40,
    totalDistanceKm: 14.8,
    interchangeHubs: ["Alandur Interchange"],
    co2SavedKg: 2.9,
    segments: [
      {
        mode: "CHENNAI_METRO",
        lineOrRoute: "Green Line (Transfer at Alandur)",
        fromStationOrStop: "CMBT Station",
        toStationOrStop: "Alandur Elevated Interchange",
        durationMin: 18,
        fareInr: 25,
        distanceKm: 9.2,
        crowdLevel: "AVAILABLE",
      },
      {
        mode: "CHENNAI_METRO",
        lineOrRoute: "Blue Line (Direct Airport Link)",
        fromStationOrStop: "Alandur Interchange",
        toStationOrStop: "Chennai International Airport",
        durationMin: 10,
        fareInr: 15,
        distanceKm: 5.6,
        crowdLevel: "AVAILABLE",
      },
    ],
  },
];

export const MultimodalPlanner: React.FC = () => {
  const [selectedHub, setSelectedHub] = useState<InterchangeHub>(CHENNAI_INTERCHANGE_HUBS[0]);
  const [selectedTrip, setSelectedTrip] = useState<MultimodalTripPlan>(PRE_CALCULATED_TRIPS[0]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Multimodal Transport Integration (Bus + Metro + Suburban Rail)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              CUMTA unified network connector linking 1,348 MTC bus routes, 33 Chennai Metro stations, and 70 suburban railway stations with coordinated transfers.
            </p>
          </div>
        </div>
      </div>

      {/* Major Interchange Hubs Carousel / Selector */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          Chennai Metropolitan Major Interchange Hubs
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CHENNAI_INTERCHANGE_HUBS.map((hub) => (
            <button
              key={hub.id}
              onClick={() => setSelectedHub(hub)}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                selectedHub.id === hub.id
                  ? "bg-slate-800 border-emerald-500/80 shadow-lg shadow-emerald-950/40"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold block">
                  {hub.tamilName}
                </span>
                <h4 className="font-bold text-white text-xs mt-1 leading-snug line-clamp-2">
                  {hub.name}
                </h4>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>{hub.busBaysCount} Bus Bays</span>
                <span className="font-mono text-cyan-400 font-bold">~{hub.averageTransferTimeMin}m walk</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Hub Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{selectedHub.name}</h3>
              <span className="text-xs text-emerald-400 font-medium">({selectedHub.tamilName})</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily Multimodal Footfall: <strong className="text-white font-mono">{selectedHub.dailyFootfall.toLocaleString()} passengers</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedHub.modes.map((m) => (
              <span
                key={m}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                  m === "MTC_BUS"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : m === "CHENNAI_METRO"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {m === "MTC_BUS" ? (
                  <Bus className="w-3.5 h-3.5" />
                ) : m === "CHENNAI_METRO" ? (
                  <Layers className="w-3.5 h-3.5" />
                ) : (
                  <Train className="w-3.5 h-3.5" />
                )}
                {m === "MTC_BUS"
                  ? "MTC Buses"
                  : m === "CHENNAI_METRO"
                  ? "Chennai Metro"
                  : "Suburban EMU"}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">Metro Connection</span>
            <span className="text-white font-bold">{selectedHub.metroLine || "Feeder Bus Connection"}</span>
            <p className="text-slate-400 text-[11px]">Direct automated fare gate sync with NCMC cards</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">Suburban Rail Line</span>
            <span className="text-white font-bold">{selectedHub.suburbanCorridor || "None"}</span>
            <p className="text-slate-400 text-[11px]">High frequency 8-car and 12-car suburban local trains</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">Passenger Amenities</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedHub.amenities.map((a) => (
                <span key={a} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sample Multimodal Trip Plans */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Optimal Seamless Multimodal Itineraries (CUMTA Route Engine)
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {PRE_CALCULATED_TRIPS.map((trip) => {
            const isSelected = selectedTrip.id === trip.id;

            return (
              <div
                key={trip.id}
                onClick={() => setSelectedTrip(trip)}
                className={`cursor-pointer p-5 rounded-2xl border transition flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-950/40"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <h4 className="font-bold text-white text-sm leading-snug">{trip.title}</h4>

                  {/* High level stats */}
                  <div className="flex items-center gap-3 my-3 text-xs">
                    <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {trip.totalDurationMin} mins
                    </span>
                    <span className="flex items-center gap-1 font-mono text-white font-bold">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                      ₹{trip.totalFareInr}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-cyan-400">
                      <Leaf className="w-3.5 h-3.5" />
                      -{trip.co2SavedKg}kg CO₂
                    </span>
                  </div>

                  {/* Segments Step-by-Step */}
                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    {trip.segments.map((seg, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            {seg.mode === "MTC_BUS" ? (
                              <Bus className="w-3.5 h-3.5" />
                            ) : seg.mode === "CHENNAI_METRO" ? (
                              <Layers className="w-3.5 h-3.5 text-cyan-400" />
                            ) : (
                              <Train className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            {seg.lineOrRoute}
                          </span>
                          <span className="font-mono text-slate-300">₹{seg.fareInr}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>
                            {seg.fromStationOrStop} → {seg.toStationOrStop}
                          </span>
                          <span className="font-mono">{seg.durationMin}m</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Transfer Hub: <strong>{trip.interchangeHubs[0]}</strong></span>
                  <span className="text-emerald-400 font-semibold">View Details →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
