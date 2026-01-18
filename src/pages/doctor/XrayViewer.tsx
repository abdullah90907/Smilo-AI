import { motion } from "framer-motion";
import { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize,
  Sun,
  Contrast,
  Image as ImageIcon,
  Grid3x3,
  List,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function XrayViewer() {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [selectedXray, setSelectedXray] = useState(0);

  const xrays = [
    { id: "12567", patientId: "#12567", date: "Jan 18, 2026", type: "OPG" },
    { id: "12568", patientId: "#12568", date: "Jan 18, 2026", type: "OPG" },
    { id: "12569", patientId: "#12569", date: "Jan 17, 2026", type: "OPG" },
    { id: "12570", patientId: "#12570", date: "Jan 17, 2026", type: "OPG" },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">X-ray Viewer</h1>
              <p className="text-sm text-muted-foreground">
                Advanced X-ray visualization and analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Maximize className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* X-ray List Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent X-rays</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {xrays.map((xray, index) => (
                    <motion.div
                      key={xray.id}
                      whileHover={{ x: 4 }}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedXray === index
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedXray(index)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">Patient {xray.patientId}</p>
                          <p className="text-xs text-muted-foreground">{xray.date}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {xray.type}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Viewer */}
          <div className="lg:col-span-3 space-y-6">
            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Zoom:</Label>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Rotate:</Label>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRotation(rotation - 90)}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium w-12 text-center">
                      {rotation % 360}°
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRotation(rotation + 90)}
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button variant="outline" onClick={() => { setZoom(100); setRotation(0); setBrightness(100); setContrast(100); }}>
                    Reset All
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Brightness
                      </Label>
                      <span className="text-sm font-medium">{brightness}%</span>
                    </div>
                    <Slider
                      value={[brightness]}
                      onValueChange={(val) => setBrightness(val[0])}
                      min={50}
                      max={150}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm flex items-center gap-2">
                        <Contrast className="w-4 h-4" />
                        Contrast
                      </Label>
                      <span className="text-sm font-medium">{contrast}%</span>
                    </div>
                    <Slider
                      value={[contrast]}
                      onValueChange={(val) => setContrast(val[0])}
                      min={50}
                      max={150}
                      step={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* X-ray Display */}
            <Card>
              <CardContent className="p-6">
                <div className="relative bg-black rounded-lg overflow-hidden min-h-[500px] flex items-center justify-center">
                  <img
                    src="https://placehold.co/1200x600/1a1a1a/white?text=X-ray+Image"
                    alt="X-ray"
                    className="max-w-full transition-all duration-200"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
