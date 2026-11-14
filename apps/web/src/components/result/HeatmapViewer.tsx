"use client";

import * as React from "react";
import { MoveHorizontal, Eye, Flame } from "lucide-react";

interface HeatmapViewerProps {
  originalUrl: string;
  heatmapUrl: string;
}

export function HeatmapViewer({ originalUrl, heatmapUrl }: HeatmapViewerProps) {
  const [sliderPosition, setSliderPosition] = React.useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const handleMove = React.useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(pos);
    },
    []
  );

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5 text-crop-600" /> Original Leaf Photo
        </span>
        <span className="flex items-center gap-1">
          <Flame className="h-3.5 w-3.5 text-amber-600" /> Grad-CAM Heatmap
        </span>
      </div>

      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden select-none cursor-ew-resize border shadow-md bg-black"
      >
        {/* Underneath Image: Grad-CAM Heatmap */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={heatmapUrl}
            alt="Grad-CAM Activation Heatmap"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Foreground Image: Original Leaf with clip-path */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={originalUrl}
            alt="Original Leaf Photo"
            className="w-full h-full object-cover"
            style={{
              width: containerRef.current?.offsetWidth || "100%",
              maxWidth: "none",
            }}
          />
        </div>

        {/* Divider Bar & Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white text-slate-800 shadow-xl border border-slate-200 flex items-center justify-center">
            <MoveHorizontal className="h-4 w-4" />
          </div>
        </div>

        {/* Floating Instruction */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2.5 py-0.5 rounded-full backdrop-blur pointer-events-none">
          Drag slider to inspect AI focus
        </div>
      </div>
    </div>
  );
}
