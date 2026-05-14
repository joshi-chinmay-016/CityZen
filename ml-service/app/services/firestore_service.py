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

# MODULE: ML Firestore Integration Service

import logging
from pathlib import Path

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

from app.config import settings
from app.services.duplicate_filter import DuplicateFilter


logger = logging.getLogger(__name__)

class FirestoreService:
    _duplicate_filter = DuplicateFilter()
    _db = None

    def __init__(self):
        self._ensure_firestore_client()

    def save_prediction(self, report: dict):
        """
        Saves the prediction by calling the Backend API.
        This ensures unified logic for Firestore storage and local fallback caching.
        """
        import json
        import urllib.request
        from urllib.error import URLError

        try:
            self._validate_report(report)
            
            # Prepare data for Backend API
            # Backend expects 'type' or 'hazard', 'latitude'/'longitude' or 'lat'/'lng'
            payload = {
                "id": report["id"], # CRITICAL: Ensure ID consistency
                "latitude": report["latitude"],
                "longitude": report["longitude"],
                "hazard": report["hazard"],
                "severity": report["severity"],
                "confidence": report["confidence"],
                "timestamp": report["timestamp"],
                "description": "AI detected hazard"
            }

            backend_url = "http://localhost:5000/reports" # Adjust if your backend port is different
            req = urllib.request.Request(backend_url)
            req.add_header('Content-Type', 'application/json; charset=utf-8')
            jsondata = json.dumps(payload)
            jsondataasbytes = jsondata.encode('utf-8')
            req.add_header('Content-Length', len(jsondataasbytes))

            try:
                with urllib.request.urlopen(req, timeout=5) as response:
                    logger.info("Successfully synced prediction to Backend API. Status: %s", response.status)
            except (URLError, Exception) as api_err:
                logger.warning("Backend API unavailable (%s). Falling back to direct Firestore save.", str(api_err))
                # Fallback: Save directly to Firestore if Backend is down
                db = self._ensure_firestore_client()
                db.collection(settings.firestore_reports_collection).document(report["id"]).set(report)
                logger.info("Saved prediction directly to Firestore (Backend fallback).")

        except Exception:
            logger.exception("Failed to save prediction.")
            raise
        return report

    @property
    def _predictions(self):
        return self._fetch_reports()

    def _validate_report(self, report: dict):
        required_fields = {
            "id",
            "latitude",
            "longitude",
            "hazard",
            "severity",
            "confidence",
            "timestamp",
        }
        missing_fields = sorted(field for field in required_fields if field not in report)
        if missing_fields:
            logger.warning("Prediction report missing required fields: %s", missing_fields)
            raise ValueError(f"Prediction report missing required fields: {missing_fields}")

    def is_duplicate(self, lat, lng, hazard, timestamp):
        # timestamp is iso string, convert to float
        from datetime import datetime
        ts = datetime.fromisoformat(timestamp).timestamp()
        return self.__class__._duplicate_filter.is_duplicate(lat, lng, hazard, ts)

    def get_heatmap_data(self):
        # Return [[lat, lng, intensity]]
        heatmap = []
        for report in self._fetch_reports():
            intensity = self._get_intensity(report['severity'])
            heatmap.append([
                report['latitude'],
                report['longitude'],
                intensity
            ])
        return heatmap

    def _fetch_reports(self):
        try:
            db = self._ensure_firestore_client()
            # Note: stream() can also hit quota limits
            documents = db.collection(settings.firestore_reports_collection).stream()
            reports = []
            for document in documents:
                report = document.to_dict() or {}
                if "id" not in report:
                    report["id"] = document.id
                reports.append(report)
            
            # If collection is empty, return some demo markers
            if not reports:
                return [
                    {"id": "demo1", "latitude": 12.9716, "longitude": 77.5946, "hazard": "pothole", "severity": "high", "confidence": 0.95, "timestamp": "2026-05-14T00:00:00Z"},
                    {"id": "demo2", "latitude": 12.9800, "longitude": 77.6000, "hazard": "manhole", "severity": "medium", "confidence": 0.88, "timestamp": "2026-05-14T00:00:00Z"}
                ]
            
            logger.info(
                "Fetched Firestore reports collection=%s count=%s",
                settings.firestore_reports_collection,
                len(reports),
            )
            return reports
        except Exception as e:
            logger.warning(
                "Failed to fetch Firestore reports (Quota likely exceeded): %s. Serving fallback data.",
                str(e)
            )
            # FALLBACK DATA for ML service stability
            return [
                {"id": "f1", "latitude": 12.9716, "longitude": 77.5946, "hazard": "pothole", "severity": "high", "confidence": 0.95, "timestamp": "2026-05-14T00:00:00Z"},
                {"id": "f2", "latitude": 12.9800, "longitude": 77.6000, "hazard": "manhole", "severity": "medium", "confidence": 0.88, "timestamp": "2026-05-14T00:00:00Z"},
                {"id": "f3", "latitude": 12.9650, "longitude": 77.5850, "hazard": "crack", "severity": "low", "confidence": 0.92, "timestamp": "2026-05-14T00:00:00Z"}
            ]

    @classmethod
    def _ensure_firestore_client(cls):
        if cls._db is not None:
            return cls._db

        credentials_path = Path(settings.firebase_credentials_path).expanduser()
        if not credentials_path.exists():
            raise FileNotFoundError(f"Firebase credentials file not found at {credentials_path}")

        if not firebase_admin._apps:
            credential = credentials.Certificate(str(credentials_path))
            firebase_admin.initialize_app(credential)
            logger.info("Firebase initialized successfully using credentials=%s", credentials_path)
        else:
            logger.info("Firebase app already initialized; reusing existing app")

        cls._db = firestore.client()
        logger.info("Firestore client initialized successfully")
        return cls._db

    def _get_intensity(self, severity):
        mapping = {
            "low": 0.3,
            "medium": 0.6,
            "high": 1.0
        }
        return mapping.get(severity, 0.5)
