import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  FileText,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getDoctorAppointments, getChatMessages, sendChatMessage, markAppointmentViewed } from "@/lib/api";

type Message = {
  id: number;
  sender: "patient" | "doctor";
  text: string;
  timestamp: string;
};

type AttachedReport = {
  id?: number;
  ai_prediction: string;
  severity: string;
  confidence: string;
  image_data?: string;
  result_json?: any;
  report_type?: string;
};

type Appointment = {
  id: number;
  patient_name: string;
  patient_age: string;
  status: string;
  appointment_date?: string;
  created_at: string;
  xray_report?: AttachedReport;
  photo_report?: AttachedReport;
  gemini_report?: AttachedReport;
  doctor_note?: string;
  has_new_uploads?: boolean;
};

export default function DoctorConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<Appointment[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Appointment | null>(null);
  const [sending, setSending] = useState(false);

  const fetchMessages = async (appointmentId: number) => {
    try {
      const data = await getChatMessages(appointmentId);
      setMessages(
        data.messages.map((m: any) => ({
          id: m.id,
          sender: m.sender_role,
          text: m.message,
          timestamp: new Date(m.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }))
      );
    } catch (e) {
      console.error("Error fetching messages:", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDoctorAppointments();
        const approved = data.appointments.filter((a: Appointment) => a.status === "approved");
        setConsultations(approved);
        if (id) {
          const found = approved.find((a: Appointment) => a.id === parseInt(id));
          if (found) setSelectedConsultation(found);
        }
      } catch (e) {
        console.error("Error fetching consultations:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (selectedConsultation) {
      fetchMessages(selectedConsultation.id);
      if (selectedConsultation.has_new_uploads) {
        markAppointmentViewed(selectedConsultation.id);
        setConsultations(
          (prev) => prev.map((c) =>
            c.id === selectedConsultation.id ? { ...c, has_new_uploads: false } : c
          )
        );
      }
      const interval = setInterval(() => {
        fetchMessages(selectedConsultation.id);
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [selectedConsultation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConsultation) return;
    setSending(true);
    try {
      await sendChatMessage(selectedConsultation.id, messageInput);
      fetchMessages(selectedConsultation.id);
      setMessageInput("");
    } catch (e) {
      console.error("Error sending message:", e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading consultations...</div>
      </div>
    );
  }

  if (id && !selectedConsultation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Consultation not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/doctor-dashboard/appointments")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            {selectedConsultation ? (
              <div>
                <h1 className="text-xl font-bold">{selectedConsultation.patient_name}</h1>
                <p className="text-sm text-muted-foreground">
                  Consultation at {selectedConsultation.appointment_date}
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold">Patient Consultations</h1>
                <p className="text-sm text-muted-foreground">Select a patient to chat</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar - Consultation List */}
        <div className="w-full md:w-80 border-r border-border p-6 bg-muted/30 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Active Consultations</h2>
          <div className="space-y-3">
            {consultations.map((consultation) => (
              <Card
                key={consultation.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${selectedConsultation?.id === consultation.id ? 'border-[#21b2c0] border-2' : ''}`}
                onClick={() => setSelectedConsultation(consultation)}
              >
                <CardContent className="p-4">
                  <div className="font-semibold">
                    {consultation.patient_name}
                    {consultation.has_new_uploads && (
                      <Badge className="ml-2 bg-orange-500 text-white hover:bg-orange-600">
                        New Scans Added
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {consultation.appointment_date}
                  </div>
                  <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
                </CardContent>
              </Card>
            ))}
            {consultations.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No active consultations yet
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        {selectedConsultation ? (
          <div className="flex-1 flex flex-col">
            {/* Context Sidebar */}
            <div className="flex-1 flex flex-col md:flex-row">
              <div className="w-full md:w-72 border-r border-border p-6 bg-muted/30 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Attached Reports
                </h3>
                {selectedConsultation.xray_report && (
                  <Card className="mb-3">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">X-ray Report</span>
                        <Badge className="bg-blue-100 text-blue-800">X-ray</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedConsultation.xray_report.ai_prediction || "AI prediction"}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {selectedConsultation.photo_report && (
                  <Card className="mb-3">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Photo Analysis</span>
                        <Badge className="bg-purple-100 text-purple-800">Photo</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedConsultation.photo_report.ai_prediction || "AI prediction"}
                      </p>
                    </CardContent>
                  </Card>
                )}
                {selectedConsultation.gemini_report && (
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">AI Hygiene Assessment</span>
                        <Badge className="bg-orange-100 text-orange-800">Gemini</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedConsultation.gemini_report.result_json?.summary || "AI summary"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "doctor" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-2xl ${
                          message.sender === "doctor"
                            ? "bg-[#21b2c0] text-white rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}
                      >
                        <p className="mb-1">{message.text}</p>
                        <p className="text-xs opacity-70">{message.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-border">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      className="bg-[#21b2c0] hover:bg-[#1a95a0]"
                      disabled={sending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sending ? "Sending..." : "Send"}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Select a patient to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
