from datetime import datetime

from app.models.resume import Candidate, CandidateResponse, Evaluation


def test_candidate_response_includes_evaluation_details():
    candidate = Candidate(
        id=1,
        job_id=1,
        name="Alice Example",
        email="alice@example.com",
        resume_text="Experienced Python engineer",
        experience=5,
        status="completed",
        created_at=datetime.utcnow(),
    )
    candidate.evaluation = Evaluation(
        id=1,
        candidate_id=1,
        match_score=88,
        matched_skills=["python", "fastapi"],
        missing_skills=["docker"],
        summary="Strong fit",
        recommendation="strong",
    )

    payload = CandidateResponse.model_validate(candidate).model_dump()

    assert payload["status"] == "completed"
    assert payload["name"] == "Alice Example"
