import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Pen,
  Eraser,
  Download,
  X,
} from "lucide-react";

export default function ProXrayStudio() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#00ff00"); // neon green
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    renderCanvas();
  }, [brightness, contrast, zoom, rotation, imageSrc]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        originalImageRef.current = img;
        setImageSrc(e.target?.result as string);
        setImageLoaded(true);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImageRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = originalImageRef.current;
    const angleRad = (rotation * Math.PI) / 180;

    // Calculate new dimensions to fit rotated image
    const sin = Math.abs(Math.sin(angleRad));
    const cos = Math.abs(Math.cos(angleRad));
    const newWidth = (img.width * cos + img.height * sin) * zoom;
    const newHeight = (img.width * sin + img.height * cos) * zoom;

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.save();
    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate(angleRad);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(
      img,
      -(img.width * zoom) / 2,
      -(img.height * zoom) / 2,
      img.width * zoom,
      img.height * zoom
    );
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setLastMousePos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !imageLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.moveTo(lastMousePos.x, lastMousePos.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    setLastMousePos({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleClearInk = () => {
    // Redraw without drawing
    renderCanvas();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "pro-xray-analysis.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pro X-Ray Studio</h1>
          <p className="text-muted-foreground">Enhance, annotate, and analyze X-ray images</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>X-Ray Workspace</CardTitle>
                <CardDescription>
                  Upload, manipulate, and annotate your X-ray images
                </CardDescription>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#21b2c0] hover:bg-[#1a95a0]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload X-Ray
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!imageLoaded ? (
                <div className="flex flex-col items-center justify-center h-[500px] border-t border-border">
                  <X className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground">No X-ray uploaded</p>
                  <p className="text-xs text-muted-foreground">
                    Click "Upload X-Ray" to get started
                  </p>
                </div>
              ) : (
                <div className="flex justify-center items-start bg-gray-100 border-t border-border overflow-auto p-8">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    className="shadow-lg bg-white cursor-crosshair"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clinical Notes</CardTitle>
              <CardDescription>Add your analysis and notes</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your clinical notes and analysis here..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="min-h-[150px]"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Image Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Brightness</Label>
                    <span className="text-xs text-muted-foreground">{brightness}%</span>
                  </div>
                  <Slider
                    value={[brightness]}
                    min={50}
                    max={150}
                    step={1}
                    onValueChange={(value) => setBrightness(value[0])}
                    className="[&_[role=slider]]:bg-[#21b2c0]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Contrast</Label>
                    <span className="text-xs text-muted-foreground">{contrast}%</span>
                  </div>
                  <Slider
                    value={[contrast]}
                    min={50}
                    max={150}
                    step={1}
                    onValueChange={(value) => setContrast(value[0])}
                    className="[&_[role=slider]]:bg-[#21b2c0]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>View Controls</Label>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleZoomIn}
                    disabled={!imageLoaded}
                    className="flex-1"
                  >
                    <ZoomIn className="w-4 h-4 mr-2" />
                    Zoom In
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleZoomOut}
                    disabled={!imageLoaded}
                    className="flex-1"
                  >
                    <ZoomOut className="w-4 h-4 mr-2" />
                    Zoom Out
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleRotate}
                    disabled={!imageLoaded}
                    className="flex-1"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Drawing Tools</Label>
                <div className="flex gap-2">
                  <Button
                    variant={isDrawing ? "default" : "secondary"}
                    className={isDrawing ? "bg-[#21b2c0] hover:bg-[#1a95a0]" : "flex-1"}
                    onClick={() => setIsDrawing(!isDrawing)}
                    disabled={!imageLoaded}
                  >
                    <Pen className="w-4 h-4 mr-2" />
                    Draw
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleClearInk}
                    disabled={!imageLoaded}
                    className="flex-1"
                  >
                    <Eraser className="w-4 h-4 mr-2" />
                    Clear Ink
                  </Button>
                </div>
                <div className="space-y-2 pt-2">
                  <Label>Draw Color</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className={`w-8 h-8 rounded-full p-0 ${drawColor === "#00ff00" ? "ring-2 ring-offset-2 ring-[#00ff00]" : ""}`}
                      style={{ backgroundColor: "#00ff00" }}
                      onClick={() => setDrawColor("#00ff00")}
                    />
                    <Button
                      variant="ghost"
                      className={`w-8 h-8 rounded-full p-0 ${drawColor === "#ff0000" ? "ring-2 ring-offset-2 ring-[#ff0000]" : ""}`}
                      style={{ backgroundColor: "#ff0000" }}
                      onClick={() => setDrawColor("#ff0000")}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full bg-[#21b2c0] hover:bg-[#1a95a0]"
            onClick={handleDownload}
            disabled={!imageLoaded}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Full Report
          </Button>
        </div>
      </div>
    </div>
  );
}
