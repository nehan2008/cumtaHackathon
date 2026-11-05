import React, { useState } from "react";
import { type DigitalTransitTicket } from "../../types/multimodal";
import {
  CreditCard,
  QrCode,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Bus,
  Layers,
  Train,
  Clock,
  ShieldCheck,
  Info,
} from "lucide-react";

export const UnifiedTicketing: React.FC = () => {
  // Calculator inputs
  const [transitMode, setTransitMode] = useState<"MTC_ORDINARY" | "MTC_EXPRESS" | "METRO" | "SUBURBAN" | "COMBINED">("MTC_ORDINARY");
  const [passengerType, setPassengerType] = useState<"General" | "Woman (Vidiyal Payanam)" | "Senior Citizen" | "Student">("Woman (Vidiyal Payanam)");
  const [origin, setOrigin] = useState<string>("Tidel Park (OMR)");
  const [destination, setDestination] = useState<string>("Central Railway Station");
  const [distanceKm, setDistanceKm] = useState<number>(14);

  // Active generated ticket state
  const [activeTicket, setActiveTicket] = useState<DigitalTransitTicket | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [refundStatus, setRefundStatus] = useState<string | null>(null);

  // Calculate fare based on official Chennai Fare Stages
  const calculateFare = (): number => {
    if (passengerType === "Woman (Vidiyal Payanam)" && transitMode === "MTC_ORDINARY") {
      return 0; // Vidiyal Payanam Scheme provides free travel for women in MTC ordinary/pink buses
    }

    if (transitMode === "MTC_ORDINARY") {
      if (distanceKm <= 4) return 5;
      if (distanceKm <= 8) return 9;
      if (distanceKm <= 12) return 11;
      return 14;
    }

    if (transitMode === "MTC_EXPRESS") {
      if (distanceKm <= 6) return 12;
      if (distanceKm <= 15) return 20;
      return 30;
    }

    if (transitMode === "METRO") {
      // Chennai metro: ₹10 to ₹40 with standard 20% discount on digital QR
      if (distanceKm <= 4) return 10;
      if (distanceKm <= 10) return 24;
      if (distanceKm <= 18) return 32;
      return 40;
    }

    if (transitMode === "SUBURBAN") {
      // Suburban EMU
      if (distanceKm <= 20) return 5;
      if (distanceKm <= 45) return 10;
      return 15;
    }

    // COMBINED (Bus + Metro transfer)
    const busPart = passengerType === "Woman (Vidiyal Payanam)" ? 0 : 12;
    const metroPart = 24;
    return busPart + metroPart;
  };

  const currentFare = calculateFare();

  const handleIssueTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: DigitalTransitTicket = {
      ticketId: `CUMTA-TKT-${Date.now().toString().slice(-6)}`,
      bookingRef: `TN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      origin,
      destination,
      passengerCategory: passengerType,
      mode:
        transitMode === "MTC_ORDINARY"
          ? "MTC Bus"
          : transitMode === "MTC_EXPRESS"
          ? "MTC Bus"
          : transitMode === "METRO"
          ? "Chennai Metro"
          : transitMode === "SUBURBAN"
          ? "Suburban EMU"
          : "Multimodal Combined",
      farePaid: currentFare,
      status: "ACTIVE",
      validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      qrCodePayload: `MTC-CUMTA:${origin}->${destination}:${passengerType}:INR${currentFare}`,
      issuedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setActiveTicket(newTicket);
    setBookingSuccess(true);
    setRefundStatus(null);
  };

  const handleCancelAndRefund = () => {
    if (!activeTicket) return;
    setActiveTicket({
      ...activeTicket,
      status: "CANCELLED_REFUNDED",
    });
    setRefundStatus(
      `Ticket ${activeTicket.bookingRef} cancelled. Refund of ₹${activeTicket.farePaid} credited to original payment source.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Unified Multimodal Ticketing & Fare Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Integrated fare calculation using official Chennai stages (Vidiyal Payanam ₹0 zero-fare for women on Ordinary buses, MTC Express, Chennai Metro, and Suburban Rail).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Fare Calculator Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Stage Fare Calculator & Digital Pass</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select journey parameters to compute accurate regulated fares.
            </p>
          </div>

          <form onSubmit={handleIssueTicket} className="space-y-4 text-xs">
            {/* Mode selection buttons */}
            <div>
              <label className="block text-slate-400 font-semibold mb-2">Transit Mode:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTransitMode("MTC_ORDINARY")}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    transitMode === "MTC_ORDINARY"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bus className="w-3.5 h-3.5" />
                    <span className="text-white text-xs">MTC Ordinary (Pink)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Vidiyal Payanam ₹0</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransitMode("MTC_EXPRESS")}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    transitMode === "MTC_EXPRESS"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bus className="w-3.5 h-3.5" />
                    <span className="text-white text-xs">MTC Express / Deluxe</span>
                  </div>
                  <span className="text-[10px] text-slate-400">₹12 - ₹30 Stages</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransitMode("METRO")}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    transitMode === "METRO"
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="text-white text-xs">Chennai Metro</span>
                  </div>
                  <span className="text-[10px] text-cyan-400">₹10 - ₹40 Stages</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransitMode("SUBURBAN")}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    transitMode === "SUBURBAN"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Train className="w-3.5 h-3.5" />
                    <span className="text-white text-xs">Suburban EMU</span>
                  </div>
                  <span className="text-[10px] text-amber-400">₹5 - ₹15 Stages</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTransitMode("COMBINED")}
                  className={`p-2.5 rounded-xl border text-left transition col-span-2 sm:col-span-2 ${
                    transitMode === "COMBINED"
                      ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-white text-xs">Combined Multimodal Pass (Bus + Metro)</span>
                  </div>
                  <span className="text-[10px] text-purple-400">Single integrated digital ticket</span>
                </button>
              </div>
            </div>

            {/* Passenger Type */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Passenger Category:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  "Woman (Vidiyal Payanam)",
                  "General",
                  "Senior Citizen",
                  "Student",
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPassengerType(type as any)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition ${
                      passengerType === type
                        ? "bg-slate-800 border-emerald-500 text-emerald-400 font-bold"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Boarding Origin</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="font-semibold">Estimated Distance:</span>
                <span className="font-mono text-white font-bold">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="35"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Fare Summary Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Calculated Regulated Fare:</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                    ₹{currentFare}
                  </span>
                  {currentFare === 0 && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Vidiyal Payanam 100% Subsidy
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Generate Digital Pass
              </button>
            </div>
          </form>
        </div>

        {/* Digital Ticket Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeTicket ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Top Watermark / Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                    CUMTA MULTIMODAL PASS
                  </span>
                  <h3 className="font-extrabold text-white text-base mt-1 tracking-tight">
                    Chennai Metropolitan Transit
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Ref: {activeTicket.bookingRef}
                  </span>
                </div>

                <div
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    activeTicket.status === "ACTIVE"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {activeTicket.status}
                </div>
              </div>

              {/* QR Code Graphic Box */}
              <div className="my-5 flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <div className="w-36 h-36 bg-white p-2.5 rounded-xl flex items-center justify-center shadow-lg">
                  {/* SVG QR Code Simulation */}
                  <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="5" y="5" width="25" height="25" />
                    <rect x="10" y="10" width="15" height="15" fill="white" />
                    <rect x="14" y="14" width="7" height="7" />

                    <rect x="70" y="5" width="25" height="25" />
                    <rect x="75" y="10" width="15" height="15" fill="white" />
                    <rect x="79" y="14" width="7" height="7" />

                    <rect x="5" y="70" width="25" height="25" />
                    <rect x="10" y="75" width="15" height="15" fill="white" />
                    <rect x="14" y="79" width="7" height="7" />

                    <rect x="35" y="10" width="10" height="10" />
                    <rect x="50" y="20" width="15" height="10" />
                    <rect x="35" y="35" width="25" height="25" />
                    <rect x="65" y="45" width="10" height="20" />
                    <rect x="35" y="70" width="15" height="10" />
                    <rect x="75" y="75" width="15" height="15" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-2">
                  Scan at Automated Metro AFG Gates & Bus Conductor ETMs
                </span>
              </div>

              {/* Ticket Details */}
              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Route / Journey:</span>
                  <span className="font-semibold text-white">
                    {activeTicket.origin} → {activeTicket.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mode:</span>
                  <span className="font-semibold text-emerald-400">{activeTicket.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Passenger Category:</span>
                  <span className="text-slate-200">{activeTicket.passengerCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Valid Until:</span>
                  <span className="font-mono text-amber-400 font-bold">{activeTicket.validUntil}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Total Paid:</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    ₹{activeTicket.farePaid}
                  </span>
                </div>
              </div>

              {/* Cancellation & Refund Action */}
              {activeTicket.status === "ACTIVE" && (
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <button
                    onClick={handleCancelAndRefund}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Cancel Journey & Request Instant Refund
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="font-bold text-white text-sm">No Active Ticket Generated</h4>
              <p className="text-xs max-w-xs mx-auto text-slate-400">
                Use the calculator on the left to compute fares and generate an instant demonstration digital pass with QR validation.
              </p>
            </div>
          )}

          {refundStatus && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{refundStatus}</span>
            </div>
          )}

          {/* Hackathon Disclaimer */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Ticketing Engine Note:</strong> All transactions and QR codes are generated dynamically for the CUMTA Hackathon live demonstration.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
