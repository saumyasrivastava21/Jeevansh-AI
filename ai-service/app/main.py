from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.services.model_registry import registry
from app.api.routes import health, models, prediction

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Microservice providing real-time AI computer vision inference and Grad-CAM medical explainability.",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup hook to load models in memory
@app.on_event("startup")
async def startup_event():
    registry.load_all_models()

# Include routing sub-modules
app.include_router(health.router, tags=["System Status"])
app.include_router(models.router, tags=["Model Meta"])
app.include_router(prediction.router, tags=["Inference Pipelines"])

@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "status": "online"
    }
