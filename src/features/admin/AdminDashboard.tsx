import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useAuthenticator } from '@aws-amplify/ui-react';
import './AdminDashboard.css';
import { AdminLogger } from '../../services/Logger';

/**
 * Interface definition for the Amplify Data Client
 * Using 'userPool' auth mode to ensure we use the authenticated user's credentials for mutations.
 */
const client = generateClient<Schema>({ authMode: 'userPool' });

/**
 * AdminDashboard Component
 * 
 * Provides a protected interface for Administrators to manage the portfolio content.
 * Features:
 * - List all existing projects
 * - Create new projects
 * - Edit existing projects
 * - Delete projects
 */
export function AdminDashboard() {
    // Access the current authenticated user to ensure permissions
    const { user } = useAuthenticator((context) => [context.user]);

    // --- Form State Management ---
    // 'id' determines if we are in 'Create' (null) or 'Edit' (string) mode
    const [id, setId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [demoUrl, setDemoUrl] = useState('');
    const [gitUrl, setGitUrl] = useState('');
    const [skills, setSkills] = useState('');

    // --- UI State Management ---
    const [projects, setProjects] = useState<Schema['Project']['type'][]>([]);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Initial data fetch on component mount
    useEffect(() => {
        fetchProjects();
    }, []);

    /**
     * READ: Fetches the list of all projects from the database.
     */
    const fetchProjects = async () => {
        AdminLogger.debug('Fetching projects...');
        try {
            const { data: items } = await client.models.Project.list();
            AdminLogger.info(`Successfully fetched ${items.length} projects.`);
            setProjects(items);
        } catch (e) {
            AdminLogger.error("Failed to fetch projects:", e);
        }
    };

    /**
     * Prepares the form for editing a specific project.
     * Populates all state variables with the project's current data.
     * @param proj - The project to edit
     */
    const handleEdit = (proj: Schema['Project']['type']) => {
        AdminLogger.debug(`Edit requested for project ID: ${proj.id}`);
        setId(proj.id);
        setTitle(proj.title || '');
        setDescription(proj.description || '');
        setImageUrl(proj.imageUrl || '');
        setDemoUrl(proj.demoUrl || '');
        setGitUrl(proj.gitUrl || '');
        setSkills(proj.skills ? proj.skills.join(', ') : '');
        setStatus(null); // Clear previous messages
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
    };

    /**
     * Resets the form to its default "Add New" state.
     * Clears all input fields and the 'id' state.
     */
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

    /**
     * DELETE: Removes a project from the database.
     * Includes a confirmation step to prevent accidental deletions.
     * @param idToDelete - The unique identifier of the project to remove
     */
    const handleDelete = async (idToDelete: string) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;

        AdminLogger.info(`Deleting project ID: ${idToDelete}`);
        try {
            await client.models.Project.delete({ id: idToDelete });
            AdminLogger.info('Project deleted successfully.');
            setStatus({ type: 'success', message: 'Project deleted.' });
            fetchProjects(); // Refresh list
            // If the deleted project was currently being edited, reset the form.
            if (id === idToDelete) handleCancelEdit();
        } catch (e: any) {
            AdminLogger.error('Delete failed:', e);
            setStatus({ type: 'error', message: `Delete failed: ${e.message}` });
        }
    };

    /**
     * CREATE & UPDATE: Handles form submission.
     * Determines whether to create a new project or update an existing one based on 'id'.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        AdminLogger.debug(`Submitting form. Mode: ${id ? 'Edit' : 'Create'}`);

        try {
            // Transform comma-separated string into Array<string> for backend
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
                // UPDATE Existing Project
                AdminLogger.info(`Updating project ${id} with data:`, projectData);
                const { errors } = await client.models.Project.update({
                    id,
                    ...projectData
                });
                if (errors) throw new Error(errors[0].message);
                AdminLogger.info('Update successful.');
                setStatus({ type: 'success', message: 'Project updated successfully!' });
            } else {
                // CREATE New Project
                AdminLogger.info('Creating new project with data:', projectData);
                const { errors } = await client.models.Project.create(projectData);
                if (errors) throw new Error(errors[0].message);
                AdminLogger.info('Creation successful.');
                setStatus({ type: 'success', message: 'Project created successfully!' });
            }

            handleCancelEdit(); // Reset form
            fetchProjects(); // Refresh list to show changes
        } catch (err: any) {
            AdminLogger.error('Error saving project:', err);
            setStatus({ type: 'error', message: `Failed to save project: ${err.message || err}` });
        } finally {
            setLoading(false);
        }
    };

    // Should not happen if wrapped in Authenticator, but good safety check
    if (!user) {
        return <div className="admin-dashboard"><p>Please sign in to access the Admin Dashboard.</p></div>;
    }

    return (
        <div className="admin-dashboard animate-fade-in">
            <div className="admin-header">
                <h2>Admin Dashboard</h2>
                <p>Manage portfolio projects.</p>
            </div>

            {/* Status Message Area */}
            {status && (
                <div className={`admin-message ${status.type}`}>
                    {status.message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* LEFT COLUMN: List of Existing Projects */}
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

                {/* RIGHT COLUMN: Create / Edit Form */}
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

                        {/* URL Fields Loop */}
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
            </div>
        </div>
    );
}
