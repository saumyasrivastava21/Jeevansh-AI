import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

class Settings:
    PROJECT_NAME: str = "Jeevansh AI Inference Service"
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    # NVIDIA API Config
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3.5-lightning-30b-a3b")
    NVIDIA_BASE_URL: str = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

    # Local Model Configs
    MODEL_DEVICE: str = os.getenv("MODEL_DEVICE", "auto")
    MODEL_PRECISION: str = os.getenv("MODEL_PRECISION", "auto")

settings = Settings()
