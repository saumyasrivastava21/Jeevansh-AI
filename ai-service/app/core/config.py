import os

class Settings:
    PROJECT_NAME: str = "Jeevansh AI Inference Service"
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")

settings = Settings()
