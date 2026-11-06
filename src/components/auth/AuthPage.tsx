import React, { useState } from "react";
import {
  ShieldCheck,
  Tv,
  Bus,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Building2
} from "lucide-react";
import type { PortalType } from "../../App";

interface AuthPageProps {
  initialTarget?: "control_room" | "display";
  onSuccess: (target: "control_room" | "display", userDetails?: any) => void;
  onCancel: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialTarget = "control_room",
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<"control_room" | "display">(initialTarget);

  // Control Room Form State
  const [operatorId, setOperatorId] = useState("CUMTA-CTRL-01");
  const [controlPassword, setControlPassword] = useState("chennai2026");
  const [controlError, setControlError] = useState<string | null>(null);

  // PID Terminal Form State
  const [terminalStation, setTerminalStation] = useState("GUINDY_INTERCHANGE");
  const [terminalPin, setTerminalPin] = useState("2026");
  const [pidError, setPidError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Handle Control Room Login
  const handleControlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setControlError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Valid credentials or demo password
      if (!operatorId.trim()) {
        setControlError("Please enter your Operator Badge ID.");
        return;
      }
      if (controlPassword !== "chennai2026" && controlPassword !== "admin" && controlPassword.length < 4) {
        setControlError("Invalid passcode. Use demo passcode: chennai2026");
        return;
      }

      onSuccess("control_room", {
        operatorId: operatorId.trim(),
        name: operatorId.includes("01") ? "R. Sundaram (Traffic Ops Chief)" : "Operations Controller",
        role: "CUMTA Master Controller",
      });
    }, 350);
  };

  // Handle PID Terminal Authentication
  const handlePidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPidError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (terminalPin !== "2026" && terminalPin !== "0000" && terminalPin.length < 4) {
        setPidError("Invalid Terminal PIN. Use demo PIN: 2026");
        return;
      }

      onSuccess("display", {
        stationKey: terminalStation,
        terminalId: `PID-TERM-${terminalStation.slice(0, 4)}-01`,
        stationName: terminalStation === "GUINDY_INTERCHANGE" ? "Guindy Multimodal Interchange" : "CMBT Koyambedu",
      });
    }, 350);
  };

  // Quick Demo Logins
  const handleQuickControlLogin = () => {
    setOperatorId("CUMTA-CTRL-01");
    setControlPassword("chennai2026");
    onSuccess("control_room", {
      operatorId: "CUMTA-CTRL-01",
      name: "R. Sundaram (Traffic Ops Chief)",
      role: "CUMTA Master Controller",
    });
  };

  const handleQuickPidLogin = () => {
    setTerminalStation("GUINDY_INTERCHANGE");
    setTerminalPin("2026");
    onSuccess("display", {
      stationKey: "GUINDY_INTERCHANGE",
      terminalId: "PID-TERM-GUIN-01",
      stationName: "Guindy Multimodal Interchange",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950">
            <Bus className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
              Transit<span className="text-emerald-400">Pulse</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 ml-1.5">
                Authentication Gate
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Chennai Unified Metropolitan Transport Authority (CUMTA & MTC)
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-lg w-full mx-auto p-4 relative z-10 my-auto">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Portal Target Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("control_room")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeTab === "control_room"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/60"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Control Room Desk</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("display")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeTab === "display"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-950/60"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Station PID Board</span>
            </button>
          </div>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 1: CONTROL ROOM OPERATOR LOGIN                           */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "control_room" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  CUMTA Control Room Sign-In
                </h2>
                <p className="text-xs text-slate-400">
                  Authorized access for transit dispatchers, depot supervisors, and CUMTA traffic controllers.
                </p>
              </div>

              {controlError && (
                <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{controlError}</span>
                </div>
              )}

              <form onSubmit={handleControlSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Operator Badge ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={operatorId}
                      onChange={(e) => setOperatorId(e.target.value)}
                      placeholder="e.g. CUMTA-CTRL-01"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Passcode / Security Key
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={controlPassword}
                      onChange={(e) => setControlPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Demo ID: <strong className="text-white font-mono">CUMTA-CTRL-01</strong></span>
                  <span>Pass: <strong className="text-white font-mono">chennai2026</strong></span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authenticate & Launch Control Room</span>
                </button>
              </form>

              {/* Instant One-Click Demo Access */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleQuickControlLogin}
                  className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1-Click Demo Login as CUMTA Controller</span>
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TAB 2: STATION PID DISPLAY AUTHORIZATION                     */}
          {/* ──────────────────────────────────────────────────────────── */}
          {activeTab === "display" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
                  <Tv className="w-5 h-5 text-amber-400" />
                  Station PID Terminal Authorization
                </h2>
                <p className="text-xs text-slate-400">
                  Airport-style Passenger Information Board (FIDS/PID) for bus stop kiosks and terminal display screens.
                </p>
              </div>

              {pidError && (
                <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{pidError}</span>
                </div>
              )}

              <form onSubmit={handlePidSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Select Bus Station / Terminal Hub
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <select
                      value={terminalStation}
                      onChange={(e) => setTerminalStation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-medium focus:border-amber-500 focus:outline-none"
                    >
                      <option value="GUINDY_INTERCHANGE">Guindy Multimodal Interchange (Bay 1 & 2)</option>
                      <option value="CMBT_KOYAMBEDU">Puratchi Thalaivar Dr. MGR Bus Terminus (CMBT)</option>
                      <option value="CENTRAL_TERMINUS">Chennai Central Station Terminal</option>
                      <option value="TAMBARAM_MEPZ">Tambaram Sanatorium Bus Hub</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Station Terminal PIN Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={terminalPin}
                      onChange={(e) => setTerminalPin(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none tracking-widest"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Terminal Station: <strong className="text-white">Guindy Interchange</strong></span>
                  <span>PIN: <strong className="text-white font-mono">2026</strong></span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-950 cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Authorize Display & Launch PID Screen</span>
                </button>
              </form>

              {/* Instant One-Click Demo Access */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleQuickPidLogin}
                  className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>1-Click Launch Guindy Station PID</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Public Portal Bypass Link */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            Commuter or passenger?{" "}
            <button
              onClick={onCancel}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Go to Public Commuter Portal
            </button>{" "}
            (No login required)
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto p-4 text-center text-xs text-slate-600 relative z-10">
        TransitPulse CUMTA Secure Gateway • Transport Operations Security Protocol 2026
      </footer>
    </div>
  );
};
