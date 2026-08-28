from pydantic import BaseModel
from typing import Dict, List, Optional

class PredictionLabel(BaseModel):
    label: str
    confidence: float
    percentage: str

class BBoxCoords(BaseModel):
    x: float
    y: float
    w: float
    h: float

class DetectionItem(BaseModel):
    label: str
    confidence: float
    percentage: str
    bbox: BBoxCoords
    pixel_bbox: Optional[BBoxCoords] = None
    image_width: Optional[int] = None
    image_height: Optional[int] = None

class ModelInfo(BaseModel):
    architecture: str
    display_name: str
    version: str

class ProcessingInfo(BaseModel):
    time_ms: int

class ExplainabilityInfo(BaseModel):
    type: str
    available: bool
    image: Optional[str] = None

class PredictionResponse(BaseModel):
    success: bool
    inference_id: str
    disease_id: str
    disease_name: str
    task_type: str
    has_finding: bool
    has_malignant_finding: Optional[bool] = None
    prediction: Optional[PredictionLabel] = None
    confidence: Optional[float] = None
    probabilities: Optional[Dict[str, float]] = None
    detections: Optional[List[DetectionItem]] = None
    findings: Optional[List[str]] = None
    model: ModelInfo
    heatmap_image: Optional[str] = None
    explainability: Optional[ExplainabilityInfo] = None
    inference_time_ms: float
