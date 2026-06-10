
# 🦷 Smilo AI: Intelligent Dental Diagnostic & Consultation Platform

&gt; **Advanced AI-Powered Tele-Dentistry with Multi-Model Analysis, Real-Time Collaboration, and Comprehensive Practice Management**

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![YOLOv8](https://img.shields.io/badge/YOLO-v8-00FFFF.svg)](https://github.com/ultralytics/ultralytics)
[![License](https://img.shields.io/badge/License-Educational-yellow.svg)](LICENSE)

---

## 📖 Executive Summary

Smilo AI is a comprehensive, production-ready tele-dentistry platform that transforms how dental care is delivered. By integrating multiple cutting-edge AI technologies into a single, cohesive ecosystem, Smilo AI empowers both patients and dental professionals:

- **Patients**: Get instant AI-driven analysis of dental X-rays, photos, and reports, find nearby doctors, book appointments, and consult with dentists remotely
- **Doctors**: Use a powerful dashboard to review AI predictions, validate findings, manage appointments, collaborate with patients, and leverage advanced tools like Pro X-Ray Studio for image manipulation and annotation
- **AI Models**: Combines U-Net for teeth segmentation, YOLOv8 for caries detection, Google Gemini for multimodal analysis, and Groq/Llama for document analysis

This platform is built as a production-grade Final Year Project (FYP) with strict role-based security, a clean, modern UI, and well-structured codebase that follows industry best practices.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Deep Project Structure Analysis](#-deep-project-structure-analysis)
- [Tech Stack Breakdown](#-tech-stack-breakdown)
- [Detailed Installation Guide](#-detailed-installation-guide)
- [Usage & Workflow](#-usage--workflow)
- [Full API Documentation](#-full-api-documentation)
- [Database Schema & Relationships](#-database-schema--relationships)
- [Security Implementation](#-security-implementation)
- [Future Enhancements Roadmap](#-future-enhancements-roadmap)
- [Known Issues & Troubleshooting](#-known-issues--troubleshooting)
- [Team & Contributors](#-team--contributors)
- [License](#-license)

---

## ✨ Key Features

### 🤖 Advanced AI Analysis Pipeline
1. **Multi-Model Dental Analysis**
   - U-Net (Hugging Face: `SerdarHelli/Segmentation-of-Teeth-in-Panoramic-X-ray-Image-Using-U-Net`) for precise teeth segmentation in panoramic X-rays
   - YOLOv8-based caries detection using Roboflow API with bounding box visualization and confidence scoring
   - Photo caries detection using custom-trained YOLOv8
   - Google Gemini multimodal analysis for comprehensive dental photo assessment
   - Groq/Llama-powered dental report/document analysis

2. **Pro X-Ray Studio (Doctor Only)**
   - Upload and manipulate dental X-rays
   - Controls: Brightness, Contrast, Zoom In/Out, Rotate (90-degree increments)
   - Drawing tools: Neon green or bright red freehand annotation with adjustable pen width
   - Clear ink function
   - Clinical notes section
   - Download combined image with annotations

### 👥 Dual Portal System with Role-Based Security
1. **Patient Portal**
   - Dashboard with statistics (recent scans, next checkup, AI accuracy)
   - X-Ray Scan: Upload and analyze panoramic dental X-rays
   - Photo Analysis: AI-based caries detection in photos
   - Report Analysis: AI analysis of dental documents/reports
   - AI Assistant Chat: Conversational dental health assistant
   - User Reports: Full history of all uploaded and analyzed reports with filtering (All/X-Ray/Photo/AI/Documents)
   - Find Doctors: Browse doctor profiles with specialization, experience, clinic location, etc.
   - Appointments: Book, view, cancel appointments with status tracking (pending/approved/rejected/completed/cancelled)
   - Consultation: Real-time chat with assigned doctor
   - Profile Management: Update personal information, change password, upload profile picture

2. **Doctor Portal**
   - Dashboard with real-time metrics (pending reports, consultations today, total patients, AI accuracy rate)
   - Pro X-Ray Studio (Advanced)
   - Patient Reports: Review and manage pending and completed reports
   - Report Detail: In-depth analysis of individual reports with AI predictions
   - Appointments: Approve/reject requests, set consultation dates, add doctor notes, hide terminal status appointments
   - Consultations: Chat with patients, share notes
   - Profile Management: Update professional information, registration number, social links, etc.
   - Live Badges: Dynamic counts for pending reports/appointments that update via custom event system

### 📊 Advanced Features
- **Real-Time Dashboard Updates**: Custom `dashboard-update` DOM events for live badge and data refresh
- **Report Attachments**: Attach multiple report types (X-Ray/Photo/Gemini) to a single appointment
- **Status Management**: Comprehensive appointment status tracking
- **Secure Authentication**: Role-based login isolation, password hashing using bcrypt
- **Profile Avatars**: Profile image upload with initials fallback using teal (#21b2c0) color
- **Terminal Status Cleanup**: Automatic cleaning of hidden appointments to only include terminal statuses (rejected, cancelled, completed, closed)
- **Responsive Design**: Mobile-first UI using Tailwind CSS that works perfectly on all devices

---

## 🏗️ System Architecture

### Core 3-Tier Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER (Frontend)                       │
│  ┌──────────────────────────────────┐    ┌───────────────────────────────┐ │
│  │       PATIENT PORTAL             │    │       DOCTOR PORTAL            │ │
│  │  - User Dashboard                │    │  - Doctor Dashboard           │ │
│  │  - X-Ray/Photo/Report Analysis   │    │  - Pro X-Ray Studio           │ │
│  │  - Find Doctors                  │    │  - Patient Reports            │ │
│  │  - Appointments/Consultations    │    │  - Appointments/Consultations │ │
│  └──────────────────────────────────┘    └───────────────────────────────┘ │
│              │                                     │                         │
│              └─────────────────┬───────────────────┘                         │
│                                │ React Router                                   │
│                  ┌─────────────▼──────────────────┐                          │
│                  │  Shared UI Components          │                          │
│                  │  (Shadcn UI, Tailwind, Lucide) │                          │
│                  └────────────────────────────────┘                          │
└──────────────────────────────────┬───────────────────────────────────────────────┘
                                   │
                                   │ RESTful APIs (lib/api.ts)
                                   │
┌──────────────────────────────────▼───────────────────────────────────────────────┐
│                       APPLICATION LAYER (Backend - FastAPI)                       │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │   AUTH ENDPOINTS       │   ANALYSIS ENDPOINTS       │   PROFILE ENDPOINTS    │ │
│ ├─────────────────────────────────────────────────────────────────────────────┤ │
│ │   /api/register        │   /analyze                 │   /api/doctor/profile  │ │
│ │   /api/login           │   /api/analyze-photo       │   /api/patient/profile │ │
│ ├─────────────────────────────────────────────────────────────────────────────┤ │
│ │                  APPOINTMENT ENDPOINTS                │   REPORT ENDPOINTS    │ │
│ ├─────────────────────────────────────────────────────────────────────────────┤ │
│ │  /api/appointments/book  │  /api/appointments/status  │  /api/reports/patient │ │
│ │  /api/appointments/patient │  /api/appointments/doctor  │  /api/reports/{id}   │ │
│ ├─────────────────────────────────────────────────────────────────────────────┤ │
│ │                      AI/ML SERVICES LAYER                                     │ │
│ ├─────────────────────────────────────────────────────────────────────────────┤ │
│ │  TeethSegmenter  │  PhotoCariesDetector  │  GeminiService  │  GroqService   │ │
│ ├─────────────────────────────────────────────────────────────────────────────┤ │
│ │                    ORM &amp; DATABASE LAYER (SQLAlchemy)                        │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬───────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────────────────────┐
│                        DATA LAYER (SQLite Database)                              │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │  Users (id, email, password, role, created_at)                              │ │
│ │  PatientProfiles (full_name, age, gender, phone, address, DOB, blood group)│ │
│ │  DoctorProfiles (specialization, clinic, exp_years, city, qual, verified)  │ │
│ │  ScanReports (user_id, report_type, filename, findings, severity)          │ │
│ │  Appointments (patient_id, doctor_id, status, date, doctor_note)           │ │
│ │  ChatMessages (appointment_id, sender_role, message, timestamp)            │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow & Request Lifecycle
1. **User Uploads Image**: Frontend collects image as FormData
2. **Request Sent**: HTTP POST with x-user-id header for authentication
3. **Backend Processing**:
   - Middleware validates x-user-id header
   - File saved to `static/segmentations/{uuid}/` or `static/photo-analyses/{uuid}/`
   - AI models run inference (segmentation, detection, analysis)
   - Results saved to `ScanReports` table in SQLite database
4. **Response Returned**: JSON object with detections, URLs, severity, etc.
5. **Dashboard Update**: Frontend dispatches `dashboard-update` custom event to refresh counts

---

## 📁 Deep Project Structure Analysis

### Root-Level Structure
```
Smilo-AI/
├── backend/                          # Backend application codebase
│   ├── app/                          # Core backend package
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── teeth_segmentation.py  # U-Net segmentation route
│   │   ├── core/
│   │   │   └── config.py             # Core configuration
│   │   ├── db/
│   │   │   ├── models.py             # SQLAlchemy ORM models
│   │   │   └── session.py            # DB session management
│   │   ├── schemas/
│   │   │   ├── auth.py               # Pydantic auth schemas
│   │   │   └── dental_analysis.py    # Dental analysis schemas
│   │   └── services/
│   │       ├── caries_detector.py    # Caries detection service
│   │       ├── chat_service.py       # Chat service
│   │       ├── gemini_service.py     # Google Gemini integration
│   │       ├── photo_caries_detector.py # Photo caries detector
│   │       ├── report_analyzer.py    # Groq-based report analysis
│   │       └── teeth_segmenter.py    # U-Net teeth segmenter
│   ├── main.py                       # Main FastAPI application entry
│   ├── smilo_ai.db                   # SQLite database file
│   ├── test_imports.py               # Import tests
│   ├── test_load_model.py            # Model loading tests
│   ├── test_report_analyzer.py       # Report analyzer tests
│   └── test_report_with_hardcoded_text.py
│
├── frontend/                         # Frontend application codebase
│   ├── public/                       # Static assets
│   │   └── dental-icon.svg
│   ├── src/
│   │   ├── pages/                    # Page-level components
│   │   │   ├── doctor/               # Doctor portal pages
│   │   │   │   ├── AIPredictions.tsx
│   │   │   │   ├── Appointments.tsx  # Doctor's appointment management
│   │   │   │   ├── Consultation.tsx
│   │   │   │   ├── DoctorDashboard.tsx
│   │   │   │   ├── MyProfile.tsx
│   │   │   │   ├── Overview.tsx      # Doctor dashboard overview
│   │   │   │   ├── PatientReports.tsx
│   │   │   │   ├── ProXrayStudio.tsx # Pro X-Ray studio (new)
│   │   │   │   ├── ReportDetail.tsx
│   │   │   │   └── XrayViewer.tsx
│   │   │   ├── user/                 # Patient portal pages
│   │   │   │   ├── AIAssistant.tsx
│   │   │   │   ├── Appointments.tsx
│   │   │   │   ├── AssistantChat.tsx
│   │   │   │   ├── Consultation.tsx
│   │   │   │   ├── FindDoctors.tsx
│   │   │   │   ├── MyProfile.tsx
│   │   │   │   ├── PhotoAnalysis.tsx
│   │   │   │   ├── ReportAnalysis.tsx
│   │   │   │   ├── UserDashboardLayout.tsx
│   │   │   │   ├── UserOverview.tsx
│   │   │   │   ├── UserReportDetail.tsx
│   │   │   │   ├── UserReports.tsx
│   │   │   │   └── XrayScan.tsx
│   │   │   ├── Auth.tsx              # Login/Register page
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Index.tsx             # Landing page
│   │   │   └── NotFound.tsx
│   │   ├── components/
│   │   │   ├── sections/             # Landing page sections
│   │   │   │   ├── CTASection.tsx
│   │   │   │   ├── DoctorsSection.tsx
│   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── HowItWorksSection.tsx
│   │   │   │   └── WhySmiloSection.tsx
│   │   │   ├── ui/                   # Shadcn UI components
│   │   │   │   ├── DoctorSidebar.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── UserSidebar.tsx
│   │   │   │   └── ... (50+ Shadcn UI components)
│   │   │   └── XrayImageWithDetections.tsx
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-toast.ts
│   │   │   └── useXrayData.tsx       # Global X-ray data state
│   │   ├── types/
│   │   │   └── xray.ts               # TypeScript type definitions
│   │   ├── lib/
│   │   │   └── api.ts                # API client library
│   │   ├── App.tsx                   # Routing and app root
│   │   ├── App.css
│   │   ├── main.tsx                  # Entry point
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts            # Tailwind configuration
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── components.json               # Shadcn UI configuration
│   ├── .gitignore
│   └── index.html
│
├── requirements.txt                  # Python dependencies list
├── SETUP.md                          # Additional setup guide
├── COMPLETE_WORKFLOW.md              # Workflow documentation
├── FRONTEND_ARCHITECTURE.md          # Frontend architecture doc
├── SYSTEM_FLOW.md                    # System flow diagrams
├── Refine Doctor Panel Frontend Logic.md
└── README.md                         # This comprehensive file
```

### Backend Module Breakdown
#### 1. `app/db/models.py`
Defines SQLAlchemy ORM models with proper relationships:
- **`User`**: Core user table with one-to-one relationships to `PatientProfile` or `DoctorProfile`, one-to-many to `Appointment`
- **`PatientProfile`**: Patient-specific data including `profile_image_url`, `phone_number`, `address`, `date_of_birth`, `blood_group`
- **`DoctorProfile`**: Doctor-specific data including `profile_image_url`, `registration_number`, `linkedin_url`, `facebook_url`
- **`ScanReport`**: Stores all AI analysis reports (X-ray/Photo/Gemini/Document) with `image_data` (base64), `result_json`, `severity`
- **`Appointment`**: Manages appointments with foreign keys to `Patient` and `Doctor`, `status` field, `appointment_date` (datetime), `doctor_note`, and links to attached reports
- **`ChatMessage`**: Stores chat history for consultations

#### 2. `main.py`
Main FastAPI application file with:
- **CORS Middleware**: Allows all origins for development
- **AI Model Loading**: Startup event that loads U-Net, Photo Caries Detector
- **Helper Functions**: `hash_password()`, `verify_password()` with safe truncation to 72 bytes (bcrypt limit)
- **Dependency Injections**: `get_current_user()`, `get_current_doctor()`, `get_current_patient()` using x-user-id header
- **Full REST API**: All endpoints for authentication, analysis, profiles, appointments, reports, chat
- **Pydantic Schemas**: `UpdateDoctorProfileRequest`, `UpdatePatientProfileRequest`, `LoginRequest`, etc., defined before routes to avoid NameError
- **Static File Serving**: `/static` for segmentation results and uploaded images

### Frontend Module Breakdown
#### 1. `App.tsx`
- **QueryClientProvider**: TanStack Query for data fetching and caching
- **XrayDataProvider**: Global state for X-ray data
- **RoleProtectedRoute**: Custom route guard for role-based access
- **BrowserRouter/Routes**: Full routing configuration for both portals

#### 2. `lib/api.ts`
- **`getAuthHeaders()`**: Retrieves user from localStorage, sets x-user-id header
- **All API Functions**: `analyzeXray()`, `getPatientAppointments()`, `updateAppointmentStatus()`, `getDoctorProfile()`, etc.
- **Proper Error Handling**: Throws errors to be caught by frontend components

#### 3. Doctor & Patient Appointments Pages
- **Hidden Appointments Logic**: Uses localStorage to persist hidden appointments
- **Cleanup Effect**: `useEffect()` runs when `appointments` changes, cleaning hidden IDs to only keep terminal statuses (rejected/cancelled/completed/closed)
- **Loading/Empty States**: Clear loading indicator and "No appointments found" messages
- **Dashboard Update Events**: Listens to `dashboard-update` to refresh appointments

---

## 🛠️ Tech Stack Breakdown

### Frontend (Core Libraries)
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Core** | React | 18.3 | UI framework |
| **Core** | TypeScript | 5.6 | Static typing |
| **Build** | Vite | 5.4 | Fast bundling & dev server |
| **Styling** | Tailwind CSS | 3.4 | Utility-first styling |
| **Styling** | Tailwind CSS Animate | 1.0 | CSS animations for Tailwind |
| **Styling** | @tailwindcss/typography | 0.5 | Typography plugin |
| **Components** | Radix UI | - | Accessible component primitives |
| **Components** | Shadcn UI | - | Reusable component library |
| **Icons** | Lucide React | 0.44 | Beautiful, consistent icons |
| **Animations** | Framer Motion | 11.3 | Smooth UI animations |
| **Data Fetching** | TanStack Query | 5.56 | Server state management, caching, refetching |
| **Notifications** | Sonner | 1.5 | Beautiful, accessible toasts |
| **Forms** | React Hook Form | - | Form handling |
| **State Management** | LocalStorage | - | Simple persistence for reports, hidden items |

### Backend (Core Libraries)
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | FastAPI | 0.128 | Modern, high-performance web framework |
| **Server** | Uvicorn | 0.32 | ASGI server for production |
| **ORM** | SQLAlchemy | 2.0 | Database ORM |
| **DB Driver** | SQLite3 | - | Embedded relational database |
| **Auth** | Passlib | 1.7 | Password hashing (bcrypt) |
| **Image Processing** | Pillow | 10.4 | Image manipulation, drawing bounding boxes |
| **AI/ML** | Hugging Face Hub | - | Download pre-trained models |
| **AI/ML** | Ultralytics YOLO | 8.3 | Caries detection in photos |
| **AI/ML** | Google Generative AI | - | Multimodal analysis |
| **AI/ML** | Groq | - | LLM inference API |
| **Validation** | Pydantic | 2.10 | Data validation and settings management |

---

## 🚀 Detailed Installation Guide

### Prerequisites
1. **Python 3.11 or 3.12** (3.13 has some compatibility issues with certain packages)
2. **Node.js 18 or higher** and npm/yarn/pnpm
3. **Git**
4. **Minimum 4 GB RAM** (8 GB recommended for AI model loading)
5. **API Keys (Optional but Recommended)**:
   - Roboflow API Key (for caries detection in X-rays)
   - Google Generative AI API Key
   - Groq API Key

### Step 1: Clone Repository
```bash
cd your/projects/folder
git clone &lt;repository-url&gt;
cd Smilo-AI
```

### Step 2: Backend Setup
1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create Virtual Environment**:
```bash
python -m venv .venv
```

3. **Activate Virtual Environment**:
   - **Windows (PowerShell/CMD)**:
   ```powershell
   .venv\Scripts\activate
   ```
   - **macOS/Linux**:
   ```bash
   source .venv/bin/activate
   ```

4. **Install Python Dependencies**:
```bash
pip install -r ../requirements.txt --default-timeout=300
```
   *(This might take a while depending on your internet speed as it downloads PyTorch and other large packages)*

5. **Download/Prepare AI Models** (Optional but Recommended):
   - **best.pt**: Place your custom YOLOv8 caries detection model in `backend/` if you want Photo Analysis to work
   - The U-Net model from Hugging Face will download automatically on first run

### Step 3: Frontend Setup
1. **Navigate to frontend directory** (in a **separate terminal**):
```bash
cd frontend
```

2. **Install Node Dependencies**:
```bash
npm install
```

### Step 4: Run Both Servers

#### Run Backend
In the first terminal (virtual environment activated, backend directory):
```bash
python -m uvicorn main:app --reload
```
- Backend will start on: http://127.0.0.1:8000
- API Docs (Swagger UI): http://127.0.0.1:8000/docs
- API Docs (ReDoc): http://127.0.0.1:8000/redoc

#### Run Frontend
In the second terminal (frontend directory):
```bash
npm run dev
```
- Frontend will start on: http://localhost:8081 (or another port if 8081 is in use)

---

## 🎯 Usage & Workflow

### Patient Workflow
1. **Sign Up or Login**: Go to /auth, select "Patient" role, create an account or login
2. **Explore Dashboard**: You'll land on the patient dashboard overview page with stats and recent scans
3. **Analyze an X-Ray**: Go to "X-Ray Scan" in sidebar, upload your panoramic X-ray, view AI analysis
4. **Book an Appointment**: Go to "Find Doctors", browse doctors, click "Book" on a doctor, it'll book with an automatic appointment
5. **Manage Appointments**: Go to "Appointments" to view/cancel your appointments
6. **Update Profile**: Go to "Profile" to update your details, change password, etc.

### Doctor Workflow
1. **Sign Up or Login**: Go to /auth, select "Doctor" role, create an account or login
2. **Explore Dashboard**: You'll land on the doctor dashboard overview page with stats, recent scans, upcoming appointments
3. **Pro X-Ray Studio**: Go to "Pro X-Ray Studio" to use advanced tools, upload images, adjust brightness/contrast, rotate, annotate, etc.
4. **Manage Appointments**: Go to "Appointments" to approve or reject pending appointments, set dates, add doctor notes
5. **Review Patient Reports**: Go to "Patient Reports" to review and manage reports
6. **Update Profile**: Go to "Profile" to update your professional details, qualifications, social links, registration number, etc.

### General Tips
- **Role-Based Login Isolation**: You cannot log into the Patient Portal using Doctor Credentials and vice versa!
- **x-user-id Header**: The authentication system uses x-user-id header, which is stored locally in localStorage
- **Live Badges**: The badges for pending reports and appointments should update whenever you do actions like approve an appointment, upload a report, etc., via the custom `dashboard-update` event!
- **Profile Image Upload**: You can upload profile images for both patients and doctors, if you don't upload, it shows initials in teal (#21b2c0) circle!
- **Pro X-Ray Studio**: Only visible to Doctor Portal!

---

## 📡 Full API Documentation

### Base URL
```
http://127.0.0.1:8000
```

### General Notes
- **Authentication**: Most endpoints require authentication using `x-user-id` header (which should contain integer `user.id` of a valid user)
- **CORS**: All origins, methods, and headers are enabled for development (not recommended for production)

### Core Endpoints List
---
#### Home &amp; Health Check
- **GET /**
  - Description: Health check endpoint that checks if AI services are loaded
  - Response: `{"message": "Smilo AI System is Online 🦷", "teeth_segmenter_service_loaded": true/false}`

---
#### Authentication
- **POST /api/register**
  - Description: Register a new patient or doctor
  - Required Fields: Email, Password, Role (patient/doctor), and other profile fields based on role
  - Response: Success and user_id
  - CURL Example:
    ```bash
    curl -X POST "http://127.0.0.1:8000/api/register" \
      -H "Content-Type: application/json" \
      -d "{\"email\": \"patient1@example.com\", \"password\": \"password123\", \"role\": \"patient\", \"full_name\": \"John Doe\", \"age\": 30, \"gender\": \"Male\"}"
    ```

- **POST /api/login**
  - Description: Authenticate user with strict role check (to ensure patients don't log into doctor portal and vice versa)
  - Required Fields: Email, Password, required_role
  - Response: Success, user_id, role, full_name, email
  - CURL Example:
    ```bash
    curl -X POST "http://127.0.0.1:8000/api/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\": \"patient1@example.com\", \"password\": \"password123\", \"required_role\": \"patient\"}"
    ```

---
#### AI Analysis Endpoints
- **POST /analyze** (Requires Auth Header: x-user-id)
  - Description: Analyze a dental X-ray image using U-Net for segmentation and Roboflow YOLO for caries detection
  - Request: multipart/form-data with "file" parameter (image)
  - Response: Detailed analysis with detections, URLs, severity, total_issues, recommendation, etc.

- **POST /api/analyze-photo** (Requires Auth Header: x-user-id)
  - Description: Analyze a dental photo using custom-trained YOLOv8 photo caries detector
  - Request: multipart/form-data with "file" parameter (image)
  - Response: Analysis with detections, severity, etc.

- **POST /api/analyze-photo-gemini** (Requires Auth Header: x-user-id)
  - Description: Analyze a dental photo using Google's Generative AI (multimodal model)
  - Request: multipart/form-data with "file" parameter (image)
  - Response: Comprehensive analysis from Gemini

- **POST /api/analyze-report** (Requires Auth Header: x-user-id)
  - Description: Analyze a dental report/document using Groq/Llama
  - Request: multipart/form-data with "file" parameter (image/document)
  - Response: Summarized analysis, findings, recommendations, etc.

---
#### Doctor &amp; Patient Profile Endpoints
- **GET /api/doctors**
  - Description: Retrieve a list of all registered doctors
  - Response: Array of doctor objects with profile info

- **GET /api/doctor/profile** (Requires Auth &amp; Doctor Role)
  - Description: Get current doctor's profile
  - Requires: x-user-id header of a valid doctor

- **PUT /api/doctor/profile** (Requires Auth &amp; Doctor Role)
  - Description: Update current doctor's profile
  - Allows updating fields like full_name, email, clinic_name, specialization, experience_years, city, qualifications, profile_image_url, registration_number, linkedin_url, facebook_url, and password change
  - Requires password confirmation when changing password

- **GET /api/patient/profile** (Requires Auth &amp; Patient Role)
  - Description: Get current patient's profile
  - Requires: x-user-id header of a valid patient

- **PUT /api/patient/profile** (Requires Auth &amp; Patient Role)
  - Description: Update current patient's profile
  - Allows updating fields like name, email, age, gender, profile_image_url, phone_number, address, date_of_birth, blood_group, and password change
  - Requires password confirmation when changing password

---
#### Appointment Endpoints
- **POST /api/appointments/book** (Requires Auth &amp; Patient Role)
  - Description: Book an appointment with a specific doctor
  - Requires: x-user-id header of a valid patient, doctor_id

- **GET /api/appointments/patient** (Requires Auth &amp; Patient Role)
  - Description: Get all appointments for the current patient

- **GET /api/appointments/doctor** (Requires Auth &amp; Doctor Role)
  - Description: Get all appointments for the current doctor

- **PUT /api/appointments/{appointment_id}/status** (Requires Auth &amp; Doctor Role)
  - Description: Update appointment status (approve/reject, set appointment date, add doctor note)
  - Allowed Statuses: pending/approved/rejected/completed/cancelled

- **DELETE /api/appointments/{appointment_id}** (Requires Auth &amp; Patient or Doctor Role)
  - Description: Cancel an appointment

---
#### Report Endpoints
- **GET /api/reports/patient** (Requires Auth &amp; Patient Role)
  - Description: Get all scan reports for the current patient

- **GET /api/reports/{report_id}** (Requires Auth Header: x-user-id)
  - Description: Get a specific scan report by report_id

---
#### Chat &amp; Consultation Endpoints
- **POST /api/chat/message**
  - Description: Send a message to the AI assistant and get a response

- **GET /api/chat/{appointment_id}** (Requires Auth Header: x-user-id)
  - Description: Get chat messages for a specific consultation

- **POST /api/chat/{appointment_id}** (Requires Auth Header: x-user-id)
  - Description: Send a chat message in a specific consultation

---
#### AI Services Status
All AI services are initialized on FastAPI startup and their status can be seen in the health check response!

---

## 🗄️ Database Schema & Relationships

### SQLite Database Tables (Full ERD Description)
#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  role TEXT NOT NULL,  -- "patient" or "doctor"
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Patient Profiles Table
```sql
CREATE TABLE patient_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  profile_image_url TEXT,
  phone_number TEXT,
  address TEXT,
  date_of_birth TEXT,
  blood_group TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

#### Doctor Profiles Table
```sql
CREATE TABLE doctor_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  city TEXT NOT NULL,
  qualifications TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT 0,
  profile_image_url TEXT,
  registration_number TEXT,
  linkedin_url TEXT,
  facebook_url TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

#### Scan Reports Table
```sql
CREATE TABLE scan_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  report_type TEXT NOT NULL,  -- "xray", "photo", "gemini", "document"
  filename TEXT NOT NULL,
  file_url TEXT,
  findings TEXT,
  summary TEXT,
  ai_prediction TEXT,
  confidence TEXT,
  severity TEXT,  -- "Healthy", "Mild", "Moderate", "Severe"
  status TEXT DEFAULT "pending",  -- "pending", "reviewed"
  image_data TEXT,  -- Base64 encoded image
  result_json TEXT,  -- JSON string of full results
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

#### Appointments Table
```sql
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  status TEXT DEFAULT "pending",
  xray_report_id INTEGER,
  photo_report_id INTEGER,
  gemini_report_id INTEGER,
  appointment_date DATETIME,
  doctor_note TEXT,
  has_new_uploads BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(patient_id) REFERENCES users(id),
  FOREIGN KEY(doctor_id) REFERENCES users(id),
  FOREIGN KEY(xray_report_id) REFERENCES scan_reports(id),
  FOREIGN KEY(photo_report_id) REFERENCES scan_reports(id),
  FOREIGN KEY(gemini_report_id) REFERENCES scan_reports(id)
);
```

#### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER NOT NULL,
  sender_role TEXT NOT NULL,  -- "patient", "doctor", "ai"
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(appointment_id) REFERENCES appointments(id)
);
```

---

## 🔒 Security Implementation

### 1. Role-Based Authentication
- **Strict Role Isolation**: The login endpoint has a `required_role` parameter that strictly checks the user's actual role. If a patient tries to log into the doctor portal (or vice versa), it returns a 403 Forbidden error!
- **x-user-id Header Authentication**: Instead of complex JWT (for simplicity but not recommended for full production, but good for FYP), we use x-user-id header which contains `user.id`. Middleware validates the header and fetches the user from the DB!
- **Password Hashing**: Using bcrypt with safe truncation to 72 bytes (the bcrypt limit) to avoid bugs!

### 2. Authorization &amp; Route Guards
- **Backend Dependency Injections**: `get_current_user()`, `get_current_doctor()`, `get_current_patient()` dependencies that validate x-user-id header AND check the role of the user!
- **Frontend Route Guards**: `RoleProtectedRoute` component in `App.tsx` that checks localStorage for user and correct role!
- **Protected API Endpoints**: Almost all API endpoints require x-user-id header (authentication) and some require specific roles!

### 3. Other Security Notes
- **CORS**: For development purposes, all origins, methods, and headers are allowed (not recommended for full production)
- **SQL Injection**: SQLAlchemy ORM is used which prevents SQL injection!
- **XSS**: The frontend uses React which automatically escapes HTML content, preventing XSS attacks!

---

## 📈 Future Enhancements Roadmap
Here are some ideas for future improvements:
1. **Payment Integration**: Add support for online payment processing for consultations
2. **Mobile Application**: Develop native iOS and Android applications using React Native or Flutter
3. **Video Consultation**: Add real-time video call capabilities using WebRTC
4. **Electronic Health Records (EHR) Integration**: Integrate with existing EHR systems used by dental clinics
5. **Advanced AI Models**: Integrate more specialized dental AI models for conditions like periodontal disease and oral cancer
6. **Multi-Language Support**: Add support for multiple languages to make the platform accessible globally
7. **Cloud Deployment**: Deploy the platform to cloud services (AWS/GCP/Azure) for high availability and scalability
8. **Email/SMS Notifications**: Add support for email and SMS notifications for appointments and reports
9. **Data Visualization**: Add more detailed data visualization for patient history
10. **HIPAA/GDPR Compliance**: For full production, make the platform compliant with healthcare regulations
11. **AI Model Improvements**: Train custom models on larger datasets
12. **Offline Mode**: Add support for some basic functions to work offline
13. **Admin Panel**: Add an admin panel for managing the platform
14. **Reports Export**: Add support for exporting reports as PDF/Word files
15. **Analytics Dashboard**: Add an analytics dashboard for doctors and admins to track key metrics
16. **Prescription Management**: Add support for writing and managing prescriptions
17. **Appointment Reminders**: Add automated reminders for upcoming consultations
18. **Patient History Timeline**: Add a timeline view of patient history
19. **Multi-Clinic Support**: Add support for multiple clinics and locations
20. **Tele-Dentistry Marketplace**: Add support for a marketplace where patients can find and compare doctors

---

## 🐛 Known Issues &amp; Troubleshooting

### Common Issues
1. **Port Already in Use**
   - If port 8000 (backend) is in use:
     - **Windows**:
       ```powershell
       netstat -ano | findstr :8000
       taskkill /PID &lt;PID&gt; /F
       ```
     - **macOS/Linux**:
       ```bash
       lsof -ti :8000 | xargs kill -9
       ```
   - If port 8081 (frontend) is in use: You can change the port in vite.config.ts or just let Vite assign a different port automatically
2. **AI Models not Loading on Startup**
   - Make sure you have an active internet connection for Hugging Face Hub to download the U-Net model (it will download on first run and then cache it locally)
3. **Frontend not connecting to Backend**
   - Make sure both servers are running!
   - Check that the backend URL is correct in lib/api.ts
   - Check CORS issues (but our code has CORS enabled for all origins so should be okay)
4. **Appointment UI shows "No Appointments" even though you have some**
   - This is likely because the hidden appointments feature had your active appointments saved! The code now automatically cleans hidden appointments to only include terminal statuses, but if you had old data in localStorage you can clear your browser's localStorage and refresh!

### How to Clear LocalStorage for Testing
1. Open browser Dev Tools (F12 or Ctrl+Shift+I / Cmd+Option+I)
2. Go to Application or Storage tab
3. Find Local Storage
4. Select http://localhost:8081 (or whatever port your frontend is running on)
5. Right-click and Clear All

---

## 👥 Team &amp; Contributors
**Smilo AI Development Team**
- Abdullah Siddique
- Mohsin

---

## 📝 License
This project is developed for **educational purposes** as part of a Final Year Project (FYP). Not licensed for commercial use.

---

## 📧 Contact
For questions, support, or collaboration:
- **Email**: abdullahsiddique773@gmail.com

---

## 🙏 Acknowledgments
- **Ultralytics** for the excellent YOLOv8 framework
- **Roboflow** for their great dataset hosting and API
- **FastAPI** Team for the fantastic documentation and framework
- **Hugging Face** for the transformers library and model hub
- **Tailwind CSS** team for their amazing utility-first CSS framework
- **Shadcn UI** for their beautiful component library
- **Google Generative AI** team for Gemini API
- **Groq** team for fast LLM inference
- **All the open-source contributors** of the libraries used in this project!

---

## 🌟 Made with ❤️ for better dental health!
---
