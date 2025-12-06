import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useEffect, useState } from 'react';

const client = generateClient<Schema>();

export function ProjectGallery() {
    const [projects, setProjects] = useState<Schema['Project']['type'][]>([]);

    useEffect(() => {
        // In a real scenario, this fetches from DynamoDB
        const fetchProjects = async () => {
            try {
                const { data: items } = await client.models.Project.list();
                setProjects(items);
            } catch (e) {
                console.error("Failed to fetch projects (Backend might not be deployed):", e);
            }
        };
        fetchProjects();
    }, []);

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Project Showcase</h2>
                {/* Admin Add button could go here */}
            </div>

            {projects.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--color-text-dim)' }}>
                        No projects loaded from DB. (If offline, ensure Backend is deployed or check console).
                    </p>
                    {/* Fallback mock for demo purposes if list is empty */}
                    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        <MockProjectCard title="Amplify Gen 2 App" desc="A powerful fullstack app built with AWS Amplify Gen 2." />
                        <MockProjectCard title="React AI Chatbot" desc="An intelligent agentic interface for personal portfolios." />
                        <MockProjectCard title="Portfolio 2025" desc="Next-gen personal website with 3D elements." />
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {projects.map(proj => (
                        <div key={proj.id} className="card">
                            {proj.imageUrl && <img src={proj.imageUrl} alt={proj.title || ''} style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />}
                            <h3>{proj.title}</h3>
                            <p style={{ color: 'var(--color-text-dim)' }}>{proj.description}</p>
                            {proj.demoUrl && <a href={proj.demoUrl} className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>View Demo</a>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MockProjectCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="card" style={{ textAlign: 'left' }}>
            <div style={{ width: '100%', height: '140px', background: 'linear-gradient(135deg, #1e293b, #334155)', borderRadius: '8px', marginBottom: '1rem' }}></div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{title}</h3>
            <p style={{ color: 'var(--color-text-dim)', fontSize: '0.9em' }}>{desc}</p>
        </div>
    );
}
