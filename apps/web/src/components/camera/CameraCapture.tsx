"use client";

import * as React from "react";
import { Camera, RefreshCw, AlertCircle, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { analyzeCanvasQuality, QualityCheckResult, compressImage } from "@/lib/quality-check";

interface CameraCaptureProps {
  onCapture: (blob: Blob, quality: QualityCheckResult) => void;
  onFallbackToUpload: () => void;
}

export function CameraCapture({ onCapture, onFallbackToUpload }: CameraCaptureProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const animFrameRef = React.useRef<number | null>(null);

  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = React.useState(true);
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = React.useState<Blob | null>(null);
  const [capturedPreview, setCapturedPreview] = React.useState<string | null>(null);
  const [quality, setQuality] = React.useState<QualityCheckResult>({
    isBlurry: false,
    blurScore: 100,
    isTooDark: false,
    isTooBright: false,
    brightnessScore: 120,
    feedback: ["Position leaf inside framing guide"],
  });

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const startCamera = React.useCallback(async () => {
    setIsInitializing(true);
    setErrorMessage(null);
    setShowPermissionPrompt(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasPermission(true);

      // Start periodic real-time quality check loop
      let lastCheckTime = 0;
      const checkLoop = (timestamp: number) => {
        if (timestamp - lastCheckTime > 350) {
          lastCheckTime = timestamp;
          if (videoRef.current && videoRef.current.videoWidth > 0) {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = 256;
            tempCanvas.height = 256;
            const ctx = tempCanvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0, 256, 256);
              const q = analyzeCanvasQuality(tempCanvas);
              setQuality(q);
            }
          }
        }
        animFrameRef.current = requestAnimationFrame(checkLoop);
      };
      animFrameRef.current = requestAnimationFrame(checkLoop);
    } catch (err: any) {
      setHasPermission(false);
      setErrorMessage(err.message || "Could not access rear camera.");
    } finally {
      setIsInitializing(false);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      stopCamera();
      if (capturedPreview) {
        URL.revokeObjectURL(capturedPreview);
      }
    };
  }, [stopCamera, capturedPreview]);

  const handleCaptureFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const finalQuality = analyzeCanvasQuality(canvas);

    canvas.toBlob(
      async (rawBlob) => {
        if (!rawBlob) return;
        const compressed = await compressImage(rawBlob);
        const url = URL.createObjectURL(compressed);
        setCapturedBlob(compressed);
        setCapturedPreview(url);
        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  const handleRetake = () => {
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedBlob(null);
    setCapturedPreview(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedBlob) {
      onCapture(capturedBlob, quality);
    }
  };

  // 1. Permission Pre-explanation View (Section 5.2)
  if (showPermissionPrompt) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-xl border bg-card">
        <div className="h-14 w-14 rounded-full bg-crop-100 dark:bg-crop-900/60 text-crop-700 dark:text-crop-300 flex items-center justify-center">
          <Camera className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-base sm:text-lg">Camera Access Needed</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
            CropGuard AI accesses your rear camera to inspect plant leaves in real-time. Camera frames are processed strictly locally for blur and brightness guidance before you choose to submit.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs pt-2">
          <Button onClick={startCamera} className="gap-2 w-full">
            <Camera className="h-4 w-4" /> Allow & Start Camera
          </Button>
          <Button variant="outline" onClick={onFallbackToUpload} className="w-full">
            Upload from Gallery
          </Button>
        </div>
      </div>
    );
  }

  // 2. Error / Fallback View (Section 5.2)
  if (hasPermission === false || errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-xl border border-destructive/30 bg-destructive/5">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <div className="space-y-1">
          <h3 className="font-semibold text-base">Camera Unavailable</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {errorMessage || "Camera permission was denied. You can take a photo using the device camera file picker."}
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <label className={cn(buttonVariants({ className: "w-full gap-2 cursor-pointer" }))}>
            <Camera className="h-4 w-4" /> Open Native Camera Fallback
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const f = e.target.files[0];
                  compressImage(f).then((compressed) => {
                    onCapture(compressed, {
                      isBlurry: false,
                      blurScore: 80,
                      isTooDark: false,
                      isTooBright: false,
                      brightnessScore: 120,
                      feedback: ["Captured from native camera"],
                    });
                  });
                }
              }}
            />
          </label>
          <Button variant="outline" onClick={onFallbackToUpload}>
            Back to File Upload
          </Button>
        </div>
      </div>
    );
  }

  // 3. Captured Frame Review Mode
  if (capturedPreview && capturedBlob) {
    return (
      <div className="space-y-4">
        <div className="relative rounded-xl overflow-hidden border aspect-[3/4] max-h-96 mx-auto bg-black">
          <img
            src={capturedPreview}
            alt="Captured Leaf Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> Captured
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRetake} className="flex-1">
            Retake Photo
          </Button>
          <Button onClick={handleConfirm} className="flex-1 gap-2">
            Confirm & Diagnose
          </Button>
        </div>
      </div>
    );
  }

  // 4. Live Camera View with Leaf Framing Guide & Quality Chips (Section 5.2)
  return (
    <div className="relative rounded-xl overflow-hidden bg-black aspect-[3/4] max-h-[460px] mx-auto flex flex-col justify-between p-4 shadow-inner">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Leaf-shaped Framing Guide Overlay */}
      <div className="absolute inset-10 border-2 border-dashed border-crop-400/80 rounded-[45%] pointer-events-none flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-t-2 border-l-2 border-crop-400/80 absolute top-4 left-4 rounded-tl-lg" />
        <div className="h-10 w-10 border-t-2 border-r-2 border-crop-400/80 absolute top-4 right-4 rounded-tr-lg" />
        <div className="h-10 w-10 border-b-2 border-l-2 border-crop-400/80 absolute bottom-4 left-4 rounded-bl-lg" />
        <div className="h-10 w-10 border-b-2 border-r-2 border-crop-400/80 absolute bottom-4 right-4 rounded-br-lg" />
      </div>

      {/* Live Quality Feedback Chips (Section 5.2: Too dark, Too blurry, Move closer, Hold steady) */}
      <div className="z-20 flex flex-wrap gap-1.5 justify-center">
        {quality.isTooDark && (
          <Badge variant="destructive" className="bg-amber-600/90 text-white text-[11px] gap-1">
            <AlertCircle className="h-3 w-3" /> Too dark - Need more light
          </Badge>
        )}
        {quality.isTooBright && (
          <Badge variant="destructive" className="bg-amber-600/90 text-white text-[11px] gap-1">
            <AlertCircle className="h-3 w-3" /> Too bright - Avoid glare
          </Badge>
        )}
        {quality.isBlurry && (
          <Badge variant="destructive" className="bg-red-600/90 text-white text-[11px] gap-1">
            <AlertCircle className="h-3 w-3" /> Too blurry - Hold steady
          </Badge>
        )}
        {!quality.isTooDark && !quality.isTooBright && !quality.isBlurry && (
          <Badge variant="success" className="bg-crop-600/90 text-white text-[11px] gap-1">
            <CheckCircle2 className="h-3 w-3" /> Quality Good - Hold Steady
          </Badge>
        )}
      </div>

      {/* Camera Capture Controls */}
      <div className="z-20 flex items-center justify-around pt-4 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onFallbackToUpload}
          className="text-white hover:bg-white/20 text-xs"
        >
          Gallery
        </Button>

        <button
          type="button"
          onClick={handleCaptureFrame}
          aria-label="Capture leaf photo"
          className="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center bg-crop-600 active:scale-95 transition-transform shadow-lg focus:outline-none"
        >
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
            <Camera className="h-6 w-6 text-crop-800" />
          </div>
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={startCamera}
          className="text-white hover:bg-white/20 text-xs gap-1"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Flip
        </Button>
      </div>
    </div>
  );
}
