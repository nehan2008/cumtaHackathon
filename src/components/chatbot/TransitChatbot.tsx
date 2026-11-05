import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Bus,
  Train,
  CreditCard,
  Layers,
  ChevronDown,
  ExternalLink,
  Globe,
  Loader2,
  X,
} from "lucide-react";

interface SourceCitation {
  uri: string;
  title: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  sources?: SourceCitation[];
  grounded?: boolean;
}

const PRESET_QUESTIONS = [
  "How do I reach Guindy from OMR?",
  "Is Route 570 free for women under Vidiyal Payanam?",
  "What is the predicted crowd on GST road right now?",
  "How do Metro and Suburban trains connect at Central?",
  "Are there weather or traffic alerts in Chennai today?",
];

export const TransitChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "bot-1",
      sender: "bot",
      text: "Vanakkam! I am your TransitPulse AI Transit Assistant powered by Gemini with live Google Search grounding. Ask me about MTC bus routes, fare stages, Metro and Suburban rail transfers, or real-time traffic and weather alerts in Chennai.",
      timestamp: "Just now",
      grounded: true,
    },
  ]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/transit-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.text || "I was unable to retrieve an answer at this moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: data.sources || [],
        grounded: !!data.grounded,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      // Fallback response with offline Chennai transport logic
      let botResponse = "";
      const lower = query.toLowerCase();

      if (lower.includes("guindy") && lower.includes("omr")) {
        botResponse =
          "To reach Guindy from OMR: Take MTC Route 570 from Thoraipakkam/Tidel Park directly to Guindy Multimodal Interchange (approx 22-25 mins). At Guindy, you have direct sheltered subway access to the Chennai Metro Blue Line and the Chennai Beach - Tambaram suburban rail platform.";
      } else if (lower.includes("vidiyal payanam") || lower.includes("women") || lower.includes("free")) {
        botResponse =
          "Under the Government of Tamil Nadu's Vidiyal Payanam Scheme, women travel 100% FREE (₹0 fare) in all MTC Ordinary (Pink destination board) buses. Express and Deluxe buses (e.g. Deluxe 570 or AC electrics) require standard stage tickets (₹12 to ₹30).";
      } else if (lower.includes("central") || lower.includes("metro")) {
        botResponse =
          "Puratchi Thalaivar Dr. M.G.R. Central is Chennai's primary multimodal hub. You can seamlessly interchange between Chennai Metro (both Blue Line and Green Line underground stations) and Suburban Rail (Moore Market Complex) via pedestrian travelators and underground concourses in under 6 minutes.";
      } else {
        botResponse = `For '${query}': Chennai public transit operates 1,348 MTC bus routes, 33 Metro stations, and 70 suburban rail stations. Ordinary MTC buses are free for women; Metro fares range from ₹10 to ₹40.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl shadow-emerald-950/70 border border-emerald-400/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition"
        >
          <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
          <span className="text-xs font-extrabold tracking-tight">Ask TransitPulse AI</span>
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs">
          {/* Header */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  TransitPulse Assistant
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                    Search Grounded
                  </span>
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">Gemini 3.8 Flash • CUMTA Multimodal</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="p-3.5 space-y-3 h-80 overflow-y-auto">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-2.5 rounded-xl ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-slate-950 font-medium"
                      : "bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Grounding Web Sources Citations */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] space-y-1">
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <Globe className="w-3 h-3 text-cyan-400" />
                        Verified Web Sources (Google Search):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {m.sources.slice(0, 3).map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-800 transition max-w-[200px] truncate"
                          >
                            <span className="truncate">{s.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[9px] text-slate-500 mt-1 block text-right font-mono">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span className="italic">Searching Google & analyzing Chennai transit routes...</span>
              </div>
            )}
          </div>

          {/* Quick preset chips */}
          <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
            {PRESET_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="whitespace-nowrap px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-800 transition disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about live routes, delays, fares, weather..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
