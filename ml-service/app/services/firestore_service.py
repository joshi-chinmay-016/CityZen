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
Firestore Service
Handles all Firestore database operations for hazard reporting.
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

# Get credentials path from environment or use default
CREDS_PATH = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS",
    str(Path(__file__).resolve().parent.parent.parent / "serviceAccountKey.json"),
)

# Initialize Firebase if not already initialized
_db = None


def get_firestore():
    """
    Get Firestore database instance. Initialize if needed.

    Returns:
        firestore.client: Firestore database client
    """
    global _db
    if _db is None:
        try:
            if not firebase_admin._apps:
                # Load service account key
                if not os.path.exists(CREDS_PATH):
                    raise FileNotFoundError(f"Service account key not found at {CREDS_PATH}")

                creds = credentials.Certificate(CREDS_PATH)
                firebase_admin.initialize_app(creds)

            _db = firestore.client()
            _db.settings(ignore_undefined_properties=True)
        except Exception as e:
            print(f"Error initializing Firestore: {str(e)}")
            raise

    return _db


def save_hazard(data: dict) -> str | None:
    """
    Save a hazard report to Firestore.

    Args:
        data (dict): Hazard data including:
            - hazard_type: str (e.g., "crack", "pothole", "manhole")
            - severity: str (e.g., "low", "medium", "high")
            - severity_score: int
            - confidence: float
            - lat: float
            - lng: float
            - timestamp: str or int
            - image_url: str (optional)

    Returns:
        str: Document ID if successful, None if failed
    """
    try:
        db = get_firestore()
        hazards_ref = db.collection("hazards")

        # Add server timestamp
        if "timestamp" not in data:
            data["timestamp"] = datetime.utcnow().isoformat()

        # Ensure report_count exists
        if "report_count" not in data:
            data["report_count"] = 1

        doc_ref = hazards_ref.add(data)
        doc_id = doc_ref[1].id
        print(f"Hazard saved to Firestore with ID: {doc_id}")
        return doc_id

    except Exception as e:
        print(f"Error saving hazard to Firestore: {str(e)}")
        return None


def get_all_hazards() -> list:
    """
    Fetch all hazard reports from Firestore.

    Returns:
        list: List of hazard documents with their IDs
    """
    try:
        db = get_firestore()
        hazards_ref = db.collection("hazards")
        docs = hazards_ref.stream()

        hazards = []
        for doc in docs:
            hazard = doc.to_dict()
            hazard["id"] = doc.id
            hazards.append(hazard)

        return hazards

    except Exception as e:
        print(f"Error fetching hazards from Firestore: {str(e)}")
        return []


def check_duplicate_hazard(
    lat: float, lng: float, label: str, time_window_mins: int = 5
) -> dict | None:
    """
    Check if a similar hazard was recently reported nearby (duplicate detection).

    Logic:
    - Same hazard type (label)
    - Within 20 meters (approximated by ~0.00018 degrees per meter at equator)
    - Within specified time window

    Args:
        lat (float): Latitude of hazard
        lng (float): Longitude of hazard
        label (str): Hazard type label
        time_window_mins (int): Time window in minutes (default 5)

    Returns:
        dict: Existing hazard document if duplicate found, None otherwise
    """
    try:
        db = get_firestore()
        hazards_ref = db.collection("hazards")

        # Approximate 20 meters as 0.00018 degrees (varies by latitude)
        THRESHOLD_DEGREES = 0.00018

        # Time threshold
        time_threshold = datetime.utcnow() - timedelta(minutes=time_window_mins)

        # Query for recent hazards of same type
        query = (
            hazards_ref.where("hazard_type", "==", label)
            .where("timestamp", ">=", time_threshold.isoformat())
            .stream()
        )

        # Filter by distance
        for doc in query:
            hazard = doc.to_dict()
            hazard_lat = hazard.get("lat", 0)
            hazard_lng = hazard.get("lng", 0)

            lat_diff = abs(hazard_lat - lat)
            lng_diff = abs(hazard_lng - lng)

            if lat_diff < THRESHOLD_DEGREES and lng_diff < THRESHOLD_DEGREES:
                hazard["id"] = doc.id
                return hazard

        return None

    except Exception as e:
        print(f"Error checking duplicate hazard: {str(e)}")
        return None


def increment_hazard_count(doc_id: str) -> bool:
    """
    Increment the report_count of an existing hazard document (for duplicates).

    Args:
        doc_id (str): Firestore document ID

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        db = get_firestore()
        hazard_ref = db.collection("hazards").document(doc_id)
        hazard_ref.update({"report_count": firestore.Increment(1)})
        print(f"Incremented report count for hazard {doc_id}")
        return True

    except Exception as e:
        print(f"Error incrementing hazard count: {str(e)}")
        return False


def get_analytics() -> dict:
    """
    Get analytics summary (counts by severity).

    Returns:
        dict: {
            "total_reports": int,
            "high": int,
            "medium": int,
            "low": int,
            "by_type": {hazard_type: count}
        }
    """
    try:
        db = get_firestore()
        hazards_ref = db.collection("hazards")
        docs = hazards_ref.stream()

        analytics = {"total_reports": 0, "high": 0, "medium": 0, "low": 0, "by_type": {}}

        for doc in docs:
            hazard = doc.to_dict()
            report_count = hazard.get("report_count", 1)

            analytics["total_reports"] += report_count
            severity = hazard.get("severity", "unknown")

            if severity == "high":
                analytics["high"] += report_count
            elif severity == "medium":
                analytics["medium"] += report_count
            elif severity == "low":
                analytics["low"] += report_count

            # Count by type
            hazard_type = hazard.get("hazard_type", "unknown")
            analytics["by_type"][hazard_type] = analytics["by_type"].get(hazard_type, 0) + report_count

        return analytics

    except Exception as e:
        print(f"Error getting analytics: {str(e)}")
        return {"total_reports": 0, "high": 0, "medium": 0, "low": 0, "by_type": {}}
