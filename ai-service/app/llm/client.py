import logging
import time
from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

class NVIDIAClient:
    def __init__(self):
        # Validate API configurations safely
        if not settings.NVIDIA_API_KEY:
            logger.error("[NVIDIA] API Key is missing from settings configuration.")
            
        self.client = OpenAI(
            base_url=settings.NVIDIA_BASE_URL,
            api_key=settings.NVIDIA_API_KEY
        )
        self.model = settings.NVIDIA_MODEL

    def generate_report(
        self, 
        system_prompt: str, 
        user_prompt: str, 
        temperature: float = 0.2, 
        top_p: float = 0.9, 
        max_tokens: int = 2000
    ) -> str:
        """
        Sends generation requests to NVIDIA Nemotron OpenAI-compatible endpoint.
        Uses JSON response format and disables reasoning templates.
        """
        logger.info(f"[NVIDIA] Request started using model: {self.model}")
        start_time = time.time()
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
                extra_body={
                    "chat_template_kwargs": {
                        "enable_thinking": False
                    }
                }
            )
            duration = time.time() - start_time
            logger.info(f"[NVIDIA] Response received. Duration: {duration:.2f}s, Success: True")
            return response.choices[0].message.content
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"[NVIDIA] Request failed after {duration:.2f}s. Error: {str(e)}")
            raise e
