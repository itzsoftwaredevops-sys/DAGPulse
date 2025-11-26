import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, AlertCircle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function AIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 hover-elevate"
        data-testid="button-ai-widget"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-96 shadow-2xl z-40 flex flex-col border-primary/20">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold">DAGPulse AI Assistant</h3>
            <p className="text-xs text-muted-foreground">24/7 Support for Mining & Platform Help</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Ask about mining, features, or get help</p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs p-2 rounded-lg text-xs ${
                    msg.role === "user"
                      ? "bg-primary/20 text-foreground"
                      : "bg-card/50 border border-border/50"
                  }`}
                >
                  <p className="text-xs">{msg.content}</p>

                  {msg.diagnostics && (
                    <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                      <Badge variant="secondary" className="text-xs">
                        {(msg.diagnostics.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                      {msg.diagnostics.factors.length > 0 && (
                        <div className="text-xs">
                          <p className="font-medium">Factors:</p>
                          {msg.diagnostics.factors.map((f, i) => (
                            <div key={i} className="flex items-center gap-1 text-muted-foreground">
                              <AlertCircle className="h-2 w-2" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-card/50 border border-border/50 p-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce animation-delay-100" />
                    <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce animation-delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50 flex gap-2">
            <Input
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={loading}
              className="text-xs h-8"
              data-testid="input-ai-widget"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-8 w-8"
              data-testid="button-send-ai"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
