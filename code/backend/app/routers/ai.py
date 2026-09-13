import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError

# Ensure environment variables are loaded
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()  # Fallback to local .env in CWD

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("WARNING: GEMINI_API_KEY is missing from environment variables!")

client = genai.Client(api_key=api_key) if api_key else None

router = APIRouter()

# Pydantic Schemas for AI Endpoints
class InsightsResponse(BaseModel):
    summary: str = Field(description="Clinical and behavioral summary of the hyperhidrosis telemetry data")
    keyPatterns: List[str] = Field(description="List of detected correlation patterns, e.g., temperature spikes, stress clusters, circadian timing")
    preventativeTips: List[str] = Field(description="Actionable, practical preventative interventions and coping strategies based on telemetry")

class ChatRequest(BaseModel):
    question: str
    episodeHistory: Optional[List[Dict[str, Any]]] = []

class ChatResponse(BaseModel):
    answer: str

def generate_with_gemini_fallback(contents: str, config: types.GenerateContentConfig):
    """
    Attempts generation with gemini-2.5-flash and falls back to gemini-3.6-flash / gemini-3.7-flash
    if the account or region is redirected by Google to the newer model version.
    """
    models_to_try = ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-3.7-flash"]
    last_err = None
    for model_name in models_to_try:
        try:
            return client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )
        except Exception as e:
            last_err = e
            err_str = str(e)
            print(f"[Gemini Model {model_name} Error]: {err_str}")
            if "no longer available" in err_str or "NOT_FOUND" in err_str or "404" in err_str:
                continue
            raise e
    if last_err:
        raise last_err

@router.post("/insights", response_model=InsightsResponse)
async def generate_insights(episodes: List[Dict[str, Any]]):
    """
    Analyze historical hyperhidrosis episode logs using Gemini
    and return structured telemetry insights.
    """
    if not client or not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API key is missing on the server. Please check backend/.env"
        )

    if not episodes:
        return InsightsResponse(
            summary="No episode logs recorded yet. Begin logging hyperhidrosis events to unlock personalized AI correlation analysis.",
            keyPatterns=[
                "Baseline awaiting telemetry input",
                "Log at least 3-5 episodes across different days to discover environmental catalysts",
                "Track ambient temperature and humidity for deeper correlation"
            ],
            preventativeTips=[
                "Carry a breathable microfiber handkerchief or cooling towel",
                "Hydrate consistently with electrolytes to compensate for fluid loss",
                "Record flare-ups immediately after onset for accurate duration tracking"
            ]
        )

    try:
        # Sanitize / summarize episode history for token efficiency
        sanitized_episodes = []
        for ep in episodes[:50]:  # Analyze up to the latest 50 logs
            sanitized_episodes.append({
                "timestamp": ep.get("timestamp"),
                "severity": ep.get("severity"),
                "bodyAreas": ep.get("bodyAreas"),
                "trigger": ep.get("trigger"),
                "stressLevel": ep.get("stressLevel"),
                "activity": ep.get("activity"),
                "durationMinutes": ep.get("durationMinutes"),
                "temperature": ep.get("temperature"),
                "humidity": ep.get("humidity"),
                "notes": ep.get("notes")
            })

        system_instruction = (
            "You are HyperTrack's AI Medical Telemetry Specialist and clinical hyperhidrosis researcher. "
            "Analyze the provided patient telemetry logs to identify physiological patterns, environmental catalysts "
            "(temperature, humidity), psychological stress multipliers, circadian timing tendencies, and anatomical distributions. "
            "Return a concise, empathetic, high-density clinical summary, 3 to 5 distinct key patterns, and 3 to 5 actionable preventative tips. "
            "Be precise, scientifically grounded, and constructive."
        )

        prompt = (
            f"Analyze the following {len(sanitized_episodes)} hyperhidrosis telemetry episodes:\n"
            f"{json.dumps(sanitized_episodes, indent=2)}\n\n"
            "Provide structured clinical telemetry insights."
        )

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_json_schema=InsightsResponse.model_json_schema(),
            system_instruction=system_instruction,
            temperature=0.2,
        )

        response = generate_with_gemini_fallback(contents=prompt, config=config)

        if not response or not response.text:
            raise ValueError("Empty response from Gemini AI.")

        parsed_data = json.loads(response.text)
        return InsightsResponse(**parsed_data)

    except Exception as e:
        print(f"[Gemini AI Insights Exception]: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini API error: {str(e)}"
        )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_gemini(request: ChatRequest):
    """
    Context-aware interactive Q&A assistant grounded in the user's personal telemetry history.
    """
    if not client or not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API key is missing on the server. Please check backend/.env"
        )

    if not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )

    try:
        # Sanitize episode logs for context
        sanitized_history = []
        if request.episodeHistory:
            for ep in request.episodeHistory[:40]:
                sanitized_history.append({
                    "timestamp": ep.get("timestamp"),
                    "severity": ep.get("severity"),
                    "bodyAreas": ep.get("bodyAreas"),
                    "trigger": ep.get("trigger"),
                    "stressLevel": ep.get("stressLevel"),
                    "activity": ep.get("activity"),
                    "durationMinutes": ep.get("durationMinutes"),
                    "temperature": ep.get("temperature"),
                    "humidity": ep.get("humidity"),
                    "notes": ep.get("notes")
                })

        system_instruction = (
            "You are HyperTrack's AI Health & Telemetry Assistant, specializing in hyperhidrosis "
            "(excessive sweating), sympathetic nervous system triggers, and practical coping mechanisms.\n\n"
            "PATIENT TELEMETRY CONTEXT:\n"
            f"The patient has logged {len(sanitized_history)} episodes in HyperTrack:\n"
            f"{json.dumps(sanitized_history, indent=2)}\n\n"
            "RULES:\n"
            "1. Ground your answers strictly in the user's specific data, triggers, body areas, and severity levels whenever applicable.\n"
            "2. If the user asks about upcoming situations (e.g. public speaking, job interviews, workouts), cite their logged triggers and suggest personalized preparation based on past patterns.\n"
            "3. Maintain an empathetic, encouraging, and clinically informed tone.\n"
            "4. Keep responses crisp and well-structured with bullet points where appropriate.\n"
            "5. Remind the user you are an AI companion and they should review treatment options with a licensed dermatologist."
        )

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.3,
        )

        response = generate_with_gemini_fallback(contents=request.question, config=config)

        answer_text = response.text if response and response.text else "I was unable to formulate a response based on the available telemetry."
        return ChatResponse(answer=answer_text)

    except Exception as e:
        print(f"[Gemini AI Chat Exception]: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini API error: {str(e)}"
        )
