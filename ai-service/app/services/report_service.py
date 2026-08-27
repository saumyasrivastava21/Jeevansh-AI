import logging
from app.schemas.medical_report import MedicalReportRequest
from app.agents.report_agent import ReportAgent

logger = logging.getLogger(__name__)

class ReportService:
    def __init__(self):
        self.report_agent = ReportAgent()

    def generate_report(self, request: MedicalReportRequest) -> dict:
        logger.info("[Report Service] Starting report generation")
        try:
            report_data, validation_passed = self.report_agent.generate(request)
            
            # Format report return structure exactly as specified
            response = {
                "success": True,
                "report": report_data.dict(),
                "reportModel": self.report_agent.client.model,
                "generatedAt": report_data.generatedAt,
                "validationPassed": validation_passed
            }
            logger.info("[Report Service] Report saved and formatted successfully.")
            return response
        except ValueError as ve:
            logger.error(f"[Report Service] Controlled ValueError during generation: {str(ve)}")
            if str(ve) == "REPORT_VALIDATION_FAILED":
                return {
                    "success": False,
                    "validationPassed": False,
                    "error": "REPORT_VALIDATION_FAILED",
                    "message": "Generated report failed clinical safety validator guidelines."
                }
            return {
                "success": False,
                "validationPassed": False,
                "error": "MALFORMED_JSON",
                "message": str(ve)
            }
        except Exception as e:
            logger.critical(f"[Report Service] Exception calling NVIDIA LLM: {str(e)}")
            return {
                "success": False,
                "validationPassed": False,
                "error": "LLM_SERVICE_UNAVAILABLE",
                "message": f"NVIDIA API request failed: {str(e)}"
            }

report_service = ReportService()
