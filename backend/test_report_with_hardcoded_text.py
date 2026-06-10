import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.report_analyzer import DentalReportService
import asyncio
import json
from groq import Groq
from app.core.config import GROQ_API_KEY, GROQ_MODEL, GROQ_VISION_MODEL

groq_client = Groq(api_key=GROQ_API_KEY)
analysis_model = GROQ_MODEL
vision_model = GROQ_VISION_MODEL

hardcoded_text = """
Patient Name: John Doe
Age: 30
Date: 2025-01-01
Clinic: Smilo Dental
Dentist: Dr. Smith
Findings:
- Mild gum inflammation (gingivitis)
- Caries (cavity) in tooth 14 (upper left premolar)
- Plaque and tartar buildup
Recommendations:
- Professional scaling and polishing
- Composite filling for tooth 14
- Improve daily brushing and flossing
- Follow up in 6 months
"""

system_prompt = """
You are a senior dental consultant. Analyze the provided text from a document.

CRITICAL RULE: First, determine if the document is related to dentistry, orthodontics, or oral health. If NOT, set "document_type": "unsupported".

TASK:
1. Classify document (dental_report, orthodontic_report, etc.)
2. Extract details into JSON matching this structure:
{
    "document_type": "dental_report",
    "patient_info": {"name": "...", "age": 0, "gender": "...", "report_date": "...", "clinic_name": "...", "dentist_name": "...", "report_type": "..."},
    "diagnoses": [{"condition": "...", "status": "...", "notes": "..."}],
    "tooth_findings": [{"tooth_number": "...", "finding": "...", "status": "healthy"}],
    "gum_findings": [{"issue": "...", "severity": "none", "details": "..."}],
    "xray_findings": [{"observation": "...", "location": "...", "severity": "none"}],
    "existing_dental_work": ["filling on tooth 14"],
    "recommended_treatments": ["scaling", "filling"],
    "risk_assessment": {"tooth_decay_risk": "Low", "gum_disease_risk": "Low", "tooth_loss_risk": "Low"},
    "precautions": ["Avoid very hot/cold drinks"],
    "patient_suggestions": ["Try to floss once a day"],
    "simplified_explanations": [{"medical_term": "Caries", "simple_explanation": "Tooth decay or a cavity"}],
    "patient_summary": "..."
}

Return ONLY a valid JSON object!
"""

async def test_hardcoded():
    print("=== Testing Groq Analysis with Hardcoded Text ===")
    try:
        print("Calling Groq API...")
        response = groq_client.chat.completions.create(
            model=analysis_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": hardcoded_text}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        raw_response = response.choices[0].message.content
        print(f"\n✅ Raw Groq Response:\n{raw_response}")
        
        analysis_dict = json.loads(raw_response)
        print("\n✅ Parsed JSON:")
        print(json.dumps(analysis_dict, indent=2))
        
    except Exception as e:
        print(f"\n❌ ERROR with hardcoded test:")
        print(e)
        import traceback
        traceback.print_exc()

asyncio.run(test_hardcoded())
