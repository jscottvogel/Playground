import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

interface GuestGatewayProps {
    onAccessGranted: (email: string) => void;
    onLoginRequest: () => void;
}

export function GuestGateway({ onAccessGranted, onLoginRequest }: GuestGatewayProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGuestAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            // In a real scenario with deployed backend, this would save to DynamoDB
            const { errors } = await client.models.GuestVisit.create({
                email: email,
                visitedAt: new Date().toISOString() // Fixed: Using string for datetime as per typical GraphQL expectations unless mapped differently
            });

            if (errors) {
                console.error('Error saving guest:', errors);
                // We might allow them through anyway if it's just a backend error, 
                // but let's notify. For now, assuming successful "intent" is enough to view the bot
            }

            onAccessGranted(email);
        } catch (err) {
            console.error('Exception saving guest:', err);
            // Fallback for "Option 1" where backend might be missing permissions/existence
            // We still let them through for the UI demo
            onAccessGranted(email);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gateway-container animate-fade-in" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh'
        }}>
            <h1 style={{ marginBottom: '2rem' }}>Vogel Solutions Lab</h1>

            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ marginTop: 0 }}>Who are you?</h2>
                <p style={{ color: 'var(--color-text-dim)', marginBottom: '1.5rem' }}>
                    Please provide your email to chat with the bot as a guest.
                </p>

                <form onSubmit={handleGuestAccess}>
                    <input
                        type="email"
                        placeholder="enter@email.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        disabled={loading}
                    />
                    {error && <p style={{ color: '#ef4444', fontSize: '0.9em', marginTop: '-0.5rem', marginBottom: '1rem' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Entering...' : 'Continue as Guest'}
                    </button>
                </form>

                <div style={{ margin: '1.5rem 0', height: '1px', background: 'var(--color-border)' }}></div>

                <button className="btn" style={{ width: '100%' }} onClick={onLoginRequest}>
                    Member Sign In / Sign Up
                </button>
            </div>
        </div>
    );
}
