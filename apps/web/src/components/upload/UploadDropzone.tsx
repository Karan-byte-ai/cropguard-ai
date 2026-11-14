"use client";

import * as React from "react";
import { Upload, X, Crop, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { compressImage } from "@/lib/quality-check";
import { ImageEditor } from "./ImageEditor";

export interface LeafPhotoItem {
  id: string;
  blob: Blob;
  previewUrl: string;
}

interface UploadDropzoneProps {
  photos: LeafPhotoItem[];
  onChange: (photos: LeafPhotoItem[]) => void;
  maxPhotos?: number;
}

export function UploadDropzone({ photos, onChange, maxPhotos = 3 }: UploadDropzoneProps) {
  const [editingPhoto, setEditingPhoto] = React.useState<LeafPhotoItem | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const processFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setErrorMessage("Unsupported format. Please upload JPEG, PNG, or WebP.");
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage("File exceeds 15MB limit.");
        continue;
      }
      validFiles.push(file);
    }

    const availableSlots = maxPhotos - photos.length;
    const toProcess = validFiles.slice(0, availableSlots);

    const newItems: LeafPhotoItem[] = [];
    for (const f of toProcess) {
      try {
        const compressed = await compressImage(f);
        const url = URL.createObjectURL(compressed);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          blob: compressed,
          previewUrl: url,
        });
      } catch (e) {
        console.error("Compression error", e);
      }
    }

    if (newItems.length > 0) {
      onChange([...photos, ...newItems]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(photos.filter((p) => p.id !== id));
  };

  const handleEditConfirm = (newBlob: Blob) => {
    if (!editingPhoto) return;
    URL.revokeObjectURL(editingPhoto.previewUrl);
    const newUrl = URL.createObjectURL(newBlob);

    const updated = photos.map((p) =>
      p.id === editingPhoto.id ? { ...p, blob: newBlob, previewUrl: newUrl } : p
    );
    onChange(updated);
    setEditingPhoto(null);
  };

  if (editingPhoto) {
    return (
      <ImageEditor
        imageFile={editingPhoto.blob}
        onConfirm={handleEditConfirm}
        onCancel={() => setEditingPhoto(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Dropzone container */}
      {photos.length < maxPhotos && (
        <label
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 sm:p-8 cursor-pointer transition-all text-center space-y-3 ${
            dragActive
              ? "border-crop-500 bg-crop-50/50 dark:bg-crop-950/40 scale-[1.01]"
              : "border-muted-foreground/30 hover:border-crop-500 bg-muted/10 hover:bg-crop-50/20"
          }`}
        >
          <div className="h-12 w-12 rounded-full bg-crop-100 dark:bg-crop-900/50 text-crop-700 dark:text-crop-300 flex items-center justify-center">
            <Upload className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              Drop leaf photos here, or <span className="text-crop-600 underline">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP up to 15MB. You can add up to {maxPhotos} photos for higher confidence.
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) processFiles(e.target.files);
            }}
          />
        </label>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Thumbnails grid */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Selected Photos ({photos.length}/{maxPhotos})
            </span>
            {photos.length > 1 && (
              <Badge variant="secondary" className="text-[10px]">
                Ensemble Averaging Active
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className="relative rounded-lg overflow-hidden border aspect-square bg-muted group shadow-sm"
              >
                <img
                  src={photo.previewUrl}
                  alt={`Plant photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:bg-black/50"
                    onClick={() => setEditingPhoto(photo)}
                    title="Crop & Rotate"
                  >
                    <Crop className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-black/50"
                    onClick={() => handleRemove(photo.id)}
                    title="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
