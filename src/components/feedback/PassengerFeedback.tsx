import React, { useState } from "react";
import {
  type FeedbackCategory,
  type FeedbackStatus,
  type PassengerFeedbackItem,
} from "../../types/feedback";
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Bus,
  MapPin,
  TrendingUp,
} from "lucide-react";

const INITIAL_FEEDBACK: PassengerFeedbackItem[] = [
  {
    id: "FB-201",
    commuterName: "Priya S.",
    rating: 2,
    category: "OVERCROWDING",
    routeNum: "570",
    stopName: "Thoraipakkam",
    comments: "3 consecutive buses were packed to the door at 8:30 AM. Women commuters under Vidiyal Payanam could not even get on the footboard safely.",
    timestamp: "Today, 08:42 AM",
    status: "FLAGGED_FOR_ACTION",
    sentiment: "negative",
    depotAssigned: "Thiruvanmiyur Depot",
  },
  {
    id: "FB-202",
    commuterName: "Karthik R.",
    rating: 1,
    category: "MISSED_STOP",
    routeNum: "21G",
    stopName: "Saidapet Court",
    comments: "Driver skipped the designated bay and overtook in the express lane without stopping for passengers waving at the shelter.",
    timestamp: "Today, 08:15 AM",
    status: "UNDER_REVIEW",
    sentiment: "negative",
    depotAssigned: "Guindy Depot",
  },
  {
    id: "FB-203",
    commuterName: "Anand M.",
    rating: 5,
    category: "SUGGESTION",
    routeNum: "102",
    stopName: "Sholinganallur Junction",
    comments: "The air-conditioned electric buses on this route are smooth and on-time. Requesting more trips between 6 PM and 8 PM.",
    timestamp: "Yesterday, 07:20 PM",
    status: "RESOLVED",
    sentiment: "positive",
    depotAssigned: "Alandur Depot",
  },
  {
    id: "FB-204",
    commuterName: "Deepa N.",
    rating: 2,
    category: "BUS_DELAY",
    routeNum: "70V",
    stopName: "Koyambedu Roundtana",
    comments: "Expected arrival was 07:55 AM according to the PID board, but bus arrived at 08:30 AM due to unannounced depot shift.",
    timestamp: "Today, 08:35 AM",
    status: "NEW",
    sentiment: "negative",
    depotAssigned: "CMBT Depot",
  },
];

interface PassengerFeedbackProps {
  mode?: "commuter" | "control_room";
}

