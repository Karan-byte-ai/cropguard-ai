/**
 * CropGuard AI - Image Quality & Pre-processing Utility
 * Implements client-side blur detection (Laplacian variance approximation),
 * brightness analysis, and resizing/compression before upload (Section 4.1 & 5.2).
 */

export interface QualityCheckResult {
  isBlurry: boolean;
  blurScore: number;
  isTooDark: boolean;
  isTooBright: boolean;
  brightnessScore: number;
  feedback: string[];
}

export function analyzeCanvasQuality(canvas: HTMLCanvasElement): QualityCheckResult {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return {
      isBlurry: false,
      blurScore: 100,
      isTooDark: false,
      isTooBright: false,
      brightnessScore: 128,
      feedback: [],
    };
  }

  // Downsample to 256x256 for rapid real-time pixel analysis
  const sampleSize = 256;
  const offscreen = document.createElement("canvas");
  offscreen.width = sampleSize;
  offscreen.height = sampleSize;
  const offCtx = offscreen.getContext("2d");
  if (!offCtx) {
    return {
      isBlurry: false,
      blurScore: 100,
      isTooDark: false,
      isTooBright: false,
      brightnessScore: 128,
      feedback: [],
    };
  }

  offCtx.drawImage(canvas, 0, 0, sampleSize, sampleSize);
  const imgData = offCtx.getImageData(0, 0, sampleSize, sampleSize);
  const data = imgData.data;

  // Convert to grayscale
  const gray = new Float32Array(sampleSize * sampleSize);
  let totalBrightness = 0;

  for (let i = 0; i < data.length; i += 4) {
    const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray[i / 4] = luma;
    totalBrightness += luma;
  }

  const avgBrightness = totalBrightness / (sampleSize * sampleSize);

  // Compute discrete Laplacian variance for sharpness/blur
  // Kernel: [0, 1, 0; 1, -4, 1; 0, 1, 0]
  let laplacianSum = 0;
  let laplacianSqSum = 0;
  let count = 0;

  for (let y = 1; y < sampleSize - 1; y++) {
    for (let x = 1; x < sampleSize - 1; x++) {
      const idx = y * sampleSize + x;
      const lap =
        gray[idx - sampleSize] +
        gray[idx + sampleSize] +
        gray[idx - 1] +
        gray[idx + 1] -
        4 * gray[idx];

      laplacianSum += lap;
      laplacianSqSum += lap * lap;
      count++;
    }
  }

  const meanLap = laplacianSum / count;
  const variance = laplacianSqSum / count - meanLap * meanLap;

  const isBlurry = variance < 45; // Threshold for mobile leaf images
  const isTooDark = avgBrightness < 45;
  const isTooBright = avgBrightness > 220;

  const feedback: string[] = [];
  if (isTooDark) feedback.push("Too dark - Move to better light");
  if (isTooBright) feedback.push("Too bright - Avoid direct glare");
  if (isBlurry) feedback.push("Too blurry - Hold steady & refocus");
  if (feedback.length === 0) feedback.push("Leaf framing is good");

  return {
    isBlurry,
    blurScore: Math.round(variance),
    isTooDark,
    isTooBright,
    brightnessScore: Math.round(avgBrightness),
    feedback,
  };
}

/**
 * Compresses an image blob or file to max 1280px, quality 0.85 (Section 4.1).
 */
export async function compressImage(file: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1280;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = url;
  });
}
