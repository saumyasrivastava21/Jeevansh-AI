<div align="center">

# 🩺 Jeevansh AI

### Next-Generation AI-Powered Medical Imaging & Diagnostic Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![NVIDIA](https://img.shields.io/badge/NVIDIA_Nemotron-LLM-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://build.nvidia.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

*Clinical-grade AI inference · Agentic report generation · Real-time explainability*

</div>

---

## ✨ What is Jeevansh AI?

**Jeevansh AI** is a full-stack, production-grade medical imaging AI application that combines **four verified deep learning models** with a **generative AI agentic report layer** powered by **NVIDIA Nemotron**. It assists patients and clinicians in understanding medical scans through real-time inference, visual explainability (Grad-CAM / bounding box overlays), auto-generated clinical reports, and an AI medical chatbot.

> **This is not a demo.** All four models run actual trained checkpoints with verified confidence scores, bounding boxes, and class probabilities. The inference pipeline has been independently tested against direct Ultralytics/PyTorch model execution for bit-exact parity.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         REACT FRONTEND                          │
│              Vite + TypeScript · http://localhost:5173           │
│   Dashboard · Upload · Results · AI Chatbot · Doctor Portal     │
└────────────────────────┬────────────────────────────────────────┘
                         │  REST API
┌────────────────────────▼────────────────────────────────────────┐
│                     EXPRESS BACKEND                             │
│              Node.js 22 · http://localhost:5000                  │
│  Auth (JWT) · Report CRUD · PDF Generation · Chatbot Proxy      │
│  MongoDB/Mongoose · Background Report Generation Worker         │
└────────┬────────────────────────────────────────┬───────────────┘
         │ Multipart / Image Upload                │ NVIDIA OpenAI API
┌────────▼─────────────────────┐        ┌─────────▼──────────────┐
│   FASTAPI AI SERVICE         │        │   NVIDIA NEMOTRON LLM  │
│   Python · http://localhost:8000│      │   nemotron-3.5-lightning│
│   Model Inference Pipeline   │        │   Agentic Report Gen.  │
│   Grad-CAM · YOLO Post-proc  │        │   Medical AI Chatbot   │
└────────┬─────────────────────┘        └────────────────────────┘
         │
┌────────▼──────────────────────────────┐
│   PYTORCH / ULTRALYTICS CHECKPOINTS   │
│   MobileNetV3-Large × 2               │
│   YOLO11 × 2  (YOLO9m × 1)           │
└───────────────────────────────────────┘
```

---

## 🤖 Verified Medical AI Models

All four models are loaded from actual trained checkpoints and run in memory on startup.

### 1. 🔬 Skin Cancer Classifier
| Property | Value |
|----------|-------|
| **Task** | Multiclass Classification |
| **Architecture** | `MobileNetV3-Large` |
| **Classes** | Melanoma, Melanocytic Nevi, BCC, Actinic Keratosis, BKL, Dermatofibroma, Vascular Lesion (7 total) |
| **Explainability** | **Grad-CAM** heatmap — visualises final conv layer `features[16][0]` |
| **Preprocessing** | ImageNet normalization + strict channel alignment |
| **Output** | Predicted class · Confidence · All class probabilities · Heatmap (Base64) |

### 2. 🫁 Pneumonia Classifier
| Property | Value |
|----------|-------|
| **Task** | Binary Classification |
| **Architecture** | `MobileNetV3-Large` |
| **Classes** | `NORMAL` vs `PNEUMONIA` |
| **Explainability** | **Grad-CAM** heatmap — final conv layer `features[16][0]` |
| **Preprocessing** | Channel-aligned, ImageNet normalised |
| **Output** | Predicted class · Confidence · Class probabilities · Heatmap (Base64) |

### 3. 🧠 Brain Tumor Detector
| Property | Value |
|----------|-------|
| **Task** | Object Detection |
| **Architecture** | `YOLOv9m` |
| **Classes** | `brain_tumor` |
| **Inference Params** | `imgsz=640`, `conf=0.25`, `iou=0.45` |
| **Explainability** | Detection overlay with bounding boxes |
| **Output** | Detections · Confidence per box · Pixel bounding box coordinates · Overlay image |

### 4. 🦴 Bone Fracture Detector
| Property | Value |
|----------|-------|
| **Task** | Object Detection |
| **Architecture** | `YOLO11` |
| **Classes** | `fracture` |
| **Inference Params** | `imgsz=1024`, `conf=0.25`, `iou=0.45` |
| **Explainability** | Detection overlay with bounding boxes |
| **Special Note** | OpenCV BGR channel alignment for bit-exact parity with direct Ultralytics inference |
| **Output** | Detections · Confidence per box · Pixel bounding box coordinates · Overlay image |

---

## 🧬 Agentic AI Medical Report Generation

After inference completes, Jeevansh AI runs an **asynchronous agentic pipeline** to generate a full clinical report:

```
ML Inference Result (verified)
        ↓
