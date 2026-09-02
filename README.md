<div align="center">

# 🩺 Jeevansh AI

### Next-Generation AI-Powered Medical Diagnostics, Clinical Workflows & Teleconsultation Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![NVIDIA](https://img.shields.io/badge/NVIDIA_Nemotron-LLM-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://build.nvidia.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

*Clinical-Grade AI Diagnostics · Explainable Vision Models · Agentic Reports · Doctor Consultations · Community Forum*

</div>

---

## ✨ What is Jeevansh AI?

**Jeevansh AI** is a production-grade full-stack healthcare platform that unifies **real-time Computer Vision deep learning**, **agentic LLM clinical report generation** powered by **NVIDIA Nemotron**, **conflict-free doctor appointment booking**, and a **peer-to-peer healthcare community**.

Jeevansh AI bridges the gap between raw AI model inference and actual patient care — providing patients with instant explainable diagnostic screenings and giving certified medical specialists the tools to review scans, confirm appointments, and deliver clinical notes.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                  REACT FRONTEND                                  │
│                       Vite + TypeScript · http://localhost:5173                  │
│   Dashboard · AI Scan Upload · Explainable Results · Doctor Portal · Booking     │
│   My Appointments · Community Forum · AI Chatbot · Disease Encyclopedia          │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │  REST API / JWT
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                                EXPRESS BACKEND                                   │
│                       Node.js 22 · http://localhost:5000                         │
│  Auth (JWT) · Appointment Booking & Conflict Guard · Community Posts & Comments  │
│  Diagnostic Reports · PDF Generation · Chatbot Proxy · MongoDB / Mongoose        │
└────────┬────────────────────────────────────────────────┬────────────────────────┘
         │ Multipart / Image Stream                       │ OpenAI-Compatible API
┌────────▼─────────────────────────┐            ┌─────────▼────────────────────────┐
│       FASTAPI AI SERVICE         │            │       NVIDIA NEMOTRON LLM        │
│    Python · http://localhost:8000│            │    nemotron-3.5-lightning-30b    │
│    Model Inference Pipeline      │            │    Agentic Clinical Reports      │
│    Grad-CAM Heatmaps · YOLO NMS  │            │    Safety Validation Guardrail   │
└────────┬─────────────────────────┘            └──────────────────────────────────┘
         │
