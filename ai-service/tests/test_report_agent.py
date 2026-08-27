import pytest
import json
from unittest.mock import MagicMock
from app.agents.report_agent import ReportAgent
from app.schemas.medical_report import MedicalReportRequest

@pytest.fixture
def mock_nvidia_client(monkeypatch):
    mock = MagicMock()
    # Monkeypatch NVIDIAClient inside report_agent module
    monkeypatch.setattr("app.agents.report_agent.NVIDIAClient", lambda: mock)
    # Mock model string
    mock.model = "nvidia/nemotron-3.5-lightning-30b-a3b"
    return mock

@pytest.fixture
def request_payload():
    return MedicalReportRequest(**{
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
                "hasFinding": True,
                "detections": [
                    {
                        "label": "fracture",
                        "confidence": 0.7126,
                        "bbox": {
                            "x": 174.15,
                            "y": 628.91,
                            "w": 269.25,
                            "h": 706.84
                        }
                    }
                ]
            }
        ]
    })

def test_report_agent_success(mock_nvidia_client, request_payload):
    # Setup mock return value representing valid JSON from Nemotron
    mock_nvidia_client.generate_report.return_value = json.dumps({
        "summary": "AI identified a fracture in the alignment.",
        "findings": [
            {
                "diseaseId": "bone_fracture",
                "diseaseName": "Bone Fracture",
                "status": "detected",
                "prediction": "fracture",
                "confidence": 0.7126,
                "interpretation": "A cortical line discontinuity was highlighted.",
                "modelArchitecture": "YOLO11",
                "modelName": "YOLO11 — Bone Fracture Detector",
                "detectionCount": 1
            }
        ],
        "overallAssessment": "Signs consistent with cortical discontinuity.",
        "recommendations": ["Follow up with orthopedic specialist."],
        "limitations": ["Requires clinical evaluation."],
        "urgentAttention": True,
        "disclaimer": "This AI-generated report is intended to assist clinical review and does not replace professional medical diagnosis."
    })
    
    agent = ReportAgent()
    report, status = agent.generate(request_payload)
    
    assert status is True
    assert report.summary == "AI identified a fracture in the alignment."
    assert report.findings[0].diseaseName == "Bone Fracture"
    assert report.findings[0].confidence == 0.7126
    assert report.findings[0].detectionCount == 1

def test_report_agent_fails_safety_check(mock_nvidia_client, request_payload):
    # Setup mock returning a modified confidence score of 0.95
    mock_nvidia_client.generate_report.return_value = json.dumps({
        "summary": "AI identified a fracture.",
        "findings": [
            {
                "diseaseId": "bone_fracture",
                "diseaseName": "Bone Fracture",
                "status": "detected",
                "prediction": "fracture",
                "confidence": 0.95,  # Modified confidence score
                "interpretation": "A cortical line discontinuity was highlighted.",
                "modelArchitecture": "YOLO11",
                "modelName": "YOLO11 — Bone Fracture Detector",
                "detectionCount": 1
            }
        ],
        "overallAssessment": "Signs consistent with bone fracture.",
        "recommendations": ["Follow up with specialist."],
        "limitations": ["Clinical review required."],
        "urgentAttention": True,
        "disclaimer": "This AI-generated report is intended to assist clinical review and does not replace professional medical diagnosis."
    })
    
    agent = ReportAgent()
    with pytest.raises(ValueError, match="REPORT_VALIDATION_FAILED"):
        agent.generate(request_payload)

def test_report_agent_malformed_json(mock_nvidia_client, request_payload):
    # Setup mock returning malformed/non-JSON text
    mock_nvidia_client.generate_report.return_value = "This is not JSON text at all."
    
    agent = ReportAgent()
    with pytest.raises(ValueError, match="LLM returned malformed JSON"):
        agent.generate(request_payload)
