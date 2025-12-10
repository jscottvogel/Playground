import { ScottBot } from '../chatbot/ScottBot';
import './GuestChat.css';

interface GuestChatProps {
    guestEmail: string;
    onSignInRequest: () => void;
}

export function GuestChat({ guestEmail, onSignInRequest }: GuestChatProps) {
    return (
        <div className="guest-chat-layout animate-fade-in">
            {/* Left Panel: Instructions & Suggestions */}
            <div className="chat-instructions-panel">
                <div className="instructions-content">
                    <h1>Chat with ScottBot</h1>
                    <p className="instruction-lead">
                        I'm an AI assistant trained on Scott's professional background.
                        I can answer questions about his projects, skills, and experience.
                    </p>

                    <div className="suggestions-list">
                        <h3>Try asking:</h3>
                        <div className="suggestion-card">
                            "What technologies did you use for the Portfolio project?"
                        </div>
                        <div className="suggestion-card">
                            "Tell me about your experience with AWS."
                        </div>
                        <div className="suggestion-card">
                            "How do I use this application?"
                        </div>
                    </div>

                    <div className="guest-footer-note">
                        <p>
                            Viewing as <strong>{guestEmail}</strong>
                        </p>
                        <p>
                            Want to see the full gallery? <br />
                            <a href="#" onClick={(e) => { e.preventDefault(); onSignInRequest(); }} className="link-primary">
                                Sign In or Sign Up
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel: The Bot */}
            <div className="chat-bot-panel">
                <ScottBot guestEmail={guestEmail} mode="embedded" />
            </div>
        </div>
    );
}
