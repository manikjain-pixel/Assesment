import { useState } from 'react';
import { api } from '../services/api';
import { useToast } from './ui/ToastProvider';

type JobFormProps = {
    onSuccess?: () => void;
};

export function JobForm({ onSuccess }: JobFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requiredSkills, setRequiredSkills] = useState('');
    const [minExperience, setMinExperience] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ title?: string; description?: string; minExperience?: string }>({});
    const { showToast } = useToast();

    const validateForm = () => {
        const nextErrors: { title?: string; description?: string; minExperience?: string } = {};

        if (!title.trim()) {
            nextErrors.title = 'Title is required.';
        } else if (title.trim().length < 3) {
            nextErrors.title = 'Title must be at least 3 characters long.';
        }

        if (!description.trim()) {
            nextErrors.description = 'Description is required.';
        } else if (description.trim().length < 10) {
            nextErrors.description = 'Description must be at least 10 characters long.';
        }

        if (minExperience) {
            const experienceValue = Number(minExperience);
            if (Number.isNaN(experienceValue) || experienceValue < 0) {
                nextErrors.minExperience = 'Minimum experience must be a non-negative number.';
            }
        }

        setFieldErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!validateForm()) {
            const firstError = Object.values(fieldErrors)[0] || 'Please fix the highlighted fields.';
            setError(firstError);
            showToast(firstError, 'error');
            return;
        }

        setLoading(true);

        try {
            await api.createJob({
                title: title.trim(),
                description: description.trim(),
                required_skills: requiredSkills || null,
                min_experience: minExperience ? Number(minExperience) : null,
            });
            setTitle('');
            setDescription('');
            setRequiredSkills('');
            setMinExperience('');
            setFieldErrors({});
            showToast('Job created successfully.', 'success');
            onSuccess?.();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to create job';
            setError(message);
            showToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">Title</label>
                <input
                    value={title}
                    onChange={(event) => {
                        setTitle(event.target.value);
                        if (fieldErrors.title) {
                            setFieldErrors((current) => ({ ...current, title: undefined }));
                        }
                    }}
                    required
                    className={`w-full rounded-xl border bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0 ${fieldErrors.title ? 'border-rose-500' : 'border-slate-700'}`}
                    placeholder="Senior Backend Engineer"
                />
                {fieldErrors.title ? <p className="text-sm text-rose-400">{fieldErrors.title}</p> : null}
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">Description</label>
                <textarea
                    value={description}
                    onChange={(event) => {
                        setDescription(event.target.value);
                        if (fieldErrors.description) {
                            setFieldErrors((current) => ({ ...current, description: undefined }));
                        }
                    }}
                    required
                    rows={4}
                    className={`w-full rounded-xl border bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0 ${fieldErrors.description ? 'border-rose-500' : 'border-slate-700'}`}
                    placeholder="Describe the role and expectations"
                />
                {fieldErrors.description ? <p className="text-sm text-rose-400">{fieldErrors.description}</p> : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Required skills</label>
                    <input
                        value={requiredSkills}
                        onChange={(event) => setRequiredSkills(event.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0"
                        placeholder="Python, FastAPI, SQL"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Minimum experience</label>
                    <input
                        type="number"
                        min="0"
                        value={minExperience}
                        onChange={(event) => {
                            setMinExperience(event.target.value);
                            if (fieldErrors.minExperience) {
                                setFieldErrors((current) => ({ ...current, minExperience: undefined }));
                            }
                        }}
                        className={`w-full rounded-xl border bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0 ${fieldErrors.minExperience ? 'border-rose-500' : 'border-slate-700'}`}
                        placeholder="3"
                    />
                    {fieldErrors.minExperience ? <p className="text-sm text-rose-400">{fieldErrors.minExperience}</p> : null}
                </div>
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <div className="flex justify-center">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60 m-auto"
                >
                    {loading ? 'Creating...' : 'Create job'}
                </button>
            </div>
        </form>
    );
}
