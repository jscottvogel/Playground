import { type Dispatch, type SetStateAction } from 'react';
import './Nav.css';

interface NavProps {
    viewState: 'gateway' | 'guest_chat' | 'auth' | 'admin';
    setViewState: Dispatch<SetStateAction<'gateway' | 'guest_chat' | 'auth' | 'admin'>>;
    user?: { signInDetails?: { loginId?: string } }; // Simplified type from Amplify
    signOut?: () => void;
}

export const Nav = ({ viewState, setViewState, user, signOut }: NavProps) => {
    return (
        <nav className="nav-container">
            <div className="nav-title">Vogel Solutions Lab</div>
            <div className="nav-actions">
                {viewState === 'auth' || viewState === 'admin' ? (
                    <>
                        <span className="nav-user-email">{user?.signInDetails?.loginId}</span>
                        <button className="btn" onClick={() => setViewState('admin')}>Admin</button>
                        <button className="btn" onClick={() => setViewState('auth')}>Gallery</button>
                        <button className="btn" onClick={signOut}>Sign Out</button>
                    </>
                ) : (
                    <>
                        <button className="btn nav-btn-home" onClick={() => setViewState('gateway')}>Home</button>
                        <button className="btn btn-primary nav-btn-auth" onClick={() => setViewState('auth')}>Sign In</button>
                    </>
                )}
            </div>
        </nav>
    );
};
