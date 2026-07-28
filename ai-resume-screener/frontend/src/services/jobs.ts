const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  return response.json() as Promise<T>;
}

export const jobsService = {
  listJobs() {
    return request('/jobs');
  },
  createJob(payload: { title: string; description: string }) {
    return request('/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
  uploadResume(jobId: string, file: File) {
    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('file', file);

    return fetch(`${API_BASE_URL}/resumes/upload`, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Resume upload failed');
      }
      return response.json();
    });
  },
};
