import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Send, Zap, AlertCircle, TrendingDown, Droplet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Miner } from "@shared/schema";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  diagnostics?: {
    confidence: number;
    factors: string[];
    recommendations: string[];
  };
};

const FAQItems = [
  {
    question: "Why did my hashrate drop suddenly?",
    answer:
      "Common causes: (1) Network difficulty spike, (2) Hardware overheating (check temps), (3) Worker disconnections (verify pool settings), (4) Intensity too high (reduce by 10%), (5) ISP throttling (contact provider)",
  },
  {
    question: "What does 'Luck' mean?",
    answer:
      "Luck = Expected shares vs actual shares. Luck > 100% = you found more blocks than statistically expected. Luck < 100% = temporary variance. Normal: 80%-120%. Use >10h avg for stability.",
  },
  {
    question: "How do I maximize rewards?",
    answer:
      "1. Run multiple workers (load balance), 2. Optimize intensity (starts at 64, increase by 1 until stability drops), 3. Monitor temp < 75°C, 4. Check network latency to pool (target <50ms), 5. Enable SSL if available",
  },
  {
    question: "What causes orphaned blocks?",
    answer:
      "Stale shares submitted after network finds block. Minimize by: reducing network latency, using geographically close pool, enabling TCP Fast Open, updating driver software.",
  },
  {
    question: "How often do payouts happen?",
    answer:
      "BlockDAG pays every ~1h (3600s payout interval). Must exceed pool minimum (usually 1 BDAG). Check your account; pending payouts appear in wallet.",
  },
];

export default function AISupport() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: miners } = useQuery<Miner[]>({
    queryKey: ["/api/miners"],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Rule-based AI diagnostics
  const generateDiagnostics = (query: string): NonNullable<Message["diagnostics"]> => {
    const lowerQuery = query.toLowerCase();
    let factors: string[] = [];
    let recommendations: string[] = [];
    let confidence = 0.85;

    // Detect common issues
    if (
      lowerQuery.includes("drop") ||
      lowerQuery.includes("decrease") ||
      lowerQuery.includes("low")
    ) {
      factors.push("Hashrate variance detected");
      recommendations.push(
        "Check worker connection status",
        "Verify pool connectivity",
        "Review hardware temperature"
      );
      confidence = 0.78;
    }

    if (lowerQuery.includes("heat") || lowerQuery.includes("temp")) {
      factors.push("Thermal issue suspected");
      recommendations.push(
        "Reduce GPU clock by 50MHz",
        "Increase fan speed to 80%",
        "Clean dust filters immediately"
      );
      confidence = 0.82;
    }

    if (
      lowerQuery.includes("stale") ||
      lowerQuery.includes("orphan") ||
      lowerQuery.includes("invalid")
    ) {
      factors.push("Share quality issue");
      recommendations.push(
        "Reduce pool latency (switch to closer server)",
        "Lower intensity by 5%",
        "Enable TCP Fast Open"
      );
      confidence = 0.88;
    }

    if (lowerQuery.includes("reward") || lowerQuery.includes("payout")) {
      factors.push("Reward calculation");
      recommendations.push(
        "Verify BDAG balance meets minimum",
        "Check last payout timestamp",
        "Monitor pool dashboard for pending"
      );
      confidence = 0.9;
    }

    if (factors.length === 0) {
      factors = ["General query"];
      recommendations = [
        "View FAQ for common questions",
        "Check miner profile for live metrics",
        "Monitor dashboard in real-time",
      ];
      confidence = 0.72;
    }

    return { confidence, factors, recommendations };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call backend AI assistant endpoint
      const res = await fetch("/api/assistant/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      if (!res.ok) throw new Error("Failed to get AI response");

      const data = await res.json();
      const response: Message = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        content: data.message,
        timestamp: Date.now(),
        diagnostics: {
          confidence: data.confidence,
          factors: data.factors,
          recommendations: data.recommendations,
        },
      };
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      const response: Message = {
        id: Math.random().toString(36).slice(2),
        role: "assistant",
        content: "I encountered an error processing your query. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, response]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">AI Support & FAQ</h1>
            <p className="text-muted-foreground">
              Get instant diagnostics and answers about mining optimization
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* FAQ Cards */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="font-semibold">Quick FAQ</h2>
              {FAQItems.map((item, idx) => (
                <Card
                  key={idx}
                  className="p-4 cursor-pointer hover-elevate transition-all"
                  onClick={() => setInput(item.question)}
                  data-testid={`card-faq-${idx}`}
                >
                  <p className="text-sm font-medium mb-2">{item.question}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.answer}
                  </p>
                </Card>
              ))}
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col p-6 border-primary/20">
                <div className="mb-4">
                  <h2 className="font-semibold">DAGPulse Assistant</h2>
                  <p className="text-sm text-muted-foreground">
                    Paste a miner address or ask any question about network health, rewards, or
                    optimization.
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-4">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                          Ask me anything about your mining operation.
                        </p>
                      </div>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary/20 text-foreground"
                            : "bg-card/50 border border-border/50"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>

                        {msg.diagnostics ? (
                          <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {(msg.diagnostics.confidence * 100).toFixed(0)}% confidence
                              </Badge>
                            </div>

                            <div className="text-xs">
                              <p className="font-medium mb-1">Factors:</p>
                              <ul className="space-y-1">
                                {msg.diagnostics.factors.map((f, i) => (
                                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                                    <AlertCircle className="h-3 w-3" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="text-xs">
                              <p className="font-medium mb-1">Recommendations:</p>
                              <ul className="space-y-1">
                                {msg.diagnostics.recommendations.map((r, i) => (
                                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                                    <TrendingDown className="h-3 w-3" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : null}

                        <p className="text-xs text-muted-foreground/50 mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-card/50 border border-border/50 p-3 rounded-lg">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce animation-delay-100" />
                          <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce animation-delay-200" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about hashrate, rewards, optimization..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={loading}
                    data-testid="input-ai-question"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    size="icon"
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
