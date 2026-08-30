import pytest
from app.agents.safety_validator import SafetyValidator
from app.schemas.medical_report import MedicalReport, FindingItem

@pytest.fixture
def validator():
    return SafetyValidator()

@pytest.fixture
def input_predictions():
    return [
        {
            "diseaseId": "bone_fracture",
            "diseaseName": "Bone Fracture",
            "taskType": "detection",
            "modelArchitecture": "YOLO11",
            "modelName": "YOLO11 — Bone Fracture Detector",
            "prediction": "fracture",
            "confidence": 0.7126,
            "hasFinding": True,
            "detectionCount": 1
        }
    ]

@pytest.fixture
def valid_report_data():
    return {
        "generatedAt": "2026-08-27T00:00:00Z",
        "reportVersion": "1.0.0",
        "llmModel": "nvidia/nemotron-3.5-lightning-30b-a3b",
        "summary": "AI identified fracture in the scan.",
        "findings": [
            {
                "diseaseId": "bone_fracture",
                "diseaseName": "Bone Fracture",
                "status": "detected",
                "prediction": "fracture",
                "confidence": 0.7126,
                "interpretation": "A cortical line discontinuity has been highlighted by the AI model.",
                "modelArchitecture": "YOLO11",
                "modelName": "YOLO11 — Bone Fracture Detector",
                "detectionCount": 1
            }
        ],
        "overallAssessment": "The finding is consistent with a bone fracture.",
        "recommendations": ["Refer to orthopedic surgeon for alignment review."],
        "limitations": ["Requires qualified review."],
        "urgentAttention": True,
        "disclaimer": "This AI-generated report is intended to assist clinical review and does not replace professional medical diagnosis."
    }

def test_safety_validator_passes_valid_report(validator, input_predictions, valid_report_data):
    report = MedicalReport(**valid_report_data)
    assert validator.validate(input_predictions, report) is True

def test_safety_validator_rejects_missing_disclaimer(validator, input_predictions, valid_report_data):
    valid_report_data["disclaimer"] = "This is a simple analysis report."
    report = MedicalReport(**valid_report_data)
    assert validator.validate(input_predictions, report) is False

def test_safety_validator_rejects_modified_confidence(validator, input_predictions, valid_report_data):
    valid_report_data["findings"][0]["confidence"] = 0.99  # Input is 0.7126
    report = MedicalReport(**valid_report_data)
    assert validator.validate(input_predictions, report) is False

def test_safety_validator_rejects_unsupported_disease(validator, input_predictions, valid_report_data):
    valid_report_data["findings"].append({
        "diseaseId": "tuberculosis",
        "diseaseName": "Tuberculosis",
        "status": "detected",
        "prediction": "tuberculosis",
        "confidence": 0.88,
        "interpretation": "Unrelated disease.",
        "modelArchitecture": "YOLO11",
        "modelName": "YOLO11 — Tuberculosis Detector",
        "detectionCount": 1
    })
    report = MedicalReport(**valid_report_data)
    # The safety validator will reject because number of findings does not match length of input findings
    assert validator.validate(input_predictions, report) is False

def test_safety_validator_rejects_definitive_diagnosis_language(validator, input_predictions, valid_report_data):
    valid_report_data["overallAssessment"] = "We definitively diagnose the patient with a severe bone fracture."
    report = MedicalReport(**valid_report_data)
    assert validator.validate(input_predictions, report) is False

def test_safety_validator_rejects_medication_prescription(validator, input_predictions, valid_report_data):
    valid_report_data["recommendations"] = ["Prescribe Ibuprofen 400 mg twice daily."]
    report = MedicalReport(**valid_report_data)
    assert validator.validate(input_predictions, report) is False

def test_safety_validator_rejects_fabricated_lab_results(validator, input_predictions, valid_report_data):
    valid_report_data["summary"] = "Scan indicates fracture. Blood tests show hemoglobin of 14 g/dL."
    report = MedicalReport(**valid_report_data)
    assert validator.validate(input_predictions, report) is False
