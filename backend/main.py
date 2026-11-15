"""CropGuard AI - single-file backend (FastAPI + ONNX Runtime).

Endpoints
  GET  /health            -> liveness check
  POST /api/v1/scans      -> multipart field "file" (image) -> disease prediction
"""
import io
import json
import os
import uuid
from pathlib import Path

import numpy as np
import onnxruntime as ort
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps

BASE = Path(__file__).parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", BASE / "models" / "model.onnx"))
LABELS_PATH = Path(os.getenv("LABELS_PATH", BASE / "models" / "labels.json"))
MODEL_VERSION = "v1.0.0-efficientnet-b0"
MAX_BYTES = 8 * 1024 * 1024
ALLOWED = {"JPEG", "PNG", "WEBP"}
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

with open(LABELS_PATH, "r", encoding="utf-8") as f:
    LABELS = json.load(f)

SESSION = ort.InferenceSession(str(MODEL_PATH), providers=["CPUExecutionProvider"])
INPUT_NAME = SESSION.get_inputs()[0].name

app = FastAPI(title="CropGuard AI API", version=MODEL_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

SCANS = {}  # in-memory store (demo); restarts clear it


def split_label(raw: str):
    crop, _, disease = raw.partition("___")
    crop = crop.replace("_", " ").replace(",", "").strip()
    disease = disease.replace("_", " ").strip() or "healthy"
    return crop, disease


def preprocess(img: Image.Image) -> np.ndarray:
    img = ImageOps.exif_transpose(img).convert("RGB").resize((224, 224), Image.BILINEAR)
    arr = np.asarray(img, dtype=np.float32) / 255.0
    arr = (arr - MEAN) / STD
    return np.transpose(arr, (2, 0, 1))[None, ...].astype(np.float32)


def softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - np.max(x))
    return e / e.sum()


def advisory_for(crop: str, disease: str, level: str):
    sources = [{"name": "ICAR / local Krishi Vigyan Kendra (KVK)", "url": "https://icar.org.in"}]
    if level == "unknown":
        return {
            "symptoms": [],
            "management": {"organic": [], "chemical": []},
            "prevention": [
                "Retake the photo: one leaf, good daylight, plain background, in focus.",
                "If the plant looks unhealthy, contact your nearest KVK or agriculture officer.",
            ],
            "sources": sources,
        }
    if disease.lower() == "healthy":
        return {
            "symptoms": ["No visible disease symptoms detected."],
            "management": {"organic": [], "chemical": []},
            "prevention": [
                "Keep monitoring leaves weekly.",
                "Water at the base, avoid wetting leaves, keep good spacing and airflow.",
                "Remove fallen debris and weeds around the plant.",
            ],
            "sources": sources,
        }
    return {
        "symptoms": [f"Likely {disease} on {crop}. Compare the leaf with disease photos before acting."],
        "management": {
            "organic": [
                "Remove and destroy badly affected leaves; do not compost them.",
                "Avoid overhead watering; improve airflow between plants.",
                "Neem-based sprays may help early infections.",
            ],
            "chemical": [
                "Use only products recommended for this crop by your KVK or agriculture officer, "
                "strictly as per the label dose and safety period.",
            ],
        },
        "prevention": [
            "Rotate crops and use disease-free seed or seedlings.",
            "Clean tools between plants; remove infected plant debris.",
        ],
        "sources": sources,
    }


@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_VERSION, "classes": len(LABELS)}


@app.get("/")
def root():
    return {"service": "CropGuard AI API", "docs": "/docs"}


@app.post("/api/v1/scans")
async def create_scan(file: UploadFile = File(...), locale: str = Form("en"), crop_hint: str = Form("")):
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 8 MB).")
    try:
        img = Image.open(io.BytesIO(data))
        if img.format not in ALLOWED:
            raise ValueError("unsupported format")
        img.load()
    except Exception:
        raise HTTPException(status_code=400, detail="Please upload a valid JPEG, PNG or WebP image.")

    logits = SESSION.run(None, {INPUT_NAME: preprocess(img)})[0][0]
    probs = softmax(logits.astype(np.float64))
    top_idx = np.argsort(probs)[::-1][:3]

    predictions = []
    for i in top_idx:
        crop, disease = split_label(LABELS[int(i)])
        predictions.append({
            "class": LABELS[int(i)],
            "disease": disease.replace(" ", "_").lower(),
            "label": disease.title(),
            "crop": crop.title(),
            "confidence": round(float(probs[int(i)]), 4),
        })

    top = predictions[0]
    conf = top["confidence"]
    if conf >= 0.85:
        level = "high"
    elif conf >= 0.55:
        level = "medium"
    else:
        level = "unknown"

    scan_id = str(uuid.uuid4())
    result = {
        "scanId": scan_id,
        "status": "done",
        "modelVersion": MODEL_VERSION,
        "leafDetected": True,
        "confidenceLevel": level if level != "unknown" else "low",
        "predictions": predictions,
        "crop": top["crop"],
        "disease": top["label"],
        "confidence": conf,
        "isHealthy": top["label"].lower() == "healthy",
        "heatmapUrl": None,
        "advisory": advisory_for(top["crop"], top["label"], level),
        "disclaimer": "AI-assisted guidance only, not a replacement for an agronomist. "
                      "Confirm severe cases with a local Krishi Vigyan Kendra (KVK) or agriculture officer.",
    }
    SCANS[scan_id] = result
    return result


@app.get("/api/v1/scans/{scan_id}")
def get_scan(scan_id: str):
    if scan_id not in SCANS:
        raise HTTPException(status_code=404, detail="Scan not found")
    return SCANS[scan_id]
