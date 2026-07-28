# AI Resume Screener Assignment

This repository contains a full-stack AI resume screener built as an assignment submission. It lets a recruiter create a job, upload clean PDF or TXT resumes, evaluate them against job requirements, and review ranked candidates in a simple web app.

## Deliverables

- Source code: available in this repository
- README with setup and environment variables
- README with the LLM used or fallback behavior
- README with what would be improved with more time and the trade-offs
- Local setup that runs with straightforward commands

## Required features implemented

- Job management
  - Create a job
  - List jobs
  - Delete a job

- Resume intake
  - Upload a resume in PDF or TXT format
  - Extract resume text
  - Create a candidate record for the selected job

- AI screening
  - Evaluate the resume against the job description and required skills
  - Return a match score, matched skills, missing skills, summary, and recommendation

- Candidate review
  - View candidates for a job
  - Filter by status or minimum score
  - Shortlist or reject a candidate

- Persistence
  - Store jobs, candidates, and evaluation results in SQLite
  - Keep the data available across refreshes and restarts

## Tech stack

- Backend: FastAPI, SQLAlchemy, SQLite, Pydantic
- Frontend: React, Vite, TypeScript
- AI: NVIDIA NIM with a Gemini-family model via the NVIDIA API, with a local deterministic fallback when no API key is configured

## How to run locally

### 1. Backend

```bash
cd ai-resume-screener/backend
cp .env.example .env
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install --prefer-binary -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend

```bash
cd ai-resume-screener/frontend
cp .env.example .env
npm install
npm run dev
```

## Environment variables

### Backend

Example values:

```env
PORT=8000
HOST=127.0.0.1
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:5173"]
DATABASE_URL=sqlite:///./ai_screener.db
NVIDIA_API_KEY=
NVIDIA_MODEL_NAME=google/gemma-2-27b-it
```

### Frontend

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## LLM used

The project uses NVIDIA NIM with the model `google/gemma-2-27b-it` for resume evaluation. If no NVIDIA API key is configured, the app falls back to a deterministic local scoring heuristic so the workflow still runs locally and remains usable for testing.

## Out of scope

- Authentication or user accounts
- Multi-tenant or multi-user workflows
- Production CI/CD deployment setup
- Pixel-perfect design work
- Exotic resume formats beyond clean PDF and TXT files

## Stretch goals (optional)

- Bulk-upload multiple resumes
- Re-score a candidate against another job
- Store the raw LLM prompt and response
- Add a scoring endpoint test with mocked LLM responses
- Stream AI summaries to the UI
- Dockerize the app

## What I would do with more time

- Improve prompt quality and scoring consistency
- Add better resume parsing for more file formats
- Add richer filtering, pagination, and analytics
- Improve the UI with more polished recruiter workflows
- Add end-to-end tests for the full screening experience

## Trade-offs

This version prioritizes clarity and completeness for an assignment over production-scale robustness. The implementation keeps the stack simple, uses SQLite for local persistence, and focuses on a readable, easy-to-run experience rather than enterprise-grade reliability or security features.

# Deployed app

Please use the below link to test the application
[App URL]: (https://ai-resume-screener-orpin.vercel.app/)