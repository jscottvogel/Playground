import { Link } from 'react-router-dom';
import './Footer.css';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-container">
            <div className="footer-content">
                {/* Brand info */}
                <div className="footer-brand-section">
                    <div className="footer-logo-title">
                        <img src="/vogel_lab_logo.png" alt="Vogel Solutions Lab Logo" className="footer-logo" />
                        <span className="footer-brand-name">Vogel Solutions Lab LLC</span>
                    </div>
                    <p className="footer-tagline">"From ideas to products"</p>
                </div>

                {/* Navigation Links */}
                <div className="footer-nav-section">
                    <h4>Incubator Target</h4>
                    <p className="footer-inc-note">Wedding App launch set for <strong>August 31, 2026</strong>.</p>
                </div>

                {/* Legal Links */}
                <div className="footer-legal-section">
                    <h4>Legal</h4>
                    <ul className="footer-links-list">
                        <li>
                            <Link to="/privacy">Privacy Policy</Link>
                        </li>
                        <li>
                            <Link to="/terms">Terms of Service</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} Vogel Solutions Lab LLC. All rights reserved.</p>
            </div>
        </footer>
    );
}
