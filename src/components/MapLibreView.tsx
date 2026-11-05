import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
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
  CloudRain,
  Sun,
  Flame,
  AlertCircle,
  Globe,
  Map as MapIcon,
} from "lucide-react";
import type { BusStop, MetroStation, SuburbanStation } from "../types/api";
import {
  type WeatherCondition,
  type ChennaiWeather,
  WEATHER_PROFILES,
} from "../services/weather";

interface MapLibreViewProps {
  stops: BusStop[];
  routesGeoJSON: any;
  metroStations: MetroStation[];
  suburbanStations: SuburbanStation[];
  selectedCorridorId?: string;
  onSelectRoute?: (routeNum: string) => void;
  activeWeather?: ChennaiWeather;
  onWeatherChange?: (w: ChennaiWeather) => void;
}

export type MapProvider = "maplibre" | "google_maps";

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
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
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
    stylers: [{ color: "#0284c7" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#082f49" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0284c7" }],
  },
];

export const MapLibreView: React.FC<MapLibreViewProps> = ({
  stops,
  routesGeoJSON,
  metroStations,
  suburbanStations,
  selectedCorridorId,
  onSelectRoute,
  activeWeather = WEATHER_PROFILES.clear,
  onWeatherChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const maplibreInstanceRef = useRef<MapLibreMap | null>(null);
  const googleMapInstanceRef = useRef<google.maps.Map | null>(null);
  const googlePolylinesRef = useRef<google.maps.Polyline[]>([]);
  const googleMarkersRef = useRef<google.maps.Marker[]>([]);

  const [provider, setProvider] = useState<MapProvider>("maplibre");
  const [layersVisible, setLayersVisible] = useState({
    routes: true,
    stops: true,
    metro: true,
    suburban: true,
  });

  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [currentWeather, setCurrentWeather] = useState<ChennaiWeather>(activeWeather);
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);

  const toggleLayer = (key: keyof typeof layersVisible) => {
    setLayersVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleWeatherSelect = (cond: WeatherCondition) => {
    const newProfile = WEATHER_PROFILES[cond];
    setCurrentWeather(newProfile);
    if (onWeatherChange) {
      onWeatherChange(newProfile);
    }
  };

  useEffect(() => {
    if (activeWeather && activeWeather.condition !== currentWeather.condition) {
      setCurrentWeather(activeWeather);
    }
  }, [activeWeather]);

  // Clean cleanup of either map instance
  const cleanupMaps = () => {
    if (maplibreInstanceRef.current) {
      try {
        maplibreInstanceRef.current.remove();
      } catch {}
      maplibreInstanceRef.current = null;
    }

    googlePolylinesRef.current.forEach((p) => p.setMap(null));
    googlePolylinesRef.current = [];
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];
    googleMapInstanceRef.current = null;

    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = "";
    }
  };

  // -------------------------------------------------------------
  // MapLibre Initializer
  // -------------------------------------------------------------
  const initMapLibre = () => {
    if (!mapContainerRef.current) return;
    cleanupMaps();

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          "carto-dark": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [
          {
            id: "carto-dark-layer",
            type: "raster",
            source: "carto-dark",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [80.24, 13.06], // Chennai coordinates
      zoom: 11,
      pitch: 25,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      map.resize();

      // 1. Add MTC Routes
      if (routesGeoJSON?.features?.length > 0 && !map.getSource("mtc-routes")) {
        map.addSource("mtc-routes", {
          type: "geojson",
          data: routesGeoJSON,
        });

        map.addLayer({
          id: "routes-glow",
          type: "line",
          source: "mtc-routes",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#10b981",
            "line-width": 5,
            "line-opacity": 0.35,
          },
        });

        map.addLayer({
          id: "routes-line",
          type: "line",
          source: "mtc-routes",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": [
              "match",
              ["get", "corridor"],
              "OMR IT Expressway",
              "#38bdf8",
              "GST Road / Inner Ring",
              "#f59e0b",
              "#10b981",
            ],
            "line-width": 3,
            "line-opacity": 0.9,
          },
        });

        map.on("click", "routes-line", (e: any) => {
          if (!e.features || !e.features[0]) return;
          const props = e.features[0].properties;
          setSelectedEntity({ type: "route", ...props });
          if (props?.route_num && onSelectRoute) onSelectRoute(props.route_num);
        });

        map.on("mouseenter", "routes-line", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "routes-line", () => {
          map.getCanvas().style.cursor = "";
        });
      }

      // 2. Add Bus Stops (Clustered)
      if (stops?.length > 0 && !map.getSource("bus-stops")) {
        const stopsGeoJSON = {
          type: "FeatureCollection",
          features: stops.map((s) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [s.lng, s.lat] },
            properties: { id: s.stop_id, name: s.stop_name, zone: s.zone },
          })),
        };

        map.addSource("bus-stops", {
          type: "geojson",
          data: stopsGeoJSON as any,
          cluster: true,
          clusterMaxZoom: 13,
          clusterRadius: 35,
        });

        map.addLayer({
          id: "stop-clusters",
          type: "circle",
          source: "bus-stops",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#059669",
              20,
              "#0d9488",
              50,
              "#0284c7",
              100,
              "#6366f1",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              13,
              20,
              17,
              50,
              21,
              100,
              26,
            ],
            "circle-opacity": 0.85,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#ffffff",
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "bus-stops",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 11,
            "text-allow-overlap": true,
          },
          paint: { "text-color": "#ffffff" },
        });

        map.addLayer({
          id: "unclustered-stops",
          type: "circle",
          source: "bus-stops",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#10b981",
            "circle-radius": 4.5,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#047857",
          },
        });

        map.on("click", "unclustered-stops", (e: any) => {
          if (!e.features || !e.features[0]) return;
          const props = e.features[0].properties;
          const coords = (e.features[0].geometry as any).coordinates;
          setSelectedEntity({ type: "stop", name: props?.name, zone: props?.zone, coords });
        });
      }

      // 3. Add Metro Stations
      if (metroStations?.length > 0 && !map.getSource("metro-stations")) {
        const metroGeoJSON = {
          type: "FeatureCollection",
          features: metroStations.map((m) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [m.lng, m.lat] },
            properties: { name: m.name, line: m.line },
          })),
        };

        map.addSource("metro-stations", { type: "geojson", data: metroGeoJSON as any });

        map.addLayer({
          id: "metro-points",
          type: "circle",
          source: "metro-stations",
          paint: {
            "circle-color": "#06b6d4",
            "circle-radius": 7,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        map.on("click", "metro-points", (e: any) => {
          if (!e.features || !e.features[0]) return;
          setSelectedEntity({ type: "metro", ...e.features[0].properties });
        });
      }

      // 4. Add Suburban Stations
      if (suburbanStations?.length > 0 && !map.getSource("suburban-stations")) {
        const subGeoJSON = {
          type: "FeatureCollection",
          features: suburbanStations.map((s) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [s.lng, s.lat] },
            properties: { name: s.name, type: s.type },
          })),
        };

        map.addSource("suburban-stations", { type: "geojson", data: subGeoJSON as any });

        map.addLayer({
          id: "suburban-points",
          type: "circle",
          source: "suburban-stations",
          paint: {
            "circle-color": "#f59e0b",
            "circle-radius": 5.5,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#78350f",
          },
        });

        map.on("click", "suburban-points", (e: any) => {
          if (!e.features || !e.features[0]) return;
          setSelectedEntity({ type: "suburban", ...e.features[0].properties });
        });
      }
    });

    maplibreInstanceRef.current = map;
  };

  // -------------------------------------------------------------
  // Google Maps Initializer
  // -------------------------------------------------------------
  const initGoogleMaps = async () => {
    if (!mapContainerRef.current) return;
    cleanupMaps();
    setGoogleMapsError(null);

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
      });

      googleMapInstanceRef.current = map;


      // Render MTC Bus Routes onto Google Maps
      if (routesGeoJSON?.features) {
        routesGeoJSON.features.slice(0, 40).forEach((f: any) => {
          const path = f.geometry.coordinates.map((c: [number, number]) => ({
            lat: c[1],
            lng: c[0],
          }));

          const strokeColor =
            f.properties.corridor === "OMR IT Expressway"
              ? "#38bdf8"
              : f.properties.corridor === "GST Road / Inner Ring"
              ? "#f59e0b"
              : "#10b981";

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

      // Render sample Bus Stops
      stops.slice(0, 60).forEach((s) => {
        const marker = new google.maps.Marker({
          position: { lat: s.lat, lng: s.lng },
          map,
          title: s.stop_name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 4,
            fillColor: "#10b981",
            fillOpacity: 0.9,
            strokeColor: "#047857",
            strokeWeight: 1.5,
          },
        });

        marker.addListener("click", () => {
          setSelectedEntity({ type: "stop", name: s.stop_name, zone: s.zone });
        });

        googleMarkersRef.current.push(marker);
      });
    } catch (err: any) {
      console.warn("Google Maps load failed, falling back to MapLibre:", err);
      setGoogleMapsError(err?.message || "Google Maps API key not yet verified in dev environment.");
      // Auto-fallback to maplibre
      setProvider("maplibre");
    }
  };

  // Mount or switch map provider
  useEffect(() => {
    if (provider === "google_maps") {
      initGoogleMaps();
    } else {
      initMapLibre();
    }

    // Resize observer safeguard so container never collapses
    const resizeObserver = new ResizeObserver(() => {
      if (maplibreInstanceRef.current) {
        maplibreInstanceRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const timer = setTimeout(() => {
      if (maplibreInstanceRef.current) {
        maplibreInstanceRef.current.resize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      cleanupMaps();
    };
  }, [provider, routesGeoJSON, stops, metroStations, suburbanStations]);

  // Handle Layer Visibility Toggles (MapLibre)
  useEffect(() => {
    if (provider !== "maplibre" || !maplibreInstanceRef.current) return;
    const map = maplibreInstanceRef.current;
    if (!map.isStyleLoaded()) return;

    const toggle = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    };

    toggle("routes-glow", layersVisible.routes);
    toggle("routes-line", layersVisible.routes);
    toggle("stop-clusters", layersVisible.stops);
    toggle("cluster-count", layersVisible.stops);
    toggle("unclustered-stops", layersVisible.stops);
    toggle("metro-points", layersVisible.metro);
    toggle("suburban-points", layersVisible.suburban);
  }, [layersVisible, provider]);

  // Fly-to Transit Hubs
  const flyToHub = (lng: number, lat: number, zoom = 13) => {
    if (provider === "maplibre" && maplibreInstanceRef.current) {
      maplibreInstanceRef.current.flyTo({ center: [lng, lat], zoom, speed: 1.2, essential: true });
    } else if (provider === "google_maps" && googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo({ lat, lng });
      googleMapInstanceRef.current.setZoom(zoom);
    }
  };

  return (
    <div className="transit-map-wrapper w-full h-[580px] lg:h-[680px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 relative">
      {/* Explicit map canvas container with guaranteed layout classes */}
      <div
        ref={mapContainerRef}
        id="transit-map-container"
        className="transit-map-canvas w-full h-full min-h-[480px] absolute inset-0"
      />

      {/* Top Left: Provider Switcher & Quick Fly-To Hubs */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 max-w-xl">
        {/* Map Provider Selector */}
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-1 flex items-center gap-1 shadow-lg backdrop-blur-md">
          <button
            onClick={() => setProvider("maplibre")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              provider === "maplibre"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            MapLibre GL
          </button>
          <button
            onClick={() => setProvider("google_maps")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              provider === "google_maps"
                ? "bg-cyan-500 text-slate-950 shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Google Maps
          </button>
        </div>

        {/* Fly to Hubs */}
        <button
          onClick={() => flyToHub(80.24, 13.06, 11)}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5 transition"
        >
          <Crosshair className="w-3 h-3 text-emerald-400" />
          Chennai
        </button>
        <button
          onClick={() => flyToHub(80.23, 12.92, 13)}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700/80 backdrop-blur-md shadow-md flex items-center gap-1.5 transition"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          OMR
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

      {/* Top Right: Weather Toggle & Demand Multiplier */}
      <div className="absolute top-3 right-14 z-10 bg-slate-900/95 border border-slate-700/80 rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-xs max-w-xs">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 font-bold text-white">
            {currentWeather.condition === "rain" ? (
              <CloudRain className="w-4 h-4 text-sky-400" />
            ) : currentWeather.condition === "heat" ? (
              <Flame className="w-4 h-4 text-orange-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span>Chennai Weather</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">{currentWeather.temp}°C</span>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-medium">
          <button
            onClick={() => handleWeatherSelect("clear")}
            className={`py-1 px-1.5 rounded transition flex items-center justify-center gap-1 ${
              currentWeather.condition === "clear"
                ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sun className="w-3 h-3" />
            Fair
          </button>
          <button
            onClick={() => handleWeatherSelect("rain")}
            className={`py-1 px-1.5 rounded transition flex items-center justify-center gap-1 ${
              currentWeather.condition === "rain"
                ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CloudRain className="w-3 h-3" />
            Monsoon
          </button>
          <button
            onClick={() => handleWeatherSelect("heat")}
            className={`py-1 px-1.5 rounded transition flex items-center justify-center gap-1 ${
              currentWeather.condition === "heat"
                ? "bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-3 h-3" />
            Heatwave
          </button>
        </div>

        <div className="mt-2 text-[10px] space-y-1">
          <div className="flex items-center justify-between text-slate-300">
            <span>Demand Multiplier:</span>
            <span
              className={`font-mono font-bold ${
                currentWeather.demand_multiplier > 1.2
                  ? "text-sky-400"
                  : currentWeather.demand_multiplier > 1.0
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {currentWeather.demand_multiplier}x
            </span>
          </div>
          <p className="text-slate-400 leading-tight">{currentWeather.advisory}</p>
        </div>
      </div>

      {/* Bottom Left: Layer Controls */}
      <div className="absolute bottom-4 left-3 z-10 bg-slate-900/95 border border-slate-800 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs space-y-2 w-56">
        <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800 pb-1.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Active Transit Layers
          </span>
        </div>

        <button
          onClick={() => toggleLayer("routes")}
          className="flex items-center justify-between w-full text-slate-300 hover:text-white"
        >
          <span className="flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-emerald-400" />
            MTC Bus Routes ({routesGeoJSON?.features?.length ?? 79})
          </span>
          {layersVisible.routes ? (
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Square className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        <button
          onClick={() => toggleLayer("stops")}
          className="flex items-center justify-between w-full text-slate-300 hover:text-white"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            Bus Stops ({stops.length})
          </span>
          {layersVisible.stops ? (
            <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
          ) : (
            <Square className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        <button
          onClick={() => toggleLayer("metro")}
          className="flex items-center justify-between w-full text-slate-300 hover:text-white"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            Chennai Metro (33 Stns)
          </span>
          {layersVisible.metro ? (
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <Square className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>

        <button
          onClick={() => toggleLayer("suburban")}
          className="flex items-center justify-between w-full text-slate-300 hover:text-white"
        >
          <span className="flex items-center gap-1.5">
            <Train className="w-3.5 h-3.5 text-amber-400" />
            Suburban Rail (70 Stns)
          </span>
          {layersVisible.suburban ? (
            <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Square className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>
      </div>

      {/* Selected Entity Popup */}
      {selectedEntity && (
        <div className="absolute top-16 right-3 z-10 bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md max-w-sm text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              {selectedEntity.type === "route"
                ? `MTC Route ${selectedEntity.route_num}`
                : selectedEntity.type === "metro"
                ? "Metro Station"
                : "Bus Stop"}
            </span>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-slate-400 hover:text-white font-mono"
            >
              ✕
            </button>
          </div>

          {selectedEntity.type === "route" && (
            <div className="space-y-1.5 text-slate-300">
              <p>
                <span className="text-slate-400">Origin:</span>{" "}
                <span className="font-semibold text-white">{selectedEntity.source}</span>
              </p>
              <p>
                <span className="text-slate-400">Destination:</span>{" "}
                <span className="font-semibold text-white">{selectedEntity.destination}</span>
              </p>
              <p>
                <span className="text-slate-400">Corridor Tag:</span>{" "}
                <span className="text-amber-400">{selectedEntity.corridor}</span>
              </p>
            </div>
          )}

          {selectedEntity.type === "metro" && (
            <div className="space-y-1 text-slate-300">
              <p className="font-semibold text-white text-sm">{selectedEntity.name}</p>
              <p className="text-cyan-400">{selectedEntity.line}</p>
            </div>
          )}

          {selectedEntity.type === "stop" && (
            <div className="space-y-1 text-slate-300">
              <p className="font-semibold text-white text-sm">{selectedEntity.name}</p>
              <p className="text-emerald-400">{selectedEntity.zone}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
