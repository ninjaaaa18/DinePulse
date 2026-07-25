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
    };

// Centralizes Gemini access so the API route can stay thin and the key remains server-only.
export async function generateAIResponse(
  prompt: string,
  options: GenerateAIResponseOptions = {},
): Promise<GenerateAIResponseResult> {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();

  if (!apiKey) {
    return {
      success: false,
      error: "Missing GOOGLE_API_KEY environment variable.",
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
    const message = error instanceof Error ? error.message : "Unknown Gemini error";
    return {
      success: false,
      error: `Gemini request failed: ${message}`,
    };
  }
}
