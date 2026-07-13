import { NavLink, Link } from 'react-router-dom';
import './Nav.css';

interface NavProps {
    user?: { signInDetails?: { loginId?: string } };
    signOut?: () => void;
}

export const Nav = ({ user, signOut }: NavProps) => {
    return (
        <nav className="nav-container">
            {/* Branding */}
            <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
                <img src="/vogel_lab_logo.png" alt="Vogel Solutions Lab Logo" className="nav-logo" />
                <div className="nav-title">Vogel Solutions Lab</div>
            </Link>

            {/* Main Navigation Links (Tabs) */}
            <div className="nav-links">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                    Home
                </NavLink>
                <NavLink to="/experiments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Experiments
                </NavLink>
                {user ? (
                    <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        Admin Portal
                    </NavLink>
                ) : (
                    <NavLink to="/admin" className="nav-link highlight">
                        Sign In
                    </NavLink>
                )}
            </div>

            {/* Profile Section */}
            {user && (
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
