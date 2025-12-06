import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useEffect, useState } from 'react';
import './ProjectGallery.css';

const client = generateClient<Schema>();



export function ProjectGallery() {
    const [projects, setProjects] = useState<Schema['Project']['type'][]>([]);

    const fetchProjects = async () => {
        try {
            const { data: items } = await client.models.Project.list();
            setProjects(items);
        } catch (e) {
            console.error("Failed to fetch projects (Backend might not be deployed):", e);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="gallery-header">
                <h2>Project Showcase</h2>
            </div>

            {projects.length === 0 ? (
                <div className="card gallery-empty">
                    <p className="gallery-text-dim">
                        No projects found.
                    </p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {projects.map(proj => (
                        <div key={proj.id} className="card">
                            {proj.imageUrl && <img src={proj.imageUrl} alt={proj.title || ''} className="project-img" />}
                            <h3>{proj.title}</h3>
                            <p className="gallery-text-dim">{proj.description}</p>

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

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                {proj.demoUrl && <a href={proj.demoUrl} className="btn btn-primary project-btn-demo" target='_blank' rel='noreferrer'>Live Demo</a>}
                                {proj.gitUrl && <a href={proj.gitUrl} className="btn" style={{ textDecoration: 'none' }} target='_blank' rel='noreferrer'>GitHub</a>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

