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

from typing import Dict, Any
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

def create_success_response(data: Any, message: str = "Success") -> JSONResponse:
    """
    Create standardized success response
    """
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": message,
            "data": data
        }
    )

def create_error_response(message: str, status_code: int = 500, details: Any = None) -> JSONResponse:
    """
    Create standardized error response
    """
    logger.error(f"Error response: {message}", extra={"details": details})
    content = {
        "success": False,
        "message": message
    }
    if details:
        content["details"] = details

    return JSONResponse(
        status_code=status_code,
        content=content
    )

def create_validation_error_response(errors: Dict[str, Any]) -> JSONResponse:
    """
    Create validation error response
    """
    return create_error_response(
        message="Validation failed",
        status_code=400,
        details=errors
    )