import os
import sys
import requests
from PIL import Image

# Add service root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.fracture_reference import FractureReferenceModel, FRACTURE_MODEL_PATH

def main():
    image_path = r"C:\Users\saums\Downloads\0003_0662359351_01_WRI-R2_M011.png"
    if not os.path.exists(image_path):
        print(f"[-] Test image not found at: {image_path}")
        sys.exit(1)
        
    print("[+] Running Part A: Direct Ultralytics Inference...")
    ref = FractureReferenceModel(FRACTURE_MODEL_PATH)
    direct_res = ref.predict(source=image_path, imgsz=1024, conf=0.25, iou=0.45)
    direct_boxes = direct_res.boxes
    
    print("[+] Running Part B: FastAPI Inference...")
    url = "http://localhost:8000/predict/fracture"
    with open(image_path, 'rb') as f:
        files = {'image': (os.path.basename(image_path), f, 'image/png')}
        response = requests.post(url, files=files)
        
    if response.status_code != 200:
        print(f"[-] FastAPI Request failed: {response.text}")
        sys.exit(1)
        
    fastapi_res = response.json()
    fastapi_detections = fastapi_res.get("detections") or []
    
    print("\nDIRECT MODEL")
    print("------------")
    print(f"Detections count: {len(direct_boxes)}")
    for i in range(len(direct_boxes)):
        conf = float(direct_boxes.conf[i].item())
        cls_id = int(direct_boxes.cls[i].item())
        cls_name = ref.classes[cls_id]
        x1, y1, x2, y2 = direct_boxes.xyxy[i].cpu().numpy()
        print(f"[{i}] class={cls_name}, conf={conf:.4f}, bbox=[{x1:.2f}, {y1:.2f}, {x2:.2f}, {y2:.2f}]")
        
    print("\nFASTAPI")
    print("-------")
    print(f"Detections count: {len(fastapi_detections)}")
    for i, d in enumerate(fastapi_detections):
        pb = d.get("pixel_bbox")
        x = pb.get("x") if pb else None
        y = pb.get("y") if pb else None
        w = pb.get("w") if pb else None
        h = pb.get("h") if pb else None
        x2 = x + w if pb else None
        y2 = y + h if pb else None
        print(f"[{i}] class={d['label']}, conf={d['confidence']:.4f}, bbox=[{x:.2f}, {y:.2f}, {x2:.2f}, {y2:.2f}]")
        
    # Compare
    print("\nCOMPARISON")
    print("----------")
    detection_count_match = len(direct_boxes) == len(fastapi_detections)
    print(f"detection_count_match: {detection_count_match}")
    
    if detection_count_match and len(direct_boxes) > 0:
        class_match = True
        conf_diff = 0.0
        bbox_diff = 0.0
        
        # Sort both by confidence descending
        for i in range(len(direct_boxes)):
            d_conf = float(direct_boxes.conf[i].item())
            d_cls = ref.classes[int(direct_boxes.cls[i].item())]
            d_x1, d_y1, d_x2, d_y2 = direct_boxes.xyxy[i].cpu().numpy()
            
            f_d = fastapi_detections[i]
            f_conf = f_d["confidence"]
            f_cls = f_d["label"]
            pb = f_d.get("pixel_bbox")
            f_x1 = pb["x"]
            f_y1 = pb["y"]
            f_x2 = pb["x"] + pb["w"]
            f_y2 = pb["y"] + pb["h"]
            
            if d_cls != f_cls:
                class_match = False
                
            conf_diff = max(conf_diff, abs(d_conf - f_conf))
            bbox_diff = max(bbox_diff, abs(d_x1 - f_x1), abs(d_y1 - f_y1), abs(d_x2 - f_x2), abs(d_y2 - f_y2))
            
        print(f"class_match: {class_match}")
        print(f"confidence_difference: {conf_diff:.6f}")
        print(f"bbox_difference: {bbox_diff:.6f} pixels")
    elif len(direct_boxes) == 0 and len(fastapi_detections) == 0:
        print("class_match: True (both empty)")
        print("confidence_difference: 0.000000")
        print("bbox_difference: 0.000000 pixels")
    else:
        print("class_match: False (mismatched count)")

if __name__ == "__main__":
    main()
