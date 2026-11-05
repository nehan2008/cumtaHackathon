export interface BusStop {
  stop_id: string;
  stop_name: string;
  lat: number;
  lng: number;
  zone: string;
}

export interface TransitRouteFeature {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: {
    route_id: string;
    route_num: string;
    source: string;
    destination: string;
    corridor: string;
    point_count: number;
  };
}

export interface MetroStation {
  name: string;
  lat: number;
  lng: number;
  line: string;
}

export interface SuburbanStation {
  name: string;
  lat: number;
  lng: number;
  type: string;
}

export interface HourlyDemand {
  hour: number;
  label: string;
  weekday_boardings: number;
  weekend_boardings: number;
  city_capacity: number;
  pressure_index: number;
  is_peak: boolean;
}

export interface Corridor {
  id: string;
  name: string;
  primary_routes: string[];
  from_hub: string;
  to_hub: string;
  length_km: number;
  peak_hourly_boardings: number;
  bus_fleet_allocated: number;
  risk_score: number;
  risk_level: "low" | "moderate" | "high" | "critical";
  overcrowding_factor: number;
  metro_parallel: string;
  key_bottlenecks: string[];
  vidiyal_payanam_share: number;
}

export interface OperationalAction {
  id: string;
  priority: "critical" | "high" | "moderate" | "ready";
  time_window: string;
  corridor_id: string;
  corridor_name: string;
  title: string;
  trigger_reason: string;
  action_type: string;
  depot: string;
  bus_count: number;
  headway_improvement: string;
  estimated_congestion_relief: string;
  metro_sync: string;
  status: "recommended" | "ready" | "deployed";
}

export interface SystemStats {
  total_etm_records_analyzed: number;
  total_geocoded_bus_stops: number;
  total_mtc_routes_mapped: number;
  total_metro_stations: number;
  total_suburban_stations: number;
  fare_scheme_shares: {
    vidiyal_payanam_women_free: number;
    cash_ordinary_and_express: number;
    upi_digital_payments: number;
    ncmc_contactless_card: number;
    senior_citizen_and_concessions: number;
  };
  top_depots_by_demand: {
    name: string;
    volume_share: number;
    fleet_size: number;
  }[];
}
