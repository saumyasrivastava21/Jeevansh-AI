from fastapi import APIRouter
from app.services.model_registry import registry
from app.services.inference_service import DEVICE, PRECISION

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "jeevansh-ai-inference",
        "device": str(DEVICE),
        "precision": str(PRECISION),
        "models_loaded": len(registry._models)
    }
