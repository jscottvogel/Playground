import type { Schema } from '../../../amplify/data/resource';
import './ProjectDetailsModal.css';

interface ProjectDetailsModalProps {
    project: Schema['Project']['type'];
    onClose: () => void;
}

export function ProjectDetailsModal({ project, onClose }: ProjectDetailsModalProps) {
    const isWeddingApp = project.title?.toLowerCase().includes('wedding');
    const isScottBot = project.title?.toLowerCase().includes('bot') || project.title?.toLowerCase().includes('chat');
    
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

                    {project.skills && project.skills.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
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
