import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import './GuestGateway.css';

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
                visitedAt: new Date().toISOString()
            });

            if (errors) {
                console.error('Error saving guest:', errors);
            }

            onAccessGranted(email);
        } catch (err) {
            console.error('Exception saving guest:', err);
            onAccessGranted(email);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gateway-container animate-fade-in">
            <h1 className="gateway-title">Vogel Solutions Lab</h1>

            <div className="card gateway-card">
                <h2 className="gateway-subtitle">Who are you?</h2>
                <p className="gateway-text">
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
                    {error && <p className="gateway-error">{error}</p>}

                    <button type="submit" className="btn btn-primary gateway-btn-submit" disabled={loading}>
                        {loading ? 'Entering...' : 'Continue as Guest'}
                    </button>
                </form>

                <div className="gateway-divider"></div>

                <button className="btn gateway-btn-auth" onClick={onLoginRequest}>
                    Member Sign In / Sign Up
                </button>
            </div>
        </div>
    );
}
