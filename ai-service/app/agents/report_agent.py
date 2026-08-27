import json
import logging
import uuid
import datetime
from typing import Tuple
from app.schemas.medical_report import MedicalReportRequest, MedicalReport
from app.agents.finding_analyzer import FindingAnalyzer
from app.agents.evidence_agent import EvidenceAgent
from app.agents.safety_validator import SafetyValidator
from app.llm.client import NVIDIAClient
from app.llm.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE

logger = logging.getLogger(__name__)

class ReportAgent:
    def __init__(self):
        self.analyzer = FindingAnalyzer()
        self.evidence_agent = EvidenceAgent()
        self.client = NVIDIAClient()
        self.validator = SafetyValidator()

    def generate(self, request: MedicalReportRequest) -> Tuple[MedicalReport, bool]:
        logger.info("[Report Agent] Starting report generation")
        
        # 1. Finding Analyzer
        analyzed_findings = self.analyzer.analyze(request)
        logger.info("[Report Agent] Finding analysis completed")

        # 2. Evidence Agent
        evidence = self.evidence_agent.retrieve_evidence(analyzed_findings)

        # 3. Build Prompt with structured JSON payload representing untrusted prediction data
        # Wrap findings in a flat analysis payload
        payload = {
            "analysis": analyzed_findings
        }
        
        patient_ctx_dict = {}
        if request.patient_context:
            patient_ctx_dict = request.patient_context.dict()

        user_prompt = USER_PROMPT_TEMPLATE.format(
            patient_context_json=json.dumps(patient_ctx_dict, indent=2),
            verified_results_json=json.dumps(payload, indent=2)
        )

        # 4. NVIDIA request
        logger.info(f"[Report Agent] Calling NVIDIA model: {self.client.model}")
        raw_response = self.client.generate_report(SYSTEM_PROMPT, user_prompt)
        logger.info("[Report Agent] LLM response received")

        # 5. Clean & Parse JSON response
        clean_res = raw_response.strip()
        if clean_res.startswith("```json"):
            clean_res = clean_res[7:]
        if clean_res.endswith("```"):
            clean_res = clean_res[:-3]
        clean_res = clean_res.strip()

        try:
            parsed_json = json.loads(clean_res)
        except json.JSONDecodeError as jde:
            logger.error(f"[Report Agent] JSON parsing failed: {str(jde)}. Response: {raw_response}")
            raise ValueError(f"LLM returned malformed JSON: {str(jde)}")

        # Fill in automatic metadata on root before validating
        parsed_json["reportId"] = f"rep_{uuid.uuid4().hex[:8]}"
        parsed_json["generatedAt"] = datetime.datetime.utcnow().isoformat() + "Z"
        parsed_json["reportVersion"] = "1.0.0"
        parsed_json["llmModel"] = self.client.model

        # 6. Validate output against Pydantic schema
        try:
            report_obj = MedicalReport(**parsed_json)
        except Exception as e:
            logger.error(f"[Report Agent] Pydantic validation failed: {str(e)}. Parsed JSON: {parsed_json}")
            raise ValueError(f"LLM response failed schema validation: {str(e)}")

        # 7. Safety Validator check
        is_safe = self.validator.validate(analyzed_findings, report_obj)
        if not is_safe:
            logger.error("[Report Agent] Safety validation failed!")
            raise ValueError("REPORT_VALIDATION_FAILED")

        logger.info("[Report Agent] Safety validation passed")
        logger.info("[Report Agent] Report completed")
        return report_obj, True
