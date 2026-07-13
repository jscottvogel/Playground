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
    const [loading, setLoading] = useState(false);

    /**
     * Handles the "Continue as Guest" flow.
     * Logs the visit to DynamoDB, and grants access.
     */
    const handleGuestAccess = async () => {
        GuestLogger.debug(`Processing guest access`);
        setLoading(true);
        try {
            // Record the guest visit in DynamoDB
            // Note: Permissions allow public create but not read/update/delete on this model
            const { errors } = await client.models.GuestVisit.create({
                email: 'Guest',
                visitedAt: new Date().toISOString()
            });

            if (errors) {
                GuestLogger.error('Error saving guest:', errors);
                // We typically allow access even if logging fails, but logging error is good.
            } else {
                GuestLogger.info('Visitation record created successfully.');
            }

            onAccessGranted('Guest');
        } catch (err) {
            GuestLogger.error('Exception saving guest:', err);
            // Fallback: grant access locally even if backend call fails
            onAccessGranted('Guest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gateway-container">
            <div className="card gateway-card animate-fade-in">
                <div className="gateway-brand">
                    <img src="/vogel_lab_logo.png" alt="Vogel Solutions Lab Logo" className="gateway-logo" />
                </div>
                
                <div className="gateway-header">
                    <h1 className="gateway-title">Welcome to Vogel Solutions</h1>
                    <p className="gateway-tagline">Solutions Lab LLC</p>
                    <p className="gateway-mission">"From ideas to products"</p>
                </div>

                <div className="gateway-info-box">
                    <p>We build, test, and incubate modern SaaS products. Our active focus is preparing the new <a href="https://weddingsteward.com" target="_blank" rel="noreferrer" className="gateway-link">Wedding Steward App</a> for launch on August 31, 2026.</p>
                </div>

                <div className="gateway-actions">
                    <button
                        onClick={handleGuestAccess}
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Continue as Guest'}
                    </button>

                    <div className="gateway-divider">
                        <span>OR</span>
                    </div>

                    <button onClick={onLoginRequest} className="btn btn-outline btn-block">
                        Sign In / Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
}
