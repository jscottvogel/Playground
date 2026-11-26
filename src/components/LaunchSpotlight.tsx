import './LaunchSpotlight.css';

export const WEDDINGSTEWARD_URL = 'https://weddingsteward.com';

interface LaunchSpotlightProps {
    /** Tighter padding / smaller title for in-app placement (e.g. above the gallery). */
    compact?: boolean;
}

/**
 * LaunchSpotlight Component
 *
 * Premium "Live in Production" callout for WeddingSteward.com, the first
 * Vogel Solutions Lab product to graduate from the incubator.
 * Shown on the GuestGateway and at the top of the signed-in gallery view.
 */
export function LaunchSpotlight({ compact = false }: LaunchSpotlightProps) {
    return (
        <section
            className={`launch-spotlight animate-fade-in${compact ? ' launch-spotlight--compact' : ''}`}
            aria-label="WeddingSteward is live in production"
            data-testid="launch-spotlight"
        >
            <div className="launch-spotlight__inner">
                <span className="launch-pill">
                    <span className="launch-pill__dot" aria-hidden="true" />
                    Live in Production
                </span>
                <h2 className="launch-spotlight__title">
                    WeddingSteward<span className="launch-spotlight__tld">.com</span>
                </h2>
                <p className="launch-spotlight__text">
                    Our first incubator graduate: an AI-powered wedding planning assistant,
                    taken from prototype to production and now serving real couples.
                </p>
                <a
                    id={compact ? 'launch-spotlight-cta-compact' : 'launch-spotlight-cta'}
                    href={WEDDINGSTEWARD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary launch-spotlight__cta"
                >
                    Visit WeddingSteward.com ↗
                </a>
            </div>
        </section>
    );
}
