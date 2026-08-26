# 🧠 Jeevansh AI

### Multimodal Disease Detection & AI-Powered Medical Imaging Assistant

Jeevansh AI is a next-generation AI-powered healthcare platform that combines **Computer Vision + Generative AI** to assist in medical diagnosis and patient understanding. 

The application has a fully working model-driven architecture integrating a React frontend, Node.js + Express backend, MongoDB database, and a Python FastAPI AI inference service running 4 actual medical deep learning checkpoints.

---

## 🏗️ Technical Architecture

```text
React UI (Vite)
       ↓
Express Backend (:5000)
       ↓
FastAPI AI Service (:8000)
       ↓
Actual PyTorch / YOLO Checkpoint
       ↓
Real-time Prediction & Attention Overlays
       ↓
Express Persistence
       ↓
MongoDB (:27017)
       ↓
React Results Page (with Bounding Boxes & Heatmaps)
```

---

## 📂 Repository Structure

```text
Jeevansh-AI/
├── ai-service/                # Python FastAPI AI Inference Service
│   ├── app/
│   │   ├── api/routes/        # Prediction, model meta, health routing
│   │   ├── core/config.py     # Global settings
│   │   ├── schemas/           # Pydantic schema model rules
│   │   ├── services/          # Inference service wrappers, registry
│   │   ├── utils/gradcam.py   # Grad-CAM calculations
│   │   └── main.py            # API entry point
│   ├── tests/                 # Direct test and comparison scripts
│   ├── requirements.txt
│   └── Dockerfile
├── backend/                   # Node.js + Express Backend
│   ├── controllers/           # Report creation and user control
│   ├── middlewares/           # Multer uploads and validation rules
│   ├── models/                # Mongoose database models
│   ├── routes/                # Backend routing map
│   ├── services/aiService.js  # FastAPI microservice wrapper client
│   ├── public/uploads/        # Static uploads folder
│   ├── server.js              # Server entry point
│   └── Dockerfile
├── frontend/                  # React (Vite) + TS Frontend
│   ├── src/
│   │   ├── components/        # Shared UI components
│   │   ├── pages/             # Dashboard, results views, and auth
│   │   ├── lib/api.ts         # Axios API backend client
│   │   └── index.css          # Design system tokens and styles
│   └── Dockerfile
├── models/                    # Ignored local model checkpoints (.pt / .pth)
└── docker-compose.yml         # Container configuration file
```

---

## 🎯 Verified Medical AI Models

Jeevansh AI runs 4 medical imaging models in memory with direct-vs-debug pipeline tracking:

1. **Skin Cancer Classifier**
   * **Task**: Multiclass Classification (7 skin lesion classes including Melanoma, BCC, etc.)
   * **Architecture**: `MobileNetV3-Large`
   * **Explainability**: Grad-CAM (visualizing final convolutional layer `features[16][0]`)
   * **Preprocessing**: Strict ImageNet normalization + channel alignment.

2. **Pneumonia Classifier**
   * **Task**: Binary Classification (`NORMAL` vs `PNEUMONIA`)
   * **Architecture**: `MobileNetV3-Large`
   * **Explainability**: Grad-CAM (visualizing final convolutional layer `features[16][0]`)
   * **Preprocessing**: Channel-aligned inputs.

3. **Brain Tumor Detector**
   * **Task**: Object Detection (`brain_tumor`)
   * **Architecture**: `YOLOv9m`
   * **Explainability**: Detection Attention Overlay
   * **Inference Parameters**: `imgsz=640`, `conf=0.25`, `iou=0.45`

4. **Bone Fracture Detector**
   * **Task**: Object Detection (`fracture`)
   * **Architecture**: `YOLO11`
   * **Explainability**: Detection Attention Overlay
   * **Inference Parameters**: `imgsz=1024`, `conf=0.25`, `iou=0.45` (using OpenCV BGR channel alignment for maximum parity with direct model execution)

---

## ⚙️ Setup and Local Running Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB local instance running on `localhost:27017`

### 1. Run Python FastAPI AI Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --host 127.0.0.1
```
*Verify API health*: `http://127.0.0.1:8000/health`  
*Verify loaded models*: `http://127.0.0.1:8000/models`

### 2. Run Express Backend
```bash
cd backend
npm install
npm start
```
Runs on `http://localhost:5000` and connects to local MongoDB.

### 3. Run React Frontend (Vite)
```bash
cd frontend
npm install
npm run dev -- --host
```
Runs on `http://localhost:5173`. Login with seeded credentials:
- **Email**: `arjun@example.com`
- **Password**: `demo123`

---

## 🧪 Testing and Validation Scripts

The repository contains automated scripts under `ai-service/tests` to verify pipeline accuracy:

- **Direct Fracture Model Test**:
  ```bash
  python tests/test_fracture_direct.py <image_path>
  ```
- **Inference Pipeline Comparison (Direct vs. FastAPI)**:
  ```bash
  python tests/compare_fracture_pipeline.py
  ```
  Compares direct execution outputs side-by-side with FastAPI outputs to verify exact bounding boxes and confidence score matches.

---

## 🤝 License

This project is licensed under the MIT License.
