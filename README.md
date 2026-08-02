<div align="center">

# 🦷 Smilo AI

### Intelligent Dental Diagnostic & Consultation Platform

An advanced AI-powered tele-dentistry platform that combines deep learning models for dental disease detection with a full-featured doctor–patient consultation system.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-smilo--ai.vercel.app-00C853?style=for-the-badge)](https://smilo-ai.vercel.app)
[![Portfolio](https://img.shields.io/badge/👨‍💻_Developer-abdullahsiddique.co.uk-6C63FF?style=for-the-badge)](https://abdullahsiddique.co.uk)

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![YOLOv8](https://img.shields.io/badge/YOLO-v8-00FFFF?style=flat-square)](https://github.com/ultralytics/ultralytics)
[![License](https://img.shields.io/badge/License-Educational-F9A825?style=flat-square)](LICENSE)

</div>

---

![Smilo AI – Home Page](Images/Home.png)

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [AI Models & Pipeline](#-ai-models--pipeline)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [About the Developer](#-about-the-developer)
- [License](#-license)
- [Contact](#-contact)

---

## 🧠 About the Project

**Smilo AI** is a Final Year Project (FYP) that addresses the challenge of limited access to dental diagnostics, particularly in underserved regions. It provides an end-to-end tele-dentistry experience where:

1. **Patients** can upload dental X-rays, intra-oral photographs, or dental documents and receive instant AI-powered analysis — including disease detection, severity grading, and treatment recommendations.
2. **Doctors** can review AI-generated reports, annotate X-rays using a professional studio tool, manage patient appointments, and consult with patients through real-time chat.

The platform integrates multiple AI models (U-Net, YOLOv8, Google Gemini, Groq/Llama) into a unified diagnostic pipeline, making quality dental screening accessible to anyone with an internet connection.

> **🌐 Live Demo:** [https://smilo-ai.vercel.app](https://smilo-ai.vercel.app)

---

## ✨ Key Features

### 🤖 AI-Powered Diagnostics

| Feature | Model | Description |
|---|---|---|
| **Teeth Segmentation** | U-Net | Segments individual teeth from panoramic dental X-rays |
| **X-Ray Caries Detection** | YOLOv8 | Detects dental caries in X-ray images with bounding boxes & confidence scores |
| **Photo Caries Detection** | YOLOv8 | Detects caries from intra-oral photographs |
| **Smart Photo Assessment** | Google Gemini | Comprehensive dental photo analysis with AI-generated findings |
| **Document Analysis** | Groq / Llama | Analyzes uploaded dental reports (PDF, DOCX) and extracts key findings |
| **AI Chat Assistant** | Google Gemini | Interactive dental health Q&A chatbot for patients |

### 👤 Patient Portal
- **Dashboard** — Overview with total scans, upcoming appointments, and recent reports
- **X-Ray Analysis** — Upload dental X-rays for AI segmentation and caries detection
- **Photo Analysis** — Upload intra-oral photos for visual caries detection and Gemini assessment
- **Report Analysis** — Upload dental documents (PDF/DOCX) for AI-powered extraction
- **AI Assistant** — Chat with an AI dental assistant for dental health questions
- **Find Doctors** — Browse verified dentists and request appointments
- **Appointments** — Track and manage upcoming and past appointments
- **Consultation Chat** — Real-time messaging with assigned doctors
- **My Reports** — View detailed history of all AI-generated scan reports
- **Profile Management** — Update personal details and profile picture

### 🩺 Doctor Portal
- **Dashboard** — Real-time metrics: pending reviews, upcoming appointments, total patients
- **Pro X-Ray Studio** — Advanced image manipulation: zoom, rotate, invert, annotate, and measure X-rays
- **AI Predictions** — Review AI model outputs for patient scans
- **Patient Reports** — View and review detailed reports submitted by patients
- **Appointments Management** — Approve, reject, reschedule, or complete appointments
- **Consultation Chat** — Communicate with patients and share clinical notes
- **Profile Management** — Manage professional profile, qualifications, and clinic details

### 🔐 Security & UX
- Role-based authentication (Patient / Doctor)
- Secure password hashing with bcrypt
- Responsive, mobile-first glassmorphism UI
- Smooth page transitions and micro-animations
- Dark-themed, premium design aesthetic

---

## 🔬 AI Models & Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Patient Upload                            │
│        (X-Ray / Photo / Document / Chat Message)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   ┌─────────────┐         ┌──────────────┐
   │  Image Input │         │  Doc / Chat  │
   └──────┬──────┘         └──────┬───────┘
          │                       │
    ┌─────┴──────┐          ┌─────┴──────┐
    ▼            ▼          ▼            ▼
 ┌──────┐  ┌────────┐  ┌───────┐  ┌────────┐
 │U-Net │  │YOLOv8  │  │Groq / │  │Gemini  │
 │Segm. │  │Caries  │  │Llama  │  │Chat    │
 └──┬───┘  └───┬────┘  └──┬────┘  └───┬────┘
    │          │           │           │
    ▼          ▼           ▼           ▼
 ┌──────────────────────────────────────────┐
 │          Unified Report Engine           │
 │  (Findings, Severity, Recommendations)   │
 └──────────────────────────────────────────┘
          │
          ▼
 ┌──────────────────┐
 │  Patient / Doctor │
 │    Dashboards     │
 └──────────────────┘
```

### Model Details

- **U-Net (Teeth Segmentation):** A custom-trained encoder-decoder CNN that segments individual tooth regions from panoramic dental X-rays. The model generates pixel-level masks used for visualization and downstream analysis.

- **YOLOv8 (Caries Detection):** Two YOLOv8 object detection models — one fine-tuned on dental X-ray images and another on intra-oral photographs. They output bounding boxes, class labels, and confidence scores for detected caries.

- **Google Gemini (Visual Assessment):** Used for comprehensive analysis of dental photographs. The model receives the image along with a structured dental prompt and returns findings, severity, and treatment suggestions in natural language.

- **Groq / Llama (Document Analysis):** Processes uploaded dental reports (PDF, DOCX) by extracting text, summarizing findings, and identifying key clinical data points using large language model inference.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI Component Library |
| TypeScript | Type-safe JavaScript |
| Vite | Build Tool & Dev Server |
| Tailwind CSS | Utility-first CSS Framework |
| Shadcn/UI | Pre-built Accessible Components |
| Framer Motion | Animations & Transitions |
| TanStack Query | Server State Management |
| Lucide React | Icon System |
| React Router | Client-side Routing |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | Async Python Web Framework |
| Uvicorn | ASGI Server |
| SQLAlchemy | ORM & Database Abstraction |
| PostgreSQL / SQLite | Relational Database |
| bcrypt | Secure Password Hashing |
| Pillow | Image Processing |
| Hugging Face Hub | Model Hosting & Download |
| Ultralytics | YOLOv8 Inference |
| Google Generative AI | Gemini API Integration |
| Groq SDK | Llama LLM Inference |
| PyMuPDF / pdfplumber | PDF Text Extraction |
| python-docx | DOCX Text Extraction |

---

## 🏗️ System Architecture

```
┌────────────────────────────┐     ┌─────────────────────────────┐
│      Frontend (Vercel)      │     │     Backend (Render)         │
│                             │     │                              │
│  React + TypeScript + Vite  │◄───►│  FastAPI + SQLAlchemy        │
│  Tailwind CSS + Shadcn/UI   │     │  U-Net + YOLOv8 + Gemini    │
│  Framer Motion              │     │  Groq/Llama + bcrypt         │
│                             │     │                              │
│  Deployed on Vercel         │     │  Deployed on Render          │
└────────────────────────────┘     └──────────────┬──────────────┘
                                                   │
                                          ┌────────┴────────┐
                                          │   PostgreSQL DB   │
                                          │   (Render)        │
                                          └─────────────────┘
```

---

## 📸 Screenshots

### 🏠 Home Page
![Home Page](Images/Home.png)

### 🔐 Authentication
![Login / Signup](Images/login.png)

### 👤 Patient Portal
| Dashboard | X-Ray Analysis |
|---|---|
| ![Patient Dashboard](Images/Patient.png) | ![X-Ray Analysis](Images/Xray.png) |

### 🩺 Doctor Portal
| Dashboard | Pro X-Ray Studio |
|---|---|
| ![Doctor Dashboard](Images/Doctor%20dashboard.png) | ![Pro X-Ray Studio](Images/Pro%20X%20ray%20Studio.png) |

| X-Ray Viewer | Appointments |
|---|---|
| ![Doctor X-Ray Page](Images/Doctor%20X%20ray%20Page.png) | ![Appointments](Images/appointment.png) |

---

## 🚀 Getting Started

### Prerequisites
- **Python** 3.11 or higher
- **Node.js** 18 or higher
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/abdullah90907/Smilo-AI.git
cd Smilo-AI
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r ../requirements.txt

# Start the development server
python -m uvicorn main:app --reload
```

The backend API will be available at `http://127.0.0.1:8000` and interactive docs at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:8080`.

### 4. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=sqlite:///./smilo.db
```

---

## 📁 Project Structure

```
Smilo-AI/
├── backend/
│   ├── main.py                    # FastAPI application entry point
│   ├── app/
│   │   ├── api/routes/            # API route handlers
│   │   ├── core/                  # Configuration & settings
│   │   ├── db/
│   │   │   ├── models.py          # SQLAlchemy ORM models
│   │   │   └── session.py         # Database session management
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   └── services/
│   │       ├── teeth_segmenter.py     # U-Net segmentation service
│   │       ├── caries_detector.py     # YOLOv8 X-ray caries detection
│   │       ├── photo_caries_detector.py # YOLOv8 photo caries detection
│   │       ├── gemini_service.py      # Google Gemini integration
│   │       ├── report_analyzer.py     # Groq/Llama document analysis
│   │       └── chat_service.py        # AI chat assistant service
│   └── static/                    # Uploaded files & generated images
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Auth.tsx           # Login & Registration
│   │   │   ├── Dashboard.tsx      # Role-based dashboard router
│   │   │   ├── user/              # Patient portal pages
│   │   │   │   ├── UserOverview.tsx
│   │   │   │   ├── XrayScan.tsx
│   │   │   │   ├── PhotoAnalysis.tsx
│   │   │   │   ├── ReportAnalysis.tsx
│   │   │   │   ├── FindDoctors.tsx
│   │   │   │   ├── Appointments.tsx
│   │   │   │   ├── Consultation.tsx
│   │   │   │   ├── AssistantChat.tsx
│   │   │   │   └── UserReports.tsx
│   │   │   └── doctor/            # Doctor portal pages
│   │   │       ├── Overview.tsx
│   │   │       ├── ProXrayStudio.tsx
│   │   │       ├── AIPredictions.tsx
│   │   │       ├── PatientReports.tsx
│   │   │       ├── Appointments.tsx
│   │   │       └── Consultation.tsx
│   │   ├── components/            # Reusable UI components
│   │   ├── services/              # API client & utilities
│   │   └── hooks/                 # Custom React hooks
│   └── public/                    # Static assets & logos
│
├── Images/                        # README screenshots
├── requirements.txt               # Python dependencies
└── README.md
```

---

## 🌐 Deployment

| Layer | Platform | URL |
|---|---|---|
| **Frontend** | Vercel | [smilo-ai.vercel.app](https://smilo-ai.vercel.app) |
| **Backend** | Render | smilo-ai-backend.onrender.com |
| **Database** | Render (PostgreSQL) | Managed by Render |

- The frontend is deployed as a static Vite build on **Vercel** with a `vercel.json` rewrite configuration for SPA routing.
- The backend is deployed as a Python web service on **Render** with auto-deploy from the `main` branch.
- PostgreSQL is provisioned through Render's managed database service.

---

## 👨‍💻 About the Developer

<div align="center">

**Abdullah Siddique**

Final Year Computer Science Student

[![Portfolio](https://img.shields.io/badge/Portfolio-abdullahsiddique.co.uk-6C63FF?style=for-the-badge&logo=google-chrome&logoColor=white)](https://abdullahsiddique.co.uk)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-mr--abdullah--siddique-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mr-abdullah-siddique/)
[![Email](https://img.shields.io/badge/Email-abdullahsiddique773@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:abdullahsiddique773@gmail.com)

</div>

---

## 📝 License

This project is developed for **educational purposes only** as a Final Year Project (FYP). It is **not intended for commercial use** or clinical deployment. The AI models provide indicative results and are **not a substitute for professional dental diagnosis**.

---

<div align="center">

### 🌟 Made with ❤️ for better dental health!

**⭐ Star this repo if you found it useful!**

</div>
