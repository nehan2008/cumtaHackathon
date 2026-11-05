import stopsData from "../data/chennai_stops.json";
import routesData from "../data/chennai_routes.json";
import metroData from "../data/chennai_metro.json";
import suburbanData from "../data/chennai_suburban.json";
import demandData from "../data/corridor_demand.json";
import actionsData from "../data/operational_actions.json";
import statsData from "../data/system_stats.json";

import type {
  BusStop,
  TransitRouteFeature,
  MetroStation,
  SuburbanStation,
  HourlyDemand,
  Corridor,
  OperationalAction,
  SystemStats,
} from "../types/api";

export const getBusStops = async (): Promise<BusStop[]> => {
  return stopsData as BusStop[];
};

export const getRoutesGeoJSON = async (): Promise<{
  type: string;
  features: TransitRouteFeature[];
}> => {
  return routesData as { type: string; features: TransitRouteFeature[] };
};

export const getMetroStations = async (): Promise<MetroStation[]> => {
  return metroData as MetroStation[];
};

export const getSuburbanStations = async (): Promise<SuburbanStation[]> => {
  return suburbanData as SuburbanStation[];
};

export const getDemandData = async (): Promise<{
  hourly: HourlyDemand[];
  corridors: Corridor[];
}> => {
  return demandData as { hourly: HourlyDemand[]; corridors: Corridor[] };
};

export const getOperationalActions = async (): Promise<OperationalAction[]> => {
  return actionsData as OperationalAction[];
};

export const getSystemStats = async (): Promise<SystemStats> => {
  return statsData as SystemStats;
};
