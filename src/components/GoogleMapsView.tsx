import React, { useEffect, useRef, useState, useMemo } from "react";
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
  Maximize2,
  Key,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import type { BusStop, MetroStation, SuburbanStation } from "../types/api";
import type { DriverIncidentReport } from "../types/communication";

interface GoogleMapsViewProps {
  stops: BusStop[];
  routesGeoJSON: any;
  metroStations: MetroStation[];
  suburbanStations: SuburbanStation[];
  incidents?: DriverIncidentReport[];
  selectedCorridorId?: string;
  onSelectRoute?: (routeNum: string) => void;
  onSelectIncident?: (inc: DriverIncidentReport) => void;
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

// Chennai Bounding Box for Vector Projection
const CHENNAI_BOUNDS = {
  minLat: 12.80,
  maxLat: 13.22,
  minLng: 80.05,
  maxLng: 80.32,
};

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  stops,
  routesGeoJSON,
  metroStations,
  suburbanStations,
  incidents = [],
  selectedCorridorId,
  onSelectRoute,
  onSelectIncident,
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
    incidents: true,
  });

  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [showKeyConfigModal, setShowKeyConfigModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");

  // Vector Canvas Pan & Zoom State for robust fallback interaction
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const toggleLayer = (key: keyof typeof layersVisible) => {
    setLayersVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Get configured Google Maps API Key
  const getEffectiveApiKey = (): string => {
    return (
      customApiKey.trim() ||
      sessionStorage.getItem("VITE_GOOGLE_MAPS_API_KEY") ||
      (window as any).__GOOGLE_MAPS_API_KEY__ ||
      (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
      ""
    ).trim();
  };

  // Google Maps Initializer
  const initGoogleMaps = async () => {
    const apiKey = getEffectiveApiKey();

    // If key is empty or placeholder, do NOT trigger the Google Maps SDK
    // to avoid the gray "This page can't load Google Maps correctly" alert.
    if (!apiKey || apiKey === "MY_GOOGLE_MAPS_API_KEY" || apiKey === "YOUR_API_KEY") {
      setGoogleMapsLoaded(false);
      return;
    }

    if (!mapContainerRef.current) return;

    // Listen for authentication failures (invalid key, unlinked billing, referrer restriction)
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps Platform: gm_authFailure received (billing or key restriction issue).");
      setAuthError(true);
      setGoogleMapsLoaded(false);
    };

    // Clear previous instances
    googlePolylinesRef.current.forEach((p) => p.setMap(null));
    googlePolylinesRef.current = [];
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    try {
      setOptions({
        key: apiKey,
        v: "weekly",
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
      setAuthError(false);

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
              : f.properties?.corridor === "GST Road Trunk"
              ? "#f59e0b"
              : f.properties?.corridor === "Inner Ring Road"
              ? "#a855f7"
              : f.properties?.corridor === "Anna Salai Arterial"
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
            setSelectedEntity({
              type: "route",
              route_num: f.properties?.route_num,
              route_name: f.properties?.route_name,
              corridor: f.properties?.corridor,
            });
            onSelectRoute?.(f.properties?.route_num);
          });

          googlePolylinesRef.current.push(polyline);
        });
      }

      // Render Chennai Metro Rail Stations
      metroStations.forEach((s) => {
        const marker = new google.maps.Marker({
          position: { lat: s.lat, lng: s.lng },
          map,
          title: `Metro: ${s.name}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5.5,
            fillColor: s.line === "Blue Line" ? "#0284c7" : "#16a34a",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        marker.addListener("click", () => {
          setSelectedEntity({ type: "metro", name: s.name, line: s.line });
        });

        googleMarkersRef.current.push(marker);
      });

      // Render Southern Railway Suburban Stations
      suburbanStations.forEach((s) => {
        const marker = new google.maps.Marker({
          position: { lat: s.lat, lng: s.lng },
          map,
          title: `Suburban: ${s.name}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 4.5,
            fillColor: "#f59e0b",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 1.5,
          },
        });

        marker.addListener("click", () => {
          setSelectedEntity({ type: "suburban", name: s.name, suburbanType: s.type });
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

      // Render Active Incident Alert Markers
      incidents.forEach((inc) => {
        let lat = 13.0035;
        let lng = 80.2014;
        const locLower = (inc.location || "").toLowerCase();
        const corr = inc.corridorId;

        if (locLower.includes("alandur") || corr === "corridor_gst") {
          lat = 13.0035; lng = 80.2014;
        } else if (locLower.includes("velachery")) {
          lat = 12.9782; lng = 80.2185;
        } else if (locLower.includes("tidel") || corr === "corridor_omr") {
          lat = 12.9897; lng = 80.2483;
        } else if (locLower.includes("vadapalani") || corr === "corridor_irr") {
          lat = 13.0514; lng = 80.2121;
        } else if (locLower.includes("central") || corr === "corridor_anna_salai") {
          lat = 13.0827; lng = 80.2707;
        }

        const isCritical = inc.severity === "CRITICAL" || inc.severity === "HIGH";
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map,
          title: `Incident: Route ${inc.routeNum} - ${inc.category}`,
          zIndex: 9999,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: isCritical ? "#ef4444" : "#f59e0b",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            rotation: 180,
          },
        });

        marker.addListener("click", () => {
          setSelectedEntity({ type: "incident", incident: inc });
          onSelectIncident?.(inc);
        });

        googleMarkersRef.current.push(marker);
      });
    } catch (err: any) {
      console.warn("Google Maps load notice:", err);
      setAuthError(true);
      setGoogleMapsLoaded(false);
    }
  };

  useEffect(() => {
    initGoogleMaps();

    // ResizeObserver to trigger Google Maps resize when container expands or tab changes
    const observer = new ResizeObserver(() => {
      if (googleMapInstanceRef.current && window.google?.maps) {
        google.maps.event.trigger(googleMapInstanceRef.current, "resize");
      }
    });

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }

    return () => {
      observer.disconnect();
      googlePolylinesRef.current.forEach((p) => p.setMap(null));
      googleMarkersRef.current.forEach((m) => m.setMap(null));
      googleMapInstanceRef.current = null;
    };
  }, [routesGeoJSON, metroStations, suburbanStations, stops, incidents, customApiKey]);

  // Handle Layer Visibility Toggles on Google Maps
  useEffect(() => {
    if (!googleMapInstanceRef.current) return;
    googlePolylinesRef.current.forEach((p) => p.setVisible(layersVisible.routes));
    googleMarkersRef.current.forEach((m) => {
      const title = m.getTitle() || "";
      if (title.startsWith("Incident")) m.setVisible(layersVisible.incidents);
      else if (title.startsWith("Metro")) m.setVisible(layersVisible.metro);
      else if (title.startsWith("Suburban")) m.setVisible(layersVisible.suburban);
      else m.setVisible(layersVisible.stops);
    });
  }, [layersVisible]);

  // Fly-to / Pan-to Hub Presets
  const flyToHub = (lng: number, lat: number, zoom: number) => {
    if (googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo({ lat, lng });
      googleMapInstanceRef.current.setZoom(zoom);
    } else {
      // Pan vector fallback
      const projected = projectGeoToCanvas(lat, lng, 600, 480);
      setPanOffset({
        x: (300 - projected.x) * zoomLevel,
        y: (240 - projected.y) * zoomLevel,
      });
    }
  };

  // Convert (Lat, Lng) to SVG Canvas (X, Y)
  const projectGeoToCanvas = (lat: number, lng: number, width = 600, height = 480) => {
    const x = ((lng - CHENNAI_BOUNDS.minLng) / (CHENNAI_BOUNDS.maxLng - CHENNAI_BOUNDS.minLng)) * width;
    const y = height - ((lat - CHENNAI_BOUNDS.minLat) / (CHENNAI_BOUNDS.maxLat - CHENNAI_BOUNDS.minLat)) * height;
    return { x, y };
  };

  // Connect user-entered Google Maps API Key
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customApiKey.trim()) return;
    sessionStorage.setItem("VITE_GOOGLE_MAPS_API_KEY", customApiKey.trim());
    (window as any).__GOOGLE_MAPS_API_KEY__ = customApiKey.trim();
    setShowKeyConfigModal(false);
    initGoogleMaps();
  };

  // Vector Canvas Drag Handling
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 relative flex flex-col">
      {/* Explicit map canvas container for Google Maps (Only rendered if loaded cleanly) */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full absolute inset-0 bg-slate-950 ${
          googleMapsLoaded && !authError ? "block" : "hidden pointer-events-none"
        }`}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HIGH-FIDELITY VECTOR TRANSIT NETWORK VISUALIZER (ACTIVE FALLBACK)    */}
      {/* Operates when Google Maps API Key is awaiting configuration         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {(!googleMapsLoaded || authError) && (
        <div
          className="absolute inset-0 bg-slate-950 flex flex-col overflow-hidden select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:36px_36px]" />

          {/* Interactive SVG Network Canvas */}
          <svg
            viewBox="0 0 600 480"
            className="w-full h-full absolute inset-0 pointer-events-auto"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
            }}
          >
            {/* Bay of Bengal Coastline Reference (East) */}
            <path
              d="M 530,0 Q 510,140 520,260 T 510,480"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3"
              strokeDasharray="6 4"
              opacity="0.4"
            />
            <text x="540" y="240" fill="#0284c7" fontSize="10" fontWeight="bold" opacity="0.6" letterSpacing="2">
              BAY OF BENGAL
            </text>

            {/* Render 45 MTC Bus Routes */}
            {layersVisible.routes &&
              routesGeoJSON?.features?.slice(0, 45).map((f: any, i: number) => {
                const points = f.geometry.coordinates
                  .map((c: [number, number]) => {
                    const pt = projectGeoToCanvas(c[1], c[0]);
                    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                  })
                  .join(" ");

                const strokeColor =
                  f.properties?.corridor === "OMR IT Expressway"
                    ? "#38bdf8"
                    : f.properties?.corridor === "GST Road Trunk"
                    ? "#f59e0b"
                    : f.properties?.corridor === "Inner Ring Road"
                    ? "#a855f7"
                    : f.properties?.corridor === "Anna Salai Arterial"
                    ? "#10b981"
                    : "#06b6d4";

                return (
                  <polyline
                    key={`route-${i}`}
                    points={points}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                    strokeOpacity="0.75"
                    className="hover:stroke-white hover:stroke-[4] cursor-pointer transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity({
                        type: "route",
                        route_num: f.properties?.route_num,
                        route_name: f.properties?.route_name,
                        corridor: f.properties?.corridor,
                      });
                      onSelectRoute?.(f.properties?.route_num);
                    }}
                  />
                );
              })}

            {/* Render Bus Stops (Green dots) */}
            {layersVisible.stops &&
              stops.slice(0, 75).map((s, i) => {
                const pt = projectGeoToCanvas(s.lat, s.lng);
                return (
                  <circle
                    key={`stop-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="2.5"
                    fill="#10b981"
                    stroke="#047857"
                    strokeWidth="0.75"
                    className="hover:r-4 cursor-pointer transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity({ type: "stop", name: s.stop_name, zone: s.zone });
                    }}
                  />
                );
              })}

            {/* Render Southern Railway Suburban Stations (Amber squares) */}
            {layersVisible.suburban &&
              suburbanStations.map((s, i) => {
                const pt = projectGeoToCanvas(s.lat, s.lng);
                return (
                  <g
                    key={`suburban-${i}`}
                    transform={`translate(${pt.x - 3.5}, ${pt.y - 3.5})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity({ type: "suburban", name: s.name, suburbanType: s.type });
                    }}
                  >
                    <rect width="7" height="7" rx="1.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  </g>
                );
              })}

            {/* Render Chennai Metro Stations (Cyan/Green circles with White core) */}
            {layersVisible.metro &&
              metroStations.map((s, i) => {
                const pt = projectGeoToCanvas(s.lat, s.lng);
                const isBlue = s.line === "Blue Line";
                return (
                  <g
                    key={`metro-${i}`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity({ type: "metro", name: s.name, line: s.line });
                    }}
                  >
                    <circle cx={pt.x} cy={pt.y} r="5" fill={isBlue ? "#0284c7" : "#16a34a"} stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx={pt.x} cy={pt.y} r="2" fill="#ffffff" />
                  </g>
                );
              })}

            {/* Render Active Incident Alert Markers (Pulsing Warning Triangles) */}
            {layersVisible.incidents &&
              incidents.map((inc) => {
                let lat = 13.0035;
                let lng = 80.2014;
                const locLower = (inc.location || "").toLowerCase();
                const corr = inc.corridorId;

                if (locLower.includes("alandur") || corr === "corridor_gst") {
                  lat = 13.0035; lng = 80.2014;
                } else if (locLower.includes("velachery")) {
                  lat = 12.9782; lng = 80.2185;
                } else if (locLower.includes("tidel") || corr === "corridor_omr") {
                  lat = 12.9897; lng = 80.2483;
                } else if (locLower.includes("vadapalani") || corr === "corridor_irr") {
                  lat = 13.0514; lng = 80.2121;
                } else if (locLower.includes("central") || corr === "corridor_anna_salai") {
                  lat = 13.0827; lng = 80.2707;
                }

                const pt = projectGeoToCanvas(lat, lng);
                const isCritical = inc.severity === "CRITICAL" || inc.severity === "HIGH";

                return (
                  <g
                    key={`inc-canvas-${inc.id}`}
                    transform={`translate(${pt.x}, ${pt.y})`}
                    className="cursor-pointer animate-pulse"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntity({ type: "incident", incident: inc });
                      onSelectIncident?.(inc);
                    }}
                  >
                    <polygon
                      points="0,-12 10,6 -10,6"
                      fill={isCritical ? "#ef4444" : "#f59e0b"}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="900" fill="#000000">
                      !
                    </text>
                  </g>
                );
              })}
          </svg>

          {/* Top Status Notification Bar */}
          <div className="absolute top-14 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 backdrop-blur-md shadow-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span className="font-semibold text-slate-200">
                Chennai Multimodal Network (Interactive Vector Topology)
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                {authError ? "API Key Authorization Required" : "Google Maps Platform Ready"}
              </span>
            </div>

            <button
              onClick={() => setShowKeyConfigModal(true)}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Connect Google Maps API Key</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Left: Quick Fly-To Hub Presets */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 max-w-xl">
        <button
          onClick={() => flyToHub(80.24, 13.06, 11)}
          className="bg-slate-900/95 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5 transition font-medium"
        >
          <Crosshair className="w-3 h-3 text-emerald-400" />
          Chennai City
        </button>
        <button
          onClick={() => flyToHub(80.23, 12.92, 13)}
          className="bg-slate-900/95 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5 transition font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          OMR IT
        </button>
        <button
          onClick={() => flyToHub(80.213, 13.007, 14)}
          className="bg-slate-900/95 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5 transition font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Guindy
        </button>
        <button
          onClick={() => flyToHub(80.27, 13.082, 14)}
          className="bg-slate-900/95 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5 transition font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          Central
        </button>
      </div>

      {/* Top Right: Vector Zoom Controls (Only when in fallback vector view) */}
      {!googleMapsLoaded && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-900/95 border border-slate-700 rounded-lg p-1 shadow-lg">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="p-1 hover:bg-slate-800 rounded text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
            className="p-1 hover:bg-slate-800 rounded text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1 hover:bg-slate-800 rounded text-slate-300"
            title="Reset Pan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Left: Layer Visibility Controls */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-900/95 border border-slate-700/80 rounded-xl p-2 shadow-2xl backdrop-blur-md text-xs">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex items-center gap-1">
          <Layers className="w-3 h-3" />
          GIS Overlays
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => toggleLayer("routes")}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
          >
            {layersVisible.routes ? (
              <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-slate-300">Routes</span>
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
            <span className="text-slate-300">Metro</span>
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
            <span className="text-slate-300">Suburban</span>
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
            <span className="text-slate-300">Stops</span>
          </button>

          <button
            onClick={() => toggleLayer("incidents")}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
          >
            {layersVisible.incidents ? (
              <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-slate-300">Incidents ({incidents.length})</span>
          </button>
        </div>
      </div>

      {/* Selected Entity Popup Banner */}
      {selectedEntity && (
        <div className="absolute top-14 right-3 z-30 bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-xs text-xs animate-in fade-in">
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
            {selectedEntity.type === "incident" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 font-bold font-mono text-sm">
                    Route {selectedEntity.incident.routeNum}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {selectedEntity.incident.severity}
                  </span>
                </div>
                <div className="text-white font-semibold text-xs mt-1">
                  {selectedEntity.incident.location}
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                  {selectedEntity.incident.description}
                </div>
                {selectedEntity.incident.cvAnalysis && (
                  <div className="mt-1.5 bg-slate-950 p-1.5 rounded border border-slate-800 text-[10px] text-cyan-300 flex items-center justify-between">
                    <span>CV: {selectedEntity.incident.cvAnalysis.categoryLabel}</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedEntity.incident.cvAnalysis.potentialDelayImpact}</span>
                  </div>
                )}
                <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-400">
                    Status: {selectedEntity.incident.verificationStatus}
                  </span>
                  {selectedEntity.incident.dispatchStatus === "SHUTTLE_RECOMMENDED" && (
                    <span className="text-amber-400 font-semibold">Shuttle Rec.</span>
                  )}
                </div>
              </>
            )}
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* GOOGLE MAPS PLATFORM CONFIGURATION & DIAGNOSTICS MODAL             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showKeyConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Google Maps Platform Setup & Diagnostics
              </span>
              <button
                onClick={() => setShowKeyConfigModal(false)}
                className="text-slate-400 hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-slate-300">
              <p>
                TransitPulse uses Google Maps JavaScript API for Chennai multimodal visualization. To load live Google satellite/vector base tiles without the auth failure warning, ensure the following requirements in Google Cloud Console:
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">1. Enable Maps JavaScript API:</strong>
                    <div className="text-slate-400 text-[11px]">
                      Search for "Maps JavaScript API" in GCP Library and click "Enable".
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">2. Link Active Billing Account:</strong>
                    <div className="text-slate-400 text-[11px]">
                      Google Maps Platform requires an associated Cloud Billing account (includes $200 free monthly credit).
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">3. Configure Key Restrictions:</strong>
                    <div className="text-slate-400 text-[11px]">
                      If HTTP referrers are restricted, include <code className="text-cyan-300 font-mono">http://localhost:3000/*</code> and <code className="text-cyan-300 font-mono">http://127.0.0.1:3000/*</code>.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Form for live key connection */}
            <form onSubmit={handleSaveApiKey} className="space-y-3 pt-1">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Enter Google Maps JavaScript API Key:
                </label>
                <input
                  type="text"
                  required
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  You can also permanently save it in <code className="text-cyan-400 font-mono">.env</code> as <code className="text-cyan-400 font-mono">VITE_GOOGLE_MAPS_API_KEY</code>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowKeyConfigModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Close & Use Topology Canvas
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl shadow-md transition"
                >
                  Connect Google Maps
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
