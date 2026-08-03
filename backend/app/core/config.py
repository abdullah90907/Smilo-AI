import os

# Load local .env manually if it exists to keep credentials out of Git history
env_paths = [
    os.path.join(os.path.dirname(__file__), "..", "..", ".env"), # backend/.env
    os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"), # root/.env
    ".env"
]

for env_path in env_paths:
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip('"').strip("'")
                        if key:
                            os.environ[key] = val
            break # Stop after loading the first found .env
        except Exception as e:
            print(f"⚠️ Warning: Failed to load .env from {env_path}: {e}")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_VISION_MODEL = os.getenv("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")
MAX_IMAGE_SIZE_MB = int(os.getenv("MAX_IMAGE_SIZE_MB", "10"))