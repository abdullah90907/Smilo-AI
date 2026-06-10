import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MessageSquare,
  ArrowRight,
  Bot,
  User,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function AIAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [chatType, setChatType] = useState<string | null>(null);

  useEffect(() => {
    if (location.state) {
      setInitialMessage(location.state.initialMessage);
      setChatType(location.state.chatType);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Assistant Chat</h1>
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Bot className="w-20 h-20 text-purple-500 mb-2" />
            <h3 className="text-2xl font-semibold">Coming Soon!</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Our AI Clinical Guidance & Chatbot is under development. Check back soon for personalized dental advice!
            </p>
            
            {chatType && (
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 max-w-2xl w-full">
                <h4 className="font-semibold text-purple-600 dark:text-purple-300 mb-2">{chatType}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap text-left">
                  {initialMessage}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
