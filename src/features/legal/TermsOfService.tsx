import './Legal.css';

export function TermsOfService() {
    return (
        <div className="legal-container card animate-fade-in">
            <h1 className="legal-title">Terms of Service</h1>
            <p className="legal-updated">Last Updated: July 13, 2026</p>

            <section className="legal-section">
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing the websites and prototype experiments operated by Vogel Solutions Lab LLC, you agree to comply with and be bound by these Terms of Service.
                </p>
            </section>

            <section className="legal-section">
                <h2>2. Experimental Prototype Use (SaaS Incubator)</h2>
                <p>
                    Many projects showcased on this site are active R&D or pre-production prototypes:
                </p>
                <ul>
                    <li>Prototypes are provided on an "as-is" and "as-available" basis.</li>
                    <li>We make no guarantees regarding data persistence, uptime, or correctness of these experiments.</li>
                    <li>Active target features (such as the Wedding App launching August 31, 2026) are subject to modification during the development lifecycle.</li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>3. Intellectual Property</h2>
                <p>
                    All code, designs, and content displayed in the Lab Showcase are the property of Vogel Solutions Lab LLC unless licensed otherwise. Unauthorized copying or redistribution is prohibited.
                </p>
            </section>

            <section className="legal-section">
                <h2>4. Limitation of Liability</h2>
                <p>
                    In no event shall Vogel Solutions Lab LLC be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use our experimental services.
                </p>
            </section>

            <section className="legal-section">
                <h2>5. Changes to Terms</h2>
                <p>
                    We reserves the right to modify these Terms of Service at any time. Changes will be posted to this page with an updated timestamp.
                </p>
            </section>
        </div>
    );
}
