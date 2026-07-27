"use client";

import { useEffect, useRef, useState } from "react";
import Card from "@/components/cards/Card";
import { callAIAPI } from "@/lib/aiClient";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";
import {
  buildCustomerHealthAnalysisPayload,
  buildDietarySafetyAnalysisPayload,
  buildRestaurantHealthAnalysisPayload,
  getStoredAnalyticsSnapshot,
  getStoredInventoryState,
} from "@/lib/orderAnalysis";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
};

const suggestedPrompts = [
  "What should I restock today?",
  "Which menu item should I promote?",
  "Predict tomorrow's demand.",
  "How can I improve restaurant health?",
  "Reduce food waste.",
  "Which items are underperforming?",
];

function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n");
  let lineCounter = 0;
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line) => {
        const trimmed = line.trim();
        const lineKey = `copilot-line-${trimmed.slice(0, 10)}-${++lineCounter}`;
        if (!trimmed) return <div key={lineKey} className="h-1" />;
        if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
          return <p key={lineKey} className="font-semibold text-emerald-light">{trimmed.replace(/^#+\s*/, "")}</p>;
        }
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*");
        const cleanContent = isBullet ? trimmed.replace(/^[•\-*]\s*/, "") : trimmed;
        const parts = cleanContent.split(/(\*\*.*?\*\*)/g);
        let partCount = 0;
        const renderedParts = parts.map((part) => {
          const partKey = `copilot-part-${part.slice(0, 10)}-${++partCount}`;
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={partKey} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
          }
          return <span key={partKey}>{part}</span>;
        });
        return (
          <p key={lineKey} className={isBullet ? "pl-3 flex items-start gap-1.5" : ""}>
            {isBullet ? <span className="text-emerald">•</span> : null}
            <span>{renderedParts}</span>
          </p>
        );
      })}
    </div>
  );
}

function compileLiveDashboardContext() {
  const analytics = getStoredAnalyticsSnapshot();
  const inventory = getStoredInventoryState();
  const lowStockIngredients = inventory.filter((item) => item.status === "Critical" || item.status === "Low").map((item) => ({
    name: item.name,
    remainingStock: `${item.currentStock} ${item.unit}`,
    remainingPercent: `${item.remainingPercent}%`,
    status: item.status,
    warning: item.warning,
  }));
  return {
    inventory: { totalIngredientsTracked: inventory.length, lowStockItemsCount: lowStockIngredients.length, lowStockIngredients },
    analytics: {
      totalOrders: analytics.totalOrders,
      revenue: analytics.revenue,
      averageMealHealthScore: analytics.averageMealHealthScore,
      popularDish: analytics.popularDish,
      healthyMealPercent: analytics.healthyMealPercent,
      customerSatisfactionScore: analytics.averageCustomerSatisfaction,
      topSellingFoods: analytics.topSellingFoods,
    },
    aiPredictions: {
      projectedTomorrowDemand: analytics.totalOrders > 0 ? Math.round(analytics.totalOrders * 1.12) : 32,
    },
  };
}

export default function AICopilotDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  async function handleSendMessage(promptText: string) {
    const userPrompt = promptText.trim();
    if (!userPrompt || isThinking) return;
    setHasStarted(true);

    const userMessage: Message = { id: `user-${Date.now()}`, sender: "user", text: userPrompt, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const context = compileLiveDashboardContext();
      const analysis = await callAIAPI<{ reply?: string }>({ type: "chat", prompt: userPrompt, data: context });
      const aiReply = analysis.reply || "Here is your operational update.";
      const aiMessage: Message = { id: `ai-${Date.now()}`, sender: "ai", text: aiReply, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: `ai-err-${Date.now()}`, sender: "ai", text: `⚠️ **Notice**: ${err instanceof Error ? err.message : "Unable to process request."}`, timestamp: "" }]);
    } finally {
      setIsThinking(false);
    }
  }

  function handleCopy(text: string, id: string) {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleClearChat() {
    setMessages([]);
    setHasStarted(false);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald">Restaurant Owner</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">AI Copilot</h1>
            <p className="mt-1 text-sm text-muted">Your AI restaurant operations manager.</p>
          </div>
          {hasStarted ? (
            <button type="button" onClick={handleClearChat} className="rounded-xl border border-white/10 px-4 py-2 text-xs text-muted transition-colors hover:bg-white/5 hover:text-white">
              Clear Chat
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col">
          {!hasStarted ? (
            <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-surface p-8 min-h-[500px]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald/20 to-emerald/5 text-3xl shadow-lg shadow-emerald/10">
                🤖
              </div>
              <h2 className="mt-6 text-xl font-bold text-white">Ask DinePulse AI</h2>
              <p className="mt-2 text-sm text-muted text-center max-w-md">
                Get instant insights about inventory, demand, menu performance, and restaurant health.
              </p>

              <div className="mt-8 w-full max-w-lg">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted text-center">Suggested Questions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void handleSendMessage(prompt)}
                      className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm text-muted transition-all hover:border-emerald/30 hover:bg-emerald/[0.03] hover:text-white"
                    >
                      ✦ {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 w-full max-w-lg">
                <form
                  onSubmit={(e) => { e.preventDefault(); void handleSendMessage(input); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald text-white transition-all hover:bg-emerald-light disabled:opacity-40"
                  >
                    ➔
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col rounded-2xl border border-white/5 bg-surface min-h-[500px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
                {messages.map((message) => {
                  const isUser = message.sender === "user";
                  return (
                    <div key={message.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 text-[11px] text-muted mb-1 px-1">
                        <span>{isUser ? "You" : "DinePulse AI"}</span>
                        <span>•</span>
                        <span>{message.timestamp}</span>
                      </div>
                      <div className={`group relative max-w-[88%] rounded-2xl px-4 py-3 text-white transition-all ${
                        isUser
                          ? "bg-gradient-to-r from-emerald-dark to-emerald text-white rounded-br-none shadow-lg shadow-emerald/10"
                          : "border border-white/10 bg-background/80 rounded-bl-none text-white/90"
                      }`}>
                        <FormattedText text={message.text} />
                        {!isUser ? (
                          <button type="button" onClick={() => handleCopy(message.text, message.id)} className="mt-2 flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-emerald">
                            <span>{copiedId === message.id ? "✓ Copied" : "📋 Copy"}</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

                {isThinking ? (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2 text-[11px] text-muted mb-1 px-1">
                      <span>DinePulse AI</span>
                      <span>•</span>
                      <span>Analyzing...</span>
                    </div>
                    <div className="rounded-2xl rounded-bl-none border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm text-emerald flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-emerald" style={{ animationDelay: "300ms" }} />
                      </span>
                      <span>Analyzing your restaurant data...</span>
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/10 p-3">
                <form onSubmit={(e) => { e.preventDefault(); void handleSendMessage(input); }} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your AI Manager..."
                    disabled={isThinking}
                    className="flex-1 rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
                  />
                  <button type="submit" disabled={!input.trim() || isThinking} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald text-white transition-all hover:bg-emerald-light disabled:opacity-40">
                    ➔
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {!hasStarted ? (
          <div className="w-full lg:w-72 space-y-3">
            <Card className="space-y-3">
              <h3 className="text-sm font-semibold text-white">💡 Tips</h3>
              <ul className="space-y-2 text-xs text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-emerald mt-0.5">•</span>
                  <span>Ask specific questions for better answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald mt-0.5">•</span>
                  <span>Mention inventory items by name</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald mt-0.5">•</span>
                  <span>Request predictions for tomorrow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald mt-0.5">•</span>
                  <span>Ask about revenue trends</span>
                </li>
              </ul>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
