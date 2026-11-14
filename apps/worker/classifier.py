import re
from typing import List, Tuple
from apps.worker.news_adapters.base import NormalisedArticle

CROP_KEYWORDS = {
    "Wheat": ["wheat", "gehun", "rabi wheat"],
    "Tomato": ["tomato", "tamatar"],
    "Potato": ["potato", "aloo"],
    "Rice": ["rice", "paddy", "dhan"],
    "Cotton": ["cotton", "kapas"],
    "Apple": ["apple", "seb"],
    "Maize": ["maize", "corn", "makka"],
    "Grape": ["grape", "angoor"],
    "Soybean": ["soybean", "soya"],
    "Mustard": ["mustard", "sarson"],
}

DISEASE_KEYWORDS = {
    "Yellow Rust": ["yellow rust", "stripe rust", "puccinia striiformis"],
    "Late Blight": ["late blight", "phytophthora infestans"],
    "Early Blight": ["early blight", "alternaria"],
    "Bacterial Blight": ["bacterial blight", "xanthomonas"],
    "Leaf Curl": ["leaf curl", "begomovirus", "whitefly"],
    "Apple Scab": ["apple scab", "venturia"],
    "Locust": ["locust", "grasshopper swarm", "tiddi dal"],
    "Rust": ["rust", "tambera", "ratua"],
    "Powdery Mildew": ["powdery mildew", "churna rog"],
}

INDIAN_STATES = [
    "Punjab", "Haryana", "Maharashtra", "Uttar Pradesh", "Madhya Pradesh",
    "Gujarat", "Rajasthan", "Karnataka", "Tamil Nadu", "Andhra Pradesh",
    "Telangana", "West Bengal", "Bihar", "Odisha", "Himachal Pradesh", "Jammu and Kashmir"
]

OUTBREAK_KEYWORDS = [
    "outbreak", "spreading", "infestation", "blight alert", "locust alert",
    "epidemic", "urgent advisory", "pest attack", "high risk"
]


def classify_and_tag_article(article: NormalisedArticle) -> Tuple[bool, NormalisedArticle]:
    """
    Filters unrelated agriculture articles, tags crops/diseases/state,
    and applies outbreak alert rules (Section 9).
    """
    text = f"{article.title} {article.summary}".lower()

    # 1. Relevance filter: must contain at least one disease or pest keyword
    matched_diseases = []
    for dis_name, kws in DISEASE_KEYWORDS.items():
        if any(kw in text for kw in kws):
            matched_diseases.append(dis_name)

    if not matched_diseases:
        # Check general disease keywords
        if not re.search(r"\b(disease|pest|fungal|blight|pathogen|infection)\b", text):
            return False, article  # Drop unrelated news
        matched_diseases.append("Unspecified Disease")

    # 2. Tag Crops
    matched_crops = []
    for crop_name, kws in CROP_KEYWORDS.items():
        if any(kw in text for kw in kws):
            matched_crops.append(crop_name)

    # 3. Tag State
    detected_state = None
    for state in INDIAN_STATES:
        if state.lower() in text:
            detected_state = state
            break

    # 4. Outbreak Alert Detection Rule
    is_alert = any(w in text for w in OUTBREAK_KEYWORDS) and (detected_state is not None)
    severity = "high" if any(w in text for w in ["locust", "epidemic", "urgent", "spreading rapidly"]) else "medium"

    article.crops = matched_crops
    article.diseases = matched_diseases
    article.state = detected_state
    article.severity = severity
    article.is_outbreak_alert = is_alert
    article.relevance_score = 0.95 if is_alert else 0.85

    return True, article
