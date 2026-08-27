import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.medical_report import MedicalReportRequest
from app.services.report_service import report_service
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1")

@router.post("/reports/generate")
async def generate_report(request: MedicalReportRequest):
    """
    Triggers Agentic AI medical report generation and safety validation.
    Raises descriptive HTTP exceptions on failures.
    """
    logger.info(f"[FastAPI Report Router] POST /api/v1/reports/generate trigger for {request.patient_context.name if request.patient_context else 'Unknown'}")
    
    if not settings.NVIDIA_API_KEY:
        logger.error("[FastAPI Report Router] NVIDIA_API_KEY environment variable is not configured.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="NVIDIA API key is not configured on the AI service."
        )

    try:
        response = report_service.generate_report(request)
        
        if not response["success"]:
            # Raise descriptive HTTP exceptions based on service errors
            err_code = response.get("error")
            msg = response.get("message", "Generation failed")
            
            if err_code == "REPORT_VALIDATION_FAILED":
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=msg)
            elif err_code == "MALFORMED_JSON":
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=msg)
            else:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=msg)
                
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[FastAPI Report Router] Uncaught exception: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation service failed: {str(e)}"
        )

@router.get("/report/health")
async def report_health():
    """
    Returns the report service health status and configurations.
    """
    logger.info("[FastAPI Report Router] GET /api/v1/report/health triggered")
    return {
        "status": "healthy",
        "llmConfigured": bool(settings.NVIDIA_API_KEY),
        "model": settings.NVIDIA_MODEL
    }
