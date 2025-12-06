import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useEffect, useState } from 'react';
import './ProjectGallery.css';

const client = generateClient<Schema>();

const seedData = [
    {
        title: 'Solutions (This Project)',
        description: 'A personal portfolio and solutions lab built with React, AWS Amplify Gen 2, and AI.',
        imageUrl: 'https://via.placeholder.com/400x200', // Placeholder
        demoUrl: window.location.origin,
        gitUrl: 'https://github.com/jscottvogel/Playground.git'
    },
    {
        title: 'Amplify Gen 2 Chatbot',
        description: 'Intelligent conversational agent integrating with backend systems.',
        imageUrl: 'https://via.placeholder.com/400x200',
        demoUrl: '#',
        gitUrl: '#'
    },
    {
        title: 'React 3D Portfolio',
        description: 'Next-gen personal website with interactive 3D elements using Three.js.',
        imageUrl: 'https://via.placeholder.com/400x200',
        demoUrl: '#',
        gitUrl: '#'
    }
];

export function ProjectGallery() {
    const [projects, setProjects] = useState<Schema['Project']['type'][]>([]);
    const [seeding, setSeeding] = useState(false);

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

    const handleSeed = async () => {
        setSeeding(true);
        try {
            for (const p of seedData) {
                const { errors } = await client.models.Project.create(p);
                if (errors) throw new Error(errors[0].message);
            }
            fetchProjects();
        } catch (e: any) {
            console.error("Seeding failed:", e);
            alert(`Failed to seed database: ${e.message || e}`);
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="gallery-header">
                <h2>Project Showcase</h2>
                <button
                    className="btn"
                    onClick={handleSeed}
                    disabled={seeding || projects.length > 0}
                    style={{ fontSize: '0.8rem', opacity: projects.length > 0 ? 0.5 : 1 }}
                >
                    {seeding ? 'Seeding...' : 'Seed Database'}
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="card gallery-empty">
                    <p className="gallery-text-dim">
                        No projects loaded from DB. Click "Seed Database" to add initial data.
                    </p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {projects.map(proj => (
                        <div key={proj.id} className="card">
                            {proj.imageUrl && <img src={proj.imageUrl} alt={proj.title || ''} className="project-img" />}
                            <h3>{proj.title}</h3>
                            <p className="gallery-text-dim">{proj.description}</p>
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

