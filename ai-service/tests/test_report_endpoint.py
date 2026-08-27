from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/report/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "healthy"
    assert "llmConfigured" in json_data
    assert json_data["model"] == "nvidia/nemotron-3.5-lightning-30b-a3b"

def test_generate_report_missing_api_key(monkeypatch):
    # Temporarily set NVIDIA_API_KEY to empty
    monkeypatch.setattr(settings, "NVIDIA_API_KEY", "")
    
    payload = {
        "patient_context": {
            "name": "Jane Doe",
            "age": 30,
            "gender": "female"
        },
        "predictions": [
            {
                "diseaseId": "bone_fracture",
                "diseaseName": "Bone Fracture",
                "taskType": "detection",
                "modelArchitecture": "YOLO11",
                "modelName": "YOLO11 — Bone Fracture Detector",
                "prediction": "fracture",
                "confidence": 0.7126,
                "hasFinding": True
            }
        ]
    }
    
    response = client.post("/api/v1/reports/generate", json=payload)
    # The updated route throws a 503 when key is missing
    assert response.status_code == 503
    json_data = response.json()
    assert "NVIDIA API key is not configured" in json_data["detail"]

def test_generate_report_endpoint_success(monkeypatch):
    # Mock settings key to bypass key missing check
    monkeypatch.setattr(settings, "NVIDIA_API_KEY", "mock_key")
    
    # Mock the ReportService call
    mock_service_response = {
        "success": True,
        "report": {
            "reportId": "rep_123",
            "generatedAt": "2026-08-27T00:00:00Z",
            "reportVersion": "1.0.0",
            "llmModel": "nvidia/nemotron-3.5-lightning-30b-a3b",
            "summary": "AI identified fracture.",
            "findings": [
                {
                    "diseaseId": "bone_fracture",
                    "diseaseName": "Bone Fracture",
                    "status": "detected",
                    "prediction": "fracture",
                    "confidence": 0.7126,
                    "interpretation": "Interpretation text.",
                    "modelArchitecture": "YOLO11",
                    "modelName": "YOLO11 — Bone Fracture Detector",
                    "detectionCount": 1
                }
            ],
            "overallAssessment": "Assessment text.",
            "recommendations": ["Recommendation 1"],
            "limitations": ["Limitation 1"],
            "urgentAttention": True,
            "disclaimer": "This AI-generated report is intended to assist clinical review and does not replace professional medical diagnosis."
        },
        "reportModel": "nvidia/nemotron-3.5-lightning-30b-a3b",
        "generatedAt": "2026-08-27T09:00:00Z",
        "validationPassed": True
    }
    
    mock_generate = MagicMock(return_value=mock_service_response)
    monkeypatch.setattr("app.api.routes.report.report_service.generate_report", mock_generate)
    
    payload = {
        "patient_context": {
            "name": "Jane Doe",
            "age": 30,
            "gender": "female"
        },
        "predictions": [
            {
                "diseaseId": "bone_fracture",
                "diseaseName": "Bone Fracture",
                "taskType": "detection",
                "modelArchitecture": "YOLO11",
                "modelName": "YOLO11 — Bone Fracture Detector",
                "prediction": "fracture",
                "confidence": 0.7126,
                "hasFinding": True
            }
        ]
    }
    
    response = client.post("/api/v1/reports/generate", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["report"]["findings"][0]["diseaseName"] == "Bone Fracture"
    assert json_data["reportModel"] == "nvidia/nemotron-3.5-lightning-30b-a3b"
