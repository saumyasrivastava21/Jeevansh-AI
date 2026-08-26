from fastapi import APIRouter
from app.services.model_registry import registry

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "jeevansh-ai-inference",
        "models_loaded": len(registry._models)
    }
