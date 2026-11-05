import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI client server-side with required User-Agent header
const geminiApiKey = process.env.GEMINI_API_KEY || "";
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Transit AI Search-Grounded API endpoint
app.post("/api/transit-ai", async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "A message string is required." });
    return;
  }

  // If Gemini API Key is configured, use gemini-3.8-flash with googleSearch tool grounding
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `You are TransitPulse AI, an intelligent assistant for Chennai Metropolitan Public Transport (MTC Buses, Chennai Metro Rail CMRL, and Southern Railway Suburban EMU) developed for the CUMTA Hackathon.
You have access to live Google Search grounding to retrieve up-to-date and accurate information about Chennai transit, road traffic, monsoon weather, Metro Phase 2 construction detours, bus routes, fares, and multimodal connections.

User Query: ${message}`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "No response received from the model.";

      // Extract search grounding web sources
      const searchChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = searchChunks
        .filter((c: any) => c.web?.uri)
        .map((c: any) => ({
          uri: c.web.uri,
          title: c.web.title || c.web.uri,
        }));

      res.json({
        text,
        sources,
        grounded: sources.length > 0,
      });
      return;
    } catch (err: any) {
      console.error("Gemini API call error:", err);
      // Fallback response with offline Chennai transport logic
    }
  }

  // Graceful response when GEMINI_API_KEY is not yet injected or offline
  const lower = message.toLowerCase();
  let text = "";
  if (lower.includes("guindy") && lower.includes("omr")) {
    text =
      "To reach Guindy from OMR: Take MTC Route 570 from Thoraipakkam/Tidel Park directly to Guindy Multimodal Interchange (approx 22-25 mins). At Guindy, you have direct sheltered subway access to the Chennai Metro Blue Line and the Chennai Beach - Tambaram suburban rail platform.";
  } else if (lower.includes("vidiyal payanam") || lower.includes("women") || lower.includes("free")) {
    text =
      "Under the Government of Tamil Nadu's Vidiyal Payanam Scheme, women travel 100% FREE (₹0 fare) in all MTC Ordinary (Pink destination board) buses. Express and Deluxe buses (e.g. Deluxe 570 or AC electrics) require standard stage tickets (₹12 to ₹30).";
  } else if (lower.includes("central") || lower.includes("metro")) {
    text =
      "Puratchi Thalaivar Dr. M.G.R. Central is Chennai's primary multimodal hub. You can seamlessly interchange between Chennai Metro (both Blue Line and Green Line underground stations) and Suburban Rail (Moore Market Complex) via pedestrian travelators and underground concourses in under 6 minutes.";
  } else {
    text = `For your transit query regarding "${message}": Chennai transit features 1,348 MTC bus routes, 33 Metro stations, and 70 suburban rail stations. MTC Ordinary buses are ₹5–₹14 (free for women); Metro is ₹10–₹40 with 20% NCMC discount.`;
  }

  res.json({
    text,
    sources: [],
    grounded: false,
  });
});

// Start dev server with Vite middlewares
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TransitPulse full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
