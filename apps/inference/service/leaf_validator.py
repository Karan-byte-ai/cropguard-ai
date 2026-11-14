import numpy as np


class LeafValidator:
    """Validates whether an input image contains a plant leaf before disease classification."""

    def __init__(self, model_path: str = ""):
        self.model_path = model_path

    def validate(self, image_np: np.ndarray) -> tuple[bool, float]:
        """
        Runs leaf validation.
        Returns (is_leaf, leaf_score).
        Score threshold: 0.6 (Section 4.2).
        """
        # In foundation stub, calculate Green Leaf Index (GLI) heuristic: (2*G - R - B) / (2*G + R + B)
        # to ensure realistic behavior even before trained ONNX weights are mounted
        if image_np.ndim == 3 and image_np.shape[-1] == 3:
            r = image_np[:, :, 0].astype(float)
            g = image_np[:, :, 1].astype(float)
            b = image_np[:, :, 2].astype(float)
            denom = 2 * g + r + b + 1e-6
            gli = (2 * g - r - b) / denom
            score = float(np.clip(np.mean(gli) * 2.0 + 0.5, 0.0, 1.0))
        else:
            score = 0.85

        is_leaf = score >= 0.6
        return is_leaf, score
