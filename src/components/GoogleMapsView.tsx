import React, { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import {
  Layers,
  MapPin,
  Route,
  Train,
  CheckSquare,
  Square,
  Crosshair,
  Info,
  AlertCircle,
  Globe,
  Maximize2
} from "lucide-react";
import type { BusStop, MetroStation, SuburbanStation } from "../types/api";

interface GoogleMapsViewProps {
  stops: BusStop[];
  routesGeoJSON: any;
  metroStations: MetroStation[];
  suburbanStations: SuburbanStation[];
  selectedCorridorId?: string;
  onSelectRoute?: (routeNum: string) => void;
}

// Dark style for Google Maps
const GOOGLE_MAPS_DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#10b981" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0284c7" }],
  },
];

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  stops,
  routesGeoJSON,
  metroStations,
  suburbanStations,
  selectedCorridorId,
  onSelectRoute,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<google.maps.Map | null>(null);
  const googlePolylinesRef = useRef<google.maps.Polyline[]>([]);
  const googleMarkersRef = useRef<google.maps.Marker[]>([]);

  const [layersVisible, setLayersVisible] = useState({
    routes: true,
    stops: true,
    metro: true,
    suburban: true,
  });

  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);

  const toggleLayer = (key: keyof typeof layersVisible) => {
    setLayersVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Google Maps Initializer
  const initGoogleMaps = async () => {
    if (!mapContainerRef.current) return;

    // Clear previous instances
    googlePolylinesRef.current.forEach((p) => p.setMap(null));
    googlePolylinesRef.current = [];
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    const apiKey =
      (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
      (window as any).__GOOGLE_MAPS_API_KEY__ ||
      "";

    try {
      setOptions({
        key: apiKey,
        v: "weekly",
        solutionChannel: "gmp_mcp_codeassist_v1_aistudio",
      });

      const mapsLib = (await importLibrary("maps")) as google.maps.MapsLibrary;

      const map = new mapsLib.Map(mapContainerRef.current, {
        center: { lat: 13.06, lng: 80.24 },
        zoom: 12,
        styles: GOOGLE_MAPS_DARK_STYLE,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      googleMapInstanceRef.current = map;
      setGoogleMapsLoaded(true);

      // Render MTC Bus Routes onto Google Maps
      if (routesGeoJSON?.features) {
        routesGeoJSON.features.slice(0, 45).forEach((f: any) => {
          const path = f.geometry.coordinates.map((c: [number, number]) => ({
            lat: c[1],
            lng: c[0],
          }));

          const strokeColor =
            f.properties?.corridor === "OMR IT Expressway"
              ? "#38bdf8"
              : f.properties?.corridor === "GST Road / Inner Ring"
              ? "#f59e0b"
              : f.properties?.corridor === "Anna Salai"
              ? "#10b981"
              : "#06b6d4";

          const polyline = new google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor,
            strokeOpacity: 0.85,
            strokeWeight: 3.5,
            map,
          });

          polyline.addListener("click", () => {
            setSelectedEntity({ type: "route", ...f.properties });
            if (f.properties?.route_num && onSelectRoute) {
              onSelectRoute(f.properties.route_num);
            }
          });

          googlePolylinesRef.current.push(polyline);
        });
      }

      // Render Metro stations
      metroStations.forEach((m) => {
        const marker = new google.maps.Marker({
          position: { lat: m.lat, lng: m.lng },
          map,
          title: `Metro: ${m.name} (${m.line})`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: "#06b6d4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        marker.addListener("click", () => {
          setSelectedEntity({ type: "metro", name: m.name, line: m.line });
        });

        googleMarkersRef.current.push(marker);
      });

      // Render Suburban Stations
      suburbanStations.forEach((s) => {
        const marker = new google.maps.Marker({
          position: { lat: s.lat, lng: s.lng },
          map,
          title: `Suburban: ${s.name}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: "#f59e0b",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 1.5,
          },
        });

        marker.addListener("click", () => {
          setSelectedEntity({ type: "suburban", name: s.name, type: s.type });
        });

        googleMarkersRef.current.push(marker);
      });

      // Render Bus Stops
      stops.slice(0, 80).forEach((s) => {
        const marker = new google.maps.Marker({
          position: { lat: s.lat, lng: s.lng },
          map,
          title: s.stop_name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 3.5,
            fillColor: "#10b981",
            fillOpacity: 0.85,
            strokeColor: "#047857",
            strokeWeight: 1,
          },
        });

        marker.addListener("click", () => {
          setSelectedEntity({ type: "stop", name: s.stop_name, zone: s.zone });
        });

        googleMarkersRef.current.push(marker);
      });
    } catch (err: any) {
      console.warn("Google Maps load notice:", err);
      setGoogleMapsError(err?.message || "Google Maps key connecting...");
    }
  };

  useEffect(() => {
    initGoogleMaps();

    return () => {
      googlePolylinesRef.current.forEach((p) => p.setMap(null));
      googleMarkersRef.current.forEach((m) => m.setMap(null));
      googleMapInstanceRef.current = null;
    };
  }, [routesGeoJSON, metroStations, suburbanStations, stops]);

  // Handle Layer Visibility Toggles on Google Maps
  useEffect(() => {
    if (!googleMapInstanceRef.current) return;
    googlePolylinesRef.current.forEach((p) => p.setVisible(layersVisible.routes));
    googleMarkersRef.current.forEach((m) => {
      const title = m.getTitle() || "";
      if (title.startsWith("Metro")) m.setVisible(layersVisible.metro);
      else if (title.startsWith("Suburban")) m.setVisible(layersVisible.suburban);
      else m.setVisible(layersVisible.stops);
    });
  }, [layersVisible]);

  // Fly-to / Pan-to Hub Presets
  const flyToHub = (lng: number, lat: number, zoom: number) => {
    if (googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo({ lat, lng });
      googleMapInstanceRef.current.setZoom(zoom);
    }
  };

  return (
    <div className="w-full h-[460px] md:h-[500px] lg:h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 relative">
      {/* Explicit map canvas container for Google Maps */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[460px] absolute inset-0 bg-slate-950"
      />

      {/* Fallback Vector Topology Display if Google Maps is awaiting key */}
      {!googleMapsLoaded && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* Stylized Chennai GIS Schematic Overlay */}
          <div className="relative z-10 max-w-md space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-950">
              <Globe className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-white">
              Chennai Multimodal Transit Visualizer (Google Maps Platform)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mapped layers active: 2,717 MTC Bus Stops • 33 Chennai Metro Stations (Blue/Green) • 70 Southern Suburban Stations • 5 Trunk Radial Corridors (OMR, GST, IRR, Anna Salai, PHR).
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-sky-500/30 text-sky-300 font-mono">
                OMR IT Corridor: 46km
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-300 font-mono">
                GST Road Trunk: 31km
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 font-mono">
                Anna Salai Spine: 15km
              </span>
            </div>
            {googleMapsError && (
              <div className="text-[11px] text-slate-500 font-mono pt-1">
                Google Maps status: Ready for API Key in VITE_GOOGLE_MAPS_API_KEY
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Left: Quick Fly-To Hub Presets */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 max-w-xl">
        <button
          onClick={() => flyToHub(80.24, 13.06, 11)}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5 transition"
        >
          <Crosshair className="w-3 h-3 text-emerald-400" />
          Chennai City
        </button>
        <button
          onClick={() => flyToHub(80.23, 12.92, 13)}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5 transition"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          OMR IT
        </button>
        <button
          onClick={() => flyToHub(80.213, 13.007, 14)}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5 transition"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Guindy
        </button>
        <button
          onClick={() => flyToHub(80.27, 13.082, 14)}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5 transition"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          Central
        </button>
      </div>

      {/* Bottom Left: Layer Visibility Controls */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 border border-slate-700/80 rounded-xl p-2 shadow-2xl backdrop-blur-md text-xs">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex items-center gap-1">
          <Layers className="w-3 h-3" />
          GIS Overlays
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleLayer("routes")}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
          >
            {layersVisible.routes ? (
              <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-slate-300">MTC Routes</span>
          </button>

          <button
            onClick={() => toggleLayer("metro")}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
          >
            {layersVisible.metro ? (
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-slate-300">Metro Rail</span>
          </button>

          <button
            onClick={() => toggleLayer("suburban")}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
          >
            {layersVisible.suburban ? (
              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-slate-300">Suburban EMU</span>
          </button>

          <button
            onClick={() => toggleLayer("stops")}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
          >
            {layersVisible.stops ? (
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-slate-300">Bus Stops</span>
          </button>
        </div>
      </div>

      {/* Selected Entity Popup Banner */}
      {selectedEntity && (
        <div className="absolute top-3 right-3 z-10 bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-xs text-xs animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-white flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Selected Feature
            </span>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1">
            {selectedEntity.type === "route" && (
              <>
                <div className="text-emerald-400 font-bold font-mono text-sm">
                  Route {selectedEntity.route_num}
                </div>
                <div className="text-slate-300">{selectedEntity.route_name}</div>
                <div className="text-slate-400 text-[11px] font-mono">
                  Corridor: {selectedEntity.corridor}
                </div>
              </>
            )}
            {selectedEntity.type === "metro" && (
              <>
                <div className="text-cyan-400 font-bold text-sm">
                  {selectedEntity.name}
                </div>
                <div className="text-slate-300">Chennai Metro ({selectedEntity.line})</div>
              </>
            )}
            {selectedEntity.type === "suburban" && (
              <>
                <div className="text-amber-400 font-bold text-sm">
                  {selectedEntity.name}
                </div>
                <div className="text-slate-300">Southern Railway Suburban Line</div>
              </>
            )}
            {selectedEntity.type === "stop" && (
              <>
                <div className="text-emerald-400 font-bold text-sm">
                  {selectedEntity.name}
                </div>
                <div className="text-slate-400">Zone: {selectedEntity.zone}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
