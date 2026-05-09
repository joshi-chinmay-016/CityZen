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

# MODULE: YOLOv8 Inference Service

import io
import logging
from pathlib import Path

from PIL import Image, UnidentifiedImageError
from ultralytics import YOLO

from app.config import settings
from app.constants import ALLOWED_HAZARDS
from app.constants import CLASS_ID_TO_HAZARD
from app.constants import CLASS_NAME_TO_HAZARD
from app.constants import MODEL_PATH
from app.utils.image_utils import read_upload_bytes


logger = logging.getLogger(__name__)
CLASSIFICATION_CONFIDENCE_THRESHOLD = 0.4


class InvalidImageUploadError(ValueError):
    """Raised when an uploaded file is not a valid image."""


class InferenceServiceError(RuntimeError):
    """Raised when model inference cannot be completed safely."""

class YOLOv8Service:
    def __init__(self, model_path=MODEL_PATH):
        self.model_path = Path(model_path)
        self.model = None  # Lazy load on first prediction
        self.confidence_threshold = CLASSIFICATION_CONFIDENCE_THRESHOLD

    def _ensure_model_loaded(self):
        if self.model is None:
            if not self.model_path.exists():
                raise FileNotFoundError(f"YOLO model not found at {self.model_path}")
            self.model = YOLO(str(self.model_path))

    async def predict(self, file):
        logger.info("Image received for prediction: filename=%s content_type=%s", file.filename, file.content_type)
        self._ensure_model_loaded()
        image = await self._load_valid_image(file)

        try:
            logger.info("YOLO inference started for filename=%s", file.filename)
            results = self.model(image, verbose=False)
        except Exception as exc:
            logger.exception("YOLO inference failed for filename=%s", file.filename)
            raise InferenceServiceError("Model inference failed") from exc

        self._log_raw_inference_debug(file.filename, results)
        predictions = self._extract_classification_prediction(results)
        if predictions:
            logger.info("YOLO produced valid classification predictions for filename=%s", file.filename)
        else:
            logger.warning("YOLO returned no valid classification predictions for filename=%s", file.filename)
        logger.info("YOLO inference completed: predictions=%s filename=%s", len(predictions), file.filename)
        return predictions

    def is_road_like_upload(self, filename):
        normalized_filename = str(filename or "").strip().lower()
        is_road_like = any(keyword in normalized_filename for keyword in settings.fallback_keywords)
        logger.info(
            "Road-like upload check: filename=%s is_road_like=%s",
            filename,
            is_road_like,
        )
        return is_road_like

    async def _load_valid_image(self, file):
        try:
            image_bytes = await read_upload_bytes(file)
            if not image_bytes:
                raise InvalidImageUploadError("Uploaded file is empty")

            validation_image = Image.open(io.BytesIO(image_bytes))
            validation_image.verify()

            image = Image.open(io.BytesIO(image_bytes))
            processed_image = image.convert("RGB")
            logger.info(
                "Image preprocessing complete: filename=%s mode=%s size=%s",
                file.filename,
                processed_image.mode,
                processed_image.size,
            )
            return processed_image
        except (UnidentifiedImageError, OSError, ValueError) as exc:
            logger.warning("Invalid image upload rejected: filename=%s error=%s", file.filename, exc)
            raise InvalidImageUploadError("Invalid image upload") from exc

    def _extract_classification_prediction(self, results):
        if not results:
            logger.info("YOLO returned no results")
            return []
        if len(results) == 0:
            logger.info("YOLO returned an empty results collection")
            return []

        result = results[0]
        probs = getattr(result, "probs", None)
        if probs is None:
            logger.info("YOLO results[0] has no probs object")
            return []

        try:
            class_id = int(probs.top1)
            confidence = float(probs.top1conf)
        except (TypeError, ValueError, AttributeError) as exc:
            logger.warning("Failed to parse classification probs: error=%s", exc)
            return []

        label = self._resolve_label(class_id, self._resolve_raw_label(getattr(result, "names", {}) or {}, class_id))
        logger.info(
            "YOLO classification parsed: class_id=%s label=%s confidence=%s threshold=%s",
            class_id,
            label,
            confidence,
            self.confidence_threshold,
        )

        if confidence < self.confidence_threshold:
            logger.info(
                "Classification skipped below threshold: class_id=%s confidence=%s threshold=%s",
                class_id,
                confidence,
                self.confidence_threshold,
            )
            return []

        if label is None:
            logger.warning("Unsupported classification label for class_id=%s", class_id)
            return []

        if label not in ALLOWED_HAZARDS:
            logger.warning("Classification resolved to unsupported hazard: class_id=%s label=%s", class_id, label)
            return []

        return [{
            "class_id": class_id,
            "label": label,
            "confidence": confidence,
        }]

    def _log_raw_inference_debug(self, filename, results):
        logger.info("RAW RESULTS filename=%s: %s", filename, results)
        logger.info("MODEL NAMES filename=%s: %s", filename, getattr(self.model, "names", {}))

        if results is None:
            logger.info("RESULTS LENGTH filename=%s: None", filename)
            return

        try:
            results_length = len(results)
        except TypeError:
            results_length = None

        logger.info("RESULTS LENGTH filename=%s: %s", filename, results_length)

        if not results or results_length == 0:
            logger.info("RESULTS[0] unavailable for filename=%s", filename)
            return

        first_result = results[0]
        probs = getattr(first_result, "probs", None)
        logger.info("RESULTS[0].PROBS filename=%s: %s", filename, probs)
        logger.info("RESULTS[0].BOXES filename=%s: %s", filename, getattr(first_result, "boxes", None))

        if probs is None:
            logger.info("CLASSIFICATION PROBS unavailable for filename=%s", filename)
            return

        top1_class_id = getattr(probs, "top1", None)
        top1_confidence = getattr(probs, "top1conf", None)
        top5_class_ids = getattr(probs, "top5", None)
        top5_confidences = self._tensor_to_list(getattr(probs, "top5conf", None))
        result_names = getattr(first_result, "names", {}) or {}
        logger.info("TOP1 CLASS ID filename=%s: %s", filename, top1_class_id)
        logger.info("TOP1 CONFIDENCE filename=%s: %s", filename, top1_confidence)
        logger.info("TOP5 CLASS IDS filename=%s: %s", filename, top5_class_ids)
        logger.info("TOP5 CONFIDENCES filename=%s: %s", filename, top5_confidences)

        if top1_class_id is not None:
            try:
                resolved_class_id = int(top1_class_id)
            except (TypeError, ValueError):
                resolved_class_id = None
            label_name = self._resolve_raw_label(result_names, resolved_class_id) if resolved_class_id is not None else None
            logger.info(
                "CLASSIFICATION DEBUG filename=%s class_id=%s label=%s confidence=%s",
                filename,
                top1_class_id,
                label_name,
                top1_confidence,
            )

    def _resolve_raw_label(self, names, class_id):
        if isinstance(names, dict):
            label = names.get(class_id)
        elif isinstance(names, list) and 0 <= class_id < len(names):
            label = names[class_id]
        else:
            label = None

        if label is None:
            return None

        return str(label)

    def _resolve_label(self, class_id, raw_label):
        if class_id in CLASS_ID_TO_HAZARD:
            return CLASS_ID_TO_HAZARD[class_id]

        if raw_label is None:
            return None

        return CLASS_NAME_TO_HAZARD.get(str(raw_label).strip().lower())

    def _tensor_to_list(self, tensor_like):
        if tensor_like is None:
            return []
        try:
            values = tensor_like.tolist()
        except AttributeError:
            return []
        if isinstance(values, list):
            return values
        return [values]
