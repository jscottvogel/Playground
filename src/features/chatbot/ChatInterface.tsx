import { useRef } from 'react';
import { ScottBot, type ScottBotHandle } from './ScottBot';
import './ChatInterface.css';

interface ChatInterfaceProps {
    userEmail?: string;
    onSignInRequest?: () => void;
    className?: string;
}

export function ChatInterface({ userEmail, onSignInRequest, className = '' }: ChatInterfaceProps) {
    const botRef = useRef<ScottBotHandle>(null);

    const handleSuggestionClick = (text: string) => {
        if (botRef.current) {
            botRef.current.setInput(text);
        }
    };

    const suggestions = [
        "What is Scott's professional background?",
        "What are Scott's key technical skills?",
        "Can you tell me about a challenging project Scott worked on?",
        "What are Scott's hobbies outside of work?"
    ];

    return (
        <section className={`chat-interface-wrapper ${className}`}>
            <h2 className="chat-main-title">Chat with Scott</h2>

            <div className="chat-interface-layout animate-fade-in">
                {/* Left Panel: Instructions & Suggestions */}
                <div className="chat-instructions-panel">
                    <p className="instruction-lead">
                        I'm an AI assistant trained on Scott's professional background.
                        I can answer questions about his projects, skills, and experience.
                    </p>

                    <div className="suggestions-list">
                        <h3>Try asking:</h3>
                        {suggestions.map((text, index) => (
                            <button
                                key={index}
                                className="suggestion-card"
                                onClick={() => handleSuggestionClick(text)}
                            >
                                "{text}"
                            </button>
                        ))}
                    </div>

                    <div className="footer-note">
                        <p>
                            Viewing as <strong>{userEmail || 'Guest'}</strong>
                        </p>
                        {onSignInRequest && (
                            <p>
                                Want to see the full gallery? <br />
                                <a href="#" onClick={(e) => { e.preventDefault(); onSignInRequest(); }} className="link-primary">
                                    Sign In or Sign Up
                                </a>
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Panel: The Bot */}
                <div className="chat-bot-panel">
                    <ScottBot
                        ref={botRef}
                        guestEmail={userEmail}
                        mode="embedded"
                    />
                </div>
            </div>
        </section>
    );

}
