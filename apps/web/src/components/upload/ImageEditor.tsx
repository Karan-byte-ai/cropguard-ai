"use client";

import * as React from "react";
import { RotateCw, ZoomIn, ZoomOut, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageEditorProps {
  imageFile: File | Blob;
  onConfirm: (editedBlob: Blob) => void;
  onCancel: () => void;
}

export function ImageEditor({ imageFile, onConfirm, onCancel }: ImageEditorProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = React.useState(0); // 0, 90, 180, 270
  const [scale, setScale] = React.useState(1.0);
  const [imageObj, setImageObj] = React.useState<HTMLImageElement | null>(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.onload = () => {
      setImageObj(img);
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const draw = React.useCallback(() => {
    if (!canvasRef.current || !imageObj) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isRotated90or270 = rotation === 90 || rotation === 270;
    const w = isRotated90or270 ? imageObj.height : imageObj.width;
    const h = isRotated90or270 ? imageObj.width : imageObj.height;

    // Constrain max canvas render size
    const maxDim = 800;
    const scaleFactor = Math.min(1, maxDim / Math.max(w, h));
    canvas.width = Math.round(w * scaleFactor);
    canvas.height = Math.round(h * scaleFactor);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    ctx.drawImage(
      imageObj,
      (-imageObj.width * scaleFactor) / 2,
      (-imageObj.height * scaleFactor) / 2,
      imageObj.width * scaleFactor,
      imageObj.height * scaleFactor
    );
    ctx.restore();
  }, [imageObj, rotation, scale]);

  React.useEffect(() => {
    draw();
  }, [draw]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.15, 2.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.15, 0.7));
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4 rounded-xl border p-4 bg-card">
      <div className="flex items-center justify-between w-full pb-2 border-b">
        <span className="text-sm font-semibold">Crop & Rotate Leaf</span>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="icon" onClick={handleRotate} title="Rotate 90°">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border max-h-[360px] aspect-square flex items-center justify-center bg-black/5 dark:bg-black/30 w-full">
        <canvas ref={canvasRef} className="max-h-full max-w-full object-contain" />
      </div>

      <div className="flex gap-2 w-full pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1 gap-1">
          <X className="h-4 w-4" /> Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1 gap-1">
          <Check className="h-4 w-4" /> Apply Edit
        </Button>
      </div>
    </div>
  );
}
