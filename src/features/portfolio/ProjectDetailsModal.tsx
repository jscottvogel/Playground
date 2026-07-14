import { useState } from 'react';
import type { Schema } from '../../../amplify/data/resource';
import { getCaseStudy } from './caseStudies';
import './ProjectDetailsModal.css';

interface ProjectDetailsModalProps {
    project: Schema['Project']['type'];
    onClose: () => void;
}

export function ProjectDetailsModal({ project, onClose }: ProjectDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<'casestudy' | 'overview'>('casestudy');
    
    const isWeddingApp = project.title?.toLowerCase().includes('wedding');
    const isScottBot = project.title?.toLowerCase().includes('bot') || project.title?.toLowerCase().includes('chat');
    
    const caseStudy = getCaseStudy(project.title || '');

    // Dynamic architecture details based on project type
    const getTechDetails = () => {
        if (isWeddingApp) {
            return {
                architecture: "Next.js frontend hosted on AWS Amplify, coupled with Cognito User Pools for secure guest RSVP authentication. S3 storage drives photo-sharing buckets, while AWS Lambda processes automated notifications.",
                challenge: "Securing image uploads and RSVP data for guest users without requiring them to go through a complex registration flow.",
                solution: "Leveraged Amplify Gen 2 passwordless guest session tokens mapped to temporary IAM credentials for secure guest read/write paths."
            };
        } else if (isScottBot) {
            return {
                architecture: "Bedrock Agent interface utilizing Claude 3.5 Sonnet. User queries are validated via AppSync GraphQL API, processed in a timeout-resilient Lambda handler, and passed to Bedrock Knowledge Bases.",
                challenge: "Preventing model hallucinations while ensuring prompt answers about specific developer details remain highly accurate.",
                solution: "Configured retrieval-augmented generation (RAG) mapped directly to structured JSON resumes and project schemas."
            };
        } else {
            return {
                architecture: "Amplify Gen 2 backend schema storing live state data in Amazon DynamoDB. Frontend built using React + Vite, deployed globally via AWS Amplify hosting pipelines.",
                challenge: "Keeping database operations responsive and managing token authentication securely for public and admin operations.",
                solution: "Implemented discrete publicApiKey and authenticated cognito group rules on GraphQL models for granular access control."
            };
        }
    };

    const techInfo = getTechDetails();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="card modal-content-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{project.title}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {/* Status Badge */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        {isWeddingApp ? (
                            <span className="badge-featured">Incubator Target Launch: Aug 31, 2026</span>
                        ) : (
                            <span className="badge-prototype">Experimental Prototype</span>
                        )}
                    </div>

                    {project.imageUrl && (
                        <img src={project.imageUrl} alt={project.title || ''} className="modal-image" />
                    )}

                    {/* Tab Navigation */}
                    <div className="modal-tabs-container">
                        <button 
                            className={`modal-tab-btn ${activeTab === 'casestudy' ? 'active' : ''}`}
                            onClick={() => setActiveTab('casestudy')}
                        >
                            📖 Case Study
                        </button>
                        <button 
                            className={`modal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            ⚙️ Tech Specs
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'casestudy' && caseStudy ? (
                        <div className="case-study-content animate-fade-in">
                            <div className="case-study-section">
                                <h3>Executive Summary</h3>
                                <p>{caseStudy.overview}</p>
                            </div>
                            <div className="case-study-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                                <div className="case-study-section">
                                    <h3>The Challenge</h3>
                                    <p>{caseStudy.challenge}</p>
                                </div>
                                <div className="case-study-section">
                                    <h3>The Solution</h3>
                                    <p>{caseStudy.solution}</p>
                                </div>
                                <div className="case-study-section">
                                    <h3>Results & Business Value</h3>
                                    <p>{caseStudy.results}</p>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'casestudy' ? (
                        <div className="case-study-empty animate-fade-in" style={{ padding: '2rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--color-text-dim)' }}>No formal case study generated for this prototype.</p>
                        </div>
                    ) : null}

                    {activeTab === 'overview' && (
                        <div className="tech-overview-content animate-fade-in">
                            <div className="modal-desc-box">
                                <h3>Concept Description</h3>
                                <p>{project.description}</p>
                            </div>

                            <div className="modal-details-grid">
                                <div className="modal-detail-section">
                                    <h4>Under the Hood</h4>
                                    <p>{techInfo.architecture}</p>
                                </div>

                                <div className="modal-detail-section">
                                    <h4>The Challenge</h4>
                                    <p>{techInfo.challenge}</p>
                                </div>

                                <div className="modal-detail-section">
                                    <h4>The Solution</h4>
                                    <p>{techInfo.solution}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {project.skills && project.skills.length > 0 && (
                        <div style={{ marginTop: '2rem' }}>
                            <h4>Technologies Used</h4>
                            <div className="modal-skills">
                                {project.skills.filter(s => s).map((s, idx) => (
                                    <span key={idx} className="modal-skill-tag">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {project.demoUrl ? (
                        <a href={project.demoUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                            Explore Live Demo ↗
                        </a>
                    ) : (
                        <button className="btn" disabled>No Live Demo Available</button>
                    )}
                    {project.gitUrl && (
                        <a href={project.gitUrl} target="_blank" rel="noreferrer" className="btn">
                            View GitHub Code
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
