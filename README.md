
# 🦷 Smilo AI: Intelligent Dental Diagnostic & Consultation Platform

Advanced AI-powered tele-dentistry platform with multi-model analysis, real-time collaboration, and comprehensive practice management.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![YOLOv8](https://img.shields.io/badge/YOLO-v8-00FFFF.svg)](https://github.com/ultralytics/ultralytics)
[![License](https://img.shields.io/badge/License-Educational-yellow.svg)](LICENSE)

---

## ✨ Key Features

### 🤖 Advanced AI Analysis
- U-Net for teeth segmentation in panoramic X-rays
- YOLOv8 for caries detection (X-rays & photos)
- Google Gemini for comprehensive dental photo assessment
- Groq/Llama for dental report/document analysis

### 👥 Dual Portal System
#### Patient Portal
- Dashboard with statistics
- X-Ray/Photo/Report Analysis
- AI Assistant Chat
- Find Doctors & Book Appointments
- User Reports History
- Consultation Chat with Doctor

#### Doctor Portal
- Dashboard with real-time metrics
- Pro X-Ray Studio (advanced image manipulation & annotation)
- Patient Reports Review
- Appointments Management
- Consultations Chat
- Profile Management

### 📊 Other Features
- Role-based authentication
- Real-time dashboard updates
- Responsive design (mobile-first)
- Report attachments for appointments
- Secure profile image upload

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Lucide React
- Framer Motion
- TanStack Query

### Backend
- FastAPI
- Uvicorn
- SQLAlchemy ORM
- SQLite
- Passlib (bcrypt)
- Pillow
- Hugging Face Hub
- Ultralytics YOLO
- Google Generative AI
- Groq

---

## 📸 Screenshots

### 🏠 Home Page
![Home Page](Images/Home.png)

### 🔐 Login Page
![Login Page](Images/login.png)

### Patient Portal
![Patient Portal](Images/Patient.png)
![X-Ray Analysis](Images/Xray.png)

### Doctor Portal
![Doctor Dashboard](Images/Doctor%20dashboard.png)
![Pro X-Ray Studio](Images/Pro%20X%20ray%20Studio.png)
![Doctor X-Ray Page](Images/Doctor%20X%20ray%20Page.png)
![Appointments](Images/appointment.png)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### Installation

1. **Clone repository**:
```bash
git clone <repository-url>
cd Smilo-AI
```

2. **Backend Setup**:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r ../requirements.txt
python -m uvicorn main:app --reload
```

3. **Frontend Setup** (in another terminal):
```bash
cd frontend
npm install
npm run dev
```

### Access
- Frontend: http://localhost:8081
- Backend: http://127.0.0.1:8000
- API Docs: http://127.0.0.1:8000/docs

---

## 👥 Team

- Abdullah Siddique
- Mohsin

---

## 📝 License

Educational purpose only (Final Year Project). Not for commercial use.

---

## 📧 Contact

For questions: abdullahsiddique773@gmail.com

---

## 🌟 Made with ❤️ for better dental health!

