import json
from typing import List, Dict, Any
from app.core.config import GROQ_API_KEY, GROQ_MODEL

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

SYSTEM_PROMPT = """
You are the Smilo AI Clinical Dental Assistant. Your sole purpose is to discuss oral health, dental diseases, preventative care, and related systemic medical conditions (e.g., how poor chewing affects stomach pain/digestion).

If the user asks about sports, politics, programming, or any topic unrelated to oral/systemic health, you must politely refuse and redirect them to ask about their dental health or scan results.

DO NOT output raw JSON or code blocks. Always respond in conversational, human-friendly Markdown text.

Keep responses balanced: neither too brief nor excessively long. Aim for 2-3 concise paragraphs, using bullet points for readability when listing advice.
"""

class ChatService:
    def __init__(self):
        if not GROQ_AVAILABLE:
            raise Exception("groq SDK is not installed.")
        try:
            self.client = Groq(api_key=GROQ_API_KEY)
            print("✅ Chat Service loaded successfully!")
        except Exception as e:
            print(f"⚠️ Failed to load Chat Service: {e}")
            raise e
    
    def get_response(self, messages: List[Dict[str, Any]], hidden_context: str | None = None) -> str:
        try:
            # If hidden_context is provided, append to system prompt
            full_messages = [
                {"role": "system", "content": SYSTEM_PROMPT.strip()}
            ]
            if hidden_context:
                full_messages.append({
                    "role": "system",
                    "content": f"Here is the user's latest scan/analysis data: {hidden_context}. Use this data to answer the user's questions about their dental health. Always remind them to consult a real dentist for professional advice."
                })
            
            # Add the user's conversation history
            full_messages.extend(messages)
            
            response = self.client.chat.completions.create(
                model=GROQ_MODEL,
                messages=full_messages,
                temperature=0.7
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            return "Sorry, I had an issue connecting to my brain! Please try again."

try:
    chat_service = ChatService()
except Exception as e:
    print(f"⚠️ Failed to initialize ChatService: {e}")
    chat_service = None
