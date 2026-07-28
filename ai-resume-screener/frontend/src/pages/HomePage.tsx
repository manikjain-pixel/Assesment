import { Link } from 'react-router-dom';
import './HomePage.css'; // Import the new CSS file

export function HomePage() {
  return (
    <main className="home-container">
      <section className="hero-card">
        <p className="subtitle">Assignment Project</p>
        <h1 className="title">AI Resume Screener</h1>
        <p className="description">
          This project was built to demonstrate a full-stack AI-assisted hiring workflow. It lets a recruiter create jobs, upload resumes, evaluate them with AI, and review ranked candidates in a clean dashboard.
        </p>
        <div className="action-wrapper">
          <Link to="/jobs" className="btn-primary">
            Open Jobs
          </Link>
        </div>
      </section>

      <section className="info-grid">
        <div className="info-card">
          <h2 className="card-heading">What the app does</h2>
          <ul className="info-list">
            <li>Create jobs with title, description, required skills, and minimum experience.</li>
            <li>Upload resumes in PDF or TXT format and extract text on the server.</li>
            <li>Evaluate each resume against the job using AI-generated structured scoring.</li>
            <li>View ranked candidates with score, recommendation, and matched or missing skills.</li>
          </ul>
        </div>
        
        <div className="info-card">
          <h2 className="card-heading">Assignment scope</h2>
          <ul className="info-list">
            <li>Backend API for jobs, candidates, and evaluation storage.</li>
            <li>SQLite persistence so data survives restarts.</li>
            <li>Frontend experience for creating jobs and reviewing screening results.</li>
            <li>Graceful handling of AI response issues and validation failures.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
