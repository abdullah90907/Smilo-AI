import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

print("Testing imports...")
try:
    import pdfplumber
    print("✅ pdfplumber imported successfully!")
except Exception as e:
    print(f"❌ pdfplumber failed: {e}")

try:
    import fitz
    print("✅ fitz (PyMuPDF) imported successfully!")
except Exception as e:
    print(f"❌ fitz failed: {e}")

try:
    from docx import Document
    print("✅ python-docx imported successfully!")
except Exception as e:
    print(f"❌ python-docx failed: {e}")

try:
    from groq import Groq
    print("✅ groq imported successfully!")
except Exception as e:
    print(f"❌ groq failed: {e}")

try:
    import tenacity
    print("✅ tenacity imported successfully!")
except Exception as e:
    print(f"❌ tenacity failed: {e}")

try:
    from app.core.config
    print("✅ config imported successfully!")
    print(f"   GROQ_API_KEY:", app.core.config.GROQ_API_KEY)
except Exception as e:
    print(f"❌ config failed: {e}")

try:
    from app.services.report_analyzer import groq_service
    print("✅ report_analyzer imported successfully!")
except Exception as e:
    print(f"❌ report_analyzer failed: {e}")
    import traceback
    traceback.print_exc()