
# 🦷 Smilo AI - Complete Developer Guide

## 📚 1. Project Overview
Smilo AI is an AI-powered dental health platform featuring:
- AI dental x-ray and photo analysis
- Dental report processing (PDF, DOCX, image OCR)
- Patient-doctor marketplace (Phase 1 complete)
- Two-sided marketplace architecture (patient & doctor portals)

---

## 📁 2. Complete Project Structure

```
Smilo AI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       └── teeth_segmentation.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── models.py (SQLAlchemy DB Models)
│   │   │   └── session.py (DB Connection)
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py (Pydantic Models for Auth)
│   │   │   └── dental_analysis.py
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── teeth_segmenter.py
│   │       ├── caries_detector.py
│   │       ├── photo_caries_detector.py
│   │       ├── report_analyzer.py
│   │       ├── chat_service.py
│   │       └── gemini_service.py
│   ├── main.py (FastAPI Entrypoint & Endpoints)
│   └── smilo_ai.db (SQLite DB)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── sections/
│   │   │   └── ui/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── doctor/
│   │   │   ├── user/
│   │   │   ├── Auth.tsx
│   │   │   ├── Index.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   └── api.ts (API communication layer)
│   │   ├── App.tsx
│   │   └── ...
│   └── ... (Vite React App
│
├── requirements.txt
├── README.md
└── ...
```

---

## 🎨 3. Color Theme & Design System
- Primary Color: `#21b2c0` (Teal)
- Secondary Colors:
  - Primary Light: `#4fc1ca`
  - Primary Dark: `#1a95a0`
  - Background: `#ffffff`
  - Card Background: `#f9fafb`
  - Text Primary: `#111827`
  - Text Secondary: `#6b7280`

