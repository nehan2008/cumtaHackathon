import React, { useState } from "react";
import {
  type PortalRole,
  type MessageCategory,
  type UrgencyLevel,
  type TransportMessage,
} from "../../types/communication";
import {
  Radio,
  Send,
  AlertTriangle,
  Shield,
  Bus,
  Users,
  Activity,
  CheckCircle2,
  Clock,
  Filter,
  Megaphone,
  MapPin,
  ChevronRight,
  Flame,
} from "lucide-react";

const INITIAL_MESSAGES: TransportMessage[] = [
  {
    id: "MSG-1001",
    senderRole: "police",
    senderName: "Insp. S. Raghavan",
    senderBadge: "TN-TP-412",
    category: "CONGESTION_OBSTRUCTION",
    urgency: "HIGH",
    routeNum: "570, 19B",
    location: "SRP Tools Junction, OMR",
    content: "Waterlogging and Metro Phase-2 pillar construction crane breakdown causing 25 min vehicle queue toward Siruseri. Request traffic diversion via SRP Link Road.",
    timestamp: "08:24 AM",
    acknowledgedByControl: true,
    actionTaken: "CUMTA Control diverted 6 standby express buses via Velachery link.",
  },
  {
    id: "MSG-1002",
    senderRole: "driver",
    senderName: "V. Chandran",
    senderBadge: "MTC-DRV-882",
    category: "BREAKDOWN_DELAY",
    urgency: "CRITICAL",
    routeNum: "21G",
    busNumber: "TN-01-AN-4412",
    location: "Alandur Metro Flyover Base",
    content: "Clutch plate failure on ascending ramp. Vehicle safely parked in breakdown bay. 62 passengers waiting for replacement feeder.",
    timestamp: "08:31 AM",
    acknowledgedByControl: true,
    actionTaken: "Depot dispatched rescue shuttle TN-01-AN-4499 from Guindy Depot.",
  },
  {
    id: "MSG-1003",
    senderRole: "conductor",
    senderName: "K. Balan",
    senderBadge: "COND-6712",
    category: "OVERCROWDING_ALERT",
    urgency: "HIGH",
    routeNum: "102",
    busNumber: "TN-01-AN-5510",
    location: "Kandanchavadi Bus Stop",
    content: "Heavy queue of IT commuters unable to board. Bus reached 80 passenger capacity. Over 45 passengers left behind at curb.",
    timestamp: "08:36 AM",
    acknowledgedByControl: false,
  },
  {
    id: "MSG-1004",
    senderRole: "control_room",
    senderName: "CUMTA Central Desk",
    senderBadge: "CUMTA-CTRL-01",
    category: "CONTROL_DIRECTIVE",
    urgency: "NORMAL",
    routeNum: "All OMR Routes",
    location: "OMR IT Corridor",
    content: "Advisory: Monsoon rain alert active. Headway reduced from 12 mins to 8 mins across routes 570, 19B, and 102. Conductor verification required at major interchanges.",
    timestamp: "08:40 AM",
    acknowledgedByControl: true,
    actionTaken: "Broadcast to all active depot consoles and driver cab displays.",
  },
];

