import uvicorn
import os
import sys

# Ensure the backend directory is in the system path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app

if __name__ == "__main__":
    # Hugging Face Spaces dynamically assigns a port to the PORT environment variable.
    # It defaults to 7860 for Gradio SDK.
    port = int(os.getenv("PORT", 7860))
    print(f"Starting Smilo AI Backend on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
