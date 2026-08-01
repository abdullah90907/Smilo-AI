import uvicorn
import os
import sys

# Get the absolute path of the backend directory
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")

# 1. Add the backend directory to Python's system path for imports
sys.path.insert(0, backend_path)

# 2. Change the working directory to backend so all relative paths (like best.pt, static/, smilo_ai.db) work correctly
os.chdir(backend_path)

from main import app

if __name__ == "__main__":
    # Hugging Face dynamically assigns a port to the PORT environment variable (default: 7860)
    port = int(os.getenv("PORT", 7860))
    print(f"Starting Smilo AI Backend from root on port {port} (CWD: {os.getcwd()})...")
    
    # Run uvicorn pointing to the imported app object
    uvicorn.run(app, host="0.0.0.0", port=port)
