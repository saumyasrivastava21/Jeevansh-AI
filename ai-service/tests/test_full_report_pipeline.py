import pytest
import json
from unittest.mock import patch, MagicMock
from app.schemas.medical_report import MedicalReportRequest
from app.agents.report_agent import ReportAgent

@pytest.fixture
def sample_classification_payload():
    return {
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
                "hasFinding": True,
                "prediction": "Melanoma",
                "confidence": 0.91,
                "probabilities": {
                    "Melanoma": 0.91,
                    "Nevus": 0.04,
                    "Basal_Cell_Carcinoma": 0.05
                },
                "modelArchitecture": "MobileNetV3-Large",
                "modelName": "MobileNetV3-Large — Skin Cancer Classifier",
                "modelVersion": "1.0.0",
                "checkpoint": "skin.pth",
                "inferenceTime": 12.5,
                "heatmapImage": "heatmap_skin_cancer.png"
            }
        ]
    }

@pytest.fixture
def sample_detection_payload():
    return {
        "patient_context": {
            "name": "Jane Smith",
            "age": 30,
            "gender": "female"
        },
        "predictions": [
            {
                "diseaseId": "bone_fracture",
                "diseaseName": "Bone Fracture",
                "taskType": "detection",
                "hasFinding": True,
                "prediction": "fracture",
                "confidence": 0.7126,
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
                ],
                "modelArchitecture": "YOLO11",
                "modelName": "YOLO11 — Bone Fracture Detector",
                "modelVersion": "1.0.0",
                "checkpoint": "fracture.pt",
                "inferenceTime": 15.2,
                "heatmapImage": "heatmap_fracture.png"
            }
        ]
    }

@patch("app.llm.client.OpenAI")
def test_full_classification_report_pipeline(mock_openai_class, sample_classification_payload):
    """Test full agentic pipeline run with classification input model result."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=json.dumps({
            "summary": "The classification model indicates a potential skin cancer finding.",
            "findings": [
                {
                    "diseaseId": "skin_cancer",
                    "diseaseName": "Skin Cancer",
                    "status": "detected",
                    "prediction": "Melanoma",
                    "confidence": 0.91,
                    "interpretation": "A Melanoma finding was observed with high confidence.",
                    "modelArchitecture": "MobileNetV3-Large",
                    "modelName": "MobileNetV3-Large — Skin Cancer Classifier",
                    "detectionCount": 0
                }
            ],
            "overallAssessment": "Finding is consistent with Melanoma. Specialist referral recommended.",
            "recommendations": ["Consult a dermatologist immediately for histological correlation."],
            "limitations": ["AI assistance support only. Medical check required."],
            "urgentAttention": True,
            "disclaimer": "This AI-generated report is intended to assist clinical review and does not replace professional medical diagnosis."
        })))
    ]
    mock_client.chat.completions.create.return_value = mock_response

    request = MedicalReportRequest(**sample_classification_payload)
    agent = ReportAgent()
    
    report, success = agent.generate(request)
    
    assert success is True
    assert report.urgentAttention is True
    assert len(report.findings) == 1
    assert report.findings[0].diseaseId == "skin_cancer"
    assert report.findings[0].status == "detected"
    assert report.findings[0].confidence == 0.91

@patch("app.llm.client.OpenAI")
def test_full_detection_report_pipeline(mock_openai_class, sample_detection_payload):
    """Test full agentic pipeline run with YOLO detection model result."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=json.dumps({
            "summary": "Bone fracture detected on analysis.",
            "findings": [
                {
                    "diseaseId": "bone_fracture",
                    "diseaseName": "Bone Fracture",
                    "status": "detected",
                    "prediction": "fracture",
                    "confidence": 0.7126,
                    "interpretation": "A fracture detection was identified at the highlighted coordinates.",
                    "modelArchitecture": "YOLO11",
                    "modelName": "YOLO11 — Bone Fracture Detector",
                    "detectionCount": 1
                }
            ],
            "overallAssessment": "Detection is consistent with fracture. Orthopedic checkup recommended.",
            "recommendations": ["Refer to orthopedics, review clinical symptoms."],
            "limitations": ["Screening software support only."],
            "urgentAttention": True,
            "disclaimer": "This AI-generated report is intended to assist clinical review and does not replace professional medical diagnosis."
        })))
    ]
    mock_client.chat.completions.create.return_value = mock_response

    request = MedicalReportRequest(**sample_detection_payload)
    agent = ReportAgent()
    
    report, success = agent.generate(request)
    
    assert success is True
    assert len(report.findings) == 1
    assert report.findings[0].detectionCount == 1
    assert report.findings[0].modelArchitecture == "YOLO11"
    assert report.findings[0].confidence == 0.7126
