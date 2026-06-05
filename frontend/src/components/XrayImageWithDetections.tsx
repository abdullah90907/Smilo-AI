import { useEffect, useRef, useState } from "react";
import { XrayDetection } from "@/types/xray";

interface XrayImageWithDetectionsProps {
  imageUrl: string;
  detections: XrayDetection[];
  alt: string;
}

export default function XrayImageWithDetections({
  imageUrl,
  detections,
  alt,
}: XrayImageWithDetectionsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      setImageDimensions({ width: img.width, height: img.height });

      // Draw the X-ray image
      ctx.drawImage(img, 0, 0);

      // Draw detection boxes
      detections.forEach((detection, index) => {
        const [x1, y1, x2, y2] = detection.box;
        const width = x2 - x1;
        const height = y2 - y1;

        // Draw rectangle
        ctx.strokeStyle = "#ef4444"; // Red color
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, width, height);

        // Draw confidence label background
        const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`;
        ctx.font = "bold 14px Arial";
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(x1, y1 - 25, textWidth + 10, 25);

        // Draw confidence label text
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, x1 + 5, y1 - 7);

        // Draw detection number
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 20px Arial";
        ctx.fillText(`#${index + 1}`, x1 + width / 2 - 10, y1 + height / 2);
      });
    };
  }, [imageUrl, detections]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-muted">
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  );
}