Express saves report with status: "generating"  ←── Immediate response to frontend
        ↓  (background worker)
FastAPI Report Agent
        ↓
NVIDIA Nemotron (nemotron-3.5-lightning-30b-a3b)
        ↓
Safety Validator (checks for hallucinations, missing fields, unsafe content)
        ↓
MongoDB: status → "completed" | "failed" | "failed_validation"
        ↓
React polls every 2s → renders AI report sections progressively
        ↓
PDF Download (PDFKit — ML results + full AI report)
```

**Key design decisions:**
- ML results are **always shown immediately** — never blocked by LLM latency
- Report generation is **fully non-blocking** — UI shows inference results in < 2 seconds
- If NVIDIA is overloaded or fails, **raw ML predictions are always preserved**
- Polling times out at 120 seconds with Refresh / Retry actions

---

## 💬 AI Medical Chatbot

The built-in chatbot is powered by **NVIDIA Nemotron** (not a mock). It:
- Maintains full **conversation history** across a session
- Answers questions about scan results, conditions, and treatment options
- Runs **server-side only** — the API key is never exposed to the browser
- Shows clear error messages if the LLM is temporarily unavailable

---

## 📂 Repository Structure

```
Jeevansh-AI/
├── ai-service/                        # Python FastAPI Inference Microservice
│   ├── app/
│   │   ├── agents/
│   │   │   ├── report_agent.py        # Agentic NVIDIA Nemotron report builder
│   │   │   ├── evidence_agent.py      # Evidence extraction agent
│   │   │   └── safety_validator.py    # Clinical safety validation layer
│   │   ├── api/routes/
│   │   │   ├── prediction.py          # /predict/{disease} endpoints
│   │   │   ├── report.py              # /api/v1/reports/generate endpoint
│   │   │   ├── health.py              # /health
│   │   │   └── models.py              # /models metadata
│   │   ├── core/config.py             # Settings (NVIDIA, model paths)
│   │   ├── llm/
│   │   │   ├── client.py              # NVIDIA OpenAI-compatible client
│   │   │   └── prompts.py             # Medical system & user prompts
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── inference_service.py   # Core model inference pipeline
│   │   │   └── model_registry.py      # Singleton model loader
│   │   └── utils/gradcam.py           # Grad-CAM visualisation
│   ├── tests/                         # 24 pytest tests (23 passing, 1 skipped)
│   └── requirements.txt
│
├── backend/                           # Node.js + Express REST API
│   ├── controllers/
│   │   ├── reportController.js        # Report CRUD + async PDF download
│   │   └── userController.js          # Auth, registration, profile
│   ├── middlewares/
│   │   ├── authMiddleware.js          # JWT protect + role-based authorize
│   │   ├── uploadMiddleware.js        # Multer scan upload handler
│   │   └── errorMiddleware.js         # Global error handler
│   ├── models/
│   │   ├── ReportModel.js             # Full report schema (ML + LLM fields)
│   │   └── UserModel.js               # User schema with roles
│   ├── routes/
│   │   ├── reportRoutes.js            # /api/reports CRUD + download
│   │   ├── chatbotRoutes.js           # /api/chatbot/message → NVIDIA
│   │   └── userRoutes.js              # /api/users auth routes
│   ├── services/
│   │   ├── aiService.js               # FastAPI client wrapper
│   │   ├── reportGenerationService.js # Background async LLM worker
│   │   └── reportPdfService.js        # PDFKit clinical report generator
│   ├── tests/test_report.js           # Backend integration tests
│   └── server.js                      # Express app entry point
│
├── frontend/                          # React 18 + TypeScript + Vite
│   └── src/
│       ├── components/ui/             # shadcn/ui component library
│       ├── contexts/AuthContext.tsx   # Global auth state
│       ├── pages/
│       │   ├── XRayResult.tsx         # Scan results + progressive report polling
│       │   ├── UserDashboard.tsx      # Report history + analytics
│       │   ├── Chatbot.tsx            # Real NVIDIA-powered chatbot UI
│       │   ├── DiseaseKnowledge.tsx   # Disease encyclopedia
│       │   ├── FindDoctors.tsx        # Doctor discovery
│       │   └── Landing.tsx            # Public landing page
│       └── index.css                  # Design system tokens (dark mode)
│
├── models/                            # Model checkpoints (git-ignored)
└── docker-compose.yml                 # Container orchestration
```

---

## ⚙️ Setup & Local Development

### Prerequisites

| Dependency | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | FastAPI AI service |
| Node.js | 18+ | Express backend + React frontend |
| MongoDB | 6+ | Running on `localhost:27017` |
| NVIDIA API Key | — | Nemotron LLM (get free at [build.nvidia.com](https://build.nvidia.com)) |

---

### Step 1 — Clone & configure environment

```bash
git clone https://github.com/saumyasrivastava21/Jeevansh-AI.git
cd Jeevansh-AI
```

**`ai-service/.env`**
```env
PORT=8000
HOST=0.0.0.0
NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
```

**`backend/.env`**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jeevansh
JWT_SECRET=your_secret_key_here
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
```

