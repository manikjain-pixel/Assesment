from app.llm.service import LLMService


def test_local_scoring_is_based_on_skill_coverage_ratio():
    service = LLMService(api_key="test", model="test")

    result = service._evaluate_locally(
        job_description="Backend engineer role",
        required_skills="python, java, mysql, typescript, azure, node.js, mongodb",
        resume_text="Python Java MySQL TypeScript Azure",
    )

    assert result["match_score"] == 71
    assert result["matched_skills"] == ["python", "java", "mysql", "typescript", "azure"]
    assert result["missing_skills"] == ["node.js", "mongodb"]
    assert result["recommendation"] == "moderate"


def test_node_js_is_detected_when_resume_mentions_it_with_punctuation():
    service = LLMService(api_key="test", model="test")

    result = service._evaluate_locally(
        job_description="Backend engineer role",
        required_skills="python, node.js, mongodb",
        resume_text="I worked with Node.js and MongoDB in production systems.",
    )

    assert "node.js" in result["matched_skills"]
    assert "node.js" not in result["missing_skills"]
