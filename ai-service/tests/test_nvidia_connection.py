import os
import json
import pytest
from unittest.mock import MagicMock, patch
from app.core.config import settings
from app.llm.client import NVIDIAClient
from app.schemas.medical_report import MedicalReport

def test_nvidia_client_initialization():
    """Verify client initialization and configuration loading."""
    client = NVIDIAClient()
    assert client.model == settings.NVIDIA_MODEL
    assert client.client is not None

@patch("app.llm.client.OpenAI")
def test_nvidia_client_mock_request(mock_openai_class):
    """Verify client request flow and JSON handling using mocks."""
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content=json.dumps({
            "summary": "Mock summary",
            "findings": [
                {
                    "diseaseId": "skin_cancer",
                    "diseaseName": "Skin Cancer",
                    "status": "detected",
                    "prediction": "melanoma",
                    "confidence": 91.0,
                    "interpretation": "Mock interpretation",
                    "modelArchitecture": "MobileNetV3-Large",
                    "modelName": "Skin Classifier",
                    "detectionCount": 0
                }
            ],
            "overallAssessment": "Mock overall",
            "recommendations": ["Review with doctor"],
            "limitations": ["AI assistant only"],
            "urgentAttention": False,
            "disclaimer": "This AI-generated report is intended to assist clinical review and does not replace professional medical diagnosis."
        })))
    ]
    mock_client.chat.completions.create.return_value = mock_response

    client = NVIDIAClient()
    res = client.generate_report("System instructions", "User payload")
    
    parsed = json.loads(res)
    assert parsed["summary"] == "Mock summary"
    assert parsed["findings"][0]["diseaseId"] == "skin_cancer"

    # Verify Pydantic matches schema
    # Fill in required fields for schema validation
    parsed["reportId"] = "rep_123"
    parsed["generatedAt"] = "2026-08-27T00:00:00Z"
    parsed["reportVersion"] = "1.0.0"
    parsed["llmModel"] = "test-model"
    report_obj = MedicalReport(**parsed)
    assert report_obj.findings[0].diseaseId == "skin_cancer"

@pytest.mark.skipif(
    os.environ.get("RUN_NVIDIA_LIVE_TEST") != "true",
    reason="RUN_NVIDIA_LIVE_TEST is not set to 'true'. Skipping live connection test."
)
def test_nvidia_live_connection():
    """Verify live endpoint connectivity and API responses (requires credentials)."""
    assert settings.NVIDIA_API_KEY, "NVIDIA_API_KEY must be configured for live tests."
    
    client = NVIDIAClient()
    system_prompt = "You are a helpful medical assistant. Output ONLY a valid JSON: {\"status\": \"ok\"}"
    user_prompt = "Test Hello"
    
    raw = client.generate_report(system_prompt, user_prompt, temperature=0.1)
    parsed = json.loads(raw)
    assert parsed.get("status") == "ok"
