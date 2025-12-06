import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useAuthenticator } from '@aws-amplify/ui-react';
import './AdminDashboard.css';

const client = generateClient<Schema>();

export function AdminDashboard() {
    const { user } = useAuthenticator((context) => [context.user]);

    // Form State
    const [id, setId] = useState<string | null>(null); // If set, we are editing
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [demoUrl, setDemoUrl] = useState('');
    const [gitUrl, setGitUrl] = useState('');
    const [skills, setSkills] = useState('');

    // UI State
    const [projects, setProjects] = useState<Schema['Project']['type'][]>([]);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data: items } = await client.models.Project.list();
            setProjects(items);
        } catch (e) {
            console.error("Failed to fetch projects:", e);
        }
    };

    const handleEdit = (proj: Schema['Project']['type']) => {
        setId(proj.id);
        setTitle(proj.title || '');
        setDescription(proj.description || '');
        setImageUrl(proj.imageUrl || '');
        setDemoUrl(proj.demoUrl || '');
        setGitUrl(proj.gitUrl || '');
        setSkills(proj.skills ? proj.skills.join(', ') : '');
        setStatus(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setId(null);
        setTitle('');
        setDescription('');
        setImageUrl('');
        setDemoUrl('');
        setGitUrl('');
        setSkills('');
        setStatus(null);
    };

    const handleDelete = async (idToDelete: string) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;

        try {
            await client.models.Project.delete({ id: idToDelete });
            setStatus({ type: 'success', message: 'Project deleted.' });
            fetchProjects();
            if (id === idToDelete) handleCancelEdit();
        } catch (e: any) {
            setStatus({ type: 'error', message: `Delete failed: ${e.message}` });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
            const projectData = {
                title,
                description,
                imageUrl,
                demoUrl,
                gitUrl,
                skills: skillsArray
            };

            if (id) {
                // Update
                const { errors } = await client.models.Project.update({
                    id,
                    ...projectData
                });
                if (errors) throw new Error(errors[0].message);
                setStatus({ type: 'success', message: 'Project updated successfully!' });
            } else {
                // Create
                const { errors } = await client.models.Project.create(projectData);
                if (errors) throw new Error(errors[0].message);
                setStatus({ type: 'success', message: 'Project created successfully!' });
            }

            // Reset form if create, but maybe keep for edit flow? Let's reset.
            handleCancelEdit();
            fetchProjects();
        } catch (err: any) {
            console.error('Error saving project:', err);
            setStatus({ type: 'error', message: `Failed to save project: ${err.message || err}` });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="admin-dashboard"><p>Please sign in to access the Admin Dashboard.</p></div>;
    }

    return (
        <div className="admin-dashboard animate-fade-in">
            <div className="admin-header">
                <h2>Admin Dashboard</h2>
                <p>Manage portfolio projects.</p>
            </div>

            {status && (
                <div className={`admin-message ${status.type}`}>
                    {status.message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Form Section */}
                <div>
                    <h3>{id ? 'Edit Project' : 'Add New Project'}</h3>
                    <form className="card admin-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Project Title</label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* URLs */}
                        {['imageUrl', 'demoUrl', 'gitUrl'].map(field => (
                            <div className="form-group" key={field}>
                                <label htmlFor={field}>{field === 'gitUrl' ? 'GitHub URL' : field.replace('Url', ' URL')}</label>
                                <input
                                    id={field}
                                    type="url"
                                    value={field === 'imageUrl' ? imageUrl : field === 'demoUrl' ? demoUrl : gitUrl}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (field === 'imageUrl') setImageUrl(val);
                                        if (field === 'demoUrl') setDemoUrl(val);
                                        if (field === 'gitUrl') setGitUrl(val);
                                    }}
                                />
                            </div>
                        ))}

                        <div className="form-group">
                            <label htmlFor="skills">Skills (comma separated)</label>
                            <input
                                id="skills"
                                type="text"
                                value={skills}
                                onChange={e => setSkills(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                                {loading ? 'Saving...' : (id ? 'Update Project' : 'Create Project')}
                            </button>
                            {id && (
                                <button type="button" className="btn" onClick={handleCancelEdit} style={{ marginTop: '1rem' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List Section */}
                <div>
                    <h3>Existing Projects</h3>
                    <div className="admin-project-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {projects.map(proj => (
                            <div key={proj.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: 0 }}>{proj.title}</h4>
                                    <small style={{ color: 'var(--color-text-dim)' }}>{proj.id.substring(0, 8)}...</small>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(proj)} className="btn" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(proj.id)} className="btn" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid #b91c1c' }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {projects.length === 0 && <p style={{ color: 'var(--color-text-dim)' }}>No projects found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
