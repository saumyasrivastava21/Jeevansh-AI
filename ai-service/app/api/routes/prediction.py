from fastapi import APIRouter, File, UploadFile, HTTPException
from PIL import Image
import io

from app.services.model_registry import registry
from app.schemas.prediction import (
    PredictionResponse,
    PredictionLabel,
    BBoxCoords,
    ModelInfo,
    ProcessingInfo,
    DetectionItem,
    ExplainabilityInfo
)

router = APIRouter()

@router.post("/predict/{disease_type}", response_model=PredictionResponse)
async def predict_disease(disease_type: str, image: UploadFile = File(...)):
    # Retrieve model from registry
    model = registry.get_model(disease_type)
    if not model:
        raise HTTPException(
            status_code=400,
            detail=f"Model for disease type '{disease_type}' is not supported. Supported: {list(registry._models.keys())}"
        )
        
    # File content type validation
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="File upload failed: Uploaded item must be an image."
        )
        
    try:
        # Load image bytes
        image_bytes = await image.read()
        
        # Log input image properties exactly as requested
        pil_image = Image.open(io.BytesIO(image_bytes))
        w, h = pil_image.size
        
        # If it is bone_fracture, we must log under [Fracture Input]
        if disease_type in ["fracture", "bone_fracture", "bone-fracture"]:
            import os
            print("\n[Fracture Input]")
            print(f"filename = {image.filename}")
            print(f"content_type = {image.content_type}")
            print(f"size = {len(image_bytes)}")
            print(f"width = {w}")
            print(f"height = {h}")
            print(f"mode = {pil_image.mode}")
            
            # Save the exact FastAPI input temporarily during development: debug/fracture_input.png
            debug_dir = r"C:\Users\saums\OneDrive\Desktop\PREP_2026\dev\Jeevansh AI\ai-service\debug"
            os.makedirs(debug_dir, exist_ok=True)
            debug_input_path = os.path.join(debug_dir, "fracture_input.png")
            with open(debug_input_path, "wb") as f:
                f.write(image_bytes)
            print(f"[Fracture Input] Saved debug input image to {debug_input_path}\n")

        # Execute prediction
        result = model.predict(image_bytes)
        
        # Map to validated Pydantic model response
        return PredictionResponse(
            success=result["success"],
            inference_id=result["inference_id"],
            disease_id=result["disease_id"],
            disease_name=result["disease_name"],
            task_type=result["task_type"],
            has_finding=result["has_finding"],
            prediction=PredictionLabel(
                label=result["prediction"]["label"],
                confidence=result["prediction"]["confidence"],
                percentage=result["prediction"].get("percentage", f"{result['prediction']['confidence'] * 100:.2f}%")
            ) if result.get("prediction") else None,
            confidence=result.get("confidence"),
            probabilities=result.get("probabilities"),
            detections=[
                DetectionItem(
                    label=d["label"],
                    confidence=d["confidence"],
                    percentage=d["percentage"],
                    bbox=BBoxCoords(
                        x=d["bbox"]["x"],
                        y=d["bbox"]["y"],
                        w=d["bbox"]["w"],
                        h=d["bbox"]["h"]
                    ),
                    pixel_bbox=BBoxCoords(
                        x=d["pixel_bbox"]["x"],
                        y=d["pixel_bbox"]["y"],
                        w=d["pixel_bbox"]["w"],
                        h=d["pixel_bbox"]["h"]
                    ) if d.get("pixel_bbox") else None,
                    image_width=d.get("image_width"),
                    image_height=d.get("image_height")
                ) for d in result["detections"]
            ] if result.get("detections") else None,
            findings=result.get("findings"),
            model=ModelInfo(
                architecture=result["model"]["architecture"],
                display_name=result["model"]["display_name"],
                version=result["model"]["version"]
            ),
            heatmap_image=result["heatmap_image"],
            explainability=ExplainabilityInfo(
                type=result["explainability"]["type"],
                available=result["explainability"]["available"],
                image=result["explainability"].get("image")
            ) if result.get("explainability") else None,
            inference_time_ms=result["inference_time_ms"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI Service Inference Error: {str(e)}"
        )
