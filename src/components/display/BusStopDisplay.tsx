import React, { useState, useEffect } from "react";
import {
  Clock,
  Bus,
  Train,
  ArrowRight,
  CloudRain,
  Sun,
  Flame,
  Shuffle,
  MapPin,
  RefreshCw,
  Maximize2,
  Lock
} from "lucide-react";
import type { BusStop } from "../../types/api";
import type { ChennaiWeather } from "../../services/weather";

interface BusStopDisplayProps {
  stops: BusStop[];
  weather: ChennaiWeather;
  onExit: () => void;
  onLockTerminal?: () => void;
}

export const BusStopDisplay: React.FC<BusStopDisplayProps> = ({
  stops,
  weather,
  onExit,
  onLockTerminal,
}) => {
  const [selectedHub, setSelectedHub] = useState<string>("GUINDY_INTERCHANGE");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Live second-by-second clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hub schedules configuration
  const hubData: Record<
    string,
    {
      name_en: string;
      name_ta: string;
      bay_code: string;
      terminal_info: string;
      services: {
        route_no: string;
        destination_en: string;
        destination_ta: string;
        via: string;
        bay: string;
        seconds_left: number;
        crowd_level: "LOW" | "MODERATE" | "HIGH" | "CRUSH";
        crowd_pct: number;
        service_type: "ORDINARY" | "DELUXE AC" | "EXPRESS";
        alternative?: string;
        rail_connection?: string;
      }[];
    }
  > = {
    GUINDY_INTERCHANGE: {
      name_en: "GUINDY MULTIMODAL INTERCHANGE",
      name_ta: "கிண்டி ஒருங்கிணைந்த போக்குவரத்து மையம்",
      bay_code: "BAY PLATFORM 1 & 2",
      terminal_info: "Connects MTC City Bus • Chennai Metro Blue Line • Southern Suburban Railway",
      services: [
        {
          route_no: "570",
          destination_en: "KELAMBAKKAM / OMR IT EXPRESSWAY",
          destination_ta: "கேளம்பாக்கம் / ஓ.எம்.ஆர்",
          via: "Tidel Park • Sholinganallur • Siruseri",
          bay: "BAY 1A",
          seconds_left: 145, // ~2 min
          crowd_level: "HIGH",
          crowd_pct: 88,
          service_type: "DELUXE AC",
          alternative: "Alt: 19B from Bay 2 has seats available",
          rail_connection: "Metro Blue Line to Wimco Nagar in 3 min",
        },
        {
          route_no: "21G",
          destination_en: "TAMBARAM BUS TERMINUS",
          destination_ta: "தாம்பரம் பேருந்து நிலையம்",
          via: "Kathipara • Chromepet • Sanatorium",
          bay: "BAY 1B",
          seconds_left: 310, // ~5 min
          crowd_level: "CRUSH",
          crowd_pct: 94,
          service_type: "ORDINARY",
          alternative: "Suburban EMU on Platform 3 (Tambaram in 18 min)",
          rail_connection: "Suburban South Line every 6 min",
        },
        {
          route_no: "70V",
          destination_en: "CMBT KOYAMBEDU TERMINUS",
          destination_ta: "கோயம்பேடு பேருந்து நிலையம்",
          via: "Ashok Pillar • Vadapalani • 100 Ft Rd",
          bay: "BAY 2A",
          seconds_left: 480, // ~8 min
          crowd_level: "MODERATE",
          crowd_pct: 65,
          service_type: "DELUXE AC",
          alternative: "Green Line Metro to CMBT in 14 min (No road traffic)",
          rail_connection: "Metro Green Line Platform 1",
        },
        {
          route_no: "A1",
          destination_en: "M.G.R. CHENNAI CENTRAL",
          destination_ta: "எம்.ஜி.ஆர் சென்னை சென்ட்ரல்",
          via: "Saidapet • DMS • LIC • Anna Salai",
          bay: "BAY 2B",
          seconds_left: 690, // ~11 min
          crowd_level: "LOW",
          crowd_pct: 42,
          service_type: "ORDINARY",
          rail_connection: "Direct direct Blue Line Metro to Central in 16 min",
        },
        {
          route_no: "119",
          destination_en: "CHEMMANCHERY S.C.B.",
          destination_ta: "செம்மஞ்சேரி",
          via: "Velachery • Thoraipakkam • Navalur",
          bay: "BAY 3A",
          seconds_left: 920, // ~15 min
          crowd_level: "MODERATE",
          crowd_pct: 68,
          service_type: "ORDINARY",
        },
      ],
    },
    CMBT_KOYAMBEDU: {
      name_en: "PURATCHI THALAIVAR DR. M.G.R. BUS TERMINUS (CMBT)",
      name_ta: "புரட்சி தலைவர் டாக்டர் எம்.ஜி.ஆர் பேருந்து நிலையம் (கோயம்பேடு)",
      bay_code: "CITY BUS DEPARTURE WING",
      terminal_info: "Main City Interchange • Chennai Metro Green Line",
      services: [
        {
          route_no: "570",
          destination_en: "SIRUSERI IT PARK / KELAMBAKKAM",
          destination_ta: "சிறுசேரி ஐடி பார்க் / கேளம்பாக்கம்",
          via: "Vadapalani • Guindy • Madhya Kailash • OMR",
          bay: "BAY 4",
          seconds_left: 180,
          crowd_level: "HIGH",
          crowd_pct: 86,
          service_type: "DELUXE AC",
          alternative: "Take Metro to Guindy for shuttle connection",
        },
        {
          route_no: "70V",
          destination_en: "VANDALUR ZOO / KILAMBAKKAM KCBT",
          destination_ta: "வண்டலூர் உயிரியல் பூங்கா / கிளாம்பாக்கம்",
          via: "100 Ft Rd • Guindy • Tambaram",
          bay: "BAY 5",
          seconds_left: 420,
          crowd_level: "HIGH",
          crowd_pct: 82,
          service_type: "EXPRESS",
        },
        {
          route_no: "114",
          destination_en: "RED HILLS / MOOLAKADAI",
          destination_ta: "செங்குன்றம் / மூலக்கடை",
          via: "Thirumangalam • Kolathur • Retteri",
          bay: "BAY 6",
          seconds_left: 640,
          crowd_level: "MODERATE",
          crowd_pct: 58,
          service_type: "ORDINARY",
        },
        {
          route_no: "48C",
          destination_en: "AYANAVARAM / PERAMBUR",
          destination_ta: "அயனாவரம் / பெரம்பூர்",
          via: "Anna Nagar • Nathamuni • ICF",
          bay: "BAY 7",
          seconds_left: 890,
          crowd_level: "LOW",
          crowd_pct: 38,
          service_type: "ORDINARY",
        },
      ],
    },
    TAMBARAM_SANATORIUM: {
      name_en: "TAMBARAM SANATORIUM MEGAPLEX",
      name_ta: "தாம்பரம் சானடோரியம் பேருந்து மையம்",
      bay_code: "GST ROAD PLATFORMS",
      terminal_info: "Southern Corridor Trunk • Connecting Chengalpattu & KCBT",
      services: [
        {
          route_no: "500",
          destination_en: "KILAMBAKKAM TERMINUS (KCBT)",
          destination_ta: "கிளாம்பாக்கம் பேருந்து முனையம்",
          via: "Perungalathur • Vandalur",
          bay: "BAY 1",
          seconds_left: 120,
          crowd_level: "CRUSH",
          crowd_pct: 95,
          service_type: "EXPRESS",
          alternative: "Board Suburban Train to Vandalur directly",
        },
        {
          route_no: "21G",
          destination_en: "BROADWAY / HIGH COURT",
          destination_ta: "பாரிமுனை / உயர் நீதிமன்றம்",
          via: "Chromepet • Guindy • DMS • Central",
          bay: "BAY 2",
          seconds_left: 360,
          crowd_level: "HIGH",
          crowd_pct: 89,
          service_type: "ORDINARY",
        },
        {
          route_no: "91",
          destination_en: "THIRUVANMIYUR / ECR",
          destination_ta: "திருவான்மியூர் / ஈ.சி.ஆர்",
          via: "Pallavaram • Velachery • Taramani",
          bay: "BAY 3",
          seconds_left: 540,
          crowd_level: "MODERATE",
          crowd_pct: 64,
          service_type: "ORDINARY",
        },
      ],
    },
  };

  const currentHub = hubData[selectedHub] || hubData.GUINDY_INTERCHANGE;

  // Format countdown string
  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 60) {
      return (
        <span className="text-rose-400 font-black animate-pulse text-xl">
          BOARDING NOW
        </span>
      );
    }
    const mins = Math.floor(totalSeconds / 60);
    return (
      <span className="font-mono text-2xl font-black text-amber-400">
        {mins} <span className="text-sm font-sans text-amber-200">MIN</span>
      </span>
    );
  };

  const getCrowdColor = (level: string) => {
    switch (level) {
      case "CRUSH":
        return "bg-rose-600 text-white border-rose-500";
      case "HIGH":
        return "bg-orange-500 text-slate-950 font-bold border-orange-400";
      case "MODERATE":
        return "bg-amber-400 text-slate-950 font-bold border-amber-300";
      default:
        return "bg-emerald-500 text-slate-950 font-bold border-emerald-400";
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#05070c] text-white flex flex-col font-sans select-none p-3 sm:p-6">
      {/* Top Header: Station Name, Live Clock, Weather Badge, and Terminal Info */}
      <header className="bg-slate-950 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded">
                DEPARTURES
              </span>
              <span className="text-xs font-mono text-amber-400">
                {currentHub.bay_code}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase font-mono">
              {currentHub.name_en}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-amber-400/90 font-serif">
              {currentHub.name_ta}
            </p>
          </div>

          {/* Clock & Weather Pill */}
          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl shadow-inner">
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                CHENNAI TIME (IST)
              </div>
              <div className="text-2xl sm:text-4xl font-mono font-black text-amber-400 tracking-wider">
                {currentTime.toLocaleTimeString("en-IN", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
            </div>

            <div className="border-l border-slate-800 pl-4 text-xs space-y-0.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                {weather.condition === "rain" ? (
                  <CloudRain className="w-4 h-4 text-sky-400" />
                ) : weather.condition === "heat" ? (
                  <Flame className="w-4 h-4 text-orange-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span>{weather.temp}°C</span>
                <span className="text-[9px] text-emerald-400 font-mono font-normal bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-800/40">
                  OpenWeather
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {weather.description}
              </p>
            </div>

            {/* Quick Exit / Fullscreen Controls */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
              <button
                onClick={toggleFullscreen}
                title="Toggle Fullscreen Display"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onExit}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
              >
                Exit Board
              </button>
              {onLockTerminal && (
                <button
                  onClick={onLockTerminal}
                  title="Lock PID Terminal Station Display"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-xs font-bold text-rose-300 border border-rose-900/40 transition flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock PID</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hub Selector Bar for Demonstration / Terminal Attendant */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">
              Switch Terminal Display:
            </span>
            {Object.keys(hubData).map((hubKey) => (
              <button
                key={hubKey}
                onClick={() => setSelectedHub(hubKey)}
                className={`px-3 py-1 rounded-lg transition font-mono font-bold ${
                  selectedHub === hubKey
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {hubKey.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="text-slate-400 text-[11px] font-mono">
            REFRESH RATE: LIVE (1s) • SATELLITE & ETM SYNCHRONIZED
          </div>
        </div>
      </header>

      {/* Main High-Legibility Display Table */}
      <main className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Table Header Row */}
        <div className="grid grid-cols-12 gap-2 bg-slate-900/90 border-b-2 border-slate-800 px-6 py-3.5 text-xs font-mono font-black uppercase tracking-wider text-slate-400">
          <div className="col-span-2">ROUTE</div>
          <div className="col-span-4">DESTINATION (சேருமிடம்)</div>
          <div className="col-span-1 text-center">BAY</div>
          <div className="col-span-2 text-center">ETA</div>
          <div className="col-span-3">CROWD STATUS & ALTERNATIVES</div>
        </div>

        {/* Table Body: Large Spacious Rows */}
        <div className="divide-y-2 divide-slate-900/80 flex-1">
          {currentHub.services.map((service, index) => (
            <div
              key={index}
              className={`grid grid-cols-12 gap-2 items-center px-6 py-5 transition ${
                index % 2 === 0 ? "bg-slate-950" : "bg-slate-900/40"
              } hover:bg-slate-900/80`}
            >
              {/* Route Number Badge */}
              <div className="col-span-2 flex items-center gap-3">
                <span className="w-16 h-12 rounded-xl bg-slate-900 border-2 border-emerald-500/40 flex items-center justify-center font-mono font-black text-2xl text-emerald-400 shadow-md">
                  {service.route_no}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {service.service_type}
                </span>
              </div>

              {/* Destination */}
              <div className="col-span-4 space-y-0.5">
                <div className="text-lg sm:text-xl font-black text-white tracking-wide uppercase font-mono">
                  {service.destination_en}
                </div>
                <div className="text-xs text-amber-400/90 font-serif">
                  {service.destination_ta}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  VIA: {service.via}
                </div>
              </div>

              {/* Bay / Platform */}
              <div className="col-span-1 text-center">
                <span className="inline-block font-mono font-black text-lg bg-slate-900 text-cyan-300 border border-cyan-800 px-2.5 py-1 rounded-xl">
                  {service.bay}
                </span>
              </div>

              {/* Countdown / Arrival Time */}
              <div className="col-span-2 text-center">
                {formatCountdown(service.seconds_left)}
              </div>

              {/* Crowd Indicator & Smart Multimodal Rail Alternative */}
              <div className="col-span-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCrowdColor(
                      service.crowd_level
                    )}`}
                  >
                    {service.crowd_level} ({service.crowd_pct}%)
                  </span>
                  <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        service.crowd_pct >= 90
                          ? "bg-rose-500"
                          : service.crowd_pct >= 70
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      }`}
                      style={{ width: `${service.crowd_pct}%` }}
                    />
                  </div>
                </div>

                {service.alternative && (
                  <div className="text-[11px] text-emerald-300 flex items-center gap-1.5 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
                    <Shuffle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{service.alternative}</span>
                  </div>
                )}

                {service.rail_connection && (
                  <div className="text-[11px] text-cyan-300 flex items-center gap-1.5 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/50">
                    <Train className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="truncate">{service.rail_connection}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Announcement Ticker */}
        <footer className="bg-amber-500 text-slate-950 px-6 py-2.5 font-mono text-xs font-black flex items-center justify-between tracking-wide">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
              CUMTA TRANSIT ANNOUNCEMENT
            </span>
            <span>
              {weather.condition === "rain"
                ? "⚠️ MONSOON WEATHER ADVISORY: HEAVY RAIN EXPECTED ALONG GST ROAD & OMR. EXTRA MTC SHUTTLES DISPATCHED FROM GUINDY."
                : weather.condition === "heat"
                ? "☀️ HEATWAVE PROTOCOL: WATER STATIONS OPEN AT ALL BAYS. AC METRO TRANSFERS RECOMMENDED FOR PEAK HOURS."
                : "✅ NORMAL OPERATIONS: ALL MTC CORRIDORS AND METRO INTERCHANGES RUNNING ON REGULAR HEADWAYS."}
            </span>
          </div>
          <div className="hidden sm:block text-[11px] font-bold">
            CUMTA • MTC CHENNAI
          </div>
        </footer>
      </main>
    </div>
  );
};
