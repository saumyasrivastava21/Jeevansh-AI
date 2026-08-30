import pytest
from pydantic import ValidationError
from app.schemas.medical_report import (
    MedicalReportRequest, 
    PatientContext, 
    ModelMetadata, 
    PredictionItem, 
    MedicalReport
)

def test_valid_report_request():
    payload = {
        "patient_context": {
            "name": "John Doe",
            "age": 45,
            "gender": "male"
        },
        "predictions": [
            {
                "diseaseId": "skin_cancer",
                "diseaseName": "Skin Cancer",
                "taskType": "classification",
                "modelArchitecture": "MobileNetV3-Large",
                "modelName": "MobileNetV3-Large Classifier",
                "modelVersion": "1.0.0",
                "prediction": "melanoma",
                "confidence": 0.912,
                "probabilities": {
                    "melanoma": 0.912,
                    "nevus": 0.088
                },
                "hasFinding": True
            }
        ]
    }
    
    req = MedicalReportRequest(**payload)
    assert req.patient_context.name == "John Doe"
    assert len(req.predictions) == 1
    assert req.predictions[0].diseaseId == "skin_cancer"
    assert req.predictions[0].confidence == 0.912

def test_invalid_report_request_missing_fields():
    payload = {
        "patient_context": {
            "name": "Jane Doe"
        }
        # missing predictions
    }
    with pytest.raises(ValidationError):
        MedicalReportRequest(**payload)

def test_valid_medical_report_response_schema():
    payload = {
        "reportId": "rep_123",
        "generatedAt": "2026-08-27T00:00:00Z",
        "reportVersion": "1.0.0",
        "llmModel": "nvidia/nemotron-3.5-lightning-30b-a3b",
        "summary": "This is a summary of findings.",
        "findings": [
            {
                "diseaseId": "skin_cancer",
                "diseaseName": "Skin Cancer",
                "status": "detected",
                "prediction": "melanoma",
                "confidence": 91.0,
                "interpretation": "Indicative signs of Melanoma detected.",
                "modelArchitecture": "MobileNetV3-Large",
                "modelName": "MobileNetV3-Large Classifier",
                "detectionCount": 0
            }
        ],
        "overallAssessment": "Patient presents with possible Melanoma.",
        "recommendations": ["Follow up with dermatologist."],
        "limitations": ["Clinical review required."],
        "urgentAttention": True,
        "disclaimer": "This AI-generated report is intended to assist clinical review and does not replace professional medical diagnosis."
    }
    report = MedicalReport(**payload)
    assert report.findings[0].diseaseName == "Skin Cancer"
    assert report.findings[0].confidence == 91.0
    assert report.overallAssessment == "Patient presents with possible Melanoma."
