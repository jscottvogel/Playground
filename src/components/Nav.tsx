import { type Dispatch, type SetStateAction } from 'react';
import './Nav.css';

interface NavProps {
    /** Current active view state of the application */
    viewState: 'gateway' | 'guest_chat' | 'auth' | 'admin';
    /** Setter to change the view state */
    setViewState: Dispatch<SetStateAction<'gateway' | 'guest_chat' | 'auth' | 'admin'>>;
    /** Authenticated user object (if signed in) */
    user?: { signInDetails?: { loginId?: string } };
    /** Function to sign out the user */
    signOut?: () => void;
}

/**
 * Nav Component
 * 
 * Top navigation bar that adapts based on the auth status.
 * - Authenticated: Shows User Email, Admin Link, Gallery Link, Sign Out.
 * - Guest/Public: Shows Home (Gateway) and Sign In buttons.
 */
export const Nav = ({ viewState, setViewState, user, signOut }: NavProps) => {
    return (
        <nav className="nav-container">
            <div className="nav-title">Vogel Solutions Lab</div>
            <div className="nav-actions">
                {/* Condition: Is the user authenticated (Auth or Admin view)? */}
                {viewState === 'auth' || viewState === 'admin' ? (
                    <>
                        <span className="nav-user-email">{user?.signInDetails?.loginId}</span>
                        <button className="btn" onClick={() => setViewState('admin')}>Admin</button>
                        <button className="btn" onClick={() => setViewState('auth')}>Gallery</button>
                        <button className="btn" onClick={signOut}>Sign Out</button>
                    </>
                ) : (
                    /* Guest / Public View */
                    <>
                        <button className="btn nav-btn-home" onClick={() => setViewState('gateway')}>Home</button>
                        <button className="btn btn-primary nav-btn-auth" onClick={() => setViewState('auth')}>Sign In</button>
                    </>
                )}
            </div>
        </nav>
    );
};
