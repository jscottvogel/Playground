import { useRef } from 'react';
import { ScottBot, type ScottBotHandle } from './ScottBot';
import './AuthChat.css';

interface AuthChatProps {
    userEmail?: string;
}

export function AuthChat({ userEmail }: AuthChatProps) {
    const botRef = useRef<ScottBotHandle>(null);

    const handleSuggestionClick = (text: string) => {
        if (botRef.current) {
            botRef.current.setInput(text);
        }
    };

    const suggestions = [
        "How was the Project Gallery built?",
        "Tell me about the admin dashboard features.",
        "What are your future plans for this app?"
    ];

    return (
        <div className="auth-chat-layout animate-fade-in">
            {/* Left Panel: Instructions & Suggestions */}
            <div className="auth-chat-instructions">
                <h2>Have Questions?</h2>
                <p className="auth-instruction-lead">
                    I'm here to help you navigate the portfolio and explain the technical details behind these projects.
                </p>

                <div className="auth-suggestions-list">
                    <h3>Suggested Technical Topics:</h3>
                    {suggestions.map((text, index) => (
                        <button
                            key={index}
                            className="auth-suggestion-card"
                            onClick={() => handleSuggestionClick(text)}
                        >
                            "{text}"
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Panel: The Bot */}
            <div className="auth-chat-bot-panel">
                <ScottBot
                    ref={botRef}
                    guestEmail={userEmail}
                    mode="embedded"
                />
            </div>
        </div>
    );
}
