import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";

type SupportedAIType = "meal-analysis" | "restaurant-health" | "dietary-safety" | "chat";

type AIRequestBody = {
  type?: string;
  prompt?: string;
  data?: Record<string, unknown>;
};

// Server-side API route for Gemini requests. The frontend never sees the API key.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as AIRequestBody | null;
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const type = typeof body?.type === "string" ? body.type : "chat";
    const data = body?.data && typeof body.data === "object" ? body.data : {};
    const dataText = JSON.stringify(data, null, 2);

    let systemInstruction = "You are a helpful DinePulse AI assistant.";
    let finalPrompt = prompt;

    // Route the request through a switch so each service can use its own role and prompt style.
    switch (type as SupportedAIType) {
      case "meal-analysis":
        systemInstruction = "You are a Certified Nutritionist.";
        finalPrompt = [
          "Analyze the provided meal data for nutrition quality, health impact, and practical guidance.",
          "Keep the response concise and useful for restaurant customers.",
          `Data:\n${dataText}`,
          prompt ? `Additional context:\n${prompt}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");
        break;

      case "restaurant-health":
        systemInstruction = "You are a Restaurant Operations Consultant.";
        finalPrompt = [
          "Evaluate the provided restaurant health data and summarize operational risks, customer impact, and improvement ideas.",
          `Data:\n${dataText}`,
          prompt ? `Additional context:\n${prompt}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");
        break;

      case "dietary-safety":
        systemInstruction = "You are a Clinical Dietitian and Allergy Specialist.";
        finalPrompt = [
          "Review the provided dietary safety data and identify allergy risks, contraindications, and safer alternatives.",
          "Be clear and cautious when discussing medical or allergy-related concerns.",
          `Data:\n${dataText}`,
          prompt ? `Additional context:\n${prompt}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");
        break;

      case "chat":
      default:
        systemInstruction = "You are a DinePulse AI Assistant.";
        finalPrompt = prompt || `Respond helpfully to the following request.\n\nData:\n${dataText}`;
        break;
    }

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
      systemInstruction,
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

    return NextResponse.json({
      success: true,
      response: result.response,
      model: result.model,
    });
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
