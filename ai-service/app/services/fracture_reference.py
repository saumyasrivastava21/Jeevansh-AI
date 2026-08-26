import os
import sys
from ultralytics import YOLO
from PIL import Image

FRACTURE_MODEL_PATH = r"C:\Users\saums\OneDrive\Desktop\PREP_2026\dev\Jeevansh AI\models\fracture.pt"

class FractureReferenceModel:
    def __init__(self, checkpoint_path: str = FRACTURE_MODEL_PATH):
        if not os.path.exists(checkpoint_path):
            raise FileNotFoundError(f"[Fracture Reference] Checkpoint path not found: {checkpoint_path}")
            
        self.model = YOLO(checkpoint_path, task="detect")
        self.checkpoint_path = os.path.abspath(checkpoint_path)
        self.architecture = "YOLO11" # yolo11m.pt
        self.classes = self.model.names
        
        print("[Fracture Model]")
        print(f"checkpoint = {self.checkpoint_path}")
        print(f"architecture = {self.architecture}")
        print(f"classes = {self.classes}")
        print("loaded = true")

    def predict(self, source, imgsz: int = 1024, conf: float = 0.25, iou: float = 0.45):
        """
        Runs the standard Ultralytics YOLO inference.
        source can be a PIL Image, path to file, etc.
        """
        results = self.model.predict(
            source=source,
            imgsz=imgsz,
            conf=conf,
            iou=iou,
            verbose=False
        )
        return results[0]