> ⚠️ **Model checkpoints are not included in the repository.** Place your `.pt` / `.pth` files in the `models/` directory and configure their paths in `ai-service/app/core/config.py`.

---

### Step 2 — Start the FastAPI AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --host 0.0.0.0
```

Verify:
- Health: `http://localhost:8000/health`
- Loaded models: `http://localhost:8000/models`
- API docs: `http://localhost:8000/docs`

---

### Step 3 — Start the Express Backend

```bash
cd backend
npm install
npm start
```

Runs on `http://localhost:5000`. Connects to MongoDB and loads the chatbot route.

Optional — seed demo data:
```bash
node seedData.js
```

---

### Step 4 — Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

**Demo credentials (after seeding):**
| Role | Email | Password |
|------|-------|----------|
| Patient | `arjun@example.com` | `demo123` |
| Doctor | `rajesh@example.com` | `demo123` |
| Admin | `admin@jeevansh.ai` | `demo123` |

---

## 🧪 Testing

### Python Tests (FastAPI + NVIDIA)
```bash
cd ai-service
pytest
```
**Result:** 23 passed, 1 skipped across 8 test files covering the full report pipeline, NVIDIA client, safety validator, and prediction endpoints.

### Backend Tests (Node.js + MongoDB + PDF)
```bash
cd backend
node tests/test_report.js
```
Validates MongoDB schema, report persistence, and PDF generation end-to-end.

### Pipeline Parity Tests
```bash
# Verify fracture model output matches direct Ultralytics execution
python tests/compare_fracture_pipeline.py
```

---

## 🌐 API Reference

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/reports` | Upload scan + run inference |
| `GET` | `/api/reports/myreports` | Get authenticated patient's reports |
| `GET` | `/api/reports/:id` | Get single report (polls for LLM status) |
| `GET` | `/api/reports/:id/download` | Download clinical PDF report |
| `POST` | `/api/reports/:id/regenerate` | Re-trigger NVIDIA report generation |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chatbot/message` | Send message → NVIDIA Nemotron response |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/login` | Authenticate + receive JWT |
| `POST` | `/api/users/create` | Register new user |
| `GET` | `/api/users/profile` | Get authenticated user profile |

---

## 📋 Key Features

- ✅ **4 real medical AI models** — MobileNetV3-Large (×2) + YOLO11 (×2)
- ✅ **Grad-CAM heatmaps** for classification models (Skin Cancer, Pneumonia)
- ✅ **Bounding box detection overlays** for YOLO models (Brain Tumor, Bone Fracture)
- ✅ **Asynchronous AI report generation** — ML results shown instantly, LLM runs in background
- ✅ **Clinical safety validation** on every AI-generated report
- ✅ **PDF report download** — PDFKit, includes both ML results and AI narrative
- ✅ **Real NVIDIA Nemotron chatbot** — full conversation history, server-side API key
- ✅ **JWT authentication** with patient / doctor / admin role-based access control
- ✅ **Progressive polling UI** with timeout and retry on report generation
- ✅ **Dark mode first** design with glassmorphism, micro-animations, and Grad-CAM heatmap toggle
- ✅ **24 automated tests** across FastAPI + Node.js layers

---

## 🔐 Security Notes

- All NVIDIA API keys are stored in **server-side environment variables only** — never sent to or logged in the browser
- JWT tokens use RS256-compatible secret signing with per-role authorization guards
- Patient data is access-controlled: patients can only view and download their own reports
- Uploaded scan images are stored locally in `backend/public/uploads/` (not in MongoDB)

---

## 🛣️ Roadmap

- [ ] DICOM file format support
- [ ] Doctor review and annotation workflow
- [ ] Multi-scan comparative analysis
- [ ] Mobile app (React Native)
- [ ] Federated learning for privacy-preserving model improvement
- [ ] HL7 FHIR integration for EHR interoperability

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ · Powered by PyTorch, NVIDIA Nemotron, FastAPI, React, and MongoDB

*Not a substitute for professional medical advice. Always consult a qualified healthcare professional.*

</div>
