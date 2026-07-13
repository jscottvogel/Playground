import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import './ContactOptions.css';

const client = generateClient<Schema>();

export function ContactOptions() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setStatus(null);

        try {
            const { errors } = await client.models.GuestVisit.create({
                email: email,
                visitedAt: new Date().toISOString()
            });

            if (errors) {
                setStatus({ type: 'error', message: 'Failed to submit email. Please try again.' });
            } else {
                setStatus({ type: 'success', message: 'Thanks! We will reach out shortly.' });
                setEmail('');
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="contact-section">
            <div className="card contact-card animate-fade-in">
                <h2 className="contact-title">Connect with the Lab</h2>
                <p className="contact-subtitle">"Dream it. Build it. Deploy it. Improve it."</p>
                <p className="contact-desc">
                    Ready to build custom SaaS systems, automate with AI, or consult on cloud infrastructure? Choose your preferred route to collaborate.
                </p>

                <div className="contact-grid">
                    {/* Left: Lead Capture Form */}
                    <div className="contact-form-container">
                        <h3>Drop Your Email</h3>
                        <p className="contact-form-hint">We'll follow up within 24 hours to schedule a project discovery call.</p>
                        <form onSubmit={handleSubmit} className="contact-form">
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                {loading ? 'Request Info' : 'Request Info'}
                            </button>
                        </form>
                        {status && (
                            <div className={`contact-status ${status.type}`}>
                                {status.message}
                            </div>
                        )}
                    </div>

                    {/* Right: Alternative CTAs */}
                    <div className="contact-actions-container">
                        <div className="contact-cta-option">
                            <h3>Direct Booking</h3>
                            <p>Instantly grab a 15-minute slot on our calendar for a technical consultation.</p>
                            <a
                                href="https://calendly.com"
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-block text-center-link"
                                style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                            >
                                Book Consultation 📅
                            </a>
                        </div>

                        <div className="contact-cta-option" style={{ marginTop: '1.5rem' }}>
                            <h3>Interactive Inquiry</h3>
                            <p>Ask LabAssistant in the chat widget directly about our pricing or stack.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
