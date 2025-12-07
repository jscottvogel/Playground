import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import './GuestGateway.css';

/**
 * Interface for the Amplify Data Client
 */
const client = generateClient<Schema>();

interface GuestGatewayProps {
    /** Callback to grant access as a guest with the provided email */
    onAccessGranted: (email: string) => void;
    /** Callback to trigger the authentication flow */
    onLoginRequest: () => void;
}

/**
 * GuestGateway Component
 * 
 * The default landing "gate" for the application.
 * Identifies the user as either a Guest (via email) or an authenticated Member.
 */
export function GuestGateway({ onAccessGranted, onLoginRequest }: GuestGatewayProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Handles the Guest "Sign In" process.
     * Validates email, records the visit in the database, and grants access.
     */
    const handleGuestAccess = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            // Record the guest visit in DynamoDB
            // Note: Permissions allow public create but not read/update/delete on this model
            const { errors } = await client.models.GuestVisit.create({
                email: email,
                visitedAt: new Date().toISOString()
            });

            if (errors) {
                console.error('Error saving guest:', errors);
                // We typically allow access even if logging fails, but logging error is good.
            }

            onAccessGranted(email);
        } catch (err) {
            console.error('Exception saving guest:', err);
            // Fallback: grant access locally even if backend call fails
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
