export type WeatherCondition = "clear" | "rain" | "heat";

export interface ChennaiWeather {
  condition: WeatherCondition;
  temp: number; // Celsius
  feels_like: number;
  humidity: number; // percentage
  description: string;
  rain_probability: number;
  wind_kmh: number;
  demand_multiplier: number;
  advisory: string;
  impact_summary: string;
  provider: string;
  is_live: boolean;
}

export const OPENWEATHER_API_KEY = import.meta && (import.meta as any).env?.VITE_OPENWEATHER_API_KEY || "";

export const WEATHER_PROFILES: Record<WeatherCondition, ChennaiWeather> = {
  clear: {
    condition: "clear",
    temp: 32,
    feels_like: 36,
    humidity: 68,
    description: "Humid & Partly Sunny (Coastal Bay Breeze)",
    rain_probability: 10,
    wind_kmh: 18,
    demand_multiplier: 1.0,
    advisory: "Normal transit operating conditions. Standard headways maintained.",
    impact_summary: "Baseline demand. Ordinary and express services operating at standard scheduled speeds.",
    provider: "OpenWeather",
    is_live: false,
  },
  rain: {
    condition: "rain",
    temp: 26,
    feels_like: 29,
    humidity: 94,
    description: "Heavy Monsoon Downpour (Northeast Monsoon Surge)",
    rain_probability: 88,
    wind_kmh: 32,
    demand_multiplier: 1.26, // +26% surge due to two-wheeler riders taking buses
    advisory: "Monsoon Surge Advisory: +26% boarding pressure. Road waterlogging at Velachery & GST Road.",
    impact_summary: "Major modal shift: 180,000+ two-wheeler commuters moving to MTC bus & Metro. Boarding queues lengthened at interchange shelters.",
    provider: "OpenWeather",
    is_live: false,
  },
  heat: {
    condition: "heat",
    temp: 41,
    feels_like: 48,
    humidity: 78,
    description: "Extreme Summer Heatwave (Agni Natchathiram)",
    rain_probability: 5,
    wind_kmh: 12,
    demand_multiplier: 1.14,
    advisory: "Severe Heatwave Alert: Hydration booths active at CMBT & Guindy. AC bus demand at peak capacity.",
    impact_summary: "Commuters avoiding walking & non-AC modes. High preference for Deluxe AC buses (570 AC, 21G AC) and underground Metro stations.",
    provider: "OpenWeather",
    is_live: false,
  },
};

/**
 * Fetches live weather for Chennai using OpenWeather API.
 * Uses key from environment variable VITE_OPENWEATHER_API_KEY.
 * Gracefully handles the initial activation window (new keys take up to 2h on OpenWeather servers).
 */
export async function getChennaiWeather(overrideCondition?: WeatherCondition): Promise<ChennaiWeather> {
  if (overrideCondition && WEATHER_PROFILES[overrideCondition]) {
    return {
      ...WEATHER_PROFILES[overrideCondition],
      provider: "OpenWeather",
      is_live: false,
    };
  }

  const apiKey =
    (import.meta as any).env?.VITE_OPENWEATHER_API_KEY || OPENWEATHER_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Chennai,IN&units=metric&appid=${apiKey}`
      );
      if (res.ok) {
        const data = await res.json();
        const main = data.weather?.[0]?.main?.toLowerCase() || "";
        const isRain =
          main.includes("rain") ||
          main.includes("drizzle") ||
          main.includes("thunderstorm");
        const temp = Math.round(data.main?.temp ?? 32);
        const isHeat = temp >= 38;

        const condition: WeatherCondition = isRain ? "rain" : isHeat ? "heat" : "clear";
        const baseProfile = WEATHER_PROFILES[condition];

        return {
          ...baseProfile,
          temp,
          feels_like: Math.round(data.main?.feels_like ?? temp),
          humidity: data.main?.humidity ?? baseProfile.humidity,
          description: data.weather?.[0]?.description
            ? data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)
            : baseProfile.description,
          wind_kmh: Math.round((data.wind?.speed ?? 4) * 3.6),
          provider: "OpenWeather (Live API)",
          is_live: true,
        };
      } else if (res.status === 401) {
        // OpenWeather key takes up to 2 hours after creation to activate
        return {
          ...WEATHER_PROFILES.clear,
          provider: "OpenWeather (Key Activating — may take up to 2h)",
          is_live: false,
        };
      }
    } catch {
      // Network or offline fallback
    }
  }

  return {
    ...WEATHER_PROFILES.clear,
    provider: "OpenWeather",
    is_live: false,
  };
}
