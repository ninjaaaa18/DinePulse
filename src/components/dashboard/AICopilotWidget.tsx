"use client";

import { useEffect, useRef, useState } from "react";
import { useActiveOrder } from "@/components/dashboard/ActiveOrderProvider";
import { useNotifications } from "@/components/dashboard/NotificationProvider";
import {
  buildCustomerHealthAnalysisPayload,
  buildDietarySafetyAnalysisPayload,
  buildRestaurantHealthAnalysisPayload,
  getStoredAnalyticsSnapshot,
  getStoredInventoryState,
} from "@/lib/orderAnalysis";
import { callAIAPI } from "@/lib/aiClient";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
};

const suggestedPrompts = [
  "Which menu item should I promote today?",
  "What should I restock?",
  "Predict tomorrow.",
  "Reduce food waste.",
  "Improve customer satisfaction.",
  "Why is my restaurant health score decreasing?",
  "Give today's summary.",
];

function formatTime(date: Date = new Date()) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function FormattedText({ text }: { text: string }) {
  // Simple, clean markdown-like parser for bold text, headers, and bullet points
  const lines = text.split("\n");
  let lineCounter = 0;

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line) => {
        const trimmed = line.trim();
        const lineKey = `copilot-line-${trimmed.slice(0, 10)}-${++lineCounter}`;
        if (!trimmed) return <div key={lineKey} className="h-1" />;

        if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
          const title = trimmed.replace(/^#+\s*/, "");
          return (
            <p key={lineKey} className="font-semibold text-emerald-light">
              {title}
            </p>
          );
        }

        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*");
        const cleanContent = isBullet ? trimmed.replace(/^[•\-*]\s*/, "") : trimmed;

        // Bold formatting parse (**bold**)
        const parts = cleanContent.split(/(\*\*.*?\*\*)/g);
        let partCount = 0;
        const renderedParts = parts.map((part) => {
          const partKey = `copilot-part-${part.slice(0, 10)}-${++partCount}`;
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partKey} className="font-semibold text-white">
                {part.slice(2, -2)}
              </strong>
            );
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

export default function AICopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { activeOrder } = useActiveOrder();
  const { notifications, notify } = useNotifications();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "👋 Hello! I am your **DinePulse AI Copilot**. I analyze live orders, inventory stock, customer health metrics, and revenue trends in real time.\n\nHow can I help optimize your restaurant operations today?",
      timestamp: formatTime(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isThinking]);

  function compileLiveDashboardContext() {
    const analytics = getStoredAnalyticsSnapshot();
    const inventory = getStoredInventoryState();

    const lowStockIngredients = inventory
      .filter((item) => item.status === "Critical" || item.status === "Low")
      .map((item) => ({
        name: item.name,
        remainingStock: `${item.currentStock} ${item.unit}`,
        remainingPercent: `${item.remainingPercent}%`,
        status: item.status,
        warning: item.warning,
      }));

    const restaurantHealthScore = analytics.totalOrders > 0
      ? Math.round(analytics.averageMealHealthScore * 0.5 + analytics.averageCustomerSatisfaction * 0.5)
      : 92;

    return {
      activeOrder: activeOrder
        ? {
            orderId: activeOrder.orderId ?? "live-order",
            restaurant: activeOrder.selectedRestaurantName,
            cuisine: activeOrder.restaurantCuisine,
            items: activeOrder.items.map((item) => `${item.name} (x${item.quantity})`),
            totalCalories: activeOrder.totalCalories,
            averageMealScore: activeOrder.averageMealScore,
            subtotal: activeOrder.subtotal,
          }
        : "No active order placed yet",
      inventory: {
        totalIngredientsTracked: inventory.length,
        lowStockItemsCount: lowStockIngredients.length,
        lowStockIngredients,
        fullStockState: inventory.map((i) => ({
          name: i.name,
          currentStock: i.currentStock,
          unit: i.unit,
          status: i.status,
        })),
      },
      analytics: {
        totalOrders: analytics.totalOrders,
        revenue: analytics.revenue,
        averageMealHealthScore: analytics.averageMealHealthScore,
        popularDish: analytics.popularDish,
        healthyMealPercent: analytics.healthyMealPercent,
        unhealthyMealPercent: analytics.unhealthyMealPercent,
        customerSatisfactionScore: analytics.averageCustomerSatisfaction,
        topSellingFoods: analytics.topSellingFoods,
      },
      recentNotifications: notifications.slice(0, 5).map((n) => ({
        title: n.title,
        category: n.category,
        severity: n.severity,
      })),
      restaurantHealth: activeOrder
        ? buildRestaurantHealthAnalysisPayload(activeOrder)
        : { overallHealthScore: restaurantHealthScore, status: "Healthy" },
      customerHealth: activeOrder
        ? buildCustomerHealthAnalysisPayload(activeOrder)
        : { averageScore: analytics.averageMealHealthScore || 87 },
      dietarySafety: activeOrder
        ? buildDietarySafetyAnalysisPayload(activeOrder)
        : { status: "Active risk checks enabled" },
      aiPredictions: {
        projectedTomorrowDemand: analytics.totalOrders > 0 ? Math.round(analytics.totalOrders * 1.12) : 32,
        projectedFoodWastePercent: Math.min(12, Math.max(2, Math.round(3 + lowStockIngredients.length * 0.8))),
      },
    };
  }

  async function handleSendMessage(promptText: string) {
    const userPrompt = promptText.trim();
    if (!userPrompt || isThinking) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userPrompt,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const context = compileLiveDashboardContext();

      const analysis = await callAIAPI<{ reply?: string }>({
        type: "chat",
        prompt: userPrompt,
        data: context,
      });

      const aiReply = analysis.reply || "Here is your operational update based on your live restaurant context.";

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiReply,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Automatically dispatch notification for important recommendations
      notify({
        icon: "✦",
        title: "AI Copilot recommendation",
        description: aiReply.replace(/\*\*/g, "").slice(0, 110) + (aiReply.length > 110 ? "..." : ""),
        category: "AI",
        severity: "ai-generated",
        dedupeKey: `copilot-rec-${Date.now()}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to process request.";
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: `⚠️ **Notice**: ${errorMessage}`,
          timestamp: formatTime(),
        },
      ]);
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
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "👋 Chat cleared. I am ready with your **DinePulse AI Copilot** live context.\n\nWhat would you like to explore next?",
        timestamp: formatTime(),
      },
    ]);
  }

  return (
    <>
      {/* Floating AI Assistant Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle AI Restaurant Manager Copilot"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald/30 bg-gradient-to-br from-emerald/90 to-emerald-dark p-0.5 text-white shadow-2xl shadow-emerald/30 transition-all duration-300 hover:scale-105 active:scale-95 sm:h-15 sm:w-15"
      >
        <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-surface/40 backdrop-blur-md">
          <span className="text-2xl animate-pulse">✦</span>
        </div>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-light opacity-75" />
          <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald" />
        </span>
      </button>

      {/* Floating AI Chat Drawer Modal */}
      {isOpen ? (
        <div className="fixed bottom-24 right-4 z-50 flex h-[620px] max-h-[82vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-emerald/20 bg-surface/95 shadow-2xl shadow-emerald/15 backdrop-blur-2xl transition-all duration-300 sm:right-6 sm:w-[440px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-background/50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald/30 bg-emerald/15 text-lg text-emerald">
                🤖
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-base">AI Copilot</h3>
                  <span className="rounded-full bg-emerald/20 px-2 py-0.5 text-[10px] font-semibold text-emerald">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-muted">AI Restaurant Operations Manager</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearChat}
                className="rounded-lg px-2.5 py-1 text-xs text-muted transition-colors hover:bg-white/10 hover:text-white"
                title="Clear conversation"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close AI Copilot chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isUser = message.sender === "user";
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 text-[11px] text-muted mb-1 px-1">
                    <span>{isUser ? "You" : "DinePulse AI"}</span>
                    <span>•</span>
                    <span>{message.timestamp}</span>
                  </div>

                  <div
                    className={`group relative max-w-[88%] rounded-2xl px-4 py-3 text-white transition-all ${
                      isUser
                        ? "bg-gradient-to-r from-emerald-dark to-emerald text-white rounded-br-none shadow-lg shadow-emerald/10"
                        : "border border-white/10 bg-background/80 rounded-bl-none text-white/90"
                    }`}
                  >
                    <FormattedText text={message.text} />

                    {!isUser ? (
                      <button
                        type="button"
                        onClick={() => handleCopy(message.text, message.id)}
                        className="mt-2 flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-emerald"
                      >
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
                  <span>Analyzing context...</span>
                </div>
                <div className="rounded-2xl rounded-bl-none border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm text-emerald flex items-center gap-2">
                  <span className="animate-spin text-base">✦</span>
                  <span>Copilot is analyzing your live restaurant data...</span>
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Chips */}
          <div className="border-t border-white/10 bg-background/40 p-3">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-muted font-medium">
              Suggested Questions
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void handleSendMessage(prompt)}
                  disabled={isThinking}
                  className="whitespace-nowrap rounded-xl border border-white/10 bg-surface/80 px-3 py-1.5 text-muted transition-colors hover:border-emerald/40 hover:bg-emerald/10 hover:text-emerald"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage(input);
            }}
            className="border-t border-white/10 bg-surface/90 p-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI Manager..."
              disabled={isThinking}
              className="flex-1 rounded-xl border border-white/10 bg-background/60 px-4 py-2.5 text-sm text-white placeholder-muted focus:border-emerald/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald text-white transition-all hover:bg-emerald-light disabled:opacity-40"
              aria-label="Send message"
            >
              ➔
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
