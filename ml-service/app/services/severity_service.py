"""
====================================================
OWNER: Chinmay
MODULE: ML Services & AI Inference

RESPONSIBILITIES:
- YOLOv8 Inference
- Prediction APIs
- Severity Mapping
- Heatmap Data Generation
- ML Processing
====================================================
"""

"""
Severity Service
Maps hazard types to severity levels and scoring.
"""

# Severity mapping for different hazard types
SEVERITY_MAP = {
    "crack": {"severity": "low", "score": 2},
    "pothole": {"severity": "medium", "score": 5},
    "manhole": {"severity": "high", "score": 10},
}


def get_severity(label: str) -> dict:
    """
    Get severity information for a given hazard type.

    Args:
        label (str): Hazard type label (e.g., "pothole", "crack", "manhole")

    Returns:
        dict: {"severity": str, "score": int}
              Returns {"severity": "unknown", "score": 0} if label not found
    """
    if label in SEVERITY_MAP:
        return SEVERITY_MAP[label].copy()
    else:
        # Default severity for unknown labels
        return {"severity": "unknown", "score": 1}


def get_all_severities() -> dict:
    """
    Get all severity mappings.

    Returns:
        dict: Complete SEVERITY_MAP
    """
    return SEVERITY_MAP.copy()
