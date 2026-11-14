import io
import numpy as np
from PIL import Image


def generate_stub_gradcam(image: Image.Image) -> bytes:
    """
    Generates an explainability heatmap overlay.
    When full ONNX Grad-CAM layer hooks are loaded, computes feature map gradients.
    Stub creates an attention heat map over salient leaf center regions.
    """
    w, h = image.size
    # Create radial heatmap centered on the lesion / central zone
    x = np.linspace(-1, 1, w)
    y = np.linspace(-1, 1, h)
    xx, yy = np.meshgrid(x, y)
    d = np.sqrt(xx * xx + yy * yy)
    heatmap = np.exp(-(d ** 2) / 0.4)
    heatmap = (heatmap * 255).astype(np.uint8)

    # Colorize to colormap (jet/turbo approximation)
    color_map = Image.fromarray(heatmap, mode="L").convert("RGB")
    blended = Image.blend(image.convert("RGB"), color_map, alpha=0.45)

    buf = io.BytesIO()
    blended.save(buf, format="PNG")
    return buf.getvalue()
