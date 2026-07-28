import json
import re
from typing import Any, Dict, Optional

import httpx

from app.config.settings import settings


class LLMService:
    """Resume evaluation service with a deterministic local scoring fallback."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.NVIDIA_API_KEY
        self.model = model or settings.NVIDIA_MODEL_NAME

    async def evaluate_resume(self, job_description: str, required_skills: str, resume_text: str) -> Dict[str, Any]:
        try:
            return await self._evaluate_with_llm(job_description, required_skills, resume_text)
        except Exception:
            return self._evaluate_locally(job_description, required_skills, resume_text)

    async def _evaluate_with_llm(self, job_description: str, required_skills: str, resume_text: str) -> Dict[str, Any]:
        prompt = self._build_prompt(job_description, required_skills, resume_text)
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an expert recruiter. Return ONLY valid JSON matching the requested schema. "
                        "No markdown, no commentary, no extra keys."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.1,
            "max_tokens": 800,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post("https://integrate.api.nvidia.com/v1/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            parsed = self._parse_json(content)
            return self._normalize_result(parsed)

    def _build_prompt(self, job_description: str, required_skills: str, resume_text: str) -> str:
        return (
            "Evaluate this resume against the job description don't mind case sensitivity. "
            "Return ONLY JSON with exactly these keys: "
            "match_score, matched_skills, missing_skills, summary, recommendation.\n"
            f"Job Description:\n{job_description}\n\n"
            f"Required Skills:\n{required_skills}\n\n"
            f"Resume Text:\n{resume_text}"
        )

    def _parse_json(self, raw_content: str) -> Dict[str, Any]:
        clean = raw_content.strip()
        if clean.startswith("```"):
            clean = re.sub(r"^```(?:json)?\s*", "", clean)
            clean = re.sub(r"\s*```$", "", clean)
        parsed = json.loads(clean)
        if not isinstance(parsed, dict):
            raise ValueError("Response is not a JSON object")
        return parsed

    def _normalize_result(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "match_score": int(payload.get("match_score", 0)),
            "matched_skills": list(payload.get("matched_skills", []) or []),
            "missing_skills": list(payload.get("missing_skills", []) or []),
            "summary": str(payload.get("summary", "")),
            "recommendation": str(payload.get("recommendation", "strong")),
        }

    def _evaluate_locally(self, job_description: str, required_skills: str, resume_text: str) -> Dict[str, Any]:
        normalized_resume = re.sub(r"[^a-z0-9]+", "", resume_text.lower()).strip()
        skills = [skill.strip().lower() for skill in required_skills.split(",") if skill.strip()]
        if not skills:
            skills = [token for token in re.findall(r"[a-z0-9]+", job_description.lower()) if len(token) > 3][:8]

        matched_skills = []
        for skill in skills:
            normalized_skill = re.sub(r"[^a-z0-9]+", "", skill)
            if normalized_skill and normalized_skill in normalized_resume:
                matched_skills.append(skill)

        total_skills = len(skills)
        matched_count = len(matched_skills)
        coverage_ratio = matched_count / total_skills if total_skills else 0.0

        if matched_count == 0:
            score = 0
            recommendation = "weak"
            summary = "No required skills were found in the resume."
        else:
            score = int(round(coverage_ratio * 100))
            score = max(10, min(100, score))

            if coverage_ratio >= 0.8:
                recommendation = "strong"
            elif coverage_ratio >= 0.5:
                recommendation = "moderate"
            else:
                recommendation = "weak"

            summary = f"Matched {matched_count} of {total_skills} required skill(s)."

        return {
            "match_score": score,
            "matched_skills": matched_skills,
            "missing_skills": [skill for skill in skills if skill not in matched_skills],
            "summary": summary,
            "recommendation": recommendation,
        }