┌────────▼─────────────────────────────────────────┐
│        PYTORCH / ULTRALYTICS CHECKPOINTS         │
│   MobileNetV3-Large (Skin Cancer, Pneumonia)     │
│   YOLO11 (Bone Fracture) · YOLOv9m (Brain Tumor) │
└──────────────────────────────────────────────────┘
```

---

## 🤖 Verified Medical AI Vision Models

All four models run in-memory on startup with full explainability and confidence scoring:

### 1. 🔬 Skin Cancer Classifier
| Property | Value |
|---|---|
| **Task** | Multiclass Classification (7 Lesion Types) |
| **Architecture** | `MobileNetV3-Large` |
| **Classes** | Melanoma, Melanocytic Nevi, Basal Cell Carcinoma, Actinic Keratosis, Benign Keratosis, Dermatofibroma, Vascular Lesion |
| **Explainability** | **Grad-CAM** Heatmap (`features[16][0]`) |
| **Output** | Predicted class · Confidence · Probabilities array · Base64 Heatmap overlay |

### 2. 🫁 Pneumonia Classifier
| Property | Value |
|---|---|
| **Task** | Binary Classification (`NORMAL` vs `PNEUMONIA`) |
| **Architecture** | `MobileNetV3-Large` |
| **Explainability** | **Grad-CAM** Heatmap visualizer |
| **Output** | Classification label · Confidence score · Probability distribution |

### 3. 🧠 Brain Tumor Detector
| Property | Value |
|---|---|
| **Task** | Object Detection & Localization |
| **Architecture** | `YOLOv9m` |
| **Classes** | `brain_tumor` |
| **Inference Params** | `imgsz=640`, `conf=0.25`, `iou=0.45` |
| **Output** | Detection bounding boxes · Confidence per box · Overlay visualization |

### 4. 🦴 Bone Fracture Detector
| Property | Value |
|---|---|
| **Task** | Object Detection & Localization |
| **Architecture** | `YOLO11` |
| **Classes** | `fracture` |
| **Inference Params** | `imgsz=1024`, `conf=0.25`, `iou=0.45` (Strict BGR Channel Alignment) |
| **Output** | Precise fracture bounding boxes · Confidence scores · Detection overlay |

---

## 🧬 Agentic AI Medical Report Generation

After vision inference completes, Jeevansh AI runs an asynchronous, multi-agent report pipeline:

1. **Immediate Inference Response**: ML predictions and heatmaps display to the patient within < 2 seconds.
2. **Background Report Agent**: Asynchronously queries **NVIDIA Nemotron-3.5-Lightning-30B**.
3. **Safety Validator**: Validates report structure, checks for clinical safety, and prevents medical hallucinations.
4. **Persistent Storage**: Structured report is saved directly to MongoDB.
5. **Clinical PDF Export**: Generates downloadable PDF reports with visual scan overlays and structured findings using PDFKit.

---

## 📅 Doctor Appointment Booking System

A conflict-free patient ↔ doctor consultation scheduling system:

- **Server-Side Double Booking Prevention**: Real-time slot conflict detection returns `HTTP 409` on conflicting slots.
- **Same-Day Slot Validation**: Prevents patients from booking time slots that have already passed for "Today".
- **Strict State Machine Lifecycle**:
  $$\text{Pending} \longrightarrow \text{Confirmed} \longrightarrow \text{Completed}$$
  $$(\text{Alternative: Pending} \longrightarrow \text{Cancelled / Rejected})$$
- **Doctor Portal**:
  - Filter consultations by *All*, *Pending*, *Confirmed*, *Today*, *Completed*, or *Rejected*.
  - 1-click **Confirm** and **Reject** workflows.
  - **Mark Completed** modal to record verified clinical diagnosis notes and prescriptions.
- **Patient Dashboard**: Tabbed appointment tracker with direct cancellation flow and doctor details.

---

## 💬 Healthcare Community Forum

A persistent peer-to-peer discussion hub for clinical knowledge sharing and recovery support:

- **MongoDB Backed**: All discussions, comments, and likes are persisted in MongoDB collections.
- **Atomic Likes System**: Likes array with unique user ObjectIds prevents duplicate counts.
- **Comment Threads & Synchronized Counters**: Normalized `Comment` schema with cascading deletion when parent posts are removed.
- **Role Badges**: Highlights verified **Doctor** 🩺, **Admin** 🛡️, and **Patient** 👤 contributors.
- **Categorized Feed & Search**: Filter by *General Health*, *Medical Questions*, *AI & Healthcare*, *Recovery & Support*, and *Doctors & Professionals*.

---

## 📂 Repository Structure

```
Jeevansh-AI/
├── ai-service/                        # Python FastAPI Inference Microservice
│   ├── app/
│   │   ├── agents/                    # Report Agent & Safety Validator
│   │   ├── api/routes/                # /predict and /api/v1/reports/generate
│   │   ├── core/config.py             # Settings & model paths
│   │   ├── llm/                       # NVIDIA Nemotron client & prompts
│   │   ├── schemas/                   # Pydantic schemas
│   │   ├── services/                  # Inference pipeline & model registry
│   │   └── utils/gradcam.py           # Grad-CAM visualization
│   ├── tests/                         # Pytest test suite
│   └── requirements.txt
│
├── backend/                           # Node.js + Express REST API
│   ├── controllers/
│   │   ├── appointmentController.js   # Appointment lifecycle & conflict checks
│   │   ├── communityController.js     # Forum CRUD, likes, comments
│   │   ├── reportController.js        # AI Report CRUD & PDF generation
│   │   └── userController.js          # Authentication & user profile
│   ├── models/
│   │   ├── AppointmentModel.js        # Appointment schema & compound indexes
│   │   ├── CommentModel.js            # Normalized comment schema
│   │   ├── PostModel.js               # Discussion post schema
│   │   ├── DoctorModel.js             # Doctor specialty & profile schema
│   │   ├── ReportModel.js             # Diagnostic report schema
│   │   └── UserModel.js               # User role-based schema
│   ├── routes/
│   │   ├── appointmentRoutes.js       # /api/appointments routes
│   │   ├── communityRoutes.js         # /api/community routes
│   │   ├── doctorRoutes.js            # /api/doctors routes
│   │   ├── reportRoutes.js            # /api/reports routes
│   │   ├── chatbotRoutes.js           # /api/chatbot routes
│   │   └── userRoutes.js              # /api/users routes
│   ├── services/                      # AI client, PDF generation, LLM worker
│   ├── tests/
│   │   ├── verify_features.js         # Database integration test suite
│   │   └── verify_http_api.js         # Full HTTP REST API test suite
│   ├── seedData.js                    # Idempotent demo database seeder
│   └── server.js                      # Express app entry point
│
├── frontend/                          # React 18 + TypeScript + Vite
│   └── src/
│       ├── components/                # UI component library & layout
│       ├── contexts/                  # AuthContext, ToastContext
│       ├── lib/
│       │   ├── appointmentApi.ts      # Type-safe appointment API client
│       │   ├── communityApi.ts        # Type-safe community API client
│       │   └── api.ts                 # Base API fetch configuration
│       ├── pages/
│       │   ├── Appointments.tsx       # Patient appointment dashboard
│       │   ├── Community.tsx          # Healthcare community forum
│       │   ├── DoctorPortal.tsx       # Doctor appointments & scan reviews
│       │   ├── FindDoctors.tsx        # Doctor directory & appointment booking
│       │   ├── XRayUpload.tsx         # Scan upload & disease selector
│       │   ├── XRayResult.tsx         # Diagnostic results & Grad-CAM viewer
│       │   ├── UserDashboard.tsx      # Patient analytics & history
│       │   └── Chatbot.tsx            # NVIDIA AI medical assistant
│       └── index.css                  # Tailwind CSS design system tokens
│
├── models/                            # Model checkpoints (.pt, .pth)
└── docker-compose.yml                 # Docker container orchestration
```

---

## ⚙️ Quick Start & Local Setup

### Prerequisites

| Dependency | Version | Purpose |
|---|---|---|
| **Python** | 3.10+ | FastAPI AI inference microservice |
| **Node.js** | 18+ | Express backend & React frontend |
| **MongoDB** | 6.0+ | Database running on `127.0.0.1:27017` |
| **NVIDIA API Key** | — | Nemotron LLM (free at [build.nvidia.com](https://build.nvidia.com)) |

---

### Step 1 — Clone Repository & Configure Environment

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
MONGO_URI=mongodb://127.0.0.1:27017/jeevansh
JWT_SECRET=your_jwt_secret_key_here
AI_SERVICE_URL=http://127.0.0.1:8000
NODE_ENV=development
NVIDIA_API_KEY=your_nvidia_api_key_here
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
```

