import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Type } from "@google/genai";

// Load local .env if present (Node 22 native loader)
try {
  process.loadEnvFile?.();
} catch {
  // No .env file present; rely on process environment variables
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === "production";

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function generateWithFallback(
  ai: GoogleGenAI,
  params: Omit<Parameters<GoogleGenAI["models"]["generateContent"]>[0], "model">
): Promise<{ response: Awaited<ReturnType<GoogleGenAI["models"]["generateContent"]>>; modelUsed: string }> {
  const models = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"] as const;
  let lastError: unknown;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ ...params, model });
      return { response, modelUsed: model };
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("429");
      if (!isTransient) throw err;
    }
  }
  throw lastError;
}

function getWeatherConditionLabel(code: number): string {
  if (code >= 95) return "Thunderstorm & Heavy Rain";
  if (code >= 80) return "Heavy Monsoon Showers";
  if (code >= 61) return "Moderate to Heavy Rain";
  if (code >= 51) return "Light Drizzle";
  if (code >= 45) return "Fog / Mist";
  if (code >= 1) return "Partly Cloudy";
  return "Clear Sky";
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: "12mb" }));

  interface WeatherPayload {
    source: "open-meteo-live" | "telemetry-fallback";
    fetchedAt: string;
    location: string;
    temperatureC: number;
    humidityPct: number;
    windKmh: number;
    currentRainMmHr: number;
    sixHourForecastMm: number;
    condition: string;
    hourlySeries: Array<{ hour: string; rainMm: number; probabilityPct: number }>;
  }

  let weatherCache: { payload: WeatherPayload; expiresAt: number } | null = null;

  function buildTelemetryFallback(): WeatherPayload {
    const baseRain = [4.2, 8.6, 14.5, 19.2, 16.0, 11.4, 7.8, 5.1, 3.4, 2.2, 1.5, 0.8];
    const nowIst = new Date(Date.now() + 330 * 60 * 1000);
    const startHour = nowIst.getUTCHours();

    return {
      source: "telemetry-fallback",
      fetchedAt: new Date().toISOString(),
      location: "Gurugram (28.4595°N, 77.0266°E)",
      temperatureC: 28,
      humidityPct: 84,
      windKmh: 16,
      currentRainMmHr: 12.4,
      sixHourForecastMm: 68,
      condition: "Monsoon Rain Band (Baseline)",
      hourlySeries: baseRain.map((rainMm, idx) => {
        const hr = (startHour + idx) % 24;
        const hour = `${String(hr).padStart(2, "0")}:00`;
        return {
          hour,
          rainMm,
          probabilityPct: Math.min(95, Math.round(rainMm * 4 + 25)),
        };
      }),
    };
  }

  // Live Gurugram Meteorological Feed (Open-Meteo proxy)
  app.get("/api/weather/gurugram", async (req, res) => {
    const forceRefresh = req.query.force === "1";
    if (!forceRefresh && weatherCache && Date.now() < weatherCache.expiresAt) {
      return res.json(weatherCache.payload);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      const url =
        "https://api.open-meteo.com/v1/forecast?latitude=28.4595&longitude=77.0266&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation,precipitation_probability&timezone=Asia%2FKolkata&forecast_days=1";
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        current?: {
          temperature_2m?: number;
          relative_humidity_2m?: number;
          precipitation?: number;
          rain?: number;
          weather_code?: number;
          wind_speed_10m?: number;
          time?: string;
        };
        hourly?: {
          time?: string[];
          precipitation?: number[];
          precipitation_probability?: number[];
        };
      };

      const currentPrecip = Number(data.current?.precipitation ?? data.current?.rain ?? 0);
      const hourlyPrecip = (data.hourly?.precipitation ?? []).slice(0, 12);
      const hourlyTimes = (data.hourly?.time ?? []).slice(0, 12);
      const hourlyProb = (data.hourly?.precipitation_probability ?? []).slice(0, 12);

      // Compute 6h cumulative forecast from hourly feed
      const sixHourForecastMm = Math.round(
        hourlyPrecip.slice(0, 6).reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0)
      );

      const payload: WeatherPayload = {
        source: "open-meteo-live",
        fetchedAt: new Date().toISOString(),
        location: "Gurugram (28.4595°N, 77.0266°E)",
        temperatureC: Math.round(data.current?.temperature_2m ?? 29),
        humidityPct: Math.round(data.current?.relative_humidity_2m ?? 78),
        windKmh: Math.round(data.current?.wind_speed_10m ?? 14),
        currentRainMmHr: Number(currentPrecip.toFixed(1)),
        sixHourForecastMm,
        condition: getWeatherConditionLabel(data.current?.weather_code ?? 0),
        hourlySeries: hourlyTimes.map((t, idx) => ({
          hour: t.slice(11, 16),
          rainMm: Number((hourlyPrecip[idx] ?? 0).toFixed(1)),
          probabilityPct: Math.round(hourlyProb[idx] ?? 0),
        })),
      };

      weatherCache = { payload, expiresAt: Date.now() + 5 * 60 * 1000 };
      res.json(payload);
    } catch {
      const fallback = buildTelemetryFallback();
      weatherCache = { payload: fallback, expiresAt: Date.now() + 60 * 1000 };
      res.json(fallback);
    } finally {
      clearTimeout(timeout);
    }
  });

  // Multimodal Citizen Flood Report Triage via Gemini
  app.post("/api/ai/triage-report", async (req, res) => {
    try {
      const {
        description = "",
        locationName = "Gurugram Hotspot",
        wardNo,
        causeAnalysis,
        photoBase64,
        photoMimeType,
      } = req.body as {
        description?: string;
        locationName?: string;
        wardNo?: number;
        causeAnalysis?: string;
        photoBase64?: string;
        photoMimeType?: string;
      };

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured on the server.",
        });
      }

      const promptText = `You are the Municipal Corporation of Gurugram (MCG) Flood Command AI Triage Engine.
Analyze this citizen waterlogging report and optional street photo.
Location: ${locationName}${wardNo ? ` (Ward ${wardNo})` : ""}
Known MCG Historical Cause: ${causeAnalysis || "Low-lying urban drainage corridor"}
Citizen Description: ${description || "Waterlogging reported on street"}

Evaluate:
1. Severity tier: critical (knee/waist deep, vehicles stalled, underpass submerged), high (ankle/calf deep, traffic slowed), moderate (curb ponding, lane narrowed), or low (minor puddle).
2. Estimated standing water depth in centimeters (0 to 150).
3. Whether blocked storm drain / silt / telecom cable obstruction is suspected.
4. Recommended primary agency: MCG, GMDA, NHAI, PWD, or Irrigation.
5. Concise 1-2 sentence operational triage summary for the Ward JE.
6. Short 1-sentence commuter safety advice.
7. Confidence score (0 to 100).`;

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (photoBase64 && photoMimeType) {
        const cleanBase64 = photoBase64.includes(",") ? photoBase64.split(",")[1] : photoBase64;
        parts.push({
          inlineData: {
            mimeType: photoMimeType,
            data: cleanBase64,
          },
        });
      }
      parts.push({ text: promptText });

      const { response, modelUsed } = await generateWithFallback(ai, {
        contents: { parts },
        config: {
          systemInstruction:
            "Return strictly valid JSON matching the schema. Be objective, civic-engineering focused, and concise.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              severity: {
                type: Type.STRING,
                description: "One of: critical, high, moderate, low",
              },
              estimatedDepthCm: {
                type: Type.INTEGER,
                description: "Estimated water depth in centimeters",
              },
              blockedDrainSuspected: {
                type: Type.BOOLEAN,
                description: "True if drain blockage or silt accumulation is likely",
              },
              recommendedAgency: {
                type: Type.STRING,
                description: "Primary civic agency: MCG, GMDA, NHAI, PWD, or Irrigation",
              },
              triageSummary: {
                type: Type.STRING,
                description: "Operational summary for the Ward Junior Engineer",
              },
              safetyAdvice: {
                type: Type.STRING,
                description: "Actionable commuter safety instruction",
              },
              confidence: {
                type: Type.INTEGER,
                description: "Confidence percentage from 0 to 100",
              },
            },
            required: [
              "severity",
              "estimatedDepthCm",
              "blockedDrainSuspected",
              "recommendedAgency",
              "triageSummary",
              "safetyAdvice",
              "confidence",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      res.json({
        model: modelUsed,
        ...parsed,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to run AI report triage";
      console.error("[GFC AI Triage] Error:", message);
      res.status(500).json({ error: message });
    }
  });

  // Monsoon Command Tactical Briefing via Gemini
  app.post("/api/ai/briefing", async (req, res) => {
    try {
      const {
        rainfallMm,
        timelineHourOffset,
        pumpMitigationActive,
        highRiskCount,
        topHotspots,
        recentCitizenReports,
        lang = "en",
      } = req.body as {
        rainfallMm: number;
        timelineHourOffset: number;
        pumpMitigationActive: boolean;
        highRiskCount: number;
        topHotspots: Array<{
          name: string;
          wardNo: number;
          zone: number;
          riskPct: number;
          causeAnalysis: string;
          owningAgency: string;
          jeName: string;
        }>;
        recentCitizenReports: Array<{
          locationName: string;
          severity: string;
          description: string;
        }>;
        lang?: "en" | "hi";
      };

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured on the server.",
        });
      }

      const prompt = `Generate a high-precision Municipal Command Monsoon Briefing for Gurugram (MCG + GMDA + NHAI).
Language requested: ${lang === "hi" ? "Hindi (Devanagari script, professional civic terminology)" : "English"}.
Live Telemetry Context:
- Simulated/Forecast 6h Rainfall: ${rainfallMm} mm
- Timeline Horizon: T${timelineHourOffset >= 0 ? `+${timelineHourOffset}` : timelineHourOffset}h
- Pre-positioned Pump Mitigation Active: ${pumpMitigationActive ? "YES" : "NO"}
- High/Critical Risk Hotspots Count (out of 153 official MCG points): ${highRiskCount}

Top Vulnerable Hotspots Right Now:
${topHotspots
  .map(
    (h, i) =>
      `${i + 1}. ${h.name} (Ward ${h.wardNo}, Zone ${h.zone}) — Risk ${h.riskPct}% — Agency: ${h.owningAgency} — JE: ${h.jeName} — Cause: ${h.causeAnalysis}`
  )
  .join("\n")}

Recent Citizen Flood Reports:
${
  recentCitizenReports.length > 0
    ? recentCitizenReports.map((r) => `- ${r.locationName} [${r.severity}]: ${r.description}`).join("\n")
    : "No unverified citizen field reports in queue."
}

Produce concise, decisive operational commands.`;

      const { response, modelUsed } = await generateWithFallback(ai, {
        contents: prompt,
        config: {
          systemInstruction:
            "You are the Chief Municipal Flood Operations Analyst for Gurugram. Provide concrete, ward-specific directives with zero fluff.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: {
                type: Type.STRING,
                description: "Short 8-12 word operational situation headline",
              },
              executiveSummary: {
                type: Type.STRING,
                description: "2-3 sentence summary of drainage pressure and immediate threat",
              },
              priorityWards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    wardLabel: { type: Type.STRING },
                    actionDirective: { type: Type.STRING },
                    officerToAlert: { type: Type.STRING },
                  },
                  required: ["wardLabel", "actionDirective", "officerToAlert"],
                },
              },
              interAgencyDirectives: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              pumpReallocationAdvice: {
                type: Type.STRING,
              },
            },
            required: [
              "headline",
              "executiveSummary",
              "priorityWards",
              "interAgencyDirectives",
              "pumpReallocationAdvice",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      res.json({
        generatedAt: new Date().toISOString(),
        model: modelUsed,
        ...parsed,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate AI briefing";
      console.error("[GFC AI Briefing] Error:", message);
      res.status(500).json({ error: message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.use((req, res, next) => {
      if (req.method !== "GET") return next();
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GFC Server] Listening on http://0.0.0.0:${PORT} (${isProduction ? "production" : "development"})`);
  });
}

createServer().catch((err) => {
  console.error("[GFC Server] Fatal startup error:", err);
  process.exit(1);
});
