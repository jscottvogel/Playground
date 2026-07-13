import './Legal.css';

export function PrivacyPolicy() {
    return (
        <div className="legal-container card animate-fade-in">
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="legal-updated">Last Updated: July 13, 2026</p>

            <section className="legal-section">
                <h2>1. Information We Collect</h2>
                <p>
                    We collect information directly from you when you submit your email address to express interest in our SaaS products or request a consultation. This is limited to:
                </p>
                <ul>
                    <li>Email address</li>
                    <li>Timestamp of submission</li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>2. How We Use Your Information</h2>
                <p>
                    We use the information we collect to:
                </p>
                <ul>
                    <li>Respond to inquiries, questions, and scheduling requests.</li>
                    <li>Provide updates on our active incubator projects (such as the Wedding App launch).</li>
                    <li>Improve our website performance and user experience.</li>
                </ul>
            </section>

            <section className="legal-section">
                <h2>3. Information Sharing</h2>
                <p>
                    Vogel Solutions Lab LLC does not sell, trade, or otherwise transfer your email address to outside parties. Your data is stored securely using AWS cloud databases.
                </p>
            </section>

            <section className="legal-section">
                <h2>4. Your Rights</h2>
                <p>
                    You can request to have your email address removed from our database at any time by contacting us at <strong>hello@vogelsolutionslab.com</strong>.
                </p>
            </section>

            <section className="legal-section">
                <h2>5. Contact Us</h2>
                <p>
                    If you have any questions regarding this Privacy Policy, contact us at <strong>hello@vogelsolutionslab.com</strong>.
                </p>
            </section>
        </div>
    );
}
