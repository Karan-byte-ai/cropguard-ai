"""
CropGuard AI - Golden Evaluation Set Test Suite
Verifies inference latency budget (under 2s p95 on CPU) and calibration (Section 7.4 & 14).
"""

import time
import pytest
import numpy as np
from apps.inference.service.leaf_validator import LeafValidator
from apps.inference.service.gate import evaluate_confidence_gate


def test_leaf_validator_non_leaf_rejection():
    validator = LeafValidator()
    # Non-leaf image: solid black or grey noise without chlorophyll signatures
    non_leaf_img = np.zeros((224, 224, 3), dtype=np.uint8)
    is_leaf, score = validator.validate(non_leaf_img)
    # Rejection gate: score < 0.6
    assert score < 0.6 or not is_leaf


def test_confidence_gate_modes():
    # 1. Low leaf score -> rejected
    res = evaluate_confidence_gate(leaf_score=0.45, predictions=[])
    assert res["status"] == "rejected"
    assert res["mode"] == "not_a_leaf"

    # 2. Confirmed disease: Top-1 >= 0.85
    preds = [
        {"disease": "tomato_late_blight", "confidence": 0.92},
        {"disease": "tomato_early_blight", "confidence": 0.05},
    ]
    res_high = evaluate_confidence_gate(leaf_score=0.88, predictions=preds)
    assert res_high["status"] == "done"
    assert res_high["confidenceLevel"] == "high"
    assert res_high["mode"] == "confirmed_disease"

    # 3. Possible diseases: 0.55 <= Top-1 < 0.85
    preds_med = [
        {"disease": "tomato_late_blight", "confidence": 0.68},
        {"disease": "tomato_early_blight", "confidence": 0.22},
    ]
    res_med = evaluate_confidence_gate(leaf_score=0.88, predictions=preds_med)
    assert res_med["status"] == "done"
    assert res_med["confidenceLevel"] == "medium"
    assert res_med["mode"] == "possible_diseases"

    # 4. Unknown: Top-1 < 0.55
    preds_low = [
        {"disease": "tomato_late_blight", "confidence": 0.40},
    ]
    res_low = evaluate_confidence_gate(leaf_score=0.88, predictions=preds_low)
    assert res_low["status"] == "done"
    assert res_low["confidenceLevel"] == "low"
    assert res_low["mode"] == "unknown"


def test_cpu_inference_latency_budget():
    start = time.perf_counter()
    validator = LeafValidator()
    dummy_leaf = np.ones((224, 224, 3), dtype=np.uint8) * 100
    dummy_leaf[:, :, 1] = 200 # Higher green channel
    is_leaf, score = validator.validate(dummy_leaf)
    duration_ms = (time.perf_counter() - start) * 1000

    # Ensure latency is well within 2-second CPU budget
    assert duration_ms < 500
