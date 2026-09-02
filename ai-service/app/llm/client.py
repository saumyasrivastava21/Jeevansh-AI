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
            api_key=settings.NVIDIA_API_KEY,
            timeout=60.0
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
        Retries with fallback model if the configured model is not found (404).
        """
        logger.info(f"[NVIDIA] Request started using model: {self.model}")
        start_time = time.time()
        import openai
        
        try:
            # Try configured model with JSON format
            return self._execute_chat(
                model=self.model,
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=temperature,
                top_p=top_p,
                max_tokens=max_tokens,
                use_json_format=True
            )
        except openai.NotFoundError as e:
            # Fallback model if 404 encountered (NVIDIA account does not have access to Lightning model)
            fallback_model = "meta/llama-3.2-11b-vision-instruct"
            logger.warning(f"[NVIDIA] Configured model {self.model} returned 404. Trying fallback model {fallback_model}...")
            try:
                res = self._execute_chat(
                    model=fallback_model,
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=temperature,
                    top_p=top_p,
                    max_tokens=max_tokens,
                    use_json_format=True
                )
                logger.info(f"[NVIDIA] Fallback model generated response successfully.")
                return res
            except Exception as fe:
                self._handle_exception(fe, start_time)
        except openai.BadRequestError as e:
            # Fallback if JSON format is rejected by provider/model
            logger.warning("[NVIDIA] BadRequest with JSON format. Retrying without response_format...")
            try:
                res = self._execute_chat(
                    model=self.model,
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=temperature,
                    top_p=top_p,
                    max_tokens=max_tokens,
                    use_json_format=False
                )
                return res
            except Exception as fe:
                self._handle_exception(fe, start_time)
        except Exception as e:
            self._handle_exception(e, start_time)

    def _execute_chat(
        self,
        model: str,
        system_prompt: str,
        user_prompt: str,
        temperature: float,
        top_p: float,
        max_tokens: int,
        use_json_format: bool
    ) -> str:
        params = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "top_p": top_p,
            "max_tokens": max_tokens
        }
        if use_json_format:
            params["response_format"] = {"type": "json_object"}
            params["extra_body"] = {
                "chat_template_kwargs": {
                    "enable_thinking": False
                }
            }
        
        response = self.client.chat.completions.create(**params)
        return response.choices[0].message.content

    def _handle_exception(self, e: Exception, start_time: float):
        duration = time.time() - start_time
        logger.error(f"[NVIDIA] Request failed after {duration:.2f}s. Error: {str(e)}")
        import openai
        if isinstance(e, openai.AuthenticationError):
            raise ValueError(f"NVIDIA_AUTH_ERROR: {str(e)}")
        elif isinstance(e, openai.RateLimitError):
            raise ValueError(f"NVIDIA_RATE_LIMIT: {str(e)}")
        elif isinstance(e, openai.APITimeoutError):
            raise ValueError(f"NVIDIA_TIMEOUT: {str(e)}")
        elif isinstance(e, openai.APIConnectionError):
            raise ValueError(f"NVIDIA_CONNECTION_ERROR: {str(e)}")
        elif isinstance(e, openai.NotFoundError):
            raise ValueError(f"NVIDIA_MODEL_NOT_FOUND: {str(e)}")
        else:
            raise ValueError(f"NVIDIA_API_ERROR: {str(e)}")
