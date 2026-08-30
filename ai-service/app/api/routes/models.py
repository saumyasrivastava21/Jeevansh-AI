from fastapi import APIRouter
from app.services.model_registry import registry

router = APIRouter()

@router.get("/models")
async def list_models():
    return registry.list_models()