export const CommunicationPortal: React.FC = () => {
  const [activeRole, setActiveRole] = useState<PortalRole>("control_room");
  const [messages, setMessages] = useState<TransportMessage[]>(INITIAL_MESSAGES);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Form states for new dispatch
  const [newCategory, setNewCategory] = useState<MessageCategory>("OPERATIONAL_UPDATE");
  const [newUrgency, setNewUrgency] = useState<UrgencyLevel>("NORMAL");
  const [newRouteNum, setNewRouteNum] = useState<string>("570");
  const [newBusNumber, setNewBusNumber] = useState<string>("TN-01-AN-2104");
  const [newLocation, setNewLocation] = useState<string>("Tidel Park Junction");
  const [newContent, setNewContent] = useState<string>("");
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    let senderName = "Control Room Operator";
    let senderBadge = "CUMTA-CTRL-OPS";

    if (activeRole === "driver") {
      senderName = "MTC Driver (Active Cab)";
      senderBadge = "DRV-DUTY-104";
    } else if (activeRole === "conductor") {
      senderName = "MTC Conductor (Onboard)";
      senderBadge = "COND-DUTY-512";
    } else if (activeRole === "police") {
      senderName = "Greater Chennai Traffic Police";
      senderBadge = "GCTP-ZONE-SOUTH";
    }

    const newMessage: TransportMessage = {
      id: `MSG-${Date.now().toString().slice(-4)}`,
      senderRole: activeRole,
      senderName,
      senderBadge,
      category: newCategory,
      urgency: newUrgency,
      routeNum: newRouteNum || undefined,
      busNumber: newBusNumber || undefined,
      location: newLocation || undefined,
      content: newContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      acknowledgedByControl: activeRole === "control_room",
    };

    setMessages([newMessage, ...messages]);
    setNewContent("");
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 2500);
  };

  const handleAcknowledge = (id: string, actionMsg: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              acknowledgedByControl: true,
              actionTaken: actionMsg || "Acknowledged and logged by CUMTA Duty Officer.",
            }
          : m
      )
    );
  };

  const filteredMessages = messages.filter(
    (m) => categoryFilter === "ALL" || m.category === categoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Role Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                <Radio className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                TransitPulse Transport Communication Portal
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Shared real-time dispatch and situational awareness channel connecting MTC Bus Drivers, Conductors, Greater Chennai Traffic Police, and CUMTA Control Room.
            </p>
          </div>

          {/* Role Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold px-2">Role:</span>
            <button
              onClick={() => setActiveRole("control_room")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeRole === "control_room"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Control Room
            </button>
            <button
              onClick={() => setActiveRole("police")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeRole === "police"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Traffic Police
            </button>
            <button
              onClick={() => setActiveRole("driver")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeRole === "driver"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              Bus Driver
            </button>
            <button
              onClick={() => setActiveRole("conductor")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeRole === "conductor"
                  ? "bg-purple-500 text-slate-950 shadow-md shadow-purple-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Conductor
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Dispatch Composer & Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Broadcast & Incident Report Composer (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-cyan-400" />
              {activeRole === "control_room"
                ? "Issue Control Room Advisory"
                : activeRole === "police"
                ? "Report Traffic Obstruction / Congestion"
                : activeRole === "driver"
                ? "Report Breakdown or Transit Delay"
                : "Report Overcrowding & Left-Behind Commuters"}
            </h3>
            <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              {activeRole.replace("_", " ")}
            </span>
          </div>

          {broadcastSent && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Message broadcast to all connected transport units!
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Incident Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MessageCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="OPERATIONAL_UPDATE">Operational Update / Headway Adjustment</option>
                <option value="BREAKDOWN_DELAY">Vehicle Breakdown / Mechanical Failure</option>
                <option value="CONGESTION_OBSTRUCTION">Traffic Obstruction / Waterlogging</option>
                <option value="OVERCROWDING_ALERT">Overcrowding & Platform Surge</option>
                <option value="CONTROL_DIRECTIVE">Control Room Official Directive</option>
                <option value="EMERGENCY_DISRUPTION">Emergency & Medical / Safety Disruption</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Urgency Priority</label>
                <select
                  value={newUrgency}
                  onChange={(e) => setNewUrgency(e.target.value as UrgencyLevel)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  <option value="LOW">LOW - Routine Informational</option>
                  <option value="NORMAL">NORMAL - Operational Note</option>
                  <option value="HIGH">HIGH - Action Required</option>
                  <option value="CRITICAL">CRITICAL - Emergency Escalation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">MTC Route Number</label>
                <input
                  type="text"
                  placeholder="e.g. 570, 21G, 70V"
                  value={newRouteNum}
                  onChange={(e) => setNewRouteNum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Bus Reg / Depot</label>
                <input
                  type="text"
                  placeholder="e.g. TN-01-AN-2104"
                  value={newBusNumber}
                  onChange={(e) => setNewBusNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Location / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Tidel Park Junction"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Incident Report / Instructions</label>
              <textarea
                rows={3}
                required
                placeholder="Describe situational impact, queue depth, route obstruction or operational directive..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 transition flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Transmit Operational Dispatch
            </button>
          </form>
        </div>

        {/* Right: Live Feed of Messages & Actions (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Live Transport Communications Feed ({filteredMessages.length})
              </h3>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-[11px]"
              >
                <option value="ALL">All Categories</option>
                <option value="OPERATIONAL_UPDATE">Operational Updates</option>
                <option value="BREAKDOWN_DELAY">Breakdowns & Delays</option>
                <option value="CONGESTION_OBSTRUCTION">Congestion / Obstructions</option>
                <option value="OVERCROWDING_ALERT">Overcrowding Alerts</option>
                <option value="CONTROL_DIRECTIVE">Control Directives</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-2.5"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1.5 rounded-lg text-xs font-bold ${
                        msg.senderRole === "control_room"
                          ? "bg-cyan-500/20 text-cyan-400"
                          : msg.senderRole === "police"
                          ? "bg-amber-500/20 text-amber-400"
                          : msg.senderRole === "driver"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {msg.senderRole === "control_room" ? (
                        <Activity className="w-3.5 h-3.5" />
                      ) : msg.senderRole === "police" ? (
                        <Shield className="w-3.5 h-3.5" />
                      ) : msg.senderRole === "driver" ? (
                        <Bus className="w-3.5 h-3.5" />
                      ) : (
                        <Users className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{msg.senderName}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {msg.senderBadge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Urgency Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      msg.urgency === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse"
                        : msg.urgency === "HIGH"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {msg.urgency}
                  </span>
                </div>

                {/* Tags: Route, Location, Bus */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  {msg.routeNum && (
                    <span className="bg-slate-800 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                      Route {msg.routeNum}
                    </span>
                  )}
                  {msg.busNumber && (
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {msg.busNumber}
                    </span>
                  )}
                  {msg.location && (
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      {msg.location}
                    </span>
                  )}
                </div>

                {/* Content */}
                <p className="text-xs text-slate-200 leading-relaxed">{msg.content}</p>

                {/* Action Taken / Acknowledge row */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  {msg.acknowledgedByControl ? (
                    <div className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{msg.actionTaken || "Action Initiated by Control Room"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full justify-between">
                      <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        Pending Operator Acknowledgment
                      </span>
                      {activeRole === "control_room" && (
                        <button
                          onClick={() =>
                            handleAcknowledge(
                              msg.id,
                              "Acknowledged: Standby shuttle alerted and traffic link notified."
                            )
                          }
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-[10px] transition"
                        >
                          Acknowledge & Deploy
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
