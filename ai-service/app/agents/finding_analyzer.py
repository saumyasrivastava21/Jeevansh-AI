import logging
from typing import List, Dict, Any
from app.schemas.medical_report import MedicalReportRequest

logger = logging.getLogger(__name__)

class FindingAnalyzer:
    def __init__(self):
        self.disease_name_map = {
            "skin_cancer": "Skin Cancer",
            "skin-cancer": "Skin Cancer",
            "pneumonia": "Pneumonia",
            "brain_tumor": "Brain Tumor",
            "brain-tumor": "Brain Tumor",
            "bone_fracture": "Bone Fracture",
            "bone-fracture": "Bone Fracture",
            "fracture": "Bone Fracture"
        }

    def analyze(self, request: MedicalReportRequest) -> List[Dict[str, Any]]:
        logger.info(f"[Finding Analyzer] Validating and analyzing {len(request.predictions)} predictions.")
        
        analyzed = []
        for pred in request.predictions:
            # 1. Core metadata validation
            if not pred.diseaseId or not pred.diseaseName or not pred.taskType:
                raise ValueError("Malformed prediction: missing core metadata diseaseId, diseaseName, or taskType.")

            # 2. Extract model name & architecture (supporting both top-level and nested fallback)
            arch = pred.modelArchitecture or (pred.model.architecture if pred.model else None)
            model_name = pred.modelName or (pred.model.displayName if pred.model else None)

            if not arch or not model_name:
                raise ValueError("Malformed prediction: missing modelName or modelArchitecture metadata.")

            # 3. Validate confidence value range
            if pred.confidence is not None:
                try:
                    conf = float(pred.confidence)
                    if not (0.0 <= conf <= 1.0):
                        raise ValueError(f"Malformed prediction: confidence {conf} is out of bounds [0.0, 1.0].")
                except (ValueError, TypeError):
                    raise ValueError(f"Malformed prediction: confidence '{pred.confidence}' is not a valid float.")

            # 4. Map finding status based strictly on the verified hasFinding flag
            status = "detected" if pred.hasFinding else "not_detected"

            # 5. Extract detections count
            det_count = len(pred.detections) if pred.detections is not None else 0

            # 6. Package final verified item
            analyzed_item = {
                "diseaseId": pred.diseaseId,
                "diseaseName": self.disease_name_map.get(pred.diseaseId.lower().replace("-", "_"), pred.diseaseName),
                "taskType": pred.taskType,
                "hasFinding": pred.hasFinding,
                "status": status,
                "prediction": pred.prediction,
                "confidence": pred.confidence,
                "probabilities": pred.probabilities,
                "modelArchitecture": arch,
                "modelName": model_name,
                "modelVersion": pred.modelVersion or (pred.model.version if pred.model else "1.0.0"),
                "checkpoint": pred.checkpoint or "",
                "inferenceTime": pred.inferenceTime or 0.0,
                "heatmapImage": pred.heatmapImage or "",
                "detectionCount": det_count
            }

            if pred.detections is not None:
                analyzed_item["detections"] = [
                    {
                        "label": det.label,
                        "confidence": det.confidence,
                        "bbox": {
                            "x": det.bbox.x,
                            "y": det.bbox.y,
                            "w": det.bbox.w,
                            "h": det.bbox.h
                        } if det.bbox else None
                    }
                    for det in pred.detections
                ]
            else:
                analyzed_item["detections"] = []

            analyzed.append(analyzed_item)
            logger.info(f"[Finding Analyzer] Successfully validated prediction for: {pred.diseaseId}")

        return analyzed
