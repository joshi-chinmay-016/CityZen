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

# MODULE: Duplicate Filter Service

import time

class DuplicateFilter:
    def __init__(self, time_window=300):  # 5 minutes
        self.time_window = time_window
        self.recent_reports = []  # list of (lat, lng, hazard, timestamp)

    def is_duplicate(self, lat, lng, hazard, timestamp):
        current_time = time.time()
        # Clean old entries
        self.recent_reports = [
            r for r in self.recent_reports
            if current_time - r[3] < self.time_window
        ]
        # Check for duplicates
        for r_lat, r_lng, r_hazard, r_ts in self.recent_reports:
            if (abs(r_lat - lat) < 0.0001 and  # ~10 meters
                abs(r_lng - lng) < 0.0001 and
                r_hazard == hazard):
                return True
        # Add to recent
        self.recent_reports.append((lat, lng, hazard, timestamp))
        return False