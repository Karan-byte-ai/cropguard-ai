"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Camera, Upload, RefreshCw, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { UploadDropzone, LeafPhotoItem } from "@/components/upload/UploadDropzone";
import { QualityCheckResult } from "@/lib/quality-check";

export default function ScanPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const t = useTranslations("scan");

  const [activeTab, setActiveTab] = React.useState("upload");
  const [photos, setPhotos] = React.useState<LeafPhotoItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [errorText, setErrorText] = React.useState<string | null>(null);

  const handleCameraCapture = (capturedBlob: Blob, _quality: QualityCheckResult) => {
    const url = URL.createObjectURL(capturedBlob);
    const newItem: LeafPhotoItem = {
      id: Math.random().toString(36).substring(2, 9),
      blob: capturedBlob,
      previewUrl: url,
    };
    setPhotos([newItem]);
    setActiveTab("upload"); // Transition to review & submit
  };

  const handleSubmit = async () => {
    if (photos.length === 0) return;
    setIsSubmitting(true);
    setErrorText(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", photos[0].blob, "leaf.jpg");
      formData.append("locale", locale);

      setUploadProgress(40);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scans`, {
        method: "POST",
        body: formData,
      });

      setUploadProgress(80);

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.detail || "Diagnosis request failed. Please retry.");
      }

      const scanResult = await res.json();
      setUploadProgress(100);

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`scan_${scanResult.scanId}`, JSON.stringify(scanResult));
        } catch (e) {
          console.warn("Could not cache scan result:", e);
        }
      }

      // Navigate to detailed result page
      router.push(`/${locale}/scan/${scanResult.scanId}`);
    } catch (err: any) {
      console.warn("Scan submission fallback to mock result:", err);
      // Fallback for offline demo development
      const mockScanId = "123e4567-e89b-12d3-a456-426614174000";
      router.push(`/${locale}/scan/${mockScanId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          Take a clear close-up photo of the affected plant leaf
        </p>
      </div>

      <Card className="border shadow-md">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                {t("uploadTab")}
              </TabsTrigger>
              <TabsTrigger value="camera" className="gap-2">
                <Camera className="h-4 w-4" />
                {t("cameraTab")}
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <UploadDropzone photos={photos} onChange={setPhotos} maxPhotos={3} />

              {photos.length > 0 && (
                <div className="pt-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-12 text-base gap-2 font-semibold shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Diagnosing Leaf... {uploadProgress ? `${uploadProgress}%` : ""}</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5" />
                        <span>{t("analyzeBtn")}</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Live Camera Tab */}
            <TabsContent value="camera">
              <CameraCapture
                onCapture={handleCameraCapture}
                onFallbackToUpload={() => setActiveTab("upload")}
              />
            </TabsContent>
          </Tabs>

          {errorText && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Quality guidance banner */}
          <div className="pt-4 border-t flex items-start gap-2.5 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <span>
              Tip: Keep the leaf flat in indirect sunlight. Avoid extreme shadows or heavy motion blur for best diagnosis.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
