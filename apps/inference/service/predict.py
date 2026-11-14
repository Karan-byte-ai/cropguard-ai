import io
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.responses import Response
import numpy as np
from PIL import Image

from service.gate import evaluate_confidence_gate
from service.gradcam import generate_stub_gradcam
from service.leaf_validator import LeafValidator

app = FastAPI(title="CropGuard Inference Service", version="1.0.0")
leaf_validator = LeafValidator()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "cropguard-inference", "device": "cpu"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        img_np = np.array(image)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid image: {e}")

    # 1. Leaf Validator (Section 7.3 Stage 2)
    is_leaf, leaf_score = leaf_validator.validate(img_np)

    # 2. Disease Classifier Stub (EfficientNet-B0 ONNX interface)
    raw_predictions = [
        {"disease": "tomato_late_blight", "label": "Late Blight", "crop": "Tomato", "confidence": 0.93},
        {"disease": "tomato_early_blight", "label": "Early Blight", "crop": "Tomato", "confidence": 0.05},
        {"disease": "tomato_healthy", "label": "Healthy", "crop": "Tomato", "confidence": 0.02},
    ]

    # 3. Confidence Gate (Section 4.2)
    gate_result = evaluate_confidence_gate(leaf_score, raw_predictions)

    return {
        "modelVersion": "v1.3.0",
        "leafDetected": is_leaf,
        "leafScore": leaf_score,
        "gateResult": gate_result,
        "predictions": gate_result.get("predictions", []),
        "confidenceLevel": gate_result.get("confidenceLevel", "low"),
    }


@app.post("/heatmap")
async def heatmap(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        heatmap_bytes = generate_stub_gradcam(image)
        return Response(content=heatmap_bytes, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Heatmap failed: {e}")
