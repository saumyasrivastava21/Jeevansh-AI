from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# --- Request Schemas ---

class PatientContext(BaseModel):
    name: Optional[str] = "Patient"
    age: Optional[int] = None
    gender: Optional[str] = None

class DetectionBBox(BaseModel):
    x: float
    y: float
    w: float
    h: float

class DetectionItem(BaseModel):
    label: str
    confidence: float
    percentage: Optional[str] = None
    bbox: Optional[DetectionBBox] = None
    pixel_bbox: Optional[DetectionBBox] = None
    image_width: Optional[int] = None
    image_height: Optional[int] = None

class ModelMetadata(BaseModel):
    architecture: str
    displayName: str
    version: Optional[str] = None

class PredictionItem(BaseModel):
    diseaseId: str
    diseaseName: str
    taskType: str
    hasFinding: bool
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    probabilities: Optional[Dict[str, float]] = None
    detections: Optional[List[DetectionItem]] = None
    modelArchitecture: Optional[str] = None
    modelName: Optional[str] = None
    modelVersion: Optional[str] = None
    checkpoint: Optional[str] = None
    inferenceTime: Optional[float] = None
    heatmapImage: Optional[str] = None
    imageWidth: Optional[int] = None
    imageHeight: Optional[int] = None
    # support nested model for backward compatibility
    model: Optional[ModelMetadata] = None

class MedicalReportRequest(BaseModel):
    patient_context: Optional[PatientContext] = None
    predictions: List[PredictionItem]


# --- Response Schemas ---

class FindingItem(BaseModel):
    diseaseId: str
    diseaseName: str
    status: str  # "detected", "not_detected", or "indeterminate"
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    interpretation: str
    modelArchitecture: str
    modelName: str
    modelVersion: Optional[str] = None
    detectionCount: int

class MedicalReport(BaseModel):
    reportId: Optional[str] = None
    generatedAt: str
    reportVersion: str = "1.0.0"
    summary: str
    findings: List[FindingItem]
    overallAssessment: str
    recommendations: List[str]
    limitations: List[str]
    urgentAttention: bool
    disclaimer: str = "This AI-generated report is intended to assist clinical review and does not replace professional medical diagnosis."
    llmModel: str

class MedicalReportResponse(BaseModel):
    success: bool
    report: MedicalReport
