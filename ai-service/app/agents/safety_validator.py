import logging
import re
from typing import List, Dict, Any
from app.schemas.medical_report import MedicalReport

logger = logging.getLogger(__name__)

class SafetyValidator:
    def __init__(self):
        # Clinical safety heuristic regexes
        self.definitive_diagnosis_regex = [
            r"\bdefinitively\b",
            r"\bdiagnosed with certainty\b",
            r"\bproves that the patient has\b",
            r"\bconfirmed diagnosis of\b",
            r"\bthis confirms\b"
        ]
        
        self.medication_regex = [
            r"\bprescribe\b",
            r"\bmg\b",
            r"\btablet\b",
            r"\bcapsule\b",
            r"\bdosage\b",
            r"\bantibiotic\b",
            r"\btherapy with\b",
            r"\bmedication\b"
        ]
        
        self.lab_results_regex = [
            r"\bblood test\b",
            r"\bhemoglobin\b",
            r"\bwhite blood cell\b",
            r"\blaboratory results\b",
            r"\burine test\b",
            r"\bserum\b"
        ]
        
        self.unsupported_emergency_regex = [
            r"\bemergency surgery\b",
            r"\bpatient is in critical condition\b",
            r"\bimmediate operations\b"
        ]

    def validate(self, input_findings: List[Dict[str, Any]], report: MedicalReport) -> bool:
        logger.info("[Safety Validator] Validating LLM generated report.")

        # 1. Verify disclaimer exists
        expected_disclaimer = "This AI-generated report is intended to assist clinical review and does not replace professional medical diagnosis."
        if expected_disclaimer.lower() not in getattr(report, "disclaimer", "").lower():
            logger.warning("[Safety Validator] Validation failed: Disclaimer is missing or modified.")
            return False

        # 2. Verify same number of findings as input predictions
        if len(report.findings) != len(input_findings):
            logger.warning(f"[Safety Validator] Validation failed: LLM report contains {len(report.findings)} findings, expected {len(input_findings)}.")
            return False

        # Build lookup maps by diseaseId (case-insensitive, normalized)
        input_map = {item["diseaseId"].lower().replace("-", "_"): item for item in input_findings}

        # 3. Verify each finding item
        for finding in report.findings:
            disease_key = finding.diseaseId.lower().replace("-", "_")
            if disease_key not in input_map:
                logger.warning(f"[Safety Validator] Validation failed: LLM invented disease ID '{finding.diseaseId}'.")
                return False

            input_item = input_map[disease_key]

            # Verify disease name matches input
            if finding.diseaseName.lower() != input_item["diseaseName"].lower():
                logger.warning(f"[Safety Validator] Validation failed for '{finding.diseaseId}': name '{finding.diseaseName}' does not match input '{input_item['diseaseName']}'.")
                return False

            # Verify status is one of detected | not_detected | indeterminate
            if finding.status not in ["detected", "not_detected", "indeterminate"]:
                logger.warning(f"[Safety Validator] Validation failed: invalid status '{finding.status}'.")
                return False

            # Verify status corresponds to hasFinding flag
            expected_status = "detected" if input_item["hasFinding"] else "not_detected"
            if finding.status != expected_status:
                logger.warning(f"[Safety Validator] Validation failed for '{finding.diseaseId}': status '{finding.status}' does not match expected '{expected_status}' based on hasFinding={input_item['hasFinding']}.")
                return False

            # Verify prediction label
            if finding.prediction != input_item["prediction"]:
                logger.warning(f"[Safety Validator] Validation failed for '{finding.diseaseId}': prediction '{finding.prediction}' does not match model output '{input_item['prediction']}'.")
                return False

            # Verify confidence score (delta comparison to support minor rounding float representations)
            if input_item["confidence"] is not None:
                if finding.confidence is None or abs(finding.confidence - input_item["confidence"]) > 0.02:
                    logger.warning(f"[Safety Validator] Validation failed for '{finding.diseaseId}': confidence {finding.confidence} does not match model confidence {input_item['confidence']}.")
                    return False
            else:
                if finding.confidence is not None:
                    logger.warning(f"[Safety Validator] Validation failed for '{finding.diseaseId}': confidence is set to {finding.confidence} but expected None.")
                    return False

            # Verify model display name and architecture
            if finding.modelArchitecture != input_item["modelArchitecture"]:
                logger.warning(f"[Safety Validator] Validation failed for '{finding.diseaseId}': architecture '{finding.modelArchitecture}' does not match input '{input_item['modelArchitecture']}'.")
                return False

            if finding.modelName != input_item["modelName"]:
                logger.warning(f"[Safety Validator] Validation failed for '{finding.diseaseId}': model name '{finding.modelName}' does not match input '{input_item['modelName']}'.")
                return False

            # Verify detection count
            if finding.detectionCount != input_item["detectionCount"]:
                logger.warning(f"[Safety Validator] Validation failed for '{finding.diseaseId}': detection count {finding.detectionCount} does not match input {input_item['detectionCount']}.")
                return False

        # 4. Check for banned clinical phrases in LLM text fields (summary, assessments, interpretations)
        all_text = " ".join([
            report.summary,
            report.overallAssessment,
            " ".join(report.recommendations),
            " ".join(report.limitations),
            " ".join([f.interpretation for f in report.findings])
        ]).lower()

        # Check for definitive diagnosis
        for pattern in self.definitive_diagnosis_regex:
            if re.search(pattern, all_text):
                logger.warning(f"[Safety Validator] Validation failed: LLM output uses definitive diagnosis language: '{pattern}'.")
                return False

        # Check for prescriptions
        for pattern in self.medication_regex:
            if re.search(pattern, all_text):
                logger.warning(f"[Safety Validator] Validation failed: LLM output suggests specific medications: '{pattern}'.")
                return False

        # Check for fabricated lab results
        for pattern in self.lab_results_regex:
            if re.search(pattern, all_text):
                logger.warning(f"[Safety Validator] Validation failed: LLM output references fabricated lab results: '{pattern}'.")
                return False

        # Check for unsupported emergency surgery claims
        for pattern in self.unsupported_emergency_regex:
            if re.search(pattern, all_text):
                logger.warning(f"[Safety Validator] Validation failed: LLM output claims emergency surgical operations: '{pattern}'.")
                return False

        logger.info("[Safety Validator] Report validated successfully against all safety constraints.")
        return True
