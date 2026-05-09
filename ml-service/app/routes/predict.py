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

# MODULE: ML Prediction Routes

import logging

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse

from app.schemas.response_schema import PredictAPIResponse
from app.services.yolov8_service import YOLOv8Service
from app.services.yolov8_service import InferenceServiceError
from app.services.yolov8_service import InvalidImageUploadError
from app.services.prediction_formatter import PredictionFormatter
from app.services.firestore_service import FirestoreService


logger = logging.getLogger(__name__)

router = APIRouter()
yolo_service = YOLOv8Service()
formatter = PredictionFormatter()
firestore_service = FirestoreService()

@router.post("/", response_model=PredictAPIResponse, response_model_exclude_none=True)
async def predict(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...)
):
    try:
        logger.info(
            "Predict request received: filename=%s latitude=%s longitude=%s",
            file.filename,
            latitude,
            longitude,
        )
        results = await yolo_service.predict(file)
        if not results:
            logger.info("No classification hazards detected for filename=%s", file.filename)
            return formatter.empty_response()

        logger.info("Using YOLO classification predictions for filename=%s count=%s", file.filename, len(results))
        formatted_results = formatter.format(results, latitude, longitude)

        if not formatted_results:
            logger.warning("Classification predictions failed validation for filename=%s", file.filename)
            return formatter.empty_response()

        # Filter duplicates
        saved_results = []
        for report in formatted_results:
            if not firestore_service.is_duplicate(
                report['latitude'], report['longitude'], report['hazard'], report['timestamp']
            ):
                firestore_service.save_prediction(report)
                saved_results.append(report)
            else:
                logger.info("Prediction duplicate skipped for document_id=%s", report["id"])

        logger.info(
            "Final prediction count for filename=%s total=%s saved=%s",
            file.filename,
            len(formatted_results),
            len(saved_results),
        )

        return formatter.wrap_response(formatted_results)
    except InvalidImageUploadError:
        logger.warning("Invalid image upload for filename=%s", file.filename)
        return JSONResponse(status_code=400, content={"error": "Invalid image upload"})
    except InferenceServiceError:
        logger.exception("Prediction inference failed for filename=%s", file.filename)
        return JSONResponse(status_code=500, content={"error": "Prediction failed"})
    except Exception:
        logger.exception("Unexpected prediction failure for filename=%s", file.filename)
        return JSONResponse(status_code=500, content={"error": "Prediction failed"})
