export type AIResponsePayload<T = Record<string, unknown>> = {
  success: boolean;
  analysis?: T;
  error?: string;
  model?: string;
};

/**
 * Parses raw errors or response payloads into human-friendly, user-facing error messages.
 * Logs full technical details strictly to the browser console.
 */
export function handleAIError(error: unknown, response?: Response | null, rawPayload?: unknown): string {
  // Always log detailed raw technical error to browser console only
  console.error("[DinePulse AI Console Error Log]:", {
    error,
    status: response?.status,
    statusText: response?.statusText,
    rawPayload,
  });

  // Handle timeout and network errors
  if (error instanceof Error) {
    if (error.name === "AbortError" || error.message.toLowerCase().includes("timeout")) {
      return "AI request timed out. Please check your connection and try again.";
    }
    if (error instanceof TypeError || error.message.toLowerCase().includes("fetch")) {
      return "Network connection issue. Please check your internet connection and try again.";
    }
  }

  // Handle HTTP status codes
  const status = response?.status;
  if (status === 429) {
    return "AI assistant rate limit reached. Please wait a moment and try again.";
  }
  if (status === 503) {
    return "AI service is temporarily busy. Please try again in a few seconds.";
  }
  if (status === 500) {
    return "AI service encountered an internal error. Please try again shortly.";
  }
  if (status === 401 || status === 403) {
    return "AI authentication error. Please verify server API configuration.";
  }

  // Extract error string from payload if available
  if (rawPayload && typeof rawPayload === "object") {
    const payloadObj = rawPayload as Record<string, unknown>;
    const rawErrorStr = typeof payloadObj.error === "string" ? payloadObj.error : null;

    if (rawErrorStr) {
      const trimmed = rawErrorStr.trim();

      // Prevent exposing raw JSON error strings like `{"error":{"code":429...}}`
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        if (trimmed.includes("429") || trimmed.includes("RESOURCE_EXHAUSTED")) {
          return "AI assistant rate limit reached. Please wait a moment and try again.";
        }
        if (trimmed.includes("503") || trimmed.includes("UNAVAILABLE")) {
          return "AI service is temporarily busy. Please try again in a few seconds.";
        }
        return "AI analysis is currently unavailable. Please try again.";
      }

      // Filter out technical prefixes
      const cleanMessage = trimmed
        .replace(/^Gemini request failed:\s*/i, "")
        .replace(/^Failed to process AI request:\s*/i, "");

      if (cleanMessage.startsWith("{")) {
        return "AI analysis is currently unavailable. Please try again.";
      }

      return cleanMessage;
    }
  }

  return "Unable to complete AI request right now. Please try again.";
}

/**
 * Client helper to call /api/ai with built-in timeout, HTTP status handling, and friendly error parsing.
 */
export async function callAIAPI<T = Record<string, unknown>>(
  body: { type: string; prompt?: string; data?: Record<string, unknown> },
  timeoutMs = 25000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response | null = null;
  let rawPayload: unknown = null;

  try {
    response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    rawPayload = await response.json().catch(() => null);

    if (!response.ok || !rawPayload || (typeof rawPayload === "object" && !(rawPayload as Record<string, unknown>).success)) {
      const friendlyError = handleAIError(null, response, rawPayload);
      throw new Error(friendlyError);
    }

    const payloadObj = rawPayload as AIResponsePayload<T>;
    if (!payloadObj.analysis) {
      throw new Error("Received incomplete response from AI service.");
    }

    return payloadObj.analysis;
  } catch (err) {
    if (err instanceof Error && err.message && !err.message.includes("fetch") && err.name !== "AbortError" && response?.ok === false) {
      throw err;
    }

    const friendlyMessage = handleAIError(err, response, rawPayload);
    throw new Error(friendlyMessage);
  } finally {
    clearTimeout(timer);
  }
}
