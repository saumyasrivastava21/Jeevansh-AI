import os
import sys
from PIL import Image

# Add service root directory to sys.path so we can import app.services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.fracture_reference import FractureReferenceModel, FRACTURE_MODEL_PATH

def main():
    if len(sys.argv) < 2:
        print("Usage: python tests/test_fracture_direct.py <image_path>")
        sys.exit(1)
        
    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(f"[-] Image not found: {image_path}")
        sys.exit(1)
        
    # Open PIL image to get width and height
    img = Image.open(image_path)
    w, h = img.size
    
    # Initialize reference model
    ref = FractureReferenceModel(FRACTURE_MODEL_PATH)
    
    # Run direct inference
    result = ref.predict(source=img, imgsz=1024, conf=0.25, iou=0.45)
    
    # Print the requested output format exactly
    print("\n==================================================")
    print("FRACTURE DIRECT MODEL TEST")
    print("==================================================")
    print(f"Checkpoint: {ref.checkpoint_path}")
    print(f"Architecture: {ref.architecture}")
    print(f"Classes: {ref.classes}")
    print(f"\nImage: {os.path.abspath(image_path)}")
    print(f"Width: {w}")
    print(f"Height: {h}")
    print("\nInference:")
    print("imgsz = 1024")
    print("conf = 0.25")
    print("iou = 0.45")
    
    print("\nDetections:")
    boxes = result.boxes
    if len(boxes) == 0:
        print("No detections found.")
    else:
        for i in range(len(boxes)):
            conf = float(boxes.conf[i].item())
            cls_id = int(boxes.cls[i].item())
            cls_name = ref.classes[cls_id]
            x1, y1, x2, y2 = boxes.xyxy[i].cpu().numpy()
            print(f"{i + 1}.")
            print(f"Class: {cls_name}")
            print(f"Confidence: {conf:.4f}")
            print(f"Bounding Box: x={x1:.2f}, y={y1:.2f}, w={x2 - x1:.2f}, h={y2 - y1:.2f}")
            
    print("==================================================")
    
    # Save debug image
    debug_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "debug"))
    os.makedirs(debug_dir, exist_ok=True)
    debug_img_path = os.path.join(debug_dir, "fracture_direct_result.png")
    
    # Ultralytics plot/save
    result.save(filename=debug_img_path)
    print(f"[+] Saved result visualization to {debug_img_path}")

if __name__ == "__main__":
    main()
