import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useEffect, useState } from 'react';
import './ProjectGallery.css';
import { GalleryLogger } from '../../services/Logger';
import { ProjectDetailsModal } from './ProjectDetailsModal';

/**
 * Interface for the Amplify Data Client
 */
const client = generateClient<Schema>();

/**
 * ProjectGallery Component
 * 
 * Displays the portfolio projects to authenticated users.
 * Fetches data from the backend and renders it in a responsive grid.
 */
export function ProjectGallery() {
    const [projects, setProjects] = useState<Schema['Project']['type'][]>([]);
    const [selectedProject, setSelectedProject] = useState<Schema['Project']['type'] | null>(null);

    /**
     * Fetches all projects from the database.
     * Note: This view allows read access to all authenticated users.
     */
    const fetchProjects = async () => {
        GalleryLogger.debug('Fetching list of projects...');
        try {
            // Fetch all projects, then filter for active ones.
            // (Ideally done via filter in list() if supported, but client-side filter is safe for small datasets)
            const { data: items } = await client.models.Project.list();
            const activeItems = items.filter(p => p.isActive !== false); // Default is true, handle null/undefined as true or explicit false

            GalleryLogger.info(`Fetched ${items.length} projects (${activeItems.length} active).`);
            setProjects(activeItems);
        } catch (e) {
            GalleryLogger.error("Failed to fetch projects (Backend might not be deployed):", e);
        }
    };

    // Load projects on mount
    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="gallery-header">
                <h2>Lab Experiments</h2>
                <p className="gallery-tagline">"From ideas to products"</p>
                <p className="gallery-desc">
                    We build, test, and incubate experimental prototypes to transform them into production SaaS products.
                </p>
            </div>

            {/* Empty State */}
            {projects.length === 0 ? (
                <div className="card gallery-empty">
                    <p className="gallery-text-dim">
                        No experiments found.
                    </p>
                </div>
            ) : (
                /* Project Grid */
                <div className="gallery-grid">
                    {projects.map(proj => {
                        const isWeddingApp = proj.title?.toLowerCase().includes('wedding');
                        return (
                            <div key={proj.id} className="card project-card">
                                <div className="badge-container">
                                    {isWeddingApp ? (
                                        <span className="badge-featured">Target Launch: Aug 31, 2026</span>
                                    ) : (
                                        <span className="badge-prototype">Experimental Prototype</span>
                                    )}
                                </div>
                            {proj.imageUrl && <img src={proj.imageUrl} alt={proj.title || ''} className="project-img" />}
                            {proj.demoUrl ? (
                                <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="project-title-link">
                                    <h3>{proj.title}</h3>
                                </a>
                            ) : (
                                <h3>{proj.title}</h3>
                            )}
                            <p className="gallery-text-dim" style={{ margin: '0.5rem 0', minHeight: '3rem' }}>
                                {proj.description}
                            </p>

                            {/* Skills Tags */}
                            {proj.skills && proj.skills.length > 0 && (
                                <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                                    {proj.skills.filter(s => s).map((opt, i) => (
                                        <span key={i} style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            color: 'var(--color-primary)'
                                        }}>
                                            {opt}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Action Links */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                <button onClick={() => setSelectedProject(proj)} className="btn btn-primary" style={{ flex: '1 1 auto' }}>
                                    View Case Study ↗
                                </button>
                                {proj.demoUrl && (
                                    <a href={proj.demoUrl} className="btn" target='_blank' rel='noreferrer' style={{ padding: '0.6em 0.8em' }}>Demo</a>
                                )}
                            </div>
                        </div>
                    );
                })}
                </div>
            )}

            {/* Project Details Modal */}
            {selectedProject && (
                <ProjectDetailsModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </div>
    );
}
