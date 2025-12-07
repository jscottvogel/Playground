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
 * Replaced buttons with a modern link/tab interface.
 */
export const Nav = ({ viewState, setViewState, user, signOut }: NavProps) => {
    return (
        <nav className="nav-container">
            {/* Branding */}
            <div className="nav-brand">
                <div className="nav-title">Vogel Solutions Lab</div>
            </div>

            {/* Main Navigation Links (Tabs) */}
            <div className="nav-links">
                {/* Public / Guest Links */}
                {(viewState === 'gateway' || viewState === 'guest_chat') && (
                    <>
                        <a
                            href="#"
                            className={`nav-link ${viewState === 'gateway' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setViewState('gateway'); }}
                        >
                            Home
                        </a>
                        <a
                            href="#"
                            className="nav-link highlight"
                            onClick={(e) => { e.preventDefault(); setViewState('auth'); }}
                        >
                            Sign In
                        </a>
                    </>
                )}

                {/* Authenticated Links */}
                {(viewState === 'auth' || viewState === 'admin') && (
                    <>
                        <a
                            href="#"
                            className={`nav-link ${viewState === 'auth' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setViewState('auth'); }}
                        >
                            Gallery
                        </a>
                        <a
                            href="#"
                            className={`nav-link ${viewState === 'admin' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setViewState('admin'); }}
                        >
                            Admin Portal
                        </a>
                    </>
                )}
            </div>

            {/* One-off User Menu / Profile Section */}
            {(viewState === 'auth' || viewState === 'admin') && (
                <div className="nav-profile">
                    <span className="nav-user-email">
                        {user?.signInDetails?.loginId}
                    </span>
                    <button className="nav-btn-signout" onClick={signOut}>
                        Sign Out
                    </button>
                </div>
            )}
        </nav>
    );
};
