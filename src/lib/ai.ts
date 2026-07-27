import { GoogleGenAI } from "@google/genai";

export type GenerateAIResponseOptions = {
  model?: string;
  temperature?: number;
  systemInstruction?: string;
};

export type GenerateAIResponseResult =
  | {
      success: true;
      response: string;
      model: string;
    }
  | {
      success: false;
      error: string;
      rawError?: string;
      statusCode?: number;
    };

// Centralizes Gemini access so the API route can stay thin and the key remains server-only.
export async function generateAIResponse(
  prompt: string,
  options: GenerateAIResponseOptions = {},
): Promise<GenerateAIResponseResult> {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();

  if (!apiKey) {
    console.error("[Server Gemini AI] Missing GOOGLE_API_KEY environment variable.");
    return {
      success: false,
      error: "AI service authentication error. API key is not configured.",
      statusCode: 500,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = options.model ?? "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: options.temperature ?? 0.7,
        ...(options.systemInstruction
          ? { systemInstruction: options.systemInstruction }
          : {}),
      },
    });

    return {
      success: true,
      response: response.text ?? "",
      model,
    };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    console.error("[Server Gemini AI Error]:", rawMessage);

    let statusCode = 500;
    let friendlyMessage = "AI service encountered an internal error. Please try again shortly.";

    if (
      rawMessage.includes("429") ||
      rawMessage.includes("RESOURCE_EXHAUSTED") ||
      rawMessage.toLowerCase().includes("quota")
    ) {
      statusCode = 429;
      friendlyMessage = "Gemini AI rate limit reached. Please wait a moment and try again.";
    } else if (
      rawMessage.includes("503") ||
      rawMessage.includes("UNAVAILABLE") ||
      rawMessage.toLowerCase().includes("overloaded")
    ) {
      statusCode = 503;
      friendlyMessage = "Gemini AI service is temporarily busy. Please try again in a few seconds.";
    } else if (rawMessage.includes("400") || rawMessage.includes("INVALID_ARGUMENT")) {
      statusCode = 400;
      friendlyMessage = "Invalid request parameters for AI analysis.";
    } else if (rawMessage.includes("401") || rawMessage.includes("403") || rawMessage.includes("API_KEY")) {
      statusCode = 401;
      friendlyMessage = "AI authentication error. Please verify server API key configuration.";
    }

    return {
      success: false,
      error: friendlyMessage,
      rawError: rawMessage,
      statusCode,
    };
  }
}
