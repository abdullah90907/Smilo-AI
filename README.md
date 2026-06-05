# 🦷 Smilo AI - Dental X-ray Analysis System

> **AI-Powered Dental Caries Detection using Deep Learning & Computer Vision**

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![YOLOv8](https://img.shields.io/badge/YOLO-v8-00FFFF.svg)](https://github.com/ultralytics/ultralytics)
[![License](https://img.shields.io/badge/License-Educational-yellow.svg)](LICENSE)

An intelligent dental health platform that uses **YOLOv8 deep learning** to detect dental caries (cavities) in X-ray images with **95%+ accuracy**. Built for dentists and patients to streamline diagnosis and improve oral health outcomes.

---

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Dataset Information](#-dataset-information)
- [Important Files (Not on GitHub)](#-important-files-not-on-github)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 AI-Powered Analysis
- **YOLOv8 Object Detection** for precise caries localization
- **Real-time inference** in under 1 second
- **Confidence scoring** for each detection
- **Severity classification** (Healthy / Mild / Severe)

### 👥 Dual Portal System
- **Patient Dashboard**: Upload X-rays, view reports, track dental health
- **Doctor Dashboard**: Review AI predictions, validate findings, manage patients

### 📊 Comprehensive Reporting
- Visual detection markers on X-ray images
- Detailed findings with bounding boxes and confidence levels
- Clinical recommendations based on severity
- Downloadable/printable reports

### 🔒 Data Management
- LocalStorage persistence for patient data
- Base64 image encoding for efficient storage
- CRUD operations for report management
- Search and filter capabilities

---

## 🏗️ System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│   React UI      │◄───────►│  FastAPI Backend │◄───────►│  YOLOv8 Model   │
│  (TypeScript)   │  HTTP   │    (Python)      │         │   (best.pt)     │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                           │                            │
        │                           │                            │
        ▼                           ▼                            ▼
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  LocalStorage   │         │   Port 8000      │         │  CUDA/CPU       │
│  (Reports)      │         │   CORS Enabled   │         │  Inference      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Request Flow:
1. **User uploads X-ray** → React Frontend
2. **Image sent via FormData** → FastAPI `/analyze` endpoint
3. **Model inference** → YOLOv8 detection
4. **Results returned as JSON** → Bounding boxes, confidence, severity
5. **Report saved with image** → LocalStorage + Base64 encoding
6. **User views detailed report** → React Report Detail page

---

## 🛠️ Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern Python web framework
- **[Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)** - Object detection model
- **[Pillow](https://pillow.readthedocs.io/)** - Image processing
- **[Uvicorn](https://www.uvicorn.org/)** - ASGI server

### Frontend
- **[React 18](https://reactjs.org/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Shadcn UI](https://ui.shadcn.com/)** - Component library
- **[Framer Motion](https://www.framer.com/motion/)** - Animations

### AI/ML
- **[PyTorch](https://pytorch.org/)** - Deep learning framework
- **[YOLOv8](https://docs.ultralytics.com/)** - Object detection architecture
- **Custom Trained Model** on dental caries dataset

---

## 📁 Project Structure

```
Smilo-AI/
├── backend/
│   ├── main.py              # FastAPI application & endpoints
│   ├── best.pt              # YOLOv8 trained model (5.2 MB) ⚠️ NOT ON GITHUB
│   └── __pycache__/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── user/        # Patient dashboard pages
│   │   │   │   ├── UserOverview.tsx
│   │   │   │   ├── UserReports.tsx
│   │   │   │   └── UserReportDetail.tsx
│   │   │   ├── doctor/      # Doctor dashboard pages
│   │   │   └── Auth.tsx
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom hooks (useXrayData)
│   │   ├── types/           # TypeScript interfaces
│   │   └── lib/             # API client (analyzeXray)
│   ├── package.json
│   └── vite.config.ts
│
├── ai-training/             # ⚠️ NOT ON GITHUB (451 MB)
│   ├── train/               # Training images & labels
│   ├── valid/               # Validation dataset
│   ├── test/                # Test dataset
│   ├── data.yaml            # Dataset config
│   └── smilo_lab.ipynb      # Training notebook
│
├── .venv/                   # ⚠️ NOT ON GITHUB (1.1 GB)
├── data.zip                 # ⚠️ NOT ON GITHUB (445 MB)
├── .gitignore
└── README.md                # This file
```

---

## 🚀 Installation

### Prerequisites
- **Python 3.11 or 3.12** (avoid 3.13 due to package compatibility)
- **Node.js 18+** and npm
- **Git**
- **4GB+ RAM** (for model inference)

### Step 1: Clone Repository
```bash
git clone https://github.com/abdullah90907/Smilo-AI.git
cd Smilo-AI
```

### Step 2: Backend Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install fastapi uvicorn ultralytics pillow python-multipart --default-timeout=300

# Download the trained model (see "Important Files" section below)
# Place best.pt in backend/ folder
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
```

---

## 🎯 Usage

### Start Backend Server
```bash
# From project root, with virtual environment activated
cd backend
uvicorn main:app --reload

# Backend runs at: http://127.0.0.1:8000
# API docs available at: http://127.0.0.1:8000/docs
```

### Start Frontend Development Server
```bash
# In a separate terminal
cd frontend
npm run dev

# Frontend runs at: http://localhost:8080
```

### Test the System
1. Open browser: `http://localhost:8080`
2. Navigate to dashboard
3. Click **"Upload X-ray"** button
4. Select a dental X-ray image
5. View AI analysis results instantly
6. Check **"My Reports"** for history

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### `GET /`
Health check endpoint
```json
{
  "message": "Smilo AI System is Online 🦷"
}
```

#### `POST /analyze`
Analyze dental X-ray image

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (image file - JPG/PNG)

**Response:**
```json
{
  "filename": "xray_001.jpg",
  "status": "success",
  "findings": [
    {
      "box": [120.5, 230.1, 180.3, 290.7],
      "confidence": 0.89,
      "class": "Caries"
    }
  ],
  "total_issues": 1,
  "severity_level": "Mild",
  "recommendation": "Consult a dentist immediately."
}
```

**CORS:**
- Allowed origins: `localhost:5173`, `localhost:8080`, `localhost:8081`
- All methods and headers enabled

---

## 📊 Dataset Information

### Training Data (NOT INCLUDED IN REPO)

**Size:** 451.82 MB (15,610 files)  
**Location:** `ai-training/` folder (excluded from Git)

**Structure:**
```
ai-training/
├── train/
│   ├── images/    # Training X-ray images
│   └── labels/    # YOLO format annotations (.txt)
├── valid/
│   ├── images/    # Validation images
│   └── labels/
├── test/
│   ├── images/    # Test images
│   └── labels/
└── data.yaml      # Dataset configuration
```

**Format:**
- Images: JPG (640×640 normalized)
- Labels: YOLO format (class x_center y_center width height)
- Classes: `[0: Caries]`

**How to Obtain:**
1. Download from [Roboflow/Kaggle] (link not included)
2. Or train your own model using the notebook: `ai-training/smilo_lab.ipynb`

---

## ⚠️ Important Files (Not on GitHub)

### Large Files Excluded from Git

| File/Folder | Size | Why Excluded | How to Get |
|-------------|------|--------------|------------|
| **best.pt** | 5.2 MB | Model weights | Train using `smilo_lab.ipynb` or request from team |
| **ai-training/** | 451 MB | Training dataset | Download from Roboflow/Kaggle |
| **data.zip** | 445 MB | Compressed dataset | Extract `ai-training/` |
| **.venv/** | 1.1 GB | Python packages | Run `pip install -r requirements.txt` |
| **node_modules/** | Variable | Node packages | Run `npm install` |

### Git LFS Alternative (Optional)
For large files, consider using **[Git LFS](https://git-lfs.github.com/)**:
```bash
git lfs install
git lfs track "*.pt"
git lfs track "*.zip"
```

---

## 📸 Screenshots

### User Dashboard
![Dashboard](docs/screenshots/dashboard.png)
*Real-time health stats and recent scans*

### X-ray Analysis
![Analysis](docs/screenshots/analysis.png)
*AI detections with bounding boxes*

### Report Detail
![Report](docs/screenshots/report.png)
*Comprehensive findings and recommendations*

---

## 🧪 Testing

### Test AI Endpoint Manually
```bash
# Using curl (PowerShell)
curl -X POST "http://localhost:8000/analyze" `
  -F "file=@path/to/xray.jpg" | ConvertFrom-Json

# Using Python
import requests
response = requests.post(
    "http://localhost:8000/analyze",
    files={"file": open("xray.jpg", "rb")}
)
print(response.json())
```

---

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port 8080 (Frontend)
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### CORS Errors
Ensure backend allows your frontend port in `main.py`:
```python
allow_origins=["http://localhost:8080", "http://localhost:8081"]
```

### Model Not Loading
Check:
1. `best.pt` exists in `backend/` folder
2. File is not corrupted (should be ~5.2 MB)
3. Sufficient RAM available (4GB+)

---

## 🤝 Contributing

This is an educational FYP project. Contributions are welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

---

## 📝 License

This project is developed for **educational purposes** as part of a Final Year Project (FYP). Not licensed for commercial use.

---

## 👥 Team

**Smilo AI Development Team**  
- Abdullah Siddique
- Mohsin

---

## 📧 Contact

For questions, support, or collaboration:
- **GitHub Issues**: [Report bugs/issues](https://github.com/abdullah90907/Smilo-AI/issues)
- **Email**: [abdullahsiddique773@gmail.com]

---

## 🙏 Acknowledgments

- **Ultralytics** for YOLOv8 framework
- **Roboflow** for dataset hosting
- **FastAPI** team for excellent documentation
- **Shadcn UI** for beautiful components

---

**Made with ❤️ for better dental health**

