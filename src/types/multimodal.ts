export type TransitMode = "MTC_BUS" | "CHENNAI_METRO" | "SUBURBAN_RAIL";

export interface InterchangeHub {
  id: string;
  name: string;
  tamilName: string;
  modes: TransitMode[];
  metroLine?: "Blue Line" | "Green Line" | "Both Lines";
  suburbanCorridor?: string;
  busBaysCount: number;
  dailyFootfall: number;
  averageTransferTimeMin: number;
  amenities: string[];
  lat: number;
  lng: number;
}

export interface MultimodalJourneySegment {
  mode: TransitMode;
  lineOrRoute: string;
  fromStationOrStop: string;
  toStationOrStop: string;
  durationMin: number;
  fareInr: number;
  distanceKm: number;
  crowdLevel: "AVAILABLE" | "MODERATE" | "CROWDED" | "VERY CROWDED";
}

export interface MultimodalTripPlan {
  id: string;
  title: string;
  totalDurationMin: number;
  totalFareInr: number;
  totalDistanceKm: number;
  interchangeHubs: string[];
  co2SavedKg: number;
  segments: MultimodalJourneySegment[];
}

export interface DigitalTransitTicket {
  ticketId: string;
  bookingRef: string;
  origin: string;
  destination: string;
  passengerCategory: "General" | "Woman (Vidiyal Payanam)" | "Senior Citizen" | "Student";
  mode: "MTC Bus" | "Chennai Metro" | "Suburban EMU" | "Multimodal Combined";
  farePaid: number;
  status: "ACTIVE" | "USED" | "CANCELLED_REFUNDED";
  validUntil: string;
  qrCodePayload: string;
  issuedAt: string;
}
