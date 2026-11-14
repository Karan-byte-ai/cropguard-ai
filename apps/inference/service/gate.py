from typing import Any, Dict, List, Literal


def evaluate_confidence_gate(
    leaf_score: float,
    predictions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Applies Section 4.2 Confidence Gate:
    Prevents falsely confident answers by triaging into distinct response modes.
    """
    if leaf_score < 0.6:
        return {
            "status": "rejected",
            "confidenceLevel": "low",
            "message": "No plant leaf detected. Please hold the camera close to the leaf and retake photo.",
            "mode": "not_a_leaf",
            "predictions": [],
        }

    if not predictions:
        return {
            "status": "rejected",
            "confidenceLevel": "low",
            "message": "Unable to analyze the leaf image. Please try again.",
            "mode": "unknown",
            "predictions": [],
        }

    top_pred = predictions[0]
    top_conf = top_pred.get("confidence", 0.0)
    top_disease = top_pred.get("disease", "")

    if "healthy" in top_disease.lower():
        return {
            "status": "done",
            "confidenceLevel": "high" if top_conf >= 0.85 else "medium",
            "mode": "healthy",
            "predictions": [top_pred],
        }

    if top_conf >= 0.85:
        return {
            "status": "done",
            "confidenceLevel": "high",
            "mode": "confirmed_disease",
            "predictions": predictions[:1],
        }
    elif 0.55 <= top_conf < 0.85:
        return {
            "status": "done",
            "confidenceLevel": "medium",
            "mode": "possible_diseases",
            "message": "Multiple possible matches detected. You may upload a second photo for higher precision.",
            "predictions": predictions[:3],
        }
    else:
        return {
            "status": "done",
            "confidenceLevel": "low",
            "mode": "unknown",
            "message": "Disease pattern is unclear. Please check general care guidelines or consult local KVK.",
            "predictions": [],
        }
