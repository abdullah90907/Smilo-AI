
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  ArrowRight,
  Bot,
  User,
  Send,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AssistantChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hiddenContextRef = useRef<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    if (location.state?.data) {
      hiddenContextRef.current = JSON.stringify(location.state.data);
      setMessages([{
        id: "initial-welcome",
        role: "assistant",
        content: "Scanning data received. Ask me anything about your analysis results."
      }]);
    } else {
      setMessages([{
        id: "initial-hello",
        role: "assistant",
        content: "Hi there! I'm your dental assistant. How can I help you today?"
      }]);
    }
  }, [location.state]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: inputText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const requestBody: any = {
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: inputText },
        ],
      };

      if (hiddenContextRef.current) {
        requestBody.hidden_context = hiddenContextRef.current;
      }

      const response = await fetch(`${BASE_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.status === "success") {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setMessages((prev) => [...prev, {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I had an issue connecting to my brain! Please try again.",
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I couldn't connect to the backend! Is the server running on port 8000?",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Assistant Chat</h1>
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto shadow-md rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 space-y-4 min-h-[500px] max-h-[600px] overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl flex items-start gap-3 ${
                      msg.role === "user"
                        ? "bg-teal-600 text-white rounded-br-none"
                        : "bg-gray-50 text-slate-800 border border-teal-100 rounded-bl-none"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <Bot className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    {msg.role === "assistant" ? (
                      <ReactMarkdown className="prose prose-sm prose-teal">
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                    {msg.role === "user" && (
                      <User className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 rounded-2xl bg-gray-50 border border-teal-100 rounded-bl-none flex items-center gap-3">
                    <Bot className="w-5 h-5 flex-shrink-0" />
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <Input
                placeholder="Ask about your dental health..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                className="flex-1 focus:ring-2 focus:ring-teal-500"
                disabled={isLoading}
              />
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
