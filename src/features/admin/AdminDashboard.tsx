import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useAuthenticator } from '@aws-amplify/ui-react';
import './AdminDashboard.css';

const client = generateClient<Schema>();

export function AdminDashboard() {
    const { user } = useAuthenticator((context) => [context.user]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [demoUrl, setDemoUrl] = useState('');
    const [gitUrl, setGitUrl] = useState('');
    const [skills, setSkills] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            // Process skills from comma-separated string to array
            const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

            const result = await client.models.Project.create({
                title,
                description,
                imageUrl,
                demoUrl,
                gitUrl,
                skills: skillsArray
            });

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            setStatus({ type: 'success', message: 'Project created successfully!' });
            // Clear form
            setTitle('');
            setDescription('');
            setImageUrl('');
            setDemoUrl('');
            setGitUrl('');
            setSkills('');
        } catch (err: any) {
            console.error('Error creating project:', err);
            setStatus({ type: 'error', message: `Failed to create project: ${err.message || err}` });
        } finally {
            setLoading(false);
        }
    };

    // Basic access check (frontend only, backend has real enforcement)
    // Note: useAuthenticator returns user object, but checking groups can differ based on token parsing.
    // Ideally we inspect user.signInUserSession.accessToken.payload['cognito:groups']
    // For now, we allow any signed-in user to see the form, but submission will fail if not Admin.

    if (!user) {
        return <div className="admin-dashboard"><p>Please sign in to access the Admin Dashboard.</p></div>;
    }

    return (
        <div className="admin-dashboard animate-fade-in">
            <div className="admin-header">
                <h2>Admin Dashboard</h2>
                <p>Add new projects to the portfolio.</p>
            </div>

            {status && (
                <div className={`admin-message ${status.type}`}>
                    {status.message}
                </div>
            )}

            <form className="card admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Project Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        placeholder="e.g. My Awesome App"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        placeholder="Brief overview of the project..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="imageUrl">Image URL</label>
                    <input
                        id="imageUrl"
                        type="url"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        placeholder="https://..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="demoUrl">Live Demo URL</label>
                    <input
                        id="demoUrl"
                        type="url"
                        value={demoUrl}
                        onChange={e => setDemoUrl(e.target.value)}
                        placeholder="https://..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="gitUrl">GitHub Repository URL</label>
                    <input
                        id="gitUrl"
                        type="url"
                        value={gitUrl}
                        onChange={e => setGitUrl(e.target.value)}
                        placeholder="https://github.com/..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="skills">Skills / Technologies</label>
                    <input
                        id="skills"
                        type="text"
                        value={skills}
                        onChange={e => setSkills(e.target.value)}
                        placeholder="React, AWS, TypeScript (comma separated)"
                    />
                    <div className="form-hint">Separate multiple skills with commas</div>
                </div>

                <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Project'}
                </button>
            </form>
        </div>
    );
}
