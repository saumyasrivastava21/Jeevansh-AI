from typing import Dict, List, Optional
from app.services.inference_service import (
    BaseMedicalModelWrapper,
    SkinCancerModel,
    FractureModel,
    BrainTumorModel,
    PneumoniaModel
)

class ModelRegistry:
    def __init__(self):
        self._models: Dict[str, BaseMedicalModelWrapper] = {}
        
    def load_all_models(self):
        """
        Loads all models in memory on application startup.
        """
        print("[Model Registry] Initializing Jeevansh AI Models...")
        self._models["skin_cancer"] = SkinCancerModel()
        self._models["bone_fracture"] = FractureModel()
        self._models["brain_tumor"] = BrainTumorModel()
        self._models["pneumonia"] = PneumoniaModel()
        print("[Model Registry] All 4 models loaded successfully in memory.")

    def get_model(self, disease_type: str) -> Optional[BaseMedicalModelWrapper]:
        """
        Retrieves a loaded model from the registry.
        Supports both kebab-case and snake_case, as well as fracture/bone_fracture alias.
        """
        normalized = disease_type.replace("-", "_").lower()
        if normalized == "fracture":
            normalized = "bone_fracture"
        return self._models.get(normalized)

    def list_models(self):
        """
        Lists metadata for all loaded models.
        """
        return [
            {
                "id": v.disease_id,
                "disease_id": v.disease_id,
                "disease_name": v.disease_name,
                "name": v.model_name,
                "display_name": v.model_name,
                "task_type": v.task_type,
                "task": v.task_type,
                "architecture": v.architecture,
                "checkpoint": getattr(v, "model_path", "") if hasattr(v, "model_path") else getattr(v, "path", ""),
                "version": v.model_version,
                "loaded": True,
                "class_names": v.classes if hasattr(v, "classes") else [v.default_class],
                "classes": v.classes if hasattr(v, "classes") else [v.default_class]
            }
            for v in self._models.values()
        ]

# Global registry instance
registry = ModelRegistry()