export const PassengerFeedback: React.FC<PassengerFeedbackProps> = ({ mode = "commuter" }) => {
  const [viewMode, setViewMode] = useState<"commuter" | "control_room">(mode);
  const [feedbackList, setFeedbackList] = useState<PassengerFeedbackItem[]>(INITIAL_FEEDBACK);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Commuter Form state
  const [commuterName, setCommuterName] = useState("");
  const [rating, setRating] = useState(4);
  const [category, setCategory] = useState<FeedbackCategory>("OVERCROWDING");
  const [routeNum, setRouteNum] = useState("570");
  const [stopName, setStopName] = useState("Tidel Park");
  const [comments, setComments] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) return;

    const sentiment = rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative";

    const newItem: PassengerFeedbackItem = {
      id: `FB-${Date.now().toString().slice(-3)}`,
      commuterName: commuterName.trim() || "Anonymous Commuter",
      rating,
      category,
      routeNum,
      stopName,
      comments,
      timestamp: "Just now",
      status: "NEW",
      sentiment,
      depotAssigned: "Central Review Desk",
    };

    setFeedbackList([newItem, ...feedbackList]);
    setComments("");
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 3000);
  };

  const updateStatus = (id: string, newStatus: FeedbackStatus) => {
    setFeedbackList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const filteredItems = feedbackList.filter(
    (item) => categoryFilter === "ALL" || item.category === categoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Toggle */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Passenger Experience & Feedback System
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Direct commuter satisfaction feedback, delay and overcrowding complaints, and CUMTA depot triage analytics.
          </p>
        </div>

        {/* View Switcher */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
          <button
            onClick={() => setViewMode("commuter")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === "commuter"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Commuter Submission Form
          </button>
          <button
            onClick={() => setViewMode("control_room")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === "control_room"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Control Room Feedback Desk ({feedbackList.length})
          </button>
        </div>
      </div>

      {viewMode === "commuter" ? (
        /* Commuter Submission Card */
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base">Submit Your Journey Experience</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Help MTC and CUMTA improve bus frequencies, safety, and cleanliness.
            </p>
          </div>

          {submittedMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Thank you! Your feedback has been forwarded to the MTC depot operations desk.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Star Rating */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Rate Your Trip Satisfaction:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-700"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-slate-300 ml-2">
                  {rating === 5
                    ? "Excellent"
                    : rating === 4
                    ? "Good"
                    : rating === 3
                    ? "Average"
                    : rating === 2
                    ? "Poor"
                    : "Very Dissatisfied"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh K."
                  value={commuterName}
                  onChange={(e) => setCommuterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category of Report</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="OVERCROWDING">Severe Overcrowding / Denied Boarding</option>
                  <option value="BUS_DELAY">Bus Delay / Irregular Headway</option>
                  <option value="MISSED_STOP">Missed Bus Stop / Skipping Bay</option>
                  <option value="STAFF_BEHAVIOR">Crew / Staff Assistance Issue</option>
                  <option value="CLEANLINESS">Bus Maintenance & Cleanliness</option>
                  <option value="SUGGESTION">Route Suggestion / Schedule Feedback</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">MTC Route Number</label>
                <input
                  type="text"
                  placeholder="e.g. 570, 21G, 102"
                  value={routeNum}
                  onChange={(e) => setRouteNum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Boarding Stop / Junction</label>
                <input
                  type="text"
                  placeholder="e.g. Tidel Park, Guindy Metro"
                  value={stopName}
                  onChange={(e) => setStopName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Your Comments & Details</label>
              <textarea
                rows={4}
                required
                placeholder="Please describe what happened, time of day, approximate crowd level, or any positive remarks..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Feedback to CUMTA & MTC
            </button>
          </form>
        </div>
      ) : (
        /* Control Room Review Desk */
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Total Submissions</span>
                <span className="text-xl font-bold text-white font-mono">{feedbackList.length}</span>
              </div>
              <MessageSquare className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Average Rating</span>
                <span className="text-xl font-bold text-amber-400 font-mono">
                  {(
                    feedbackList.reduce((acc, i) => acc + i.rating, 0) / feedbackList.length
                  ).toFixed(1)}{" "}
                  / 5.0
                </span>
              </div>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Flagged For Action</span>
                <span className="text-xl font-bold text-rose-400 font-mono">
                  {feedbackList.filter((i) => i.status === "FLAGGED_FOR_ACTION").length}
                </span>
              </div>
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Resolved Cases</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  {feedbackList.filter((i) => i.status === "RESOLVED").length}
                </span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-semibold">Filter by Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs"
              >
                <option value="ALL">All Categories</option>
                <option value="OVERCROWDING">Overcrowding</option>
                <option value="BUS_DELAY">Bus Delay</option>
                <option value="MISSED_STOP">Missed Stop</option>
                <option value="CLEANLINESS">Cleanliness</option>
                <option value="SUGGESTION">Suggestions</option>
              </select>
            </div>
          </div>

          {/* Feedback Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.commuterName}</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < item.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "FLAGGED_FOR_ACTION"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : item.status === "UNDER_REVIEW"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : item.status === "RESOLVED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Route & Stop */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                      Route {item.routeNum}
                    </span>
                    <span className="text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      {item.stopName}
                    </span>
                    <span className="text-slate-500 text-[11px] ml-auto">
                      Depot: {item.depotAssigned}
                    </span>
                  </div>

                  {/* Comments */}
                  <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                    "{item.comments}"
                  </p>
                </div>

                {/* Triage Status Control */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Update Disposition:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateStatus(item.id, "UNDER_REVIEW")}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-semibold transition"
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => updateStatus(item.id, "FLAGGED_FOR_ACTION")}
                      className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-semibold border border-rose-500/30 transition"
                    >
                      Flag for Fleet
                    </button>
                    <button
                      onClick={() => updateStatus(item.id, "RESOLVED")}
                      className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 transition"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