---

### Step 2 — Start the Python FastAPI AI Service

```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --host 127.0.0.1
```

*Endpoints:*
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Service Health: `http://localhost:8000/health`

---

### Step 3 — Start the Express Backend & Seed Database

```bash
cd backend
npm install
node seedData.js   # Seed sample doctors, users, appointments & forum posts
npm start
```

*Backend runs on `http://localhost:5000`.*

---

### Step 4 — Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```

*Open `http://localhost:5173` in your browser.*

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Patient** | `arjun@example.com` | `demo123` | AI Scan Upload, Book Consultations, Manage Appointments, Community Posts |
| **Doctor** | `neha.joshi@hospital.com` | `demo123` | Confirm/Complete Appointments, Review Patient Scans, Add Clinical Notes |
| **Admin** | `admin@jeevansh.ai` | `demo123` | Full Administrative Controls & System Metrics |

---

## 🧪 Comprehensive Test Suites

### 1. Database & Feature Verification
```bash
cd backend
node tests/verify_features.js
```
*Validates MongoDB connections, appointment creation, conflict prevention (409), doctor confirmation/completion, post persistence, and cascading comment deletion.*

### 2. HTTP REST API End-to-End Suite
```bash
cd backend
node tests/verify_http_api.js
```
*Executes full authentication, booking, security authorization (403), community likes toggle, and comment API flows.*

