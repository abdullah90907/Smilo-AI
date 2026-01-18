# 🚀 Quick Setup Guide

## Prerequisites
- Python 3.11 or 3.12 (recommended)
- Node.js 18+
- Git

## Step-by-Step Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/abdullah90907/Smilo-AI.git
cd Smilo-AI
```

### 2️⃣ Backend Setup (Python)

#### Create Virtual Environment
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

**Or install manually:**
```bash
pip install fastapi uvicorn ultralytics pillow python-multipart --default-timeout=300
```

#### Download AI Model
⚠️ **IMPORTANT:** The trained model (`best.pt`) is NOT included in the repository due to size.

**Option 1:** Request from team
**Option 2:** Train your own (see Training section below)

Place `best.pt` in the `backend/` folder:
```
backend/
├── main.py
└── best.pt  ← Place here (5.2 MB)
```

### 3️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
```

### 4️⃣ Run the Application

#### Start Backend (Terminal 1)
```bash
# From project root with activated virtual environment
cd backend
uvicorn main:app --reload

# ✅ Backend running at: http://127.0.0.1:8000
```

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev

# ✅ Frontend running at: http://localhost:8080
```

### 5️⃣ Test the System
1. Open browser: http://localhost:8080
2. Click **"Upload X-ray"** on dashboard
3. Select a dental X-ray image
4. View AI analysis results instantly!

---

## 📊 Dataset Setup (Optional - For Training)

The training dataset is **NOT included** due to size (451 MB).

### Download Dataset
1. Get dataset from [Roboflow/Kaggle] (link TBD)
2. Extract to `ai-training/` folder:
```
ai-training/
├── train/
├── valid/
├── test/
└── data.yaml
```

### Train Your Own Model
```bash
# Open Jupyter notebook
jupyter notebook ai-training/smilo_lab.ipynb

# Or use Python directly
python train.py
```

---

## 🐛 Troubleshooting

### Backend won't start
**Problem:** "Model not found" error  
**Solution:** Ensure `best.pt` is in `backend/` folder

### CORS Error
**Problem:** Frontend can't connect to backend  
**Solution:** Check `main.py` allows your frontend port:
```python
allow_origins=["http://localhost:8080"]
```

### Port Already in Use
```bash
# Windows - Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill
```

---

## 📦 What's Included vs What's Not

### ✅ Included in Git
- Source code (frontend + backend)
- Documentation
- Configuration files
- README and setup guides

### ❌ NOT Included (Too Large)
- `best.pt` (5.2 MB) - AI model weights
- `ai-training/` (451 MB) - Training dataset
- `data.zip` (445 MB) - Compressed dataset
- `.venv/` (1.1 GB) - Virtual environment
- `node_modules/` - Node packages

**Why?** GitHub has 100 MB file limit. Large files must be:
- Downloaded separately
- Or use Git LFS (Large File Storage)

---

## 🔗 Useful Links

- **API Documentation**: http://localhost:8000/docs (when backend is running)
- **Frontend Docs**: See `frontend/README.md`
- **Architecture**: See `frontend/FRONTEND_ARCHITECTURE.md`

---

## 🆘 Need Help?

1. Check [Issues](https://github.com/abdullah90907/Smilo-AI/issues)
2. Read full [README.md](README.md)
3. Contact team via email

---

**Happy Coding! 🦷✨**
