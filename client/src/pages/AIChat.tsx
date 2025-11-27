import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  confidence?: number;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message
  useEffect(() => {
    const welcomeMsg: Message = {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm DAGPulse Assistant, your AI mining intelligence chatbot. I can help you with: mining optimization, hardware troubleshooting, network analysis, platform features, wallet management, and more. What would you like to know?",
      timestamp: Date.now(),
      confidence: 0.95,
    };
    setMessages([welcomeMsg]);
  }, []);

  const queryMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("/api/assistant/query", {
        method: "POST",
        body: JSON.stringify({ query }),
      });
      return response.json();
    },
  });

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await queryMutation.mutateAsync(input);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.message || "I couldn't process that. Please try again.",
        timestamp: Date.now(),
        confidence: response.confidence || 0.75,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI Assistant Chat</h1>
            <p className="text-muted-foreground">
              Ask me anything about DAGPulse and blockchain mining
            </p>
          </div>
        </div>

        <Card className="flex flex-col flex-1 gap-4 p-4 md:p-6 overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-muted-foreground border border-border rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="text-xs opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    {msg.confidence && msg.role === "assistant" && (
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(msg.confidence * 100)}% confidence
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {queryMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-3 rounded-lg rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me about mining, features, wallet, or anything else..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={queryMutation.isPending}
                data-testid="input-chat-message"
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || queryMutation.isPending}
                size="icon"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>💡 Try asking about:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover-elevate">
                  Mining optimization
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover-elevate">
                  Dashboard features
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover-elevate">
                  Wallet connection
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover-elevate">
                  Hashrate forecasts
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover-elevate">
                  Block exploration
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