### 3. AI Service & Safety Tests
```bash
cd ai-service
python -m pytest tests/test_report_schema.py tests/test_report_safety.py tests/test_report_agent.py
```
*Validates report generation schemas, LLM agents, and safety validators.*

---

## 🌐 API Reference

### Appointments (`/api/appointments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/appointments` | Patient | Book consultation with slot conflict guard |
| `GET` | `/api/appointments/my` | Patient | Get authenticated patient's appointments |
| `GET` | `/api/appointments/doctor` | Doctor | Get appointments assigned to logged-in doctor |
| `GET` | `/api/appointments/:id` | Authenticated | Retrieve single appointment details |
| `PATCH`| `/api/appointments/:id/cancel` | Patient/Doctor | Cancel scheduled consultation |
| `PATCH`| `/api/appointments/:id/confirm`| Doctor | Confirm pending appointment |
| `PATCH`| `/api/appointments/:id/reject` | Doctor | Reject appointment with clinical reason |
| `PATCH`| `/api/appointments/:id/complete`| Doctor | Mark completed & add clinical notes |

### Community Forum (`/api/community`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/community/posts` | Public | List posts with category and search filter |
| `POST`| `/api/community/posts` | Authenticated | Publish new discussion post |
| `GET` | `/api/community/posts/:id` | Public | Get single post details |
| `PATCH`| `/api/community/posts/:id` | Author/Admin | Update post title, content, or tags |
| `DELETE`|`/api/community/posts/:id`| Author/Admin | Delete post and cascade delete comments |
| `POST`| `/api/community/posts/:id/like`| Authenticated | Toggle atomic like on post |
| `GET` | `/api/community/posts/:id/comments` | Public | Fetch comments for a post |
| `POST`| `/api/community/posts/:id/comments` | Authenticated | Add comment to post thread |
| `DELETE`|`/api/community/comments/:commentId`| Author/Admin | Delete comment and decrement counter |

### Diagnostic Reports (`/api/reports`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reports` | Authenticated | Upload scan image & trigger AI inference |
| `GET` | `/api/reports/myreports` | Authenticated | Get patient's diagnostic scan history |
| `GET` | `/api/reports/:id` | Authenticated | Get report with polling status |
| `GET` | `/api/reports/:id/download` | Authenticated | Download clinical PDF report |
| `POST` | `/api/reports/:id/regenerate` | Authenticated | Re-trigger NVIDIA Nemotron report |

---

## 🔒 Security & Privacy

- **Server-Side Authorization**: Identity and roles are derived directly from signed JWT tokens (`req.user._id`), never trusting client-supplied IDs.
- **Protected Environment Credentials**: NVIDIA API keys and database secrets reside strictly in server-side `.env` files.
- **Data Isolation**: Patients are restricted to viewing and managing only their own scans and appointments.
- **Medical Safety Validation**: Clinical LLM responses pass through a dedicated validation filter to prevent unsafe recommendations.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ · Powered by PyTorch, NVIDIA Nemotron, FastAPI, Express.js, React, and MongoDB

*Disclaimer: Jeevansh AI is designed to assist clinical workflows and diagnostic education. Always consult a certified healthcare professional for definitive medical advice.*

</div>
