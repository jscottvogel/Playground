import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { useEffect, useState } from 'react';
import './ProjectGallery.css';

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
            <div className="gallery-header">
                <h2>Project Showcase</h2>
                {/* Admin Add button could go here */}
            </div>

            {projects.length === 0 ? (
                <div className="card gallery-empty">
                    <p className="gallery-text-dim">
                        No projects loaded from DB. (If offline, ensure Backend is deployed or check console).
                    </p>
                    {/* Fallback mock for demo purposes if list is empty */}
                    <div className="gallery-mock-grid">
                        <MockProjectCard title="Amplify Gen 2 App" desc="A powerful fullstack app built with AWS Amplify Gen 2." />
                        <MockProjectCard title="React AI Chatbot" desc="An intelligent agentic interface for personal portfolios." />
                        <MockProjectCard title="Portfolio 2025" desc="Next-gen personal website with 3D elements." />
                    </div>
                </div>
            ) : (
                <div className="gallery-grid">
                    {projects.map(proj => (
                        <div key={proj.id} className="card">
                            {proj.imageUrl && <img src={proj.imageUrl} alt={proj.title || ''} className="project-img" />}
                            <h3>{proj.title}</h3>
                            <p className="gallery-text-dim">{proj.description}</p>
                            {proj.demoUrl && <a href={proj.demoUrl} className="btn btn-primary project-btn-demo">View Demo</a>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MockProjectCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="card mock-card">
            <div className="mock-img-placeholder"></div>
            <h3 className="mock-title">{title}</h3>
            <p className="mock-desc">{desc}</p>
        </div>
    );
}
