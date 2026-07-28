import json
import httpx
from typing import Dict, Any, Tuple
from app.config import settings

class LLMService:
    @staticmethod
    async def evaluate_resume(job_title: str, job_description: str, resume_text: str) -> Tuple[str, int, Dict[str, Any]]:
        """
        Sends resume and job data to NVIDIA NIM API (Gemini model).
        Returns: (candidate_name, score, structured_analysis)
        """
        if not settings.NVIDIA_API_KEY or settings.NVIDIA_API_KEY == "nvapi-your-key-here":
            # Graceful fallback mock if key missing during test
            return "John Doe (Mock)", 75, {"summary": "API key missing. Running in mock mode.", "skills": [], "experience": []}

        url = "https://nvidia.com"
        headers = {
            "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
            "Content-Type": "application/json"
        }
        
        system_prompt = (
            "You are an expert technical recruiter AI. Analyze the provided resume text against the job description. "
            "You must respond with a strictly formatted valid raw JSON object and nothing else. No markdown wraps, no backticks. "
            "The JSON object must contain exactly these fields:\n"
            "{\n"
            "  \"candidate_name\": \"String (Extract name or use 'Unknown' if missing)\",\n"
            "  \"score\": Integer (0 to 100 based strictly on match quality),\n"
            "  \"summary\": \"String (Short brief explanation of overall fit)\",\n"
            "  \"matched_skills\": [\"List\", \"of\", \"matching\", \"skills\"],\n"
            "  \"missing_skills\": [\"List\", \"of\", \"gaps\"],\n"
            "  \"recommendation\": \"String (Short advice for hiring manager)\"\n"
            "}"
        )
        
        user_prompt = f"JOB TITLE: {job_title}\n\nJOB DESCRIPTION:\n{job_description}\n\nRESUME TEXT:\n{resume_text}"

        payload = {
            "model": settings.NVIDIA_MODEL_NAME,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 1024
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
                
                # Extract and parse inner JSON text content safely
                content_str = result['choices'][0]['message']['content'].strip()
                
                # Sanitize typical LLM outputs wrapped in ```json ... ```
                if content_str.startswith("```"):
                    content_str = content_str.split("```")[1]
                    if content_str.startswith("json"):
                        content_str = content_str[4:]
                content_str = content_str.strip()

                parsed_json = json.loads(content_str)
                
                candidate_name = parsed_json.get("candidate_name", "Unknown")
                score = int(parsed_json.get("score", 0))
                
                analysis_payload = {
                    "summary": parsed_json.get("summary", ""),
                    "matched_skills": parsed_json.get("matched_skills", []),
                    "missing_skills": parsed_json.get("missing_skills", []),
                    "recommendation": parsed_json.get("recommendation", "")
                }
                
                return candidate_name, score, analysis_payload
                
            except Exception as e:
                # Structured safety fallback inside application logic if JSON schema parsing blows up
                return "Unknown (Parsing Error)", 0, {"error": f"LLM parsing processing failed: {str(e)}"}
