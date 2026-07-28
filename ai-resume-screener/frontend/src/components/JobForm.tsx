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
    const { showToast } = useToast();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.createJob({
                title,
                description,
                required_skills: requiredSkills || null,
                min_experience: minExperience ? Number(minExperience) : null,
            });
            setTitle('');
            setDescription('');
            setRequiredSkills('');
            setMinExperience('');
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
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0"
                    placeholder="Senior Backend Engineer"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">Description</label>
                <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                    rows={4}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0"
                    placeholder="Describe the role and expectations"
                />
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
                        onChange={(event) => setMinExperience(event.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0"
                        placeholder="3"
                    />
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
