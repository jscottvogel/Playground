import { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { GuestLogger } from '../../services/Logger';
import './GuestGateway.css';

/**
 * Interface for the Amplify Data Client
 */
const client = generateClient<Schema>();

interface GuestGatewayProps {
    onAccessGranted: (email: string) => void;
    onLoginRequest: () => void;
}

/**
 * GuestGateway Component
 * 
 * The entry point for unauthenticated users.
 * Allows users to:
 * 1. Sign in (redirects to Auth)
 * 2. Continue as a Guest (requires email, logs visit)
 */
export function GuestGateway({ onAccessGranted, onLoginRequest }: GuestGatewayProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * Handles the "Continue as Guest" flow.
     * Validates email, logs the visit to DynamoDB, and grants access.
     */
    const handleGuestAccess = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!email || !email.includes('@')) {
            GuestLogger.warn(`Invalid email provided: ${email}`);
            setError('Please enter a valid email address.');
            return;
        }

        GuestLogger.debug(`Processing guest access for: ${email}`);
        setLoading(true);
        try {
            // Record the guest visit in DynamoDB
            // Note: Permissions allow public create but not read/update/delete on this model
            const { errors } = await client.models.GuestVisit.create({
                email: email,
                visitedAt: new Date().toISOString()
            });

            if (errors) {
                GuestLogger.error('Error saving guest:', errors);
                // We typically allow access even if logging fails, but logging error is good.
            } else {
                GuestLogger.info('Visitation record created successfully.');
            }

            onAccessGranted(email);
        } catch (err) {
            GuestLogger.error('Exception saving guest:', err);
            // Fallback: grant access locally even if backend call fails
            onAccessGranted(email);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gateway-container">
            <div className="gateway-card animate-scale-in">
                <div className="gateway-header">
                    <h1 className="gateway-title">Welcome to Vogel Solutions</h1>
                    <p className="gateway-subtitle">Please identify yourself to continue</p>
                </div>

                <div className="gateway-actions">
                    {/* Guest Access Form */}
                    <form onSubmit={handleGuestAccess} className="guest-form">
                        <div className="form-group">
                            <label htmlFor="guest-email" className="sr-only">Email Address</label>
                            <input
                                id="guest-email"
                                type="email"
                                className="gateway-input"
                                placeholder="enter@email.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                disabled={loading}
                            />
                        </div>
                        {error && <p className="gateway-error">{error}</p>}

                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Verifying...' : 'Continue as Guest'}
                        </button>
                    </form>

                    <div className="gateway-divider">
                        <span>OR</span>
                    </div>

                    {/* Login Button */}
                    <button onClick={onLoginRequest} className="btn btn-outline btn-block">
                        Login with Password
                    </button>
                </div>
            </div>
        </div>
    );
}