- Typography: Default Vite/React
- Buttons: Teal (#21b2c0 background, white text
- Cards: Rounded-xl, white background, subtle shadow
- Inputs: Gray border, focus with teal ring
- Mobile-First approach
- Clean minimal design

---

## 🌐 4. Backend API Endpoints
All endpoints at `http://127.0.0.1:8000/` or `http://localhost:8000/` (CORS is enabled for all origins)

### Auth Endpoints
- `POST /api/register`
  - Body (Patient: {email, password, role ("patient"/"doctor", ...}
- `POST /api/login`
  - Body: {email, password}
  - Returns: {success, user_id, role, full_name, email}
- `GET /api/seed` (Create test users for quick testing!
  - Returns: {"patient@test.com, test1234
  - Doctor: doctor@test.com, test1234

### Dental Health Analysis Endpoints
- `POST /analyze` (XRay Analysis (multipart/form-data file
- `POST /api/analyze-photo` (Photo Caries Detection
- `POST /api/analyze-photo-gemini`
- `POST /api/analyze-report` (Dental Report (PDF/DOCX/Image
- `POST /api/chat/analyze` (Chat Endpoint
- `POST /api/chat/message` (Chat message endpoint

---

## 📊 5. Database Schema (SQLAlchemy)
Tables:
  - `users`: id, email, hashed_password, role, created_at
  - `patient_profiles`: id, user_id, full_name, age, gender
  - `doctor_profiles`: id, user_id, full_name, specialization, experience_years, city, qualifications, clinic_name, is_verified
  - `scan_reports`: id, user_id, created_at, report_type, filename, file_url, findings, summary
  - `appointments`: id, patient_id, doctor_id, status, attached_report_id, created_at

---

## 📱 6. Mobile App Integration (Guide)
To build a mobile app using this backend, follow these steps:

### a) Tech Stack Options
- React Native / Expo
- Flutter
- Native Swift/Kotlin
- Ionic

### b) API Integration Guide
1. Connect mobile `api layer: Use `http://127.0.0.1:8000` or your public address
2. Auth flow:
  - POST to `/api/register`
  - POST to `/api/login`
  - Save user object in secure storage
3. File Upload: use `multipart/form-data` to upload files to endpoints!
4. Use same colors from above color theme
5. Test users: patient@test.com (pass test1234; doctor@test.com same pass!

### c) Required Environment Variables
- Backend Config:
  - GROQ_API_KEY: your groq key
  - GROQ_MODEL: default `llama-3.3-70b-versatile
  - GROQ_VISION_MODEL: `meta-llama/llama-4-scout-17b-16e-instruct
  - MAX_IMAGE_SIZE_MB: 10
  - GEMINI_API_KEY (optional)

---

## 🧪 7. Test Data & Quick Start
1. cd backend/
   - install requirements
   - pip install -r ../requirements.txt
   - run: `python -m uvicorn main:app --reload
2. cd frontend/
   - npm install
   - npm run dev
3. Visit `http://localhost:8080`
4. Go to auth page, click `Test as Patient` button!
5. Use `Test as Doctor`!

---

## 📦 8. Dependencies
Backend:
  - FastAPI
  - Uvicorn
  - SQLAlchemy
  - passlib, bcrypt, email-validator
  - Pillow
  - pdfplumber, PyMuPDF, python-docx
  - Groq API, tenacity
  - python-multipart
  - etc.
  Frontend: Vite, React, Tailwind, shadcn, React-Router

---

## 📋 9. Phase 1 Complete Checklist ✅
- ✅ Backend DB models created (User, PatientProfile, DoctorProfile, Appointment, ScanReport
- ✅ Endpoints for register/login with proper CORS enabled
- ✅ Frontend Auth UI & Quick Test buttons for patient & doctor
- ✅ Seed endpoint to create test user
- ✅ Color theme defined as #21b2c0 primary
- ✅ Report analyze function from dental report analyzer (PDF/DOCX/Image OCR
- ✅ Doctor and patient portals
- ✅ Two sided marketplace starting!

---

## 🤖 10. Dental Report Analysis - Prompt Engineering Details
The AI uses the following detailed prompt to process dental reports! This is used by `app/services/report_analyzer.py` to extract structured data!

### System Prompt for Dental Report Analysis
```text
You are a senior dental consultant. Analyze the provided text from a document.

CRITICAL RULE: 
First, determine if the document is related to dentistry, orthodontics, or oral health. 
If the document is NOT dental-related (e.g., a bank statement, grocery receipt, or general medical report not involving the mouth), you MUST set "document_type" to "unsupported" and provide a brief explanation in "message".

TASK:
1. Classify the document (dental_report, orthodontic_report, periodontal_report, dental_xray_report, or unsupported).
2. Extract details into a valid JSON object matching this structure:
{
    "document_type": "dental_report",
    "patient_info": {"name": "...", "age": 0, "gender": "...", "report_date": "...", "clinic_name": "...", "dentist_name": "...", "report_type": "..."},
    "diagnoses": [{"condition": "...", "status": "...", "notes": "..."}],
    "tooth_findings": [{"tooth_number": "...", "finding": "...", "status": "healthy"}],
    "gum_findings": [{"issue": "...", "severity": "none", "details": "..."}],
    "xray_findings": [{"observation": "...", "location": "...", "severity": "none"}],
    "existing_dental_work": ["filling on tooth 14", "crown on 18"],
    "recommended_treatments": ["scaling", "filling"],
    "risk_assessment": {"tooth_decay_risk": "Low", "gum_disease_risk": "Low", "tooth_loss_risk": "Low"},
    "precautions": ["Avoid very hot/cold drinks", "Brush gently"],
    "patient_suggestions": ["Try to floss once a day", "Consider a soft-bristled toothbrush", "Schedule a follow-up in 6 months"],
    "simplified_explanations": [{"medical_term": "Caries", "simple_explanation": "Tooth decay or a cavity"}],
    "patient_summary": "..."
}

IMPORTANT:
- "patient_suggestions": Provide 3-5 easy-to-understand, actionable suggestions for the patient based on the findings.
- Valid tooth status: ["healthy", "decayed", "filled", "crowned", "missing", "root_canal", "implant", "extraction_recommended", "mobility"]
- Valid severity: ["none", "mild", "moderate", "severe"]
- Valid risk values: ["Low", "Moderate", "High", "Unknown"]
- Return ONLY a valid JSON object. NO other text or markdown formatting!
- If a field is unknown, use null for strings/numbers and [] for lists. Do not omit required fields.
```

### OCR Prompt (For Images)
For scanned PDFs or images, we also use:
```text
Extract all text from this dental report image exactly as it appears. Include all patient details, findings, and dates. Do not summarize or add any commentary.
```

### AI Models Used
- Text Analysis: `llama-3.3-70b-versatile` (Groq)
- Vision/OCR: `meta-llama/llama-4-scout-17b-16e-instruct` (Groq)
